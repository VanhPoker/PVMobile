import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  FlatList
} from 'react-native'
// import { getSavedRecipients } from '@/integrations/supabase/userService'

export default function TransferWidgetComponent({
  state,
  onAction,
  flowId,
  onSetInputMessage
}: any) {
  const {
    step,
    recipient,
    sender,
    amount,
    description,
    transactionId,
    bankName
  } = state

  // State cho các input
  const [recipientName, setRecipientName] = useState(recipient?.name || '')
  const [accountNumber, setAccountNumber] = useState(
    recipient?.accountNumber || ''
  )
  const [transferAmount, setTransferAmount] = useState(amount || 0)
  const [transferDescription, setTransferDescription] = useState(
    description || ''
  )

  useEffect(() => {
    setRecipientName(recipient?.name || '')
    setAccountNumber(recipient?.accountNumber || '')
    setTransferAmount(amount || 0)
    setTransferDescription(description || '')
  }, [recipient, amount, description])

  const getBankLogo = (bankName: string) => {
    const logoMap: Record<string, any> = {
      'pvcombank': require('../../../../assets/logo/icon-pvcombank.png'),
      'bidv': require('../../../../assets/logo/bidv-logo.jpg'),
      'agribank': require('../../../../assets/logo/agribank-logo.png'),
      'vietcombank': require('../../../../assets/logo/vietcombank-logo.png'),
      'techcombank': require('../../../../assets/logo/techcombank-logo.png'),
      'mbbank': require('../../../../assets/logo/mbbank-logo.png'),
      'vpbank': require('../../../../assets/logo/vpbank-logo.png'),
    }
    return logoMap[bankName.toLowerCase()] || null
  }

  const formatCurrency = (num: any) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(num)
  }

  // Function để format số tiền theo kiểu VN (dấu phẩy)
  const formatAmount = (num: any) => {
    if (!num) return ''
    return Number(num).toLocaleString('vi-VN')
  }



  const handleConfirm = () => {
    const payloadData = {
      recipientName,
      accountNumber,
      amount: Number(transferAmount),
      description: transferDescription,
      transactionId,
      bankName
    }

    // ✅ Gửi message trực tiếp vào metadata-topic
    if (onAction) {
      onAction({
        type: 'SEND_MESSAGE_TO_METADATA_TOPIC',
        flowId,
        payload: {
          message: 'xác nhận chuyển khoản nếu đã đủ thông tin',
          data: payloadData
        }
      })
    }

    // Trigger action cũ (nếu cần)
    if (onAction) {
      onAction({
        type: 'TRIGGER_ACTION',
        flowId,
        payload: {
          actionName: 'confirmTransfer',
          data: payloadData
        }
      })
    }

    if (onSetInputMessage) {
      onSetInputMessage(`xác nhận chuyển khoản nếu đã đủ thông tin`)
    }
  }

  const handleCancel = () => {
    // React Native doesn't have window.dispatchEvent
    
    if (onAction) {
      onAction({
        type: 'CLOSE_WIDGET',
        flowId
      })
    }
  }

  const formatAccountNumber = (accountNumber: any) => {
    if (!accountNumber || accountNumber.toString().trim() === '') {
      return '(Không có số tài khoản)'
    }

    const cleanNumber = accountNumber.toString().replace(/\s+/g, '')
    if (cleanNumber.length < 4) {
      return cleanNumber
    }

    // Format: xxxx xxxx xxxx
    return cleanNumber.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  if (step === 'confirm') {
    return (
      <View style={styles.confirmContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Xác nhận chuyển tiền</Text>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Huỷ</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Tài khoản nguồn */}
          <View style={styles.sourceAccountContainer}>
            <Text style={styles.sectionTitle}>Từ tài khoản</Text>
            <View style={styles.accountCard}>
              <View style={styles.bankIconContainer}>
                <Image
                  source={require('../../../../assets/logo/icon-pvcombank.png')}
                  style={styles.bankIcon}
                />
              </View>
              <View style={styles.accountInfo}>
                <Text style={styles.accountName}>
                  {(sender?.name || 'Tài khoản của bạn').toUpperCase()}
                </Text>
                <Text style={styles.bankName}>
                  PVcomBank - {sender?.accountType || 'Thanh toán'}
                </Text>
                <Text style={styles.accountNumber}>
                  {sender?.accountNumber
                    ? formatAccountNumber(sender.accountNumber)
                    : '••••'}
                </Text>
              </View>
            </View>
          </View>

          {/* Người nhận */}
          <View style={styles.recipientContainer}>
            <Text style={styles.sectionTitle}>Đến tài khoản</Text>
            <View style={[styles.accountCard, styles.recipientCard]}>
              <View style={styles.bankIconContainer}>
                {getBankLogo(bankName) ? (
                  <Image
                    source={getBankLogo(bankName)}
                    style={styles.bankIcon}
                  />
                ) : (
                  <View style={styles.defaultBankIcon}>
                    <Text style={styles.checkIcon}>✓</Text>
                  </View>
                )}
              </View>
              <View style={styles.accountInfo}>
                <Text style={styles.accountName}>
                  {recipientName.toUpperCase()}
                </Text>
                <Text style={styles.bankName}>
                  {bankName || 'PVcomBank'}
                </Text>
                <Text style={styles.accountNumber}>
                  {accountNumber
                    ? formatAccountNumber(accountNumber)
                    : '(Không có số tài khoản)'}
                </Text>
              </View>
            </View>
          </View>

          {/* Số tiền */}
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Số tiền</Text>
            <Text style={styles.amount}>
              {formatAmount(transferAmount)} <Text style={styles.currency}>₫</Text>
            </Text>
            <View style={styles.transactionDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phí</Text>
                <Text style={styles.freeText}>Miễn phí</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Hình thức</Text>
                <Text style={styles.detailValue}>
                  Chuyển nhanh <Text style={styles.napasText}>napas 24/7</Text>
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Nội dung</Text>
                <Text style={[styles.detailValue, styles.contentText]}>
                  {transferDescription || 'Chuyển tiền'}
                </Text>
              </View>
            </View>
          </View>

          {/* Xác thực */}
          <View style={styles.verificationContainer}>
            <View style={styles.checkIconContainer}>
              <Text style={styles.checkIcon}>✓</Text>
            </View>
            <Text style={styles.verificationText}>
              Được xác thực bởi PVcomBank
            </Text>
          </View>

          {/* Nút xác nhận */}
          <TouchableOpacity
            onPress={handleConfirm}
            style={styles.confirmButton}
          >
            <Text style={styles.confirmButtonText}>Xác nhận</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    )
  }

  if (step === 'processing') {
    return (
      <View style={styles.card}>
        <View style={styles.processingContainer}>
          <Text style={styles.loadingIcon}>⏳</Text>
          <View>
            <Text style={styles.processingTitle}>Đang xử lý giao dịch...</Text>
            <Text style={styles.processingSubtitle}>
              Chờ xác nhận từ hệ thống ngân hàng
            </Text>
            {transactionId && (
              <Text style={styles.transactionId}>
                Mã giao dịch: {transactionId}
              </Text>
            )}
          </View>
        </View>
      </View>
    )
  }

  if (step === 'completed') {
    return (
      <View style={styles.completedCard}>
        <View style={styles.completedHeader}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../../assets/logo/icon-pvcombank.png')}
              style={styles.completedLogo}
            />
          </View>
          <Text style={styles.successTitle}>
            Chuyển tiền thành công
          </Text>
          <Text style={styles.successAmount}>
            {formatCurrency(amount)}
          </Text>
          <Text style={styles.successTime}>
            {new Date().toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit'
            })}{' '}
            - {new Date().toLocaleDateString('vi-VN')}
          </Text>
        </View>

        <View style={styles.completedContent}>
          <View style={styles.completedRow}>
            <Text style={styles.completedLabel}>Tên người nhận</Text>
            <View style={styles.completedValueContainer}>
              <Text style={styles.completedValue}>
                {recipient.name}
              </Text>
              <TouchableOpacity
                style={styles.saveButton}
                disabled
              >
                <Text style={styles.saveButtonText}>+ Lưu người nhận</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.completedRow}>
            <Text style={styles.completedLabel}>Ngân hàng nhận</Text>
            <View style={styles.bankContainer}>
              <View style={styles.completedBankIcon}>
                {getBankLogo(bankName) ? (
                  <Image
                    source={getBankLogo(bankName)}
                    style={styles.bankIconSmall}
                  />
                ) : (
                  <View style={styles.defaultBankIcon}>
                    <Text style={styles.checkIcon}>✓</Text>
                  </View>
                )}
              </View>
              <Text style={styles.completedValue}>
                {bankName || 'PVcomBank'}
              </Text>
            </View>
          </View>

          <View style={styles.completedRow}>
            <Text style={styles.completedLabel}>Số tài khoản nhận</Text>
            <Text style={styles.completedAccountNumber}>
              {formatAccountNumber(recipient.accountNumber)}
            </Text>
          </View>

          <View style={styles.completedRow}>
            <Text style={styles.completedLabel}>Nội dung</Text>
            <Text style={[styles.completedValue, styles.contentValue]}>
              {description}
            </Text>
          </View>

          {state.transactionId && (
            <View style={styles.completedRow}>
              <Text style={styles.completedLabel}>Mã giao dịch</Text>
              <Text style={styles.completedValue}>
                {state.transactionId}
              </Text>
            </View>
          )}

          <View style={styles.completedRow}>
            <Text style={styles.completedLabel}>Hình thức</Text>
            <Text style={styles.completedValue}>
              Chuyển nhanh Napas
            </Text>
          </View>
        </View>
      </View>
    )
  }

  return null
}

const styles = StyleSheet.create({
  confirmContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    maxWidth: 400,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  cancelButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3b82f6',
  },
  content: {
    padding: 16,
  },
  sourceAccountContainer: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  recipientContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  recipientCard: {
    borderColor: '#3b82f6',
    borderWidth: 2,
  },
  bankIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bankIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  defaultBankIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  bankName: {
    fontSize: 12,
    color: '#6b7280',
  },
  accountNumber: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  amountContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  currency: {
    fontSize: 12,
  },
  transactionDetails: {
    width: '100%',
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111827',
  },
  freeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#10b981',
  },
  napasText: {
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  contentText: {
    flex: 1,
    textAlign: 'right',
    marginLeft: 8,
  },
  verificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    marginBottom: 8,
  },
  checkIconContainer: {
    width: 16,
    height: 16,
    backgroundColor: '#10b981',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verificationText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#047857',
  },
  confirmButton: {
    width: '100%',
    backgroundColor: '#fbbf24',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    maxWidth: 400,
    width: '100%',
  },
  processingContainer: {
    alignItems: 'center',
    gap: 16,
  },
  loadingIcon: {
    fontSize: 32,
  },
  processingTitle: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  processingSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
  transactionId: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 4,
  },
  completedCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    maxWidth: 400,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  completedHeader: {
    backgroundColor: '#fbbf24',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  logoContainer: {
    width: 56,
    height: 56,
    backgroundColor: 'white',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    padding: 4,
  },
  completedLogo: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
  },
  successTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  successAmount: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  successTime: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 4,
  },
  completedContent: {
    padding: 20,
    gap: 12,
  },
  completedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completedLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  completedValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  completedValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButton: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  saveButtonText: {
    fontSize: 12,
    color: '#3b82f6',
    opacity: 0.5,
  },
  bankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completedBankIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bankIconSmall: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  completedAccountNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'monospace',
  },
  contentValue: {
    textAlign: 'right',
  },
})

// Add TypeScript interfaces
interface TransferWidgetProps {
  state: {
    step: string
    recipient?: {
      name: string
      accountNumber: string
    }
    sender?: {
      name: string
      accountNumber: string
      accountType: string
    }
    amount: number
    description: string
    transactionId?: string
    bankName?: string
  }
  onAction: (action: any) => void
  flowId: string
  onSetInputMessage?: (message: string) => void
}


