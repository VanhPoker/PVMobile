import React from 'react'
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView 
} from 'react-native'
import PropTypes from 'prop-types'

export default function UserInfoWidget({ state = {}, onAction, flowId }) {
  const { userInfo = {}, action = 'showUserInfo' } = state

  console.log('👤 UserInfoWidget rendered:', {
    flowId,
    action,
    userInfo
  })

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật'

    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch (error) {
      return dateString
    }
  }

  const handleEditInfo = () => {
    console.log('Edit user info clicked')

    onAction({
      type: 'TRIGGER_ACTION',
      flowId,
      payload: {
        actionName: 'editUserInfo',
        data: {
          userInfo: userInfo
        }
      }
    })
  }

  const handleUpdateInfo = (field) => {
    console.log(`Update ${field} clicked`)

    onAction({
      type: 'TRIGGER_ACTION',
      flowId,
      payload: {
        actionName: 'updateUserField',
        data: {
          field: field,
          currentValue: userInfo[field]
        }
      }
    })
  }

  if (!userInfo || Object.keys(userInfo).length === 0) {
    return (
      <View style={styles.emptyCard}>
        <View style={styles.emptyContent}>
          <Text style={styles.emptyIcon}>👤</Text>
          <Text style={styles.emptyTitle}>Không có thông tin</Text>
          <Text style={styles.emptySubtitle}>
            Chưa có thông tin cá nhân để hiển thị
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.card}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerIcon}>👤</Text>
          <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
        </View>

        <View style={styles.infoList}>
          {/* Họ tên */}
          {userInfo.full_name && (
            <View style={styles.infoItem}>
              <View style={styles.infoContent}>
                <Text style={styles.infoIcon}>👤</Text>
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Họ và tên</Text>
                  <Text style={styles.infoValue}>{userInfo.full_name}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleUpdateInfo('full_name')}
              >
                <Text style={styles.editIcon}>✏️</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Email */}
          {userInfo.email && (
            <View style={styles.infoItem}>
              <View style={styles.infoContent}>
                <Text style={styles.infoIcon}>📧</Text>
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{userInfo.email}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleUpdateInfo('email')}
              >
                <Text style={styles.editIcon}>✏️</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Số điện thoại */}
          {userInfo.phone && (
            <View style={styles.infoItem}>
              <View style={styles.infoContent}>
                <Text style={styles.infoIcon}>📱</Text>
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Số điện thoại</Text>
                  <Text style={styles.infoValue}>{userInfo.phone}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleUpdateInfo('phone')}
              >
                <Text style={styles.editIcon}>✏️</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Ngày sinh */}
          {userInfo.date_of_birth && (
            <View style={styles.infoItem}>
              <View style={styles.infoContent}>
                <Text style={styles.infoIcon}>📅</Text>
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Ngày sinh</Text>
                  <Text style={styles.infoValue}>
                    {formatDate(userInfo.date_of_birth)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleUpdateInfo('date_of_birth')}
              >
                <Text style={styles.editIcon}>✏️</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Địa chỉ */}
          {userInfo.address && (
            <View style={styles.infoItem}>
              <View style={styles.infoContent}>
                <Text style={styles.infoIcon}>📍</Text>
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Địa chỉ</Text>
                  <Text style={styles.infoValue}>{userInfo.address}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleUpdateInfo('address')}
              >
                <Text style={styles.editIcon}>✏️</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.editAllButton} onPress={handleEditInfo}>
          <Text style={styles.editAllIcon}>✏️</Text>
          <Text style={styles.editAllText}>Chỉnh sửa thông tin</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            💡 Nhấn vào biểu tượng chỉnh sửa để cập nhật thông tin
          </Text>
        </View>
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
  container: {
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  headerIcon: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  infoList: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  infoIcon: {
    fontSize: 16,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  editButton: {
    padding: 8,
    borderRadius: 4,
  },
  editIcon: {
    fontSize: 12,
  },
  editAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  editAllIcon: {
    fontSize: 16,
    color: '#ffffff',
  },
  editAllText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 12,
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  emptyCard: {
    backgroundColor: '#fffbeb',
    borderColor: '#fed7aa',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    maxWidth: 400,
    width: '100%',
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#d97706',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#92400e',
    textAlign: 'center',
  },
})

UserInfoWidget.propTypes = {
  state: PropTypes.shape({
    userInfo: PropTypes.shape({
      full_name: PropTypes.string,
      email: PropTypes.string,
      phone: PropTypes.string,
      date_of_birth: PropTypes.string,
      address: PropTypes.string
    }),
    action: PropTypes.string
  }),
  onAction: PropTypes.func.isRequired,
  flowId: PropTypes.string.isRequired
}
