import React, { useState } from 'react'
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView 
} from 'react-native'
import PropTypes from 'prop-types'

export default function AccountListWidget({ state = {}, onAction, flowId }) {
  const { accounts = [], action = 'showAll' } = state

  const [pendingAccounts, setPendingAccounts] = useState([])
  const [showFullAccount, setShowFullAccount] = useState({})

  console.log('🏦 AccountListWidget rendered:', {
    flowId,
    accountCount: accounts.length,
    action,
    accounts
  })

  const formatCurrency = (amount, currency = 'VND') => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getAccountIcon = (type) => {
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

  const getAccountStyle = (type) => {
    switch (type?.toLowerCase()) {
      case 'thanh toán':
      case 'payment':
        return styles.blueAccount
      case 'tiết kiệm':
      case 'savings':
        return styles.greenAccount
      case 'đầu tư':
      case 'investment':
        return styles.purpleAccount
      default:
        return styles.grayAccount
    }
  }

  const handleAccountAction = (account, actionType) => {
    console.log(`Account ${actionType} clicked:`, account)

    if (actionType === 'transfer') {
      // Gửi sự kiện sang LiveKit - React Native không có window
      // Có thể sử dụng EventEmitter hoặc props callback
      onAction &&
        onAction({
          type: 'ACCOUNT_SELECTED',
          flowId,
          payload: {
            ...account,
            message: `Tôi muốn chuyển khoản bằng tài khoản ${account.account_number} , type: ${account.type}`
          }
        })
    }

    onAction &&
      onAction({
        type: 'TRIGGER_ACTION',
        flowId,
        payload: {
          actionName: `account${actionType.charAt(0).toUpperCase() + actionType.slice(1)}`,
          data: {
            account: account,
            actionType: actionType
          }
        }
      })
  }

  const handleLockUnlock = (account, isLock) => {
    setPendingAccounts((prev) => [...prev, account.account_number])
    
    onAction &&
      onAction({
        type: 'ACCOUNT_LOCK_UNLOCK',
        flowId,
        payload: {
          ...account,
          message: `${isLock ? 'khoa' : 'mở'} tai khoan ${account.account_number}`,
          isLock
        }
      })
  }

  const toggleShowAccount = (account_number) => {
    setShowFullAccount((prev) => ({
      ...prev,
      [account_number]: !prev[account_number]
    }))
  }

  if (!accounts || accounts.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <View style={styles.emptyContent}>
          <Text style={styles.emptyIcon}>💳</Text>
          <Text style={styles.emptyTitle}>Không có tài khoản</Text>
          <Text style={styles.emptySubtitle}>
            Chưa có thông tin tài khoản để hiển thị
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.card}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerIcon}>💳</Text>
          <Text style={styles.headerTitle}>
            {action === 'showAll' ? 'Danh sách tài khoản' : 'Tài khoản của bạn'}
          </Text>
        </View>

        <ScrollView style={styles.accountsList} showsVerticalScrollIndicator={false}>
          {accounts
            .filter(
              (account) => !pendingAccounts.includes(account.account_number)
            )
            .map((account, index) => (
              <View
                key={index}
                style={[styles.accountItem, getAccountStyle(account.type)]}
              >
                <View style={styles.accountHeader}>
                  <View style={styles.accountTypeContainer}>
                    <Text style={styles.accountIcon}>
                      {getAccountIcon(account.type)}
                    </Text>
                    <Text style={styles.accountType}>{account.type}</Text>
                  </View>
                  <View style={styles.currencyBadge}>
                    <Text style={styles.currencyText}>
                      {account.currency_type || 'VND'}
                    </Text>
                  </View>
                </View>

                <View style={styles.accountNumberContainer}>
                  <Text style={styles.accountNumberLabel}>Số tài khoản: </Text>
                  <Text style={styles.accountNumber}>
                    {showFullAccount[account.account_number]
                      ? account.account_number
                      : `****${account.account_number.slice(-4)}`}
                  </Text>
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => toggleShowAccount(account.account_number)}
                  >
                    <Text style={styles.eyeIcon}>
                      {showFullAccount[account.account_number] ? '🙈' : '👁️'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.balanceContainer}>
                  <Text style={styles.balance}>
                    {formatCurrency(account.amount, account.currency_type)}
                  </Text>
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.transferButton]}
                    onPress={() => handleAccountAction(account, 'transfer')}
                  >
                    <Text style={styles.transferButtonText}>📤 Chuyển khoản</Text>
                  </TouchableOpacity>
                  
                  {account.status === 'active' ? (
                    <TouchableOpacity
                      style={[styles.button, styles.lockButton]}
                      onPress={() => handleLockUnlock(account, true)}
                    >
                      <Text style={styles.lockButtonText}>🔒 Khóa</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.button, styles.unlockButton]}
                      onPress={() => handleLockUnlock(account, false)}
                    >
                      <Text style={styles.unlockButtonText}>🔓 Mở</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            💡 Chọn tài khoản để thực hiện giao dịch
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 8,
    maxWidth: 400,
    width: '100%',
  },
  container: {
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  accountsList: {
    gap: 4,
  },
  accountItem: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 4,
  },
  blueAccount: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  greenAccount: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  purpleAccount: {
    backgroundColor: '#faf5ff',
    borderColor: '#e9d5ff',
  },
  grayAccount: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  accountTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accountIcon: {
    fontSize: 16,
  },
  accountType: {
    fontSize: 14,
    fontWeight: '500',
  },
  currencyBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  currencyText: {
    fontSize: 12,
    color: '#374151',
  },
  accountNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  accountNumberLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  accountNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
  },
  eyeButton: {
    marginLeft: 8,
    padding: 2,
  },
  eyeIcon: {
    fontSize: 12,
  },
  balanceContainer: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  balance: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  transferButton: {
    backgroundColor: '#3b82f6',
  },
  transferButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  lockButton: {
    backgroundColor: '#ef4444',
  },
  lockButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  unlockButton: {
    backgroundColor: '#10b981',
  },
  unlockButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  emptyCard: {
    backgroundColor: '#fffbeb',
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

AccountListWidget.propTypes = {
  state: PropTypes.shape({
    accounts: PropTypes.arrayOf(
      PropTypes.shape({
        type: PropTypes.string,
        amount: PropTypes.number,
        currency_type: PropTypes.string
      })
    ),
    action: PropTypes.string
  }),
  onAction: PropTypes.func.isRequired,
  flowId: PropTypes.string.isRequired
}
