import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Dimensions,
  Animated
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

// LiveKit React Native imports
import {
  Room,
  Track,
  RoomEvent,
  LocalParticipant,
  RemoteParticipant,
  RpcInvocationData,
} from 'livekit-client'
import {
  AudioSession,
  LiveKitRoom,
  useRoomContext,
  useLocalParticipant,
  useParticipants,
  useVoiceAssistant,
  useTracks,
  useChat,
  registerGlobals,
} from '@livekit/react-native'

// Register globals first
registerGlobals()

// Local imports
import { supabase } from "../../services/supabase"
import { useAuth } from "../../hooks/useAuth"
import { useAudioStore } from "../../../stores/audioStore"
import OtpInputWidget from './widgets/OtpInputWidget'
import EkycCameraWidget from './widgets/EkycCameraWidget'
import { TranscriptionTile } from './TranscriptionTile'

const { width, height } = Dimensions.get('window')

// Type definitions
interface LiveKitVoiceRoomProps {
  onConnectionChange?: (connected: boolean) => void
  onMessageReceived?: (message: any) => void
  sendMessageRef?: React.MutableRefObject<((message: string) => boolean) | null>
  handleSendMessage?: (message: string) => void
  addMessage?: (message: any) => void
  onTranscriptReceived?: (transcript: any) => void
  onVoiceStateChange?: (state: string) => void
  onCustomEvent?: (eventName: string, data: any) => void
}

interface VoiceAssistantWidgetProps {
  onDisconnect?: () => void
  onMessageReceived?: (message: any) => void
  sendMessageRef?: React.MutableRefObject<((message: string) => boolean) | null>
  externalSendMessage?: (message: string) => void
  roomSession?: any
  addMessage?: (message: any) => void
  onTranscriptReceived?: (transcript: any) => void
  onVoiceStateChange?: (state: string) => void
  onCustomEvent?: (eventName: string, data: any) => void
}

interface AgentTranscriptionTileProps {
  onAgentTranscript?: (transcript: any) => void
}

interface RoomSession {
  roomName: string
  participantName: string
  connectedAt: Date
  userId: string
}

export default function LiveKitVoiceRoom({
  onConnectionChange,
  onMessageReceived,
  sendMessageRef,
  handleSendMessage,
  addMessage,
  onTranscriptReceived,
  onVoiceStateChange,
  onCustomEvent
}: LiveKitVoiceRoomProps) {
  const [token, setToken] = useState<string | null>(null)
  const [wsUrl, setWsUrl] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messageCallbackRef = useRef(onMessageReceived)
  const internalSendMessageRef = useRef<((message: string) => boolean) | null>(null)
  const [roomSession, setRoomSession] = useState<RoomSession | null>(null)
  const { user } = useAuth()

  // Start AudioSession when component mounts
  useEffect(() => {
    let startAudioSession = async () => {
      try {
        await AudioSession.startAudioSession()
        console.log('AudioSession started successfully')
      } catch (error) {
        console.error('Failed to start AudioSession:', error)
      }
    }

    startAudioSession()
    
    return () => {
      AudioSession.stopAudioSession()
    }
  }, [])

  // Tự động kết nối khi component mount và user có sẵn
  useEffect(() => {
    if (user) {
      generateToken()
    }
  }, [user])

  // Expose send message function to the parent component
  useEffect(() => {
    if (sendMessageRef) {
      sendMessageRef.current = (message: string) => {
        if (internalSendMessageRef.current) {
          return internalSendMessageRef.current(message)
        }
        return false
      }
    }
  }, [sendMessageRef])

  // Tạo một room ID mới mỗi khi kết nối
  const generateUniqueRoomName = () => {
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 10)
    const userId = user?.id ? user.id.substring(0, 8) : 'anonymous'
    return `ai-assistant-room-${userId}-${timestamp}-${randomString}`
  }

  const generateToken = async () => {
    try {
      setIsConnecting(true)
      setError(null)

      if (!user) {
        throw new Error('User not authenticated')
      }

      const roomName = generateUniqueRoomName()
      const participantName = `user_${Math.random().toString(36).substr(2, 9)}`

      const additionalMetadata = {
        user_email: user.email,
        user_created_at: user.created_at,
        session_type: 'PV-Bank',
        device_info: {
          platform: 'React Native',
          timestamp: new Date().toISOString()
        }
      }

      setRoomSession({
        roomName,
        participantName,
        connectedAt: new Date(),
        userId: user.id
      })

      console.log('🚀 Generating token with user metadata:', {
        roomName,
        participantName,
        user_id: user.id,
        user_email: user.email
      })

      const { data, error } = await supabase.functions.invoke(
        'livekit-token1',
        {
          body: {
            roomName,
            participantName,
            user_id: user.id,
            metadata: {
              project: 'PV-Bank',
              deploy_mode: 'dev',
              user_id: user.id,
              user_email: user.email,
              user_created_at: user.created_at,
              session_type: 'ai_chat'
            }
          }
        }
      )

      if (error) throw error

      console.log('✅ Token generated successfully with metadata:', {
        user_id: data.user_id,
        participantName: data.participantName,
        metadata: data.metadata
      })

      setToken(data.token)
      setWsUrl(data.wsUrl)
    } catch (err: any) {
      console.error('Error generating token:', err)
      setError('Không thể kết nối voice chat: ' + (err?.message || 'Unknown error'))
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    setToken(null)
    setWsUrl(null)
    setRoomSession(null)
    onConnectionChange?.(false)
  }

  // Loading states
  if (!token) {
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Lỗi kết nối Voice Chat</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={generateToken}
            disabled={isConnecting || !user}
          >
            <Text style={styles.retryButtonText}>Thử lại kết nối</Text>
          </TouchableOpacity>
        </View>
      )
    }

    if (!user) {
      return (
        <View style={styles.warningContainer}>
          <Text style={styles.warningTitle}>Chưa đăng nhập</Text>
          <Text style={styles.warningText}>
            Vui lòng đăng nhập để sử dụng voice chat
          </Text>
        </View>
      )
    }

    return (
      <View style={styles.loadingContainer}>
        <View style={styles.spinner} />
        <Text style={styles.loadingText}>
          Đang kết nối voice chat cho {user.email}...
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <LiveKitRoom
        serverUrl={wsUrl || ''}
        token={token}
        connect={true}
        options={{
          // Use screen pixel density to handle screens with differing densities
          adaptiveStream: { pixelDensity: 'screen' },
        }}
        audio={true}
        video={false}
        onConnected={() => onConnectionChange?.(true)}
        onDisconnected={handleDisconnect}
      >
        <AgentTranscriptionTile onAgentTranscript={onTranscriptReceived} />
        <VoiceAssistantWidget
          onDisconnect={handleDisconnect}
          onMessageReceived={messageCallbackRef.current}
          sendMessageRef={internalSendMessageRef}
          externalSendMessage={handleSendMessage}
          roomSession={roomSession}
          addMessage={addMessage}
          onTranscriptReceived={onTranscriptReceived}
          onVoiceStateChange={onVoiceStateChange}
          onCustomEvent={onCustomEvent}
        />
      </LiveKitRoom>
    </View>
  )
}

function VoiceAssistantWidget({
  onDisconnect,
  onMessageReceived,
  sendMessageRef,
  externalSendMessage,
  roomSession,
  addMessage,
  onTranscriptReceived,
  onVoiceStateChange,
  onCustomEvent
}: VoiceAssistantWidgetProps) {
  const { state, audioTrack } = useVoiceAssistant()
  const [showOtpWidget, setShowOtpWidget] = useState(false)
  const [otpResolve, setOtpResolve] = useState<((value: string) => void) | null>(null)
  const [showEkycWidget, setShowEkycWidget] = useState(false)
  const [ekycResolve, setEkycResolve] = useState<((value: string) => void) | null>(null)
  
  const { isMuted, isDeafened, setMicState, setDeafenedState, setBotExists } = useAudioStore()

  const pendingTransactions = useRef(new Map())
  const room = useRoomContext()
  const { localParticipant } = useLocalParticipant()
  const participants = useParticipants()
  const { send } = useChat()
  const messageCallbackRef = useRef(onMessageReceived)
  
  // Audio level state
  const [audioLevel, setAudioLevel] = useState(0)
  const [isAudioActive, setIsAudioActive] = useState(false)
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current
  const opacityAnim = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    onVoiceStateChange && onVoiceStateChange(state)
  }, [state, onVoiceStateChange])

  useEffect(() => {
    messageCallbackRef.current = onMessageReceived
  }, [onMessageReceived])

  // Animated effects based on audio state
  useEffect(() => {
    if (isAudioActive) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1 + audioLevel / 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: Math.min(0.9, 0.4 + audioLevel / 80),
          duration: 200,
          useNativeDriver: true,
        })
      ]).start()
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.02,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 500,
          useNativeDriver: true,
        })
      ]).start()
    }
  }, [isAudioActive, audioLevel])

  // RPC Methods setup
  useEffect(() => {
    if (localParticipant) {
      localParticipant.registerRpcMethod('getEkycCode', async (data: RpcInvocationData): Promise<string> => {
        let params = null
        try {
          params = JSON.parse(data.payload)
          console.log('params rpc :', params)
          
          if (params.mode === 'otp') {
            return await new Promise<string>((resolve) => {
              setOtpResolve(() => resolve)
              setShowOtpWidget(true)
            })
          } else if (params.mode === 'ekyc') {
            return await new Promise<string>((resolve) => {
              setEkycResolve(() => resolve)
              setShowEkycWidget(true)
            })
          } else {
            return JSON.stringify({
              ekycCode: 'EKYC-123456',
              mode: params.mode
            })
          }
        } catch (error) {
          console.error('Lỗi khi xử lý yêu cầu getEkycCode:', error)
          return JSON.stringify({ error: 'Failed to process request' })
        }
      })
    }
  }, [localParticipant])

  const handleOtpSubmit = (otp: string) => {
    setShowOtpWidget(false)
    if (otpResolve) {
      otpResolve(JSON.stringify({ otp }))
      setOtpResolve(null)
    }
  }

  const handleEkycDone = () => {
    setShowEkycWidget(false)
    if (ekycResolve) {
      ekycResolve(JSON.stringify({ ekycResult: 'ekyc thành công' }))
      setEkycResolve(null)
    }
  }

  // Log session info
  useEffect(() => {
    if (roomSession) {
      console.log(`Connected to room: ${roomSession.roomName}`)
      console.log(`Participant name: ${roomSession.participantName}`)
      console.log(`User ID: ${roomSession.userId}`)
      console.log(`Connected at: ${roomSession.connectedAt}`)
    }
  }, [roomSession])

  // Log participant metadata
  useEffect(() => {
    if (localParticipant && roomSession) {
      console.log('🔍 Local participant metadata:', {
        identity: localParticipant.identity,
        name: localParticipant.name,
        metadata: localParticipant.metadata,
        user_id: roomSession.userId
      })
    }
  }, [localParticipant, roomSession])

  // Check if bot participant exists
  useEffect(() => {
    const botExists = participants.some(
      (p) =>
        p.identity === 'bot_ai' ||
        p.identity.startsWith('agent') ||
        p.identity.toLowerCase().includes('bot') ||
        p.identity.toLowerCase().includes('assistant')
    )
    setBotExists(botExists)
  }, [participants, setBotExists])

  // Send message setup
  useEffect(() => {
    if (sendMessageRef) {
      sendMessageRef.current = (message: string) => {
        if (send) {
          try {
            const msg = typeof message === 'object' ? JSON.stringify(message) : message
            send(msg)
            console.log('Message sent via LiveKit Chat API:', msg)
            return true
          } catch (error) {
            console.error('Error sending message via Chat API:', error)
            return false
          }
        }
        return false
      }
    }
  }, [sendMessageRef, send])

  // Chat message handling
  useEffect(() => {
    if (!room) return

    const handleChatMessage = (message: any) => {
      console.log('LiveKit Chat Message received:', message)

      if (onMessageReceived && message.from?.identity !== localParticipant?.identity) {
        onMessageReceived({
          content: message.content,
          sender: 'ai',
          timestamp: new Date()
        })
      }
    }

    room.on(RoomEvent.ChatMessage, handleChatMessage)

    return () => {
      room.off(RoomEvent.ChatMessage, handleChatMessage)
    }
  }, [room, localParticipant, onMessageReceived])

  // Text Stream Handler for metadata-topic
  useEffect(() => {
    if (!room) return

    const registerHandler = () => {
      console.log('Đang đăng ký text stream handler cho metadata-topic')

      try {
        room.registerTextStreamHandler(
          'metadata-topic',
          async (reader: any, participantInfo: any) => {
            const info = reader.info
            console.log(
              `Nhận được metadata stream từ ${participantInfo.identity}\n` +
              `  Topic: ${info.topic}\n` +
              `  Timestamp: ${info.timestamp}\n` +
              `  ID: ${info.id}\n` +
              `  Size: ${info.size || 'không xác định'}`
            )

            try {
              const text = await reader.readAll()
              console.log(`Nội dung metadata nhận được: ${text}`)
              const metadata = JSON.parse(text)

              // Xử lý metadata dựa vào method_name
              switch (metadata.method_name) {
                case 'initTransaction':
                  if (metadata.data) {
                    const {
                      receiver,
                      amount,
                      description,
                      transaction_id,
                      receiver_account_number,
                      bank_name,
                      source_account_type,
                      sender_account_number,
                      sender_name
                    } = metadata.data

                    if (!transaction_id) {
                      console.error('initTransaction missing transaction_id from backend')
                      return
                    }

                    pendingTransactions.current.set(transaction_id, {
                      data: {
                        receiver: receiver || 'Người nhận không xác định',
                        amount: amount || 0,
                        description: description || '',
                        timestamp: new Date().toISOString(),
                        transaction_id: transaction_id,
                        accountNumber: receiver_account_number,
                        bankName: bank_name || 'Techainer',
                        senderAccountNumber: sender_account_number,
                        senderName: sender_name,
                        sourceAccountType: source_account_type
                      },
                      createdAt: new Date()
                    })

                    console.log('🚀 DISPATCHING livekit-rpc-transaction with data:', {
                      receiver,
                      amount,
                      description,
                      transaction_id,
                      receiver_account_number,
                      bank_name,
                      source_account_type,
                      sender_account_number,
                      sender_name
                    });

                    // Trigger custom event cho AIChat
                    if (onCustomEvent) {
                      onCustomEvent('livekit-rpc-transaction', {
                        receiver,
                        amount,
                        description,
                        transaction_id,
                        receiver_account_number,
                        bank_name,
                        source_account_type,
                        sender_account_number,
                        sender_name
                      });
                    }
                  }
                  break

                case 'doneTransaction':
                  if (metadata.data) {
                    const { transaction_id } = metadata.data
                    
                    if (!transaction_id) {
                      console.error('doneTransaction missing transaction_id from backend')
                      return
                    }

                    const matchedTransaction = pendingTransactions.current.get(transaction_id)

                    if (matchedTransaction) {
                      console.log(`🎉 FOUND MATCHING TRANSACTION: ${transaction_id}`)
                      
                      matchedTransaction.data = {
                        ...matchedTransaction.data,
                        completed: true,
                        completedAt: new Date().toISOString()
                      }

                      console.log(`✅ Transaction ${transaction_id} completed`)
                      pendingTransactions.current.delete(transaction_id)
                    }
                  }
                  break

                default:
                  console.log(`Received metadata: ${metadata.method_name}`, metadata.data)
                  break
              }
            } catch (error) {
              console.error('Error processing metadata stream:', error)
            }
          }
        )

        console.log('Đăng ký handler thành công cho metadata-topic')
      } catch (regError) {
        console.error('Lỗi khi đăng ký text stream handler:', regError)
      }
    }

    if (room.state === 'connected') {
      registerHandler()
    } else {
      const handleConnected = () => {
        console.log('Room đã kết nối, đăng ký handler')
        registerHandler()
        room.off(RoomEvent.Connected, handleConnected)
      }
      room.on(RoomEvent.Connected, handleConnected)
    }

    return () => {
      if (room) {
        try {
          room.unregisterTextStreamHandler('metadata-topic')
          console.log('Đã hủy đăng ký text stream handler')
        } catch (error) {
          console.error('Lỗi khi hủy đăng ký handler:', error)
        }
      }
    }
  }, [room, localParticipant, send])

  // Transcription Handler
  useEffect(() => {
    if (!room) return

    const processedMessageIds = new Set()
    const processedContent = new Map()

    const registerTranscriptionHandler = () => {
      try {
        room.registerTextStreamHandler(
          'lk.transcription',
          async (reader: any, participantInfo: any) => {
            const identity = participantInfo.identity
            const text = await reader.readAll()
            const sender = identity.startsWith('user') ? 'user' : 'ai'

            const contentKey = `${identity}-${text}`
            const now = Date.now()

            if (processedContent.has(contentKey)) {
              const lastTime = processedContent.get(contentKey)
              if (now - lastTime < 2000) {
                console.log('⏭️ Skipping duplicate content:', contentKey)
                return
              }
            }

            processedContent.set(contentKey, now)
            const messageId = `lk-transcript-${identity}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

            console.log(`[lk.transcription] ${identity}: ${text} (ID: ${messageId})`)

            if (identity.startsWith('user') || identity.startsWith('agent')) {
              processedMessageIds.add(messageId)

              // Cleanup old entries
              if (processedMessageIds.size > 100) {
                const idsArray = Array.from(processedMessageIds)
                processedMessageIds.clear()
                idsArray.slice(-50).forEach((id) => processedMessageIds.add(id))
              }

              for (const [key, timestamp] of processedContent.entries()) {
                if (now - timestamp > 10000) {
                  processedContent.delete(key)
                }
              }

              onTranscriptReceived &&
                onTranscriptReceived({
                  id: messageId,
                  content: text,
                  sender: sender,
                  type: 'text',
                  timestamp: new Date(),
                  isFinal: true,
                  source: 'lk.transcription'
                })
            }
          }
        )
      } catch (error) {
        console.error('Lỗi khi đăng ký handler lk-transcription:', error)
      }
    }

    let isRegistered = false

    if (room.state === 'connected' && !isRegistered) {
      registerTranscriptionHandler()
      isRegistered = true
    } else {
      const handleConnected = () => {
        if (!isRegistered) {
          registerTranscriptionHandler()
          isRegistered = true
        }
        room.off(RoomEvent.Connected, handleConnected)
      }
      room.on(RoomEvent.Connected, handleConnected)
    }

    return () => {
      if (room && isRegistered) {
        try {
          room.unregisterTextStreamHandler('lk.transcription')
          console.log('Đã hủy đăng ký handler lk-transcription')
          isRegistered = false
        } catch (error) {
          console.error('Lỗi khi hủy đăng ký handler lk-transcription:', error)
        }
      }
    }
  }, [room])

  const handleToggle = () => {
    if (localParticipant) {
      localParticipant.setMicrophoneEnabled(isMuted)
      setMicState(!isMuted)
    }
    // Note: Room doesn't have setAudioEnabled method in React Native
    // You might need to use a different approach for audio control
  }

  const getStateColor = (state: string) => {
    switch (state) {
      case 'listening':
        return styles.listeningState
      case 'thinking':
        return styles.thinkingState
      case 'speaking':
        return styles.speakingState
      default:
        return styles.idleState
    }
  }

  const getBorderColor = (state: string) => {
    switch (state) {
      case 'listening':
        return '#3B82F6'
      case 'thinking':
        return '#A855F7'
      case 'speaking':
        return '#22C55E'
      default:
        return '#6B7280'
    }
  }

  return (
    <View style={[styles.widgetContainer, getStateColor(state)]}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/logo/icon-pvcombank.png')}
            style={styles.logo}
          />
          <Text style={styles.assistantText}>ABC Bank Assistant</Text>
        </View>
      </View>

      {showOtpWidget && (
        <OtpInputWidget 
          onSubmit={handleOtpSubmit}
          onCancel={() => setShowOtpWidget(false)}
        />
      )}
      
      {showEkycWidget && (
        <EkycCameraWidget 
          onDone={handleEkycDone}
          onCancel={() => setShowEkycWidget(false)}
        />
      )}

      {/* Avatar with audio visualization */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            <Image
              source={require('../../../assets/logo/icon-pvcombank.png')}
              style={styles.avatarImage}
            />
            
            <Animated.View
              style={[
                styles.audioRing,
                styles.audioRing1,
                {
                  borderColor: getBorderColor(state),
                  opacity: opacityAnim,
                  transform: [{ scale: scaleAnim }]
                }
              ]}
            />
            
            <Animated.View
              style={[
                styles.audioRing,
                styles.audioRing2,
                {
                  borderColor: getBorderColor(state),
                  opacity: opacityAnim,
                  transform: [{ scale: scaleAnim }]
                }
              ]}
            />
            
            {(audioLevel > 10 || state === 'speaking') && (
              <Animated.View
                style={[
                  styles.audioRing,
                  styles.audioRing3,
                  {
                    borderColor: getBorderColor(state),
                    opacity: opacityAnim,
                    transform: [{ scale: scaleAnim }]
                  }
                ]}
              />
            )}
          </View>
        </View>
      </View>

      {/* Mic toggle */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[
            styles.micButton,
            (isMuted || isDeafened) ? styles.micButtonOff : styles.micButtonOn
          ]}
          onPress={handleToggle}
        >
          <Text style={styles.micButtonText}>
            {isMuted || isDeafened ? '🔇 Bật Mic' : '🎤 Tắt Mic'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export function AgentTranscriptionTile({ onAgentTranscript }: AgentTranscriptionTileProps) {
  const tracks = useTracks()

  const agentAudioTrack = tracks.find(
    (trackRef) =>
      trackRef.publication.kind === Track.Kind.Audio &&
      trackRef.participant.identity?.toLowerCase().includes('agent')
  )

  return (
    <TranscriptionTile
      agentAudioTrack={agentAudioTrack}
      accentColor='#2563eb'
      onAgentTranscript={onAgentTranscript}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  
  // Loading states
  errorContainer: {
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#B91C1C',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  
  warningContainer: {
    padding: 16,
    backgroundColor: '#FFFBEB',
    borderColor: '#FED7AA',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#D97706',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 12,
    color: '#92400E',
  },
  
  loadingContainer: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    borderColor: '#E5E7EB',
    borderWidth: 1,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  spinner: {
    width: 16,
    height: 16,
    borderWidth: 2,
    borderColor: '#6B7280',
    borderTopColor: 'transparent',
    borderRadius: 8,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  
  // Widget styles
  widgetContainer: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    borderColor: '#E5E7EB',
    borderWidth: 1,
  },
  
  listeningState: {
    backgroundColor: 'rgba(239, 246, 255, 0.9)',
    borderColor: '#BFDBFE',
  },
  thinkingState: {
    backgroundColor: 'rgba(250, 245, 255, 0.9)',
    borderColor: '#E9D5FF',
  },
  speakingState: {
    backgroundColor: 'rgba(240, 253, 244, 0.9)',
    borderColor: '#BBF7D0',
  },
  idleState: {
    backgroundColor: 'rgba(249, 250, 251, 0.9)',
    borderColor: '#E5E7EB',
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    height: 24,
    width: 24,
    resizeMode: 'contain',
  },
  assistantText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
    zIndex: 10,
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    resizeMode: 'contain',
  },
  
  audioRing: {
    position: 'absolute',
    borderRadius: 40,
    borderWidth: 3,
  },
  audioRing1: {
    width: 80,
    height: 80,
    top: 0,
    left: 0,
  },
  audioRing2: {
    width: 90,
    height: 90,
    top: -5,
    left: -5,
    borderWidth: 2,
  },
  audioRing3: {
    width: 100,
    height: 100,
    top: -10,
    left: -10,
    borderWidth: 1,
  },
  
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  micButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  micButtonOn: {
    backgroundColor: '#10B981',
  },
  micButtonOff: {
    backgroundColor: '#6B7280',
  },
  micButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
})
