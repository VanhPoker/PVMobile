import React from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView 
} from 'react-native'
import PropTypes from 'prop-types'

export default function TransactionHistoryWidget({
  state = {},
  onAction,
  flowId
}) {
  const { transactions = [] } = state

  console.log('📊 TransactionHistoryWidget rendered:', {
    flowId,
    transactionCount: transactions.length,
    transactions
  })

  const formatCurrency = (amount, currency = 'VND') => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''

    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return dateString
    }
  }

  const getTransactionIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'transfer':
      case 'chuyển khoản':
        return '💸'
      case 'receive':
      case 'nhận tiền':
        return '💰'
      case 'payment':
      case 'thanh toán':
        return '💳'
      case 'withdrawal':
      case 'rút tiền':
        return '🏧'
      default:
        return '📄'
    }
  }

  const getAmountStyle = (amount, type) => {
    if (type?.toLowerCase().includes('receive') || type?.toLowerCase().includes('nhận')) {
      return styles.positiveAmount
    }
    if (amount < 0) {
      return styles.negativeAmount
    }
    return styles.neutralAmount
  }

  if (!transactions || transactions.length === 0) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.headerIcon}>📊</Text>
          <Text style={styles.headerTitle}>Lịch sử giao dịch</Text>
        </View>
        
        <View style={styles.emptyContent}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyTitle}>Không có giao dịch</Text>
          <Text style={styles.emptySubtitle}>
            Chưa có giao dịch nào được thực hiện
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>📊</Text>
        <Text style={styles.headerTitle}>Lịch sử giao dịch</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{transactions.length}</Text>
        </View>
      </View>

      <ScrollView style={styles.transactionsList} showsVerticalScrollIndicator={false}>
        {transactions.map((tx, idx) => (
          <View key={idx} style={styles.transactionItem}>
            <View style={styles.transactionHeader}>
              <View style={styles.transactionTitleContainer}>
                <Text style={styles.transactionIcon}>
                  {getTransactionIcon(tx.type)}
                </Text>
                <Text style={styles.transactionDescription} numberOfLines={2}>
                  {tx.description || 'Giao dịch'}
                </Text>
              </View>
              {tx.created_at && (
                <Text style={styles.transactionDate}>
                  {formatDate(tx.created_at)}
                </Text>
              )}
            </View>

            <View style={styles.transactionDetails}>
              <Text style={[styles.transactionAmount, getAmountStyle(tx.amount, tx.type)]}>
                {formatCurrency(tx.amount, tx.currency)}
              </Text>
            </View>

            {tx.from_account_id && tx.to_account_id && (
              <View style={styles.accountInfo}>
                <Text style={styles.accountInfoText} numberOfLines={1}>
                  <Text style={styles.accountLabel}>Từ: </Text>
                  <Text style={styles.accountNumber}>****{tx.from_account_id.slice(-4)}</Text>
                  <Text style={styles.accountArrow}> → </Text>
                  <Text style={styles.accountNumber}>****{tx.to_account_id.slice(-4)}</Text>
                </Text>
              </View>
            )}

            {tx.receiver_name && (
              <View style={styles.receiverInfo}>
                <Text style={styles.receiverLabel}>Người nhận: </Text>
                <Text style={styles.receiverName} numberOfLines={1}>
                  {tx.receiver_name}
                </Text>
              </View>
            )}

            {tx.status && (
              <View style={styles.statusContainer}>
                <View style={[
                  styles.statusBadge, 
                  tx.status === 'success' ? styles.successBadge : 
                  tx.status === 'pending' ? styles.pendingBadge : styles.failedBadge
                ]}>
                  <Text style={[
                    styles.statusText,
                    tx.status === 'success' ? styles.successText :
                    tx.status === 'pending' ? styles.pendingText : styles.failedText
                  ]}>
                    {tx.status === 'success' ? '✅ Thành công' :
                     tx.status === 'pending' ? '⏳ Đang xử lý' : '❌ Thất bại'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💡 Hiển thị {transactions.length} giao dịch gần nhất
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  headerIcon: {
    fontSize: 18,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  countBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  countText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  transactionsList: {
    maxHeight: 300,
  },
  transactionItem: {
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  transactionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  transactionIcon: {
    fontSize: 16,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  transactionDate: {
    fontSize: 10,
    color: '#6b7280',
  },
  transactionDetails: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  positiveAmount: {
    color: '#10b981',
  },
  negativeAmount: {
    color: '#ef4444',
  },
  neutralAmount: {
    color: '#3b82f6',
  },
  accountInfo: {
    marginBottom: 4,
  },
  accountInfoText: {
    fontSize: 12,
    color: '#6b7280',
  },
  accountLabel: {
    fontWeight: '500',
  },
  accountNumber: {
    fontFamily: 'monospace',
  },
  accountArrow: {
    color: '#9ca3af',
  },
  receiverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  receiverLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  receiverName: {
    fontSize: 12,
    color: '#374151',
    flex: 1,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  successBadge: {
    backgroundColor: '#d1fae5',
  },
  pendingBadge: {
    backgroundColor: '#fef3c7',
  },
  failedBadge: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  successText: {
    color: '#047857',
  },
  pendingText: {
    color: '#d97706',
  },
  failedText: {
    color: '#dc2626',
  },
  footer: {
    alignItems: 'center',
    marginTop: 12,
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
})

TransactionHistoryWidget.propTypes = {
  state: PropTypes.shape({
    transactions: PropTypes.arrayOf(
      PropTypes.shape({
        description: PropTypes.string,
        amount: PropTypes.number,
        currency: PropTypes.string,
        from_account_id: PropTypes.string,
        to_account_id: PropTypes.string,
        receiver_name: PropTypes.string,
        type: PropTypes.string,
        status: PropTypes.string,
        created_at: PropTypes.string
      })
    )
  }),
  onAction: PropTypes.func,
  flowId: PropTypes.string
}
