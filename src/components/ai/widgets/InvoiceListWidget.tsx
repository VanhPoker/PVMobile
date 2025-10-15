import React from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'

interface Invoice {
  id?: string
  supplier_name: string
  invoice_type: string
  payment_status: string
  billing_month?: string
  due_date: string
  amount?: number
}

interface InvoiceListProps {
  title: string
  invoices: Invoice[]
  color: string
  bgColor: string
}

function InvoiceListSection({ title, invoices, color, bgColor }: InvoiceListProps) {
  if (!invoices || invoices.length === 0) return null

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return styles.statusPending
      case 'done':
        return styles.statusDone
      default:
        return styles.statusOverdue
    }
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={[styles.indicator, { backgroundColor: bgColor }]} />
        <Text style={[styles.sectionTitle, { color }]}>
          {title} ({invoices.length})
        </Text>
      </View>
      <View style={styles.invoiceList}>
        {invoices.map((inv, idx) => (
          <View key={inv.id || idx} style={styles.invoiceItem}>
            <View style={styles.invoiceHeader}>
              <Text style={styles.supplierName}>
                {inv.supplier_name}
              </Text>
              <View style={[styles.typeBadge, getStatusStyle(inv.payment_status)]}>
                <Text style={[styles.typeText, getStatusStyle(inv.payment_status)]}>
                  {inv.invoice_type}
                </Text>
              </View>
            </View>

            <View style={styles.invoiceFooter}>
              <Text style={styles.invoiceDate}>
                {inv.billing_month?.slice(0, 7)} • Hạn: {inv.due_date}
              </Text>
              <Text style={styles.invoiceAmount}>
                {inv.amount?.toLocaleString()} ₫
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

export default function InvoiceListWidget({ state = {} }) {
  const { invoices = [], paid = [], pending = [], overdue = [] } = state

  // Nếu backend chỉ trả về invoices, tự phân loại
  const allInvoices = invoices.length
    ? invoices
    : [...(paid || []), ...(pending || []), ...(overdue || [])]

  const _pending = pending.length
    ? pending
    : allInvoices.filter((inv) => inv.payment_status === 'pending')
  const _paid = paid.length
    ? paid
    : allInvoices.filter((inv) => inv.payment_status === 'done')
  const _overdue = overdue.length
    ? overdue
    : allInvoices.filter((inv) => inv.payment_status === 'overdue')

  const totalInvoices = _pending.length + _paid.length + _overdue.length

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Hóa đơn</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {totalInvoices} hóa đơn
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <InvoiceListSection
          title="Chưa thanh toán"
          invoices={_pending}
          color="#b45309"
          bgColor="#fbbf24"
        />
        <InvoiceListSection
          title="Quá hạn"
          invoices={_overdue}
          color="#b91c1c"
          bgColor="#ef4444"
        />
        <InvoiceListSection
          title="Đã thanh toán"
          invoices={_paid}
          color="#047857"
          bgColor="#10b981"
        />

        {totalInvoices === 0 && (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>📄</Text>
            </View>
            <Text style={styles.emptyText}>Chưa có hóa đơn nào</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    maxWidth: 500,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  countBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: 12,
    color: '#6b7280',
  },
  content: {
    maxHeight: 400,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  invoiceList: {
    gap: 12,
  },
  invoiceItem: {
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  supplierName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
  },
  statusPending: {
    backgroundColor: '#fef3c7',
    color: '#b45309',
  },
  statusDone: {
    backgroundColor: '#d1fae5',
    color: '#047857',
  },
  statusOverdue: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
  },
  invoiceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invoiceDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  invoiceAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#f3f4f6',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyIconText: {
    fontSize: 24,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
  },
})
