import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import WidgetRenderer from '../components/ai/WidgetRenderer';

interface Message {
  id: string;
  type: 'text' | 'widget';
  sender: 'user' | 'ai';
  content?: string;
  widgetType?: string;
  state?: any;
  flowId?: string;
  timestamp: Date;
}

export const AIChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'text',
      sender: 'ai',
      content: 'Xin chào! Tôi là Pivi - trợ lý AI của PV Bank. Tôi có thể giúp bạn:\n\n• Kiểm tra số dư tài khoản\n• Chuyển khoản\n• Thanh toán hóa đơn\n• Xem lịch sử giao dịch\n\nBạn cần hỗ trợ gì?',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceConnected, setIsVoiceConnected] = useState(false);
  const messagesRef = useRef<FlatList>(null);
  const { signOut, user } = useAuth();

  // Auto scroll to bottom when new message
  useEffect(() => {
    if (messagesRef.current && messages.length > 0) {
      setTimeout(() => {
        messagesRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const updateMessage = (messageId: string, updates: Partial<Message>) => {
    setMessages(prev =>
      prev.map(msg => (msg.id === messageId ? { ...msg, ...updates } : msg))
    );
  };

  const handleWidgetAction = (actionData: any) => {
    console.log('Widget Action:', actionData);
    
    // Handle different widget actions
    switch (actionData.type) {
      case 'TRANSFER_CONFIRM':
        // Simulate transfer processing
        setTimeout(() => {
          addMessage({
            id: `transfer-result-${Date.now()}`,
            type: 'text',
            sender: 'ai',
            content: `✅ Chuyển khoản thành công!\n\nSố tiền: ${actionData.payload.amount?.toLocaleString()} VNĐ\nNgười nhận: ${actionData.payload.recipient?.name}\nSố TK: ${actionData.payload.recipient?.accountNumber}`,
            timestamp: new Date(),
          });
        }, 2000);
        break;
        
      case 'ACCOUNT_SELECTED':
        addMessage({
          id: `account-selected-${Date.now()}`,
          type: 'text',
          sender: 'ai',
          content: `Bạn đã chọn tài khoản: ${actionData.payload.account_name}\nSố tài khoản: ${actionData.payload.receiver_account_number}`,
          timestamp: new Date(),
        });
        break;
        
      default:
        console.log('Unhandled action:', actionData);
    }
  };

  const processUserInput = async (input: string) => {
    if (!input.trim() || isLoading) return;

    // Add user message
    addMessage({
      id: `user-${Date.now()}`,
      type: 'text',
      sender: 'user',
      content: input,
      timestamp: new Date(),
    });

    setIsLoading(true);

    // Simulate AI processing
    setTimeout(() => {
      handleAIResponse(input);
      setIsLoading(false);
    }, 1000);
  };

  const handleAIResponse = (userInput: string) => {
    const lowerInput = userInput.toLowerCase();
    
    // Simple keyword-based responses with widgets
    if (lowerInput.includes('chuyển khoản') || lowerInput.includes('transfer')) {
      // Show transfer widget
      addMessage({
        id: `transfer-widget-${Date.now()}`,
        type: 'widget',
        sender: 'ai',
        widgetType: 'transfer',
        flowId: `transfer-flow-${Date.now()}`,
        state: {
          step: 'input_recipient',
          amount: 0,
          description: '',
        },
        timestamp: new Date(),
      });
    } else if (lowerInput.includes('tài khoản') || lowerInput.includes('số dư')) {
      // Show account list widget
      addMessage({
        id: `account-widget-${Date.now()}`,
        type: 'widget',
        sender: 'ai',
        widgetType: 'accountChoice',
        flowId: `account-flow-${Date.now()}`,
        state: {
          accounts: [
            {
              id: '1',
              account_name: 'Tài khoản thanh toán',
              receiver_account_number: '1234567890',
              balance: 15000000,
            },
            {
              id: '2',
              account_name: 'Tài khoản tiết kiệm',
              receiver_account_number: '0987654321',
              balance: 50000000,
            },
          ],
        },
        timestamp: new Date(),
      });
    } else if (lowerInput.includes('hóa đơn') || lowerInput.includes('bill')) {
      // Show invoice list widget
      addMessage({
        id: `invoice-widget-${Date.now()}`,
        type: 'widget',
        sender: 'ai',
        widgetType: 'invoiceList',
        flowId: `invoice-flow-${Date.now()}`,
        state: {
          invoices: [
            {
              id: '1',
              supplier_name: 'Điện lực TP.HCM',
              amount: 850000,
              due_date: '2025-10-15',
              invoice_type: 'electricity',
              payment_status: 'pending',
              billing_month: '2025-09',
            },
            {
              id: '2',
              supplier_name: 'Saigon Water',
              amount: 320000,
              due_date: '2025-10-20',
              invoice_type: 'water',
              payment_status: 'pending',
              billing_month: '2025-09',
            },
          ],
          pending: [],
          paid: [],
          overdue: [],
        },
        timestamp: new Date(),
      });
    } else {
      // Default text response
      const responses = [
        'Tôi hiểu bạn cần hỗ trợ. Bạn có thể thử hỏi về "chuyển khoản", "kiểm tra tài khoản", hoặc "thanh toán hóa đơn".',
        'Để tôi giúp bạn tốt hơn, bạn có thể nói rõ hơn về vấn đề cần hỗ trợ không?',
        'Tôi có thể giúp bạn với các dịch vụ ngân hàng. Hãy cho tôi biết bạn muốn làm gì.',
      ];
      
      addMessage({
        id: `ai-${Date.now()}`,
        type: 'text',
        sender: 'ai',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      });
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    const message = inputMessage;
    setInputMessage('');
    processUserInput(message);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';

    if (item.type === 'widget') {
      return (
        <View style={styles.messageContainer}>
          <View style={styles.aiAvatar}>
            <Text style={styles.avatarText}>🤖</Text>
          </View>
          <View style={styles.widgetContainer}>
            <WidgetRenderer
              widgetType={item.widgetType!}
              state={item.state}
              flowId={item.flowId!}
              onAction={handleWidgetAction}
              onSetInputMessage={setInputMessage}
            />
          </View>
        </View>
      );
    }

    return (
      <View style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.aiMessageContainer
      ]}>
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Text style={styles.avatarText}>🤖</Text>
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
            {item.content}
          </Text>
          <Text style={styles.timestamp}>
            {item.timestamp.toLocaleTimeString('vi-VN', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
      </View>
    );
  };

  const renderLoadingIndicator = () => {
    if (!isLoading) return null;
    
    return (
      <View style={styles.messageContainer}>
        <View style={styles.aiAvatar}>
          <Text style={styles.avatarText}>🤖</Text>
        </View>
        <View style={[styles.messageBubble, styles.aiBubble]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#666" />
            <Text style={styles.loadingText}>Đang xử lý...</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Pivi AI Assistant</Text>
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusDot, 
              { backgroundColor: isVoiceConnected ? '#10b981' : '#ef4444' }
            ]} />
            <Text style={styles.statusText}>
              {isVoiceConnected ? 'Đang kết nối' : 'Offline'}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity onPress={signOut} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Thoát</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={messagesRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        ListFooterComponent={renderLoadingIndicator}
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputMessage}
          onChangeText={setInputMessage}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor="#999"
          multiline
          maxLength={500}
          editable={!isLoading}
        />
        <TouchableOpacity 
          style={[
            styles.sendButton, 
            (!inputMessage.trim() || isLoading) && styles.sendButtonDisabled
          ]}
          onPress={handleSendMessage}
          disabled={!inputMessage.trim() || isLoading}
        >
          <Text style={styles.sendButtonText}>Gửi</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#6b7280',
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '500',
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
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
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
  },
  userBubble: {
    backgroundColor: '#3b82f6',
    marginLeft: 12,
  },
  aiBubble: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  aiMessageText: {
    color: '#1f2937',
  },
  timestamp: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'right',
  },
  widgetContainer: {
    flex: 1,
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: 8,
    color: '#6b7280',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    color: '#1f2937',
  },
  sendButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});