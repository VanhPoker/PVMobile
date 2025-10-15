import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function InvoiceDetailWidget({ state = {} }) {
  const inv = state.invoice || {}

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return styles.statusPending
      case 'expired':
        return styles.statusExpired
      default:
        return styles.statusDefault
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Chưa thanh toán'
      case 'expired':
        return 'Đã hết hạn'
      default:
        return status
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Chi tiết hóa đơn</Text>
      <View style={styles.content}>
        <View style={styles.invoiceCard}>
          <Text style={styles.supplierName}>
            {inv.supplier_name} ({inv.invoice_type})
          </Text>
          <Text style={styles.detail}>
            Tháng: {inv.billing_month?.slice(0, 7)}
          </Text>
          <Text style={styles.detail}>
            Hạn thanh toán: {inv.due_date}
          </Text>
          <Text style={[styles.status, getStatusStyle(inv.payment_status)]}>
            Trạng thái: {getStatusText(inv.payment_status)}
          </Text>
          <Text style={styles.amount}>
            Số tiền: {inv.amount?.toLocaleString()} VND
          </Text>
          {inv.notes && (
            <Text style={styles.notes}>Ghi chú: {inv.notes}</Text>
          )}
        </View>
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
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  content: {
    gap: 8,
  },
  invoiceCard: {
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 4,
  },
  supplierName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1d4ed8',
  },
  detail: {
    fontSize: 12,
    color: '#6b7280',
  },
  status: {
    fontSize: 12,
  },
  statusPending: {
    color: '#d97706',
  },
  statusExpired: {
    color: '#dc2626',
  },
  statusDefault: {
    color: '#6b7280',
  },
  amount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#dc2626',
  },
  notes: {
    fontSize: 12,
    color: '#9ca3af',
  },
})
