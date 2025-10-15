import React, { useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'

export default function BalanceWidgetComponent({ state, onAction, flowId }: any) {
  const { step, accounts, trendData } = state

  useEffect(() => {
    if (step === 'loading') {
      onAction({
        type: 'TRIGGER_ACTION',
        flowId,
        payload: { actionName: 'init' }
      })
    }
  }, [step, onAction, flowId])

  const formatCurrency = (num: number) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(num)

  const getAccountIcon = (name: string) => {
    if (name.toLowerCase().includes('tiết kiệm')) return '🐷'
    if (name.toLowerCase().includes('tín dụng')) return '💳'
    return '💰'
  }

  if (step === 'loading') {
    return (
      <View style={styles.card}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>⏳ Đang tải dữ liệu...</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>💰</Text>
        <Text style={styles.headerTitle}>Số dư tài khoản</Text>
      </View>

      <ScrollView style={styles.accountsList} showsVerticalScrollIndicator={false}>
        {accounts?.map((acc: any, index: number) => (
          <View key={index} style={styles.accountItem}>
            <View style={styles.accountInfo}>
              <Text style={styles.accountIcon}>{getAccountIcon(acc.name)}</Text>
              <Text style={styles.accountName}>{acc.name}</Text>
            </View>
            <Text style={[
              styles.accountBalance,
              acc.balance < 0 ? styles.negativeBalance : styles.positiveBalance
            ]}>
              {formatCurrency(acc.balance)}
            </Text>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.detailButton}
        onPress={() =>
          onAction({
            type: 'TRIGGER_ACTION',
            flowId,
            payload: { actionName: 'viewTransactions' }
          })
        }
      >
        <Text style={styles.detailButtonIcon}>👁️</Text>
        <Text style={styles.detailButtonText}>Xem chi tiết giao dịch</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    maxWidth: 340,
    width: '100%',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  headerIcon: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  accountsList: {
    gap: 8,
    marginBottom: 12,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    marginBottom: 4,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accountIcon: {
    fontSize: 16,
  },
  accountName: {
    fontSize: 14,
    color: '#374151',
  },
  accountBalance: {
    fontSize: 14,
    fontWeight: '500',
  },
  positiveBalance: {
    color: '#1f2937',
  },
  negativeBalance: {
    color: '#dc2626',
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  detailButtonIcon: {
    fontSize: 16,
  },
  detailButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
})
