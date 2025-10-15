import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions
} from 'react-native'

// Thay thế useWindowResize bằng Dimensions của React Native
const useWindowResize = () => {
  const [windowSize, setWindowSize] = useState(() => {
    const { width, height } = Dimensions.get('window')
    return { width, height }
  })

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setWindowSize({ width: window.width, height: window.height })
    })

    return () => subscription?.remove()
  }, [])

  return windowSize
}

export const ChatMessageInput = ({
  placeholder,
  accentColor,
  height,
  onSend
}) => {
  const [message, setMessage] = useState('')
  const [inputHasFocus, setInputHasFocus] = useState(false)

  const handleSend = useCallback(() => {
    if (!onSend || message.trim() === '') {
      return
    }
    onSend(message.trim())
    setMessage('')
  }, [onSend, message])

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.textInput,
            {
              borderColor: inputHasFocus ? accentColor : '#374151',
              opacity: inputHasFocus ? 1 : 0.7
            }
          ]}
          placeholder={placeholder}
          placeholderTextColor='#9CA3AF'
          value={message}
          onChangeText={setMessage}
          onFocus={() => setInputHasFocus(true)}
          onBlur={() => setInputHasFocus(false)}
          onSubmitEditing={handleSend}
          returnKeyType='send'
          multiline={false}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              opacity: message.trim().length > 0 ? 1 : 0.3,
              backgroundColor:
                message.trim().length > 0 ? accentColor : '#6B7280'
            }
          ]}
          onPress={handleSend}
          disabled={message.trim().length === 0}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingTop: 12
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#E5E7EB',
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 6,
    minHeight: 40
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center'
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase'
  }
})
