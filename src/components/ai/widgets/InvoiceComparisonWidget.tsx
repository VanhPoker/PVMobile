import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

export default function InvoiceComparisonWidget({ state = {}, flowId }: any) {
  const { comparison, removeSelf } = state
  if (!comparison) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        📊 So sánh hóa đơn {comparison.comparison_direction}
      </Text>
      
      <View style={styles.content}>
        <View style={styles.comparisonItem}>
          <Text style={styles.monthLabel}>Tháng {comparison.month1}:</Text>
          <Text style={styles.monthValue}>
            {formatCurrency(comparison.month1_data.total_amount)} ({comparison.month1_data.total_count} hóa đơn)
          </Text>
        </View>
        
        <View style={styles.comparisonItem}>
          <Text style={styles.monthLabel}>Tháng {comparison.month2}:</Text>
          <Text style={styles.monthValue}>
            {formatCurrency(comparison.month2_data.total_amount)} ({comparison.month2_data.total_count} hóa đơn)
          </Text>
        </View>
        
        <View style={styles.deltaContainer}>
          <Text style={styles.deltaLabel}>Chênh lệch:</Text>
          <Text style={styles.deltaValue}>
            {formatCurrency(comparison.delta?.total_amount?.abs)}
            {comparison.delta?.total_amount?.pct !== null &&
              ` (${comparison.delta.total_amount.pct > 0 ? '+' : ''}${Number(comparison.delta.total_amount.pct).toFixed(2)}%)`}
          </Text>
        </View>
        
        <Text style={styles.filterInfo}>
          {comparison.filters?.invoice_type
            ? `Loại hóa đơn: ${comparison.filters.invoice_type}`
            : 'Tất cả các loại hóa đơn'}
        </Text>
      </View>
      
      {removeSelf && (
        <TouchableOpacity style={styles.closeButton} onPress={removeSelf}>
          <Text style={styles.closeButtonText}>Đóng</Text>
        </TouchableOpacity>
      )}
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
  content: {
    gap: 8,
    marginBottom: 12,
  },
  comparisonItem: {
    marginBottom: 4,
  },
  monthLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  monthValue: {
    fontSize: 14,
    color: '#374151',
    marginTop: 2,
  },
  deltaContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  deltaLabel: {
    fontSize: 14,
    color: '#1d4ed8',
    fontWeight: '600',
  },
  deltaValue: {
    fontSize: 14,
    color: '#1d4ed8',
    marginTop: 2,
  },
  filterInfo: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
  },
  closeButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
})
