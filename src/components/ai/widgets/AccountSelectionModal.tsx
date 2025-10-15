import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native'

export default function AccountSelectionModal() {
  const [accounts, setAccounts] = useState<any[]>([])
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleAccountSelection = (event: any) => {
      const { accounts } = event.detail
      if (Array.isArray(accounts) && accounts.length > 0) {
        setAccounts(accounts)
        setVisible(true)
      }
    }

    // React Native doesn't have window events, this is a placeholder
    // You would use EventEmitter or props callback instead
    
    return () => {
      // cleanup
    }
  }, [])

  const handleAccountSelect = (account: any) => {
    // Dispatch event or call callback
    setVisible(false)
  }

  if (!visible) return null

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setVisible(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Chọn tài khoản nhận tiền</Text>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setVisible(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.accountsList} showsVerticalScrollIndicator={false}>
            {accounts.map((account: any, index: number) => (
              <TouchableOpacity
                key={index}
                style={styles.accountItem}
                onPress={() => handleAccountSelect(account)}
              >
                <View>
                  <Text style={styles.receiverName}>{account.receiver}</Text>
                  <Text style={styles.accountNumber}>
                    STK: {account.receiver_account_number}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    maxWidth: 400,
    width: '90%',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1f2937',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#6b7280',
  },
  accountsList: {
    gap: 8,
  },
  accountItem: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  receiverName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  accountNumber: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
})
