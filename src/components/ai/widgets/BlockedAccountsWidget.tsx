import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'

export default function BlockedAccountsWidget({
  state = {},
  onAction,
  flowId
}: any) {
  const { accounts = [], removeSelf } = state

  const handleUnlock = (acc: any) => {
    onAction &&
      onAction({ type: 'BLOCKED_ACCOUNT_UNLOCK', payload: acc, flowId })
    if (removeSelf) removeSelf()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount || 0)
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>🔒 Tài khoản đã khóa</Text>
      <ScrollView style={styles.accountsList} showsVerticalScrollIndicator={false}>
        {accounts
          .filter(
            (acc: any) => acc.blockStatus !== 'done' && acc.unblockStatus !== 'done'
          )
          .map((acc: any, idx: number) => (
            <View
              key={acc.account_number || idx}
              style={styles.accountItem}
            >
              <View style={styles.accountInfo}>
                <Text style={styles.accountType}>{acc.account_type}</Text>
                <Text style={styles.accountNumber}>{acc.account_number}</Text>
                <Text style={styles.balance}>
                  Số dư: {formatCurrency(acc.balance)}
                </Text>
                {acc.blockStatus && (
                  <Text style={[
                    styles.status,
                    acc.blockStatus === 'PENDING' ? styles.pendingStatus : styles.blockedStatus
                  ]}>
                    {acc.blockStatus === 'PENDING'
                      ? 'Đang chờ xử lý'
                      : 'Đã bị khóa'}
                  </Text>
                )}
                {acc.unblockStatus && (
                  <Text style={[
                    styles.status,
                    acc.unblockStatus === 'done' ? styles.successStatus : styles.errorStatus
                  ]}>
                    {acc.unblockStatus === 'done'
                      ? acc.unblockMessage || 'Mở tài khoản thành công'
                      : acc.unblockMessage || 'Mở tài khoản thất bại'}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.unlockButton}
                onPress={() => handleUnlock(acc)}
              >
                <Text style={styles.unlockButtonText}>Mở khóa</Text>
              </TouchableOpacity>
            </View>
          ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 16,
    maxWidth: 400,
    width: '100%',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#991b1b',
    marginBottom: 12,
  },
  accountsList: {
    gap: 8,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  accountInfo: {
    flex: 1,
  },
  accountType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#b91c1c',
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
  status: {
    fontSize: 12,
    marginTop: 4,
  },
  pendingStatus: {
    color: '#d97706',
  },
  blockedStatus: {
    color: '#dc2626',
  },
  successStatus: {
    color: '#059669',
  },
  errorStatus: {
    color: '#dc2626',
  },
  unlockButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  unlockButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
})
