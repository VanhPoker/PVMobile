import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

interface OtpInputWidgetProps {
  state?: {
    removeSelf?: () => void;
  };
  onSubmit: (otp: string) => void;
  onCancel?: () => void;
}

export default function OtpInputWidget({ 
  state = {}, 
  onSubmit, 
  onCancel 
}: OtpInputWidgetProps) {
  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    // Auto focus first input when component mounts
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleSubmit = async () => {
    if (otp.length !== 6) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ 6 chữ số OTP');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(otp);
      
      // Show success message
      Alert.alert('Thành công', 'Xác thực OTP thành công!', [
        {
          text: 'OK',
          onPress: () => {
            // Auto close after 2 seconds like web version
            setTimeout(() => {
              if (state.removeSelf) {
                state.removeSelf();
              }
            }, 2000);
          }
        }
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Xác thực OTP thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    
    if (numericValue.length <= 1) {
      const newOtpDigits = [...otpDigits];
      newOtpDigits[index] = numericValue;
      setOtpDigits(newOtpDigits);
      
      // Update full OTP string
      setOtp(newOtpDigits.join(''));
      
      // Auto focus next input
      if (numericValue && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        // If current input is empty and backspace pressed, go to previous
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (value: string) => {
    // Handle paste of full OTP
    const numericValue = value.replace(/[^0-9]/g, '').slice(0, 6);
    const digits = numericValue.split('');
    
    // Pad with empty strings if needed
    while (digits.length < 6) {
      digits.push('');
    }
    
    setOtpDigits(digits);
    setOtp(numericValue);
    
    // Focus appropriate input
    const nextEmptyIndex = digits.findIndex(digit => !digit);
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  const clearOtp = () => {
    setOtpDigits(['', '', '', '', '', '']);
    setOtp('');
    inputRefs.current[0]?.focus();
  };

  return (
    <Modal 
      visible={true} 
      transparent 
      animationType="slide"
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView 
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1} 
          onPress={Keyboard.dismiss}
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>Nhập mã OTP</Text>
              {onCancel && (
                <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.description}>
              Vui lòng nhập mã OTP gồm 6 chữ số đã được gửi đến số điện thoại của bạn
            </Text>

            {/* OTP Input Fields */}
            <View style={styles.otpContainer}>
              {otpDigits.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => inputRefs.current[index] = ref}
                  style={[
                    styles.otpInput,
                    digit ? styles.otpInputFilled : {},
                    submitting ? styles.otpInputDisabled : {}
                  ]}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                  maxLength={1}
                  keyboardType="numeric"
                  textAlign="center"
                  selectTextOnFocus
                  editable={!submitting}
                  onFocus={() => {
                    // Select all text when focused
                    if (digit) {
                      setTimeout(() => {
                        inputRefs.current[index]?.setSelection(0, 1);
                      }, 10);
                    }
                  }}
                />
              ))}
            </View>

            {/* Alternative: Single input field */}
            <View style={styles.alternativeContainer}>
              <Text style={styles.alternativeLabel}>Hoặc nhập toàn bộ mã OTP:</Text>
              <TextInput
                style={[styles.fullOtpInput, submitting ? styles.otpInputDisabled : {}]}
                value={otp}
                onChangeText={(value) => {
                  const numericValue = value.replace(/[^0-9]/g, '').slice(0, 6);
                  setOtp(numericValue);
                  
                  // Update individual digits
                  const digits = numericValue.split('');
                  while (digits.length < 6) {
                    digits.push('');
                  }
                  setOtpDigits(digits);
                }}
                onPaste={(e) => {
                  const pastedText = e.nativeEvent.text || '';
                  handlePaste(pastedText);
                }}
                placeholder="Nhập 6 chữ số OTP"
                keyboardType="numeric"
                maxLength={6}
                editable={!submitting}
                textAlign="center"
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearOtp}
                disabled={submitting || !otp}
              >
                <Text style={styles.clearButtonText}>Xóa</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!otp || otp.length !== 6 || submitting) ? styles.submitButtonDisabled : {}
                ]}
                onPress={handleSubmit}
                disabled={!otp || otp.length !== 6 || submitting}
              >
                <Text style={[
                  styles.submitButtonText,
                  (!otp || otp.length !== 6 || submitting) ? styles.submitButtonTextDisabled : {}
                ]}>
                  {submitting ? 'Đang xác thực...' : 'Xác nhận'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Helper Text */}
            <Text style={styles.helperText}>
              Mã OTP có hiệu lực trong 5 phút
            </Text>

            <TouchableOpacity style={styles.resendButton}>
              <Text style={styles.resendButtonText}>Gửi lại mã OTP</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    color: '#6b7280',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  otpInput: {
    width: 45,
    height: 50,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  otpInputFilled: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  otpInputDisabled: {
    backgroundColor: '#f9fafb',
    borderColor: '#d1d5db',
    color: '#9ca3af',
  },
  alternativeContainer: {
    marginBottom: 24,
  },
  alternativeLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  fullOtpInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  clearButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  clearButtonText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 2,
    marginLeft: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  submitButtonTextDisabled: {
    color: '#9ca3af',
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  resendButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  resendButtonText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
});
