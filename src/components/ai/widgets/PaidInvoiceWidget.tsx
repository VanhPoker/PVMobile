import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function PaidInvoiceWidget({ state = {} }) {
  const inv = state.invoice || {}

  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        Hóa đơn đã thanh toán
      </Text>
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
          <Text style={styles.status}>
            Trạng thái: Đã thanh toán
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
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    maxWidth: 400,
    width: '100%',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 12,
  },
  content: {
    gap: 8,
  },
  invoiceCard: {
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    gap: 4,
  },
  supplierName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#15803d',
  },
  detail: {
    fontSize: 12,
    color: '#6b7280',
  },
  status: {
    fontSize: 12,
    color: '#059669',
  },
  amount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#15803d',
  },
  notes: {
    fontSize: 12,
    color: '#9ca3af',
  },
})
