import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/Header';
import { Button } from '../../src/components/Button';
import { Colors } from '../../src/constants/theme';
import { useTest } from '../../src/context/TestContext';
import { useAuth } from '../../src/context/AuthContext';
import { AlertRecord, AlertStatus, User } from '../../src/types';
import { MOCK_USERS } from '../../src/services/mockData';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AlertsScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const {
    alerts,
    updateAlertStatus,
    assignRecheck,
    markAlertRechlorinated,
    sendOfflineFallbackSmsForAlert,
    refreshData,
  } = useTest();

  const [filter, setFilter] = useState<'all' | 'open' | 'recheck' | 'rechlorinated'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [assigningAlert, setAssigningAlert] = useState<AlertRecord | null>(null);

  const isSupervisorOrOfficer = currentUser.role === 'supervisor' || currentUser.role === 'officer';

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'open') return a.status === 'open';
    if (filter === 'recheck') return a.status === 'recheck_assigned';
    if (filter === 'rechlorinated') return a.status === 'rechlorinated';
    return true;
  });

  const handleSelectWorkerForRecheck = async (worker: User) => {
    if (!assigningAlert) return;
    try {
      await assignRecheck(assigningAlert.id, worker.id, worker.name);
      setAssigningAlert(null);
      Alert.alert(
        'Recheck Assigned',
        `Recheck task assigned to ${worker.name}. Local notification dispatched.`
      );
    } catch {
      Alert.alert('Error', 'Could not assign recheck.');
    }
  };

  const handleMarkRechlorinated = async (alertId: string) => {
    try {
      await markAlertRechlorinated(alertId);
      Alert.alert('Resolved', 'Alert marked as Rechlorinated and safe.');
    } catch {
      Alert.alert('Error', 'Could not update alert status.');
    }
  };

  const handleSendOfflineSms = async (alertId: string) => {
    const success = await sendOfflineFallbackSmsForAlert(alertId);
    if (success) {
      Alert.alert('SMS Sent', 'Fallback SMS sent to village supervisor.');
    }
  };

  const getStatusBadge = (status: AlertStatus) => {
    if (status === 'open') {
      return (
        <View style={[styles.statusBadge, { backgroundColor: Colors.lowLight, borderColor: Colors.lowBorder }]}>
          <Ionicons name="alert-circle" size={13} color={Colors.low} />
          <Text style={[styles.statusBadgeText, { color: Colors.low }]}>OPEN ALERT</Text>
        </View>
      );
    }
    if (status === 'recheck_assigned') {
      return (
        <View style={[styles.statusBadge, { backgroundColor: Colors.highLight, borderColor: Colors.highBorder }]}>
          <Ionicons name="person" size={13} color={Colors.high} />
          <Text style={[styles.statusBadgeText, { color: Colors.high }]}>RECHECK ASSIGNED</Text>
        </View>
      );
    }
    return (
      <View style={[styles.statusBadge, { backgroundColor: Colors.safeLight, borderColor: Colors.safeBorder }]}>
        <Ionicons name="checkmark-done-circle" size={13} color={Colors.safe} />
        <Text style={[styles.statusBadgeText, { color: Colors.safe }]}>RECHLORINATED</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header title="Water Alerts" subtitle="Low-FRC Escalation & Rechlorination" />

      <View style={styles.container}>
        {/* Protocol Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="shield-half" size={20} color={Colors.low} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoBannerTitle}>Low-FRC Escalation Protocol</Text>
            <Text style={styles.infoBannerText}>
              Any water test below 0.2 ppm generates a high-priority alert. Supervise booster dosing,
              assign a recheck, and verify safe residual.
            </Text>
          </View>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {(['all', 'open', 'recheck', 'rechlorinated'] as const).map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.filterPill, filter === opt && styles.filterPillActive]}
              onPress={() => setFilter(opt)}
            >
              <Text style={[styles.filterText, filter === opt && styles.filterTextActive]}>
                {opt === 'all'
                  ? `ALL (${alerts.length})`
                  : opt === 'recheck'
                  ? 'RECHECKS'
                  : opt.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Alerts List */}
        <FlatList
          data={filteredAlerts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="checkmark-circle-outline" size={48} color={Colors.safe} />
              <Text style={styles.emptyTitle}>No Alerts In This View</Text>
              <Text style={styles.emptySub}>
                All drinking water points are currently safe or rechlorinated.
              </Text>
            </View>
          }
          renderItem={({ item }: { item: AlertRecord }) => {
            const isAssignedToCurrentUser =
              item.assigned_to === currentUser.id ||
              (item.assigned_to_name && item.assigned_to_name.includes(currentUser.name.split(' ')[0]));

            return (
              <View style={[styles.alertCard, isAssignedToCurrentUser && styles.alertCardAssigned]}>
                <View style={styles.cardHeader}>
                  {getStatusBadge(item.status)}
                  <Text style={styles.timeAgo}>
                    {new Date(item.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}{' '}
                    •{' '}
                    {new Date(item.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>

                {/* Worker Assignment Callout */}
                {isAssignedToCurrentUser && item.status === 'recheck_assigned' && (
                  <View style={styles.assignedCallout}>
                    <Ionicons name="notifications" size={15} color="#92400E" />
                    <Text style={styles.assignedCalloutText}>
                      Assigned to You: Please retest this tap stand
                    </Text>
                  </View>
                )}

                <View style={styles.cardBody}>
                  <Text style={styles.villageText}>{item.village_name}</Text>
                  <Text style={styles.frcText}>Chlorine Residual: {item.frc_range}</Text>
                  <Text style={styles.workerText}>Reported by: {item.worker_name}</Text>

                  {item.assigned_to_name && (
                    <Text style={styles.assignedToText}>
                      Assigned to: <Text style={{ fontWeight: '700' }}>{item.assigned_to_name}</Text>
                    </Text>
                  )}

                  {item.notes ? <Text style={styles.notesText}>{item.notes}</Text> : null}

                  {/* SMS Status Pill */}
                  <View style={styles.smsStatusRow}>
                    <Ionicons
                      name={
                        item.sms_sent_via_fallback || item.sms_status === 'sent'
                          ? 'chatbubble-ellipses'
                          : 'mail-unread'
                      }
                      size={12}
                      color={
                        item.sms_sent_via_fallback || item.sms_status === 'sent'
                          ? Colors.safe
                          : Colors.warning
                      }
                    />
                    <Text style={styles.smsStatusText}>
                      SMS Alert:{' '}
                      {item.sms_sent_via_fallback
                        ? 'Sent via Offline Fallback'
                        : item.sms_status === 'sent'
                        ? 'Dispatched via Gateway'
                        : 'Queued for sync'}
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.cardActions}>
                  {/* Supervisor: Assign Recheck */}
                  {isSupervisorOrOfficer && item.status === 'open' && (
                    <Button
                      title="Assign Recheck"
                      size="small"
                      variant="outline"
                      icon="person-add"
                      onPress={() => setAssigningAlert(item)}
                      style={{ flex: 1, marginRight: 6 }}
                    />
                  )}

                  {/* Supervisor: Mark Rechlorinated */}
                  {isSupervisorOrOfficer && item.status !== 'rechlorinated' && (
                    <Button
                      title="Mark Rechlorinated"
                      size="small"
                      variant="safe"
                      icon="checkmark-circle"
                      onPress={() => handleMarkRechlorinated(item.id)}
                      style={{ flex: 1 }}
                    />
                  )}

                  {/* Field Worker: Start Recheck Test */}
                  {!isSupervisorOrOfficer && item.status === 'recheck_assigned' && (
                    <Button
                      title="Perform Recheck Test"
                      size="small"
                      variant="primary"
                      icon="scan-circle"
                      onPress={() => router.push('/(tabs)/scan')}
                      style={{ flex: 1, marginRight: 6 }}
                    />
                  )}

                  {/* Offline SMS Fallback button if SMS not sent */}
                  {!item.sms_sent_via_fallback && item.sms_status === 'pending' && (
                    <TouchableOpacity
                      style={styles.offlineSmsIconBtn}
                      onPress={() => handleSendOfflineSms(item.id)}
                      accessibilityLabel="Send fallback SMS"
                    >
                      <Ionicons name="chatbox" size={16} color={Colors.low} />
                      <Text style={styles.offlineSmsBtnText}>SMS</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
        />

        {/* Modal: Choose a Worker to Assign Recheck */}
        <Modal
          visible={!!assigningAlert}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setAssigningAlert(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Assign Recheck Task</Text>
                <TouchableOpacity onPress={() => setAssigningAlert(null)}>
                  <Ionicons name="close-circle" size={26} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSub}>
                Select a field worker / volunteer to recheck chlorine residual in{' '}
                <Text style={{ fontWeight: '700' }}>{assigningAlert?.village_name}</Text>:
              </Text>

              {MOCK_USERS.filter((u) => u.role === 'worker').map((w) => (
                <TouchableOpacity
                  key={w.id}
                  style={styles.workerPickItem}
                  onPress={() => handleSelectWorkerForRecheck(w)}
                >
                  <View style={styles.workerPickAvatar}>
                    <Ionicons name="person" size={20} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.workerPickName}>{w.name}</Text>
                    <Text style={styles.workerPickPhone}>{w.phone} • {w.district} District</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={18} color={Colors.primary} />
                </TouchableOpacity>
              ))}

              <Button
                title="Cancel"
                variant="secondary"
                size="small"
                onPress={() => setAssigningAlert(null)}
                style={{ marginTop: 12 }}
              />
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  infoBanner: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 10,
  },
  infoBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#991B1B',
  },
  infoBannerText: {
    fontSize: 11,
    color: '#7F1D1D',
    marginTop: 2,
    lineHeight: 16,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  filterPill: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 24,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  alertCardAssigned: {
    borderColor: Colors.high,
    borderLeftWidth: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  timeAgo: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  assignedCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  assignedCalloutText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  cardBody: {
    marginBottom: 10,
  },
  villageText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  frcText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.low,
    marginTop: 2,
  },
  workerText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  assignedToText: {
    fontSize: 12,
    color: Colors.primaryDark,
    marginTop: 3,
  },
  notesText: {
    fontSize: 11,
    color: '#475569',
    backgroundColor: Colors.surface,
    padding: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  smsStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  smsStatusText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
    alignItems: 'center',
  },
  offlineSmsIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.lowLight,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.lowBorder,
  },
  offlineSmsBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.low,
  },
  emptyBox: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  modalSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 14,
    lineHeight: 18,
  },
  workerPickItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
    gap: 12,
  },
  workerPickAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workerPickName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  workerPickPhone: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
});
