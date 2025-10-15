import React, { useState } from 'react'
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert 
} from 'react-native'
import PropTypes from 'prop-types'

export default function AccountDetailWidget({ state = {}, onAction, flowId }) {
  const { account = {}, action = 'showAccount' } = state
  const [showFullAccount, setShowFullAccount] = useState(false)

  // Function để gửi metadata qua callback
  const sendMetadataToLiveKit = (actionType: string, accountData: any) => {
    const metadataMessage = {
      method_name: actionType,
      data: {
        account_number: accountData.account_number,
        account_type: accountData.type,
        amount: accountData.amount,
        currency_type: accountData.currency_type,
        action_source: 'account_detail_widget',
        timestamp: new Date().toISOString()
      }
    }

    console.log(`🚀 Sending ${actionType} metadata:`, metadataMessage)

    // React Native doesn't have window.dispatchEvent
    // Use onAction callback instead
    if (onAction) {
      onAction({
        type: 'SEND_METADATA',
        flowId,
        payload: {
          topic: 'metadata-topic',
          data: metadataMessage
        }
      })
    }
  }

  const handleAction = (actionType: string) => {
    console.log(`Account ${actionType} clicked:`, account)

    // Gửi metadata tương ứng với từng action
    switch (actionType) {
      case 'transfer':
        sendMetadataToLiveKit('requestTransfer', account)
        break
      case 'deposit':
        sendMetadataToLiveKit('requestDeposit', account)
        break
      case 'withdraw':
        sendMetadataToLiveKit('requestWithdraw', account)
        break
      case 'history':
        sendMetadataToLiveKit('requestTransactionHistory', account)
        break
      default:
        console.log(`Unknown action: ${actionType}`)
        break
    }

    // Giữ nguyên logic cũ để compatibility
    if (onAction) {
      onAction({
        type: 'TRIGGER_ACTION',
        flowId,
        payload: {
          actionName: actionType,
          data: {
            account: account,
            actionType: actionType
          }
        }
      })
    }
  }

  const formatCurrency = (amount: number, currency = 'VND') => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getAccountIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'thanh toán':
      case 'payment':
        return '💳'
      case 'tiết kiệm':
      case 'savings':
        return '🏦'
      case 'đầu tư':
      case 'investment':
        return '📈'
      default:
        return '💰'
    }
  }

  const getAccountStyle = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'thanh toán':
      case 'payment':
        return styles.paymentAccount
      case 'tiết kiệm':
      case 'savings':
        return styles.savingsAccount
      case 'đầu tư':
      case 'investment':
        return styles.investmentAccount
      default:
        return styles.defaultAccount
    }
  }

  // Function để toggle ẩn/hiện số tài khoản
  const toggleShowAccount = () => {
    setShowFullAccount((prev) => !prev)
  }

  if (!account || Object.keys(account).length === 0) {
    return (
      <View style={styles.emptyCard}>
        <View style={styles.emptyContent}>
          <Text style={styles.emptyIcon}>💳</Text>
          <Text style={styles.emptyTitle}>
            Không có thông tin tài khoản
          </Text>
          <Text style={styles.emptySubtitle}>
            Chưa có dữ liệu tài khoản để hiển thị
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.card}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerIcon}>💳</Text>
          <Text style={styles.headerTitle}>Chi tiết tài khoản</Text>
        </View>

        {/* Account Card */}
        <View style={[styles.accountCard, getAccountStyle(account.type)]}>
          <View style={styles.accountHeader}>
            <View style={styles.accountTypeContainer}>
              <Text style={styles.accountIcon}>{getAccountIcon(account.type)}</Text>
              <View>
                <Text style={styles.accountType}>{account.type}</Text>
                <Text style={styles.currencyType}>
                  {account.currency_type || 'VND'}
                </Text>
              </View>
            </View>
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>Số dư khả dụng</Text>
              <Text style={styles.balance}>
                {formatCurrency(account.amount, account.currency_type)}
              </Text>
            </View>
          </View>

          {/* Account Number (if available) */}
          {account.account_number && (
            <View style={styles.accountNumberSection}>
              <View style={styles.accountNumberContainer}>
                <View>
                  <Text style={styles.accountNumberLabel}>Số tài khoản</Text>
                  <Text style={styles.accountNumber}>
                    {showFullAccount
                      ? account.account_number
                      : `**** **** **** ${account.account_number.slice(-4)}`}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={toggleShowAccount}
                >
                  <Text style={styles.eyeIcon}>
                    {showFullAccount ? '🙈' : '👁️'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryAction]}
            onPress={() => handleAction('transfer')}
          >
            <Text style={styles.actionIcon}>📤</Text>
            <Text style={styles.primaryActionText}>Chuyển khoản</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryAction]}
            onPress={() => handleAction('deposit')}
          >
            <Text style={styles.actionIcon}>📥</Text>
            <Text style={styles.secondaryActionText}>Nạp tiền</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryAction]}
            onPress={() => handleAction('withdraw')}
          >
            <Text style={styles.actionIcon}>📤</Text>
            <Text style={styles.secondaryActionText}>Rút tiền</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryAction]}
            onPress={() => handleAction('history')}
          >
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.secondaryActionText}>Lịch sử</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>
          💡 Chọn thao tác bạn muốn thực hiện với tài khoản này
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    maxWidth: 400,
    width: '100%',
  },
  container: {
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  accountCard: {
    padding: 16,
    borderRadius: 12,
  },
  paymentAccount: {
    backgroundColor: '#3b82f6',
  },
  savingsAccount: {
    backgroundColor: '#10b981',
  },
  investmentAccount: {
    backgroundColor: '#8b5cf6',
  },
  defaultAccount: {
    backgroundColor: '#6b7280',
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  accountTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accountIcon: {
    fontSize: 24,
  },
  accountType: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
  currencyType: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  balance: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  accountNumberSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  accountNumberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountNumberLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  accountNumber: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: 'white',
  },
  eyeButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  eyeIcon: {
    fontSize: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
  },
  primaryAction: {
    backgroundColor: '#3b82f6',
  },
  secondaryAction: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  primaryActionText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  secondaryActionText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  emptyCard: {
    backgroundColor: '#fefbeb',
    borderColor: '#fed7aa',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    maxWidth: 400,
    width: '100%',
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#d97706',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#92400e',
    textAlign: 'center',
  },
})

AccountDetailWidget.propTypes = {
  state: PropTypes.shape({
    account: PropTypes.shape({
      type: PropTypes.string,
      amount: PropTypes.number,
      currency_type: PropTypes.string,
      account_number: PropTypes.string,
      interest_rate: PropTypes.number
    }),
    action: PropTypes.string
  }),
  onAction: PropTypes.func.isRequired,
  flowId: PropTypes.string.isRequired
}
