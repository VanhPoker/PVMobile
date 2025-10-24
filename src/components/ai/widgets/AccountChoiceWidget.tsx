import React, { useState } from 'react'
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView 
} from 'react-native'

export default function AccountChoiceWidget({ state = {}, onAction }: any) {
  const { accounts = [] } = state
  const [selectedId, setSelectedId] = useState(null)

  const formatAccountNumber = (accountNumber: any) => {
    if (!accountNumber) return ''
    const cleanNumber = accountNumber.toString().replace(/\s+/g, '')
    return cleanNumber.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  const handleSelect = (acc: any, idx: number) => {
    setSelectedId(acc.id || idx)

    // Delay để show animation
    setTimeout(() => {
      console.log('🎯 Account selected:', acc);
      
      // ✅ Gửi message trực tiếp vào metadata-topic
      if (onAction) {
        onAction({
          type: 'SEND_MESSAGE_TO_METADATA_TOPIC',
          flowId: 'destination-choice',
          payload: {
            message: `Tôi chọn tài khoản ${acc.receiver} - ${acc.receiver_account_number} tại ${acc.bank_name}`,
            selectedAccount: acc
          }
        })
      }

      // Gọi onAction cho UI update nếu cần
      onAction && onAction({ 
        type: 'ACCOUNT_SELECTED', 
        payload: {
          ...acc,
          message: `Tôi chọn tài khoản ${acc.receiver} - ${acc.receiver_account_number} tại ${acc.bank_name}`
        }
      })
    }, 300)
  }

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.headerIcon}>💳</Text>
        </View>
        <View>
          <Text style={styles.headerTitle}>Chọn tài khoản nhận</Text>
          <Text style={styles.headerSubtitle}>{accounts.length} tài khoản</Text>
        </View>
      </View>

      {/* Account List */}
      <ScrollView style={styles.accountList} showsVerticalScrollIndicator={false}>
        {accounts.map((acc: any, idx: number) => {
          const isSelected = selectedId === (acc.id || idx)

          return (
            <TouchableOpacity
              key={acc.id || idx}
              style={[
                styles.accountItem,
                isSelected ? styles.selectedAccount : styles.unselectedAccount
              ]}
              onPress={() => handleSelect(acc, idx)}
            >
              {/* Selection indicator */}
              {isSelected && (
                <View style={styles.selectionIndicator}>
                  <Text style={styles.checkIcon}>✓</Text>
                </View>
              )}

              <View style={styles.accountContent}>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountName}>
                    {acc.account_name || acc.receiver || 'Tài khoản'}
                  </Text>
                  <Text style={styles.accountNumber}>
                    {formatAccountNumber(acc.receiver_account_number)}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.selectButton,
                    isSelected ? styles.selectedButton : styles.unselectedButton
                  ]}
                  onPress={() => handleSelect(acc, idx)}
                >
                  <Text style={[
                    styles.selectButtonText,
                    isSelected ? styles.selectedButtonText : styles.unselectedButtonText
                  ]}>
                    {isSelected ? 'Xác nhận' : 'Chọn'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Selection animation */}
              {isSelected && (
                <View style={styles.animationContainer}>
                  <View style={styles.animationDot} />
                </View>
              )}
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    maxWidth: 400,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    backgroundColor: '#f9fafb',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  accountList: {
    padding: 16,
  },
  accountItem: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
  },
  selectedAccount: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  unselectedAccount: {
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  selectionIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  accountContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  selectButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedButton: {
    backgroundColor: '#3b82f6',
  },
  unselectedButton: {
    backgroundColor: '#f3f4f6',
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedButtonText: {
    color: '#ffffff',
  },
  unselectedButtonText: {
    color: '#374151',
  },
  animationContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  animationDot: {
    width: 4,
    height: 4,
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
})
