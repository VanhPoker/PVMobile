import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';

import Animated, { 
  FadeInUp, 
  FadeIn, 
  useSharedValue, 
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence
} from 'react-native-reanimated';
import { useAudioStore } from '../../stores/audioStore';

// Local imports
import WidgetRenderer from '../components/ai/WidgetRenderer';
import EkycCameraWidget from '../components/ai/widgets/EkycCameraWidget';
import LiveKitVoiceRoom from '../components/ai/LiveKitVoiceRoom';

const { width, height } = Dimensions.get('window');

interface Message {
  id: string | number;
  type: 'text' | 'widget';
  sender: 'user' | 'ai';
  content?: string;
  widgetType?: string;
  flowId?: string;
  state?: any;
  timestamp: Date;
  hidden?: boolean;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [voiceState, setVoiceState] = useState('idle');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceConnected, setIsVoiceConnected] = useState(false);
  const [showEkycPopup, setShowEkycPopup] = useState(false);
  
  // State cho refresh
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const messagesEndRef = useRef<ScrollView>(null);
  const messagesRef = useRef(messages);
  const actionManagerRef = useRef<any>(null);
  const navigation = useNavigation<NavigationProp>();
  const proactiveTimer = useRef<NodeJS.Timeout | null>(null);
  const sendVoiceChatMessageRef = useRef<any>(null);
  const lastTranscriptRef = useRef({ text: '', timestamp: 0 });
  const ekycResolveRef = useRef<any>(null);
  
  // State cho streaming messages
  const [currentAgentMessage, setCurrentAgentMessage] = useState('');
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const processingContentRef = useRef<string | null>(null);
  const [currentUserMessage, setCurrentUserMessage] = useState('');
  const finalizeMessageTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [pendingLkTranscript, setPendingLkTranscript] = useState<any>(null);
  
  const [processedTranscriptIds, setProcessedTranscriptIds] = useState(new Set());
  const [processedTranscriptContent, setProcessedTranscriptContent] = useState(new Map());
  
  const insets = useSafeAreaInsets();
  const { isMuted, botExists, setMicState } = useAudioStore();

  // Animation values
  const micButtonScale = useSharedValue(1);
  const loadingOpacity = useSharedValue(0);
  const refreshButtonRotation = useSharedValue(0);

  // Refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Animate refresh button
    refreshButtonRotation.value = withRepeat(
      withSpring(360, { duration: 1000 }),
      1,
      false
    );
    
    try {
      // Reset all states
      setMessages([]);
      setVoiceState('idle');
      setInputMessage('');
      setIsLoading(false);
      setIsVoiceConnected(false);
      setCurrentAgentMessage('');
      setCurrentUserMessage('');
      setStreamingMessageId(null);
      
      // Clear refs
      processingContentRef.current = null;
      if (finalizeMessageTimerRef.current) {
        clearTimeout(finalizeMessageTimerRef.current);
      }
      if (proactiveTimer.current) {
        clearTimeout(proactiveTimer.current);
      }
      
      // Reset processed transcript tracking
      setProcessedTranscriptIds(new Set());
      setProcessedTranscriptContent(new Map());
      
      // Force remount LiveKitVoiceRoom component
      setRefreshKey(prev => prev + 1);
      
      console.log('🔄 AIChat refreshed, LiveKit component will remount');
      
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
    } catch (error) {
      console.error('Error during refresh:', error);
    } finally {
      setIsRefreshing(false);
      refreshButtonRotation.value = 0;
    }
  };

  // Effect to keep messagesRef updated
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Custom event handler functions (replace window.addEventListener)
  const handleShowInvoiceList = (data: any) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `invoice-list-${Date.now()}`,
        type: 'widget',
        sender: 'ai',
        widgetType: 'invoiceList',
        flowId: `invoice-list-flow-${Date.now()}`,
        state: {
          invoices: data.invoices,
          paid: data.paid,
          pending: data.pending,
          overdue: data.overdue,
          action: data.action
        },
        timestamp: new Date()
      }
    ]);
  };

  const handleShowTransactionHistory = (data: any) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `transaction-history-${Date.now()}`,
        type: 'widget',
        sender: 'ai',
        widgetType: 'transactionHistory',
        flowId: `transaction-history-flow-${Date.now()}`,
        state: {
          transactions: data.transactions || [],
          account: data.account
        },
        timestamp: new Date()
      }
    ]);
  };

  const handleShowAccount = (data: any) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `account-detail-${Date.now()}`,
        type: 'widget',
        sender: 'ai',
        widgetType: 'accountDetail',
        flowId: `account-detail-flow-${Date.now()}`,
        state: {
          account: data.account,
          transactions: data.transactions || []
        },
        timestamp: new Date()
      }
    ]);
  };

  const handleShowAllAccount = (data: any) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `account-list-${Date.now()}`,
        type: 'widget',
        sender: 'ai',
        widgetType: 'accountList',
        flowId: `account-list-flow-${Date.now()}`,
        state: {
          accounts: data.accounts || []
        },
        timestamp: new Date()
      }
    ]);
  };

  const handleShowUserInfo = (data: any) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `user-info-${Date.now()}`,
        type: 'widget',
        sender: 'ai',
        widgetType: 'userInfo',
        flowId: `user-info-flow-${Date.now()}`,
        state: {
          user: data.user
        },
        timestamp: new Date()
      }
    ]);
  };

  const handleShowBalance = (data: any) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `balance-${Date.now()}`,
        type: 'widget',
        sender: 'ai',
        widgetType: 'balance',
        flowId: `balance-flow-${Date.now()}`,
        state: {
          balance: data.balance,
          account: data.account
        },
        timestamp: new Date()
      }
    ]);
  };

  const handleInitTransaction = (data: any) => {
    console.log('📤 handleInitTransaction called with data:', data);
    console.log('📤 Data type:', typeof data);
    console.log('📤 Data keys:', data ? Object.keys(data) : 'null');
    
    // Parse data nếu là string JSON
    let transactionData = data;
    if (typeof data === 'string') {
      try {
        transactionData = JSON.parse(data);
      } catch (e) {
        console.error('Failed to parse transaction data:', e);
        transactionData = data;
      }
    }
    
    const transactionId = transactionData.transaction_id || `tx-${Date.now()}`;
    
    // Chuẩn bị state cho TransferWidget
    const transferState = {
      step: 'confirm', // Luôn hiển thị confirmation step
      recipient: {
        name: transactionData.receiver || transactionData.receiverName || transactionData.recipient_name || 'Người nhận',
        accountNumber: transactionData.receiver_account_number || transactionData.receiverAccountNumber || transactionData.account_number || ''
      },
      sender: {
        name: transactionData.sender_name || transactionData.senderName || 'Tài khoản của bạn',
        accountNumber: transactionData.sender_account_number || transactionData.senderAccountNumber || '1234567890',
        accountType: transactionData.source_account_type || transactionData.sourceAccountType || 'Tài khoản thanh toán'
      },
      amount: Number(transactionData.amount) || 0,
      description: transactionData.description || transactionData.content || transactionData.memo || '',
      transactionId: transactionId,
      bankName: transactionData.bank_name || transactionData.bankName || 'pvcombank',
      isMetadataTransaction: true
    };
    
    console.log('🎯 Creating transfer widget with state:', transferState);
    
    setMessages((prev) => [
      ...prev,
      {
        id: `transfer-${transactionId}`,
        type: 'widget',
        sender: 'ai',
        widgetType: 'transfer',
        flowId: `transfer-flow-${transactionId}`,
        state: transferState,
        timestamp: new Date()
      }
    ]);
  };

  const handleDoneTransaction = (data: any) => {
    console.log('✅ handleDoneTransaction called with data:', data);
    
    const transactionId = data.transaction_id;
    if (!transactionId) {
      console.error('doneTransaction missing transaction_id');
      return;
    }

    setMessages((prev) => {
      const updatedMessages = prev.map((msg) => {
        if (
          msg.type === 'widget' &&
          msg.widgetType === 'transfer' &&
          msg.state?.transactionId === transactionId
        ) {
          console.log(`Found and updating transfer widget for transaction: ${transactionId}`);
          return {
            ...msg,
            state: {
              ...msg.state,
              step: 'completed',
              completedAt: new Date().toISOString()
            }
          };
        }
        return msg;
      });
      return updatedMessages;
    });
  };

  // Custom event system for React Native (replace window events)
  const customEventHandlers = useRef<Record<string, (data: any) => void>>({
    'livekit-show-invoice-list': handleShowInvoiceList,
    'livekit-transaction-history': handleShowTransactionHistory,
    'livekit-show-account': handleShowAccount,
    'livekit-show-all-account': handleShowAllAccount,
    'livekit-show-user-info': handleShowUserInfo,
    'livekit-show-balance': handleShowBalance,
    'livekit-rpc-transaction': handleInitTransaction,
    'livekit-done-transaction': handleDoneTransaction,
  });

  // Expose event trigger function to LiveKitVoiceRoom
  const triggerCustomEvent = (eventName: string, data: any) => {
    console.log('🎯 triggerCustomEvent called:', { eventName, data });
    const handler = customEventHandlers.current[eventName];
    if (handler) {
      console.log('✅ Handler found, calling:', eventName);
      handler(data);
    } else {
      console.warn(`❌ No handler found for event: ${eventName}`);
      console.log('📋 Available handlers:', Object.keys(customEventHandlers.current));
    }
  };

  // Handle transcript message
  const handleTranscriptMessage = (transcriptMessage: any) => {
    const { content, isFinal, sender } = transcriptMessage;

    clearTimeout(finalizeMessageTimerRef.current!);

    if (isFinal && content?.trim()) {
      console.log('✅ Received isFinal, adding message normally:', content);

      if (processingContentRef.current === content) return;
      processingContentRef.current = content;
      setTimeout(() => {
        if (processingContentRef.current === content) {
          processingContentRef.current = null;
        }
      }, 500);

      const isDuplicateInState = messagesRef.current.some(
        (msg) =>
          msg.sender === sender &&
          msg.content === content &&
          Date.now() - new Date(msg.timestamp).getTime() < 500
      );
      if (isDuplicateInState) return;

      if (sender === 'ai') {
        setCurrentAgentMessage('');
        addMessage({
          id: `transcript-ai-${Date.now()}`,
          type: 'text',
          sender: 'ai',
          content: content,
          timestamp: new Date()
        });
      } else if (sender === 'user') {
        setCurrentUserMessage('');
        addMessage({
          id: `transcript-user-${Date.now()}`,
          type: 'text',
          sender: 'user',
          content: content,
          timestamp: new Date()
        });
      }
      return;
    }

    if (!isFinal && content?.trim()) {
      if (sender === 'ai') setCurrentAgentMessage(content);
      if (sender === 'user') setCurrentUserMessage(content);

      finalizeMessageTimerRef.current = setTimeout(() => {
        console.log('⏳ Timeout! Finalizing message due to inactivity:', content);

        const finalContent = sender === 'ai' ? currentAgentMessage : currentUserMessage;
        if (!finalContent) return;

        if (processingContentRef.current === finalContent) return;
        processingContentRef.current = finalContent;
        setTimeout(() => {
          if (processingContentRef.current === finalContent) {
            processingContentRef.current = null;
          }
        }, 500);

        const isDuplicateInState = messagesRef.current.some(
          (msg) =>
            msg.sender === sender &&
            msg.content === finalContent &&
            Date.now() - new Date(msg.timestamp).getTime() < 500
        );
        if (isDuplicateInState) return;

        if (sender === 'ai') {
          setCurrentAgentMessage('');
          addMessage({
            id: `transcript-ai-fallback-${Date.now()}`,
            type: 'text',
            sender: 'ai',
            content: finalContent,
            timestamp: new Date()
          });
        } else if (sender === 'user') {
          setCurrentUserMessage('');
          addMessage({
            id: `transcript-user-fallback-${Date.now()}`,
            type: 'text',
            sender: 'user',
            content: finalContent,
            timestamp: new Date()
          });
        }
      }, 1200);
    }
  };

  // Process LK transcription - EXACT SAME LOGIC
  const processLkTranscriptionMessage = (transcriptMessage: any) => {
    const { content, sender, id } = transcriptMessage;
    const contentKey = `${sender}-${content}`;
    const now = Date.now();

    if (processedTranscriptContent.has(contentKey)) {
      console.log('⏭️ Skipping duplicate lk.transcription content (fallback):', contentKey);
      return;
    }

    console.log('⚠️ Adding message from lk.transcription (fallback):', content);

    setProcessedTranscriptContent(
      (prev) => new Map([...prev, [contentKey, now]])
    );

    const messageId = id || `transcript-${sender}-${now}-${Math.random().toString(36).substr(2, 9)}`;

    if (processedTranscriptIds.has(messageId)) {
      console.log('⏭️ Skipping duplicate message ID:', messageId);
      return;
    }

    if (content.trim()) {
      setProcessedTranscriptIds((prev) => new Set([...prev, messageId]));
      addMessage({
        id: messageId,
        type: 'text',
        sender: sender,
        content: content,
        timestamp: new Date()
      });
    }
  };

  // Voice state effect
  useEffect(() => {
    console.log('🔊 Voice state changed to:', voiceState);

    if (voiceState !== 'speaking' && currentAgentMessage) {
      console.log('🧹 Voice stopped, clearing any leftover streaming text.');
      setCurrentAgentMessage('');
      setStreamingMessageId(null);
    }

    if (voiceState === 'thinking') {
      loadingOpacity.value = withSpring(1);
    } else {
      loadingOpacity.value = withSpring(0);
    }
  }, [voiceState, currentAgentMessage]);

  // Proactive timer functions - SAME LOGIC
  const resetProactiveTimer = () => {
    if (proactiveTimer.current) {
      clearTimeout(proactiveTimer.current);
    }
    proactiveTimer.current = setTimeout(() => {
      showProactiveSuggestion();
    }, 20000);
  };

  const showProactiveSuggestion = () => {
    if (
      messagesRef.current.length === 0 ||
      messagesRef.current[messagesRef.current.length - 1].sender === 'user'
    ) {
      const suggestions = [
        { trigger: 'Kích hoạt ưu đãi sinh nhật', category: 'promotion' },
        { trigger: 'Bạn đã nghĩ đến việc đầu tư chưa?', category: 'investment' },
        { trigger: 'Cùng đặt mục tiêu tiết kiệm nhé?', category: 'savings' }
      ];
      const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
      processUserInput(randomSuggestion.trigger, 'PROACTIVE');
    }
  };

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // Add message function - SAME LOGIC
  const addMessage = (message: Message) => {
    setMessages((prev) => {
      if (message.type === 'widget' && message.widgetType === 'transfer') {
        console.log(
          'Adding NEW transfer widget (no duplicate check):',
          message.id,
          'transaction_id:',
          message.state?.transactionId
        );
        return [...prev, message];
      }

      const exists = prev.find((m) => m.id === message.id);
      if (exists) {
        console.log('Message ID already exists:', message.id);
        return prev;
      }

      console.log('Adding new message:', message.id, message.content?.substring(0, 30));
      return [...prev, message];
    });
  };

  // Update message function
  const updateMessage = (messageId: string, updates: Partial<Message>) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, ...updates } : msg))
    );
  };

  // Handle AI Action - SAME LOGIC
  const handleAIAction = async (actionData: any) => {
    if (!actionManagerRef.current) return;
    try {
      setIsLoading(true);
      const result = await actionManagerRef.current.processAction(actionData);
      console.log('Action processed:', result);

      if (result?.actionResult?.action === 'navigate') {
        navigation.navigate(result.actionResult.page as never);
      }

      if (result && !result.success && result.error) {
        addMessage({
          id: Date.now().toString(),
          type: 'text',
          sender: 'ai',
          content: `⚠️ **Lỗi**: ${result.error}`,
          timestamp: new Date()
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle voice assistant message - SAME LOGIC
  const handleVoiceAssistantMessage = (message: any) => {
    if (!message) return;

    try {
      if (
        typeof message.content === 'string' &&
        (message.content.startsWith('{') || message.content.startsWith('['))
      ) {
        try {
          const parsedContent = JSON.parse(message.content);

          if (parsedContent.type === 'widget') {
            addMessage({
              id: `widget-${Date.now()}-${Math.random()}`,
              type: 'widget',
              sender: 'ai',
              widgetType: parsedContent.widgetType || 'transfer',
              state: parsedContent.state || { step: 'input_recipient' },
              flowId: parsedContent.flowId || `flow-${Date.now()}`,
              timestamp: new Date()
            });
            return;
          }
        } catch (e) {
          console.log('Failed to parse JSON message:', e);
        }
      }

      addMessage({
        id: Date.now().toString(),
        type: 'text',
        sender: 'ai',
        content: message.content,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error handling voice assistant message:', error);
      addMessage({
        id: Date.now().toString(),
        type: 'text',
        sender: 'ai',
        content: message?.content || 'Có lỗi xảy ra khi xử lý tin nhắn',
        timestamp: new Date()
      });
    }
  };

  // Handle widget action - SAME LOGIC
  const handleWidgetAction = (actionData: any) => {
    console.log('Widget Action received in AIChat:', actionData);

    if (
      actionData.type === 'TRIGGER_ACTION' &&
      actionData.payload?.actionName === 'confirmTransfer'
    ) {
      const transactionData = actionData.payload.data;

      if (transactionData.isMetadataTransaction) {
        console.log('Processing metadata transaction confirmation');

        const widgetIndex = messages.findIndex(
          (m) => m.type === 'widget' && m.flowId === actionData.flowId
        );

        if (widgetIndex !== -1) {
          console.log(`Found widget at index ${widgetIndex} for flowId: ${actionData.flowId}`);

          setMessages((prev) => {
            const updated = [...prev];
            updated[widgetIndex] = {
              ...updated[widgetIndex],
              state: {
                ...updated[widgetIndex].state,
                step: 'processing',
                transactionId: updated[widgetIndex].state.transactionId
              }
            };
            return updated;
          });

          console.log(
            `Widget ${actionData.flowId} moved to processing state, waiting for doneTransaction metadata`
          );
          return;
        } else {
          console.error(`Widget not found for flowId: ${actionData.flowId}`);
        }
      }
    }

    return handleAIAction(actionData);
  };

  // Process user input - SAME LOGIC
  const processUserInput = async (input: string, source = 'CHAT') => {
    resetProactiveTimer();
    if (isLoading) return;

    if (source !== 'PROACTIVE') {
      addMessage({
        id: Date.now().toString(),
        sender: 'user',
        type: 'text',
        content: input,
        timestamp: new Date()
      });
    }

    await handleAIAction({
      type: 'NEW_INTENT',
      payload: { intent: input, triggerText: input },
      source
    });
  };

  // Handle send message
  const handleSendMessage = (message = inputMessage) => {
    if (!message.trim() || isLoading) return;
    setInputMessage('');

    if (isVoiceConnected && sendVoiceChatMessageRef.current) {
      sendVoiceChatMessageRef.current(message);
    }

    processUserInput(message, 'CHAT');
  };

  // Toggle microphone
  const handleToggleMic = () => {
    const newMicState = isMuted;
    setMicState(newMicState);

    micButtonScale.value = withSequence(
      withSpring(0.8),
      withSpring(1)
    );
  };

  // Animated styles
  const micButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: micButtonScale.value }]
    };
  });

  const loadingAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: loadingOpacity.value
    };
  });

  const refreshButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${refreshButtonRotation.value}deg` }]
    };
  });

  // Render message function
  const renderMessage = (message: Message, index: number) => {
    const isUser = message.sender === 'user';

    if (message.hidden) {
      console.log('Skip rendering hidden message:', message.id);
      return null;
    }

    if (message.type === 'widget') {
      return (
        <Animated.View
          key={message.id}
          entering={FadeInUp.delay(index * 100)}
          style={styles.messageContainer}
        >
          <View style={styles.aiAvatarContainer}>
            <Icon name="smart-toy" size={16} color="#ffffff" />
          </View>
          <View style={styles.widgetContainer}>
            <WidgetRenderer
              widgetType={message.widgetType}
              state={message.state}
              flowId={message.flowId}
              onAction={handleWidgetAction}
              onSetInputMessage={setInputMessage}
            />
          </View>
        </Animated.View>
      );
    }

    return (
      <Animated.View
        key={message.id}
        entering={FadeInUp.delay(index * 100)}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.aiMessageContainer
        ]}
      >
        {!isUser && (
          <View style={styles.aiAvatarContainer}>
            <Icon name="smart-toy" size={16} color="#ffffff" />
          </View>
        )}
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.aiBubble
        ]}>
          <Text style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.aiMessageText
          ]}>
            {message.content?.replace(/\*\*(.*?)\*\*/g, '$1')}
          </Text>
        </View>
      </Animated.View>
    );
  };

  // Render streaming messages
  const renderStreamingMessage = (content: string, sender: 'user' | 'ai') => {
    const isUser = sender === 'user';
    
    return (
      <Animated.View
        entering={FadeIn}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.aiMessageContainer
        ]}
      >
        {!isUser && (
          <View style={styles.aiAvatarContainer}>
            <Icon name="smart-toy" size={16} color="#ffffff" />
          </View>
        )}
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.aiBubble
        ]}>
          <View style={styles.streamingTextContainer}>
            <Text style={[
              styles.messageText,
              isUser ? styles.userMessageText : styles.aiMessageText
            ]}>
              {content}
            </Text>
            <View style={styles.cursor} />
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      {/* Header với margin top để tránh status bar */}
      <View style={[styles.header, { marginTop: insets.top }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#6b7280" />
        </TouchableOpacity>
        
        <View style={styles.headerTitle}>
          <Text style={styles.title}>Pivi</Text>
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusDot,
              { backgroundColor: botExists ? '#10b981' : '#ef4444' }
            ]} />
            <Text style={styles.subtitle}>Trợ lý tài chính thông minh</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          {/* Refresh Button */}
          <Animated.View style={refreshButtonAnimatedStyle}>
            <TouchableOpacity
              style={[
                styles.refreshButton,
                isRefreshing && styles.refreshButtonDisabled
              ]}
              onPress={handleRefresh}
              disabled={isRefreshing}
            >
              <Icon 
                name="refresh" 
                size={20} 
                color={isRefreshing ? "#9ca3af" : "#6b7280"} 
              />
            </TouchableOpacity>
          </Animated.View>

          {/* Mic Button */}
          <Animated.View style={micButtonAnimatedStyle}>
            <TouchableOpacity
              style={[
                styles.micButton,
                { backgroundColor: !isMuted ? '#10b981' : '#6b7280' }
              ]}
              onPress={handleToggleMic}
              disabled={isRefreshing}
            >
              <Icon 
                name={!isMuted ? "mic" : "mic-off"} 
                size={20} 
                color="#ffffff" 
              />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

      {/* Voice Room - Hidden - Sử dụng refreshKey để force remount */}
      <View style={styles.hiddenContainer}>
        <LiveKitVoiceRoom
          key={refreshKey} // Force remount when refreshKey changes
          onConnectionChange={setIsVoiceConnected}
          onMessageReceived={handleVoiceAssistantMessage}
          sendMessageRef={sendVoiceChatMessageRef}
          handleSendMessage={handleSendMessage}
          addMessage={addMessage}
          onTranscriptReceived={handleTranscriptMessage}
          onVoiceStateChange={setVoiceState}
          onCustomEvent={triggerCustomEvent}
        />
      </View>

      {/* Messages */}
      <KeyboardAvoidingView 
        style={styles.mainContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={messagesEndRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Refresh Indicator */}
          {isRefreshing && (
            <View style={styles.refreshIndicator}>
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text style={styles.refreshText}>Đang làm mới kết nối...</Text>
            </View>
          )}

          {/* Welcome Message when no messages */}
          {messages.length === 0 && !isRefreshing && (
            <View style={styles.welcomeContainer}>
              <View style={styles.welcomeContent}>
                <Icon name="smart-toy" size={48} color="#3b82f6" />
                <Text style={styles.welcomeTitle}>Xin chào! 👋</Text>
                <Text style={styles.welcomeText}>
                  Tôi là Pivi, trợ lý tài chính thông minh của bạn. Hãy hỏi tôi bất cứ điều gì!
                </Text>
                <View style={styles.connectionStatus}>
                  <View style={[
                    styles.connectionDot,
                    { backgroundColor: isVoiceConnected ? '#10b981' : '#ef4444' }
                  ]} />
                  <Text style={styles.connectionText}>
                    {isVoiceConnected ? 'Đã kết nối voice chat' : 'Đang kết nối...'}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {messages.map((message, index) => renderMessage(message, index))}

          {/* Agent streaming message */}
          {currentAgentMessage && renderStreamingMessage(currentAgentMessage, 'ai')}

          {/* User streaming message */}
          {currentUserMessage && renderStreamingMessage(currentUserMessage, 'user')}

          {/* Loading indicator */}
          {isLoading && (
            <Animated.View style={[styles.messageContainer, styles.aiMessageContainer]}>
              <View style={styles.aiAvatarContainer}>
                <Icon name="smart-toy" size={16} color="#ffffff" />
              </View>
              <View style={[styles.messageBubble, styles.aiBubble]}>
                <View style={styles.loadingContainer}>
                  <Animated.View style={[styles.loadingDot]} />
                  <Animated.View style={[styles.loadingDot]} />
                  <Animated.View style={[styles.loadingDot]} />
                </View>
              </View>
            </Animated.View>
          )}

          {/* Thinking indicator */}
          <Animated.View style={[loadingAnimatedStyle, styles.thinkingContainer]}>
            {voiceState === 'thinking' && (
              <View style={[styles.messageContainer, styles.aiMessageContainer]}>
                <View style={styles.aiAvatarContainer}>
                  <Icon name="smart-toy" size={16} color="#ffffff" />
                </View>
                <View style={[styles.messageBubble, styles.aiBubble]}>
                  <View style={styles.loadingContainer}>
                    <Animated.View style={[styles.loadingDot]} />
                    <Animated.View style={[styles.loadingDot]} />
                    <Animated.View style={[styles.loadingDot]} />
                  </View>
                </View>
              </View>
            )}
          </Animated.View>
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              value={inputMessage}
              onChangeText={(text) => {
                setInputMessage(text);
                resetProactiveTimer();
              }}
              placeholder="Bạn cần giúp gì?"
              placeholderTextColor="#9ca3af"
              editable={
                !isLoading &&
                !isRefreshing &&
                voiceState !== 'thinking' &&
                voiceState !== 'speaking'
              }
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputMessage.trim() || 
                 isLoading ||
                 isRefreshing ||
                 voiceState === 'thinking' || 
                 voiceState === 'speaking') && styles.sendButtonDisabled
              ]}
              onPress={() => handleSendMessage()}
              disabled={
                !inputMessage.trim() ||
                isLoading ||
                isRefreshing ||
                voiceState === 'thinking' ||
                voiceState === 'speaking'
              }
            >
              <Icon name="send" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
          
          {(voiceState === 'thinking' || voiceState === 'speaking') && (
            <Text style={styles.inputWarning}>
              Bạn cần đợi AI xử lý và trả lời mới có thể gửi tin nhắn.
            </Text>
          )}
          
          {isRefreshing && (
            <Text style={styles.inputWarning}>
              Đang làm mới kết nối, vui lòng đợi...
            </Text>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* EKYC Popup */}
      <Modal
        visible={showEkycPopup}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEkycPopup(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowEkycPopup(false)}
            >
              <Icon name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
            <EkycCameraWidget 
              onDone={(data) => {
                setShowEkycPopup(false);
                if (ekycResolveRef.current) {
                  ekycResolveRef.current('ekyc thành công');
                  ekycResolveRef.current = null;
                }
              }}
              onCancel={() => setShowEkycPopup(false)}
            />
          </View>
        </View>
      </Modal>
              
      {/* Test Button - Navigate to Test Screen */}
  
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: 0, // Loại bỏ padding top mặc định
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
  refreshButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hiddenContainer: {
    position: 'absolute',
    left: -9999,
    top: -9999,
  },
  mainContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  refreshIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  refreshText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  welcomeContent: {
    alignItems: 'center',
    maxWidth: 280,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  connectionText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  userMessageContainer: {
    flexDirection: 'row-reverse',
  },
  aiMessageContainer: {
    flexDirection: 'row',
  },
  aiAvatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  messageBubble: {
    maxWidth: width * 0.75,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  userBubble: {
    backgroundColor: '#3b82f6',
    marginLeft: 12,
  },
  aiBubble: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#ffffff',
  },
  aiMessageText: {
    color: '#111827',
  },
  streamingTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cursor: {
    width: 2,
    height: 16,
    backgroundColor: '#6b7280',
    marginLeft: 4,
    opacity: 0.7,
  },
  widgetContainer: {
    flex: 1,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fbbf24',
    marginHorizontal: 2,
  },
  thinkingContainer: {
    marginBottom: 16,
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f59e0b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  inputWarning: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    margin: 20,
    maxWidth: 400,
    width: '90%',
    position: 'relative',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  testButton: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 1000,
  },
  testButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
});
