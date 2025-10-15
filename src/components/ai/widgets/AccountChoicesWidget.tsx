import React from 'react'
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView 
} from 'react-native'

export default function AccountChoicesWidget({ state = {}, onAction, flowId }: any) {
  const { accounts = [], removeSelf } = state

  const handleSelect = (acc) => {
    // Gọi onAction nếu cần
    onAction &&
      onAction({ type: 'ACCOUNT_CHOICES_SELECTED', payload: acc, flowId })
    // Đóng widget sau khi chọn
    if (removeSelf) removeSelf()
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount || 0)
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>💳 Chọn tài khoản</Text>
      <ScrollView style={styles.accountsList} showsVerticalScrollIndicator={false}>
        {accounts
          .filter(
            (acc) => acc.blockStatus !== 'done' && acc.unblockStatus !== 'done'
          )
          .map((acc, idx) => (
            <View
              key={acc.account_number || idx}
              style={styles.accountItem}
            >
              <View style={styles.accountInfo}>
                <Text style={styles.accountType}>{acc.account_type}</Text>
                <Text style={styles.accountNumber}>
                  {acc.account_number}
                </Text>
                <Text style={styles.balance}>
                  Số dư: {formatCurrency(acc.balance)}
                </Text>
                {acc.blockStatus && (
                  <Text
                    style={[
                      styles.blockStatus,
                      acc.blockStatus === 'done'
                        ? styles.successStatus
                        : styles.errorStatus
                    ]}
                  >
                    {acc.blockStatus === 'done'
                      ? acc.blockMessage || 'Khóa tài khoản thành công'
                      : acc.blockMessage || 'Khóa tài khoản thất bại'}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                style={[
                  styles.selectButton,
                  acc.blockStatus === 'done' && styles.disabledButton
                ]}
                onPress={() => handleSelect(acc)}
                disabled={acc.blockStatus === 'done'}
              >
                <Text style={[
                  styles.selectButtonText,
                  acc.blockStatus === 'done' && styles.disabledButtonText
                ]}>
                  Chọn
                </Text>
              </TouchableOpacity>
            </View>
          ))}
      </ScrollView>
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
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  accountsList: {
    gap: 8,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  accountInfo: {
    flex: 1,
  },
  accountType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  accountNumber: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  balance: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  blockStatus: {
    fontSize: 12,
    marginTop: 4,
  },
  successStatus: {
    color: '#059669',
  },
  errorStatus: {
    color: '#dc2626',
  },
  selectButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  disabledButton: {
    backgroundColor: '#d1d5db',
  },
  selectButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  disabledButtonText: {
    color: '#9ca3af',
  },
})
