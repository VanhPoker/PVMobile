import React, { useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function AccountBlockStatusWidget({
  state = {},
  onAction,
  flowId
}: any) {
  const { account_number, status, message, actionType } = state
  const isSuccess = status === 'done'

  useEffect(() => {
    if (isSuccess && onAction && account_number) {
      // Cập nhật trạng thái tài khoản trên UI
      onAction({
        type: 'UPDATE_ACCOUNT_STATUS',
        payload: { account_number, actionType },
        flowId
      })
      // Đóng widget sau 2 giây
      const timer = setTimeout(() => {
        onAction({ type: 'CLOSE_WIDGET', flowId })
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isSuccess, onAction, account_number, actionType, flowId])

  return (
    <View style={[styles.card, isSuccess ? styles.successCard : styles.errorCard]}>
      <Text style={[styles.title, isSuccess ? styles.successTitle : styles.errorTitle]}>
        {actionType === 'unblock'
          ? isSuccess
            ? '✅ Mở khóa tài khoản thành công'
            : '❌ Mở khóa tài khoản thất bại'
          : isSuccess
            ? '✅ Khóa tài khoản thành công'
            : '❌ Khóa tài khoản thất bại'}
      </Text>
      <Text style={styles.accountInfo}>
        Số tài khoản: <Text style={styles.accountNumber}>{account_number}</Text>
      </Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    maxWidth: 400,
    width: '100%',
  },
  successCard: {
    backgroundColor: '#f0fdf4',
  },
  errorCard: {
    backgroundColor: '#fef2f2',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  successTitle: {
    color: '#15803d',
  },
  errorTitle: {
    color: '#dc2626',
  },
  accountInfo: {
    fontSize: 14,
    color: '#374151',
  },
  accountNumber: {
    fontWeight: 'bold',
  },
  message: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
})
