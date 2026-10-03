import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/constants/theme';
import { Header } from '../../src/components/Header';
import { Button } from '../../src/components/Button';
import { StatusBadge } from '../../src/components/StatusBadge';
import { useAuth } from '../../src/context/AuthContext';
import { useTest } from '../../src/context/TestContext';
import { MOCK_VILLAGES } from '../../src/services/mockData';
import { Village, TestRecord } from '../../src/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const {
    activeVillage,
    setActiveVillage,
    tests,
    alerts,
    resetCurrentTest,
    syncStats,
    isOnline,
    isSyncing,
    triggerSync,
    setSimulatedNetworkStatus,
  } = useTest();
  const [villageModalVisible, setVillageModalVisible] = useState(false);

  // Compute metrics
  const totalTests = tests.length;
  const safeTests = tests.filter((t) => t.status === 'safe').length;
  const safePercentage = totalTests > 0 ? Math.round((safeTests / totalTests) * 100) : 100;
  const openAlerts = alerts.filter((a) => a.status === 'open').length;

  const handleStartNewTest = () => {
    resetCurrentTest();
    router.push('/(tabs)/scan');
  };

  const handleSelectVillage = (village: Village) => {
    setActiveVillage(village);
    setVillageModalVisible(false);
  };

  const handleManualSync = async () => {
    try {
      const res = await triggerSync();
      Alert.alert('Sync Status', res.message);
    } catch {
      Alert.alert('Sync Failed', 'Could not complete cloud sync.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Phase 2: Offline Storage & Cloud Sync Status Banner */}
        <View
          style={[
            styles.syncBanner,
            !isOnline
              ? styles.syncBannerOffline
              : syncStats.pending > 0
              ? styles.syncBannerPending
              : styles.syncBannerSynced,
          ]}
        >
          <View style={styles.syncBannerLeft}>
            <Ionicons
              name={
                !isOnline
                  ? 'cloud-offline'
                  : isSyncing
                  ? 'sync'
                  : syncStats.pending > 0
                  ? 'cloud-upload'
                  : 'cloud-done'
              }
              size={22}
              color={
                !isOnline
                  ? '#64748B'
                  : syncStats.pending > 0
                  ? Colors.high
                  : Colors.safe
              }
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.syncBannerTitle}>
                {!isOnline
                  ? 'Working Offline (Airplane Mode)'
                  : isSyncing
                  ? 'Syncing with Supabase...'
                  : syncStats.pending > 0
                  ? `${syncStats.pending} Tests Saved Offline in SQLite`
                  : 'All Tests Synced with Supabase'}
              </Text>
              <Text style={styles.syncBannerSub}>
                {!isOnline
                  ? 'All tests safely recorded to local SQLite storage'
                  : syncStats.pending > 0
                  ? 'Stored in SQLite first • Tap to sync with cloud'
                  : 'Zero pending sync records • Database up-to-date'}
              </Text>
            </View>
          </View>

          {/* Sync Button */}
          {syncStats.pending > 0 && isOnline && (
            <TouchableOpacity
              style={styles.syncNowBtn}
              onPress={handleManualSync}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.syncNowBtnText}>Sync Now</Text>
              )}
            </TouchableOpacity>
          )}

          {/* Network Simulator Toggle */}
          <TouchableOpacity
            style={styles.simToggleBtn}
            onPress={() => setSimulatedNetworkStatus(!isOnline)}
          >
            <Ionicons
              name={isOnline ? 'airplane' : 'wifi'}
              size={14}
              color={Colors.textSecondary}
            />
            <Text style={styles.simToggleText}>
              {isOnline ? 'Go Offline' : 'Go Online'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Banner with Village Switcher */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.greetingText}>
                Namaste, {currentUser.name.split(' ')[0]} 👋
              </Text>
              <Text style={styles.roleSub}>
                {currentUser.role === 'worker'
                  ? 'JJM Village Water Quality Volunteer'
                  : currentUser.role === 'supervisor'
                  ? 'Cluster Health & Water Supervisor'
                  : 'State JJM Monitoring Officer'}
              </Text>
            </View>

            {/* Village Selector Pill */}
            <TouchableOpacity
              style={styles.villageSelector}
              onPress={() => setVillageModalVisible(true)}
              accessibilityLabel="Change village"
            >
              <Ionicons name="location" size={14} color={Colors.primary} />
              <Text style={styles.villageSelectorText} numberOfLines={1}>
                {activeVillage.name.split(' ')[0]}
              </Text>
              <Ionicons name="chevron-down" size={14} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Primary Action Button */}
          <Button
            title="START NEW STRIP TEST"
            subtitle="Step 1: Scan Strip QR • Step 2: Detect 6 Pads"
            icon="scan-circle"
            size="large"
            onPress={handleStartNewTest}
            style={styles.primaryActionBtn}
          />
        </View>

        {/* Quick KPI Stats Dashboard */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <View style={[styles.statIconBadge, { backgroundColor: Colors.primaryLight }]}>
              <Ionicons name="flask" size={18} color={Colors.primaryDark} />
            </View>
            <Text style={styles.statNumber}>{totalTests}</Text>
            <Text style={styles.statLabel}>Tests Recorded</Text>
          </View>

          <View style={styles.statBox}>
            <View style={[styles.statIconBadge, { backgroundColor: Colors.safeLight }]}>
              <Ionicons name="checkmark-done-circle" size={18} color={Colors.safe} />
            </View>
            <Text style={[styles.statNumber, { color: Colors.safe }]}>{safePercentage}%</Text>
            <Text style={styles.statLabel}>Safe Residual</Text>
          </View>

          <TouchableOpacity
            style={styles.statBox}
            onPress={() => router.push('/(tabs)/alerts')}
          >
            <View
              style={[
                styles.statIconBadge,
                { backgroundColor: openAlerts > 0 ? Colors.lowLight : Colors.surface },
              ]}
            >
              <Ionicons
                name="alert-circle"
                size={18}
                color={openAlerts > 0 ? Colors.low : Colors.textMuted}
              />
            </View>
            <Text
              style={[
                styles.statNumber,
                { color: openAlerts > 0 ? Colors.low : Colors.textPrimary },
              ]}
            >
              {openAlerts}
            </Text>
            <Text style={styles.statLabel}>Low-FRC Alerts</Text>
          </TouchableOpacity>
        </View>

        {/* Educational Ladder Quick Guide Card */}
        <View style={styles.guideCard}>
          <View style={styles.guideHeader}>
            <Ionicons name="information-circle" size={20} color={Colors.accent} />
            <Text style={styles.guideTitle}>How Cl-Ladder Works</Text>
          </View>
          <Text style={styles.guideBody}>
            The paper strip has <Text style={styles.bold}>6 discrete pads</Text> detecting FRC at
            0.1, 0.2, 0.5, 1.0, 2.0, 5.0 ppm.
          </Text>
          <View style={styles.ladderVisualRow}>
            <View style={[styles.ladderPill, styles.ladderLow]}>
              <Text style={styles.ladderPillText}>0-1 Pad: LOW</Text>
              <Text style={styles.ladderPillSub}>&lt; 0.2 ppm</Text>
            </View>
            <View style={[styles.ladderPill, styles.ladderSafe]}>
              <Text style={styles.ladderPillText}>2-4 Pads: SAFE</Text>
              <Text style={styles.ladderPillSub}>0.2 - 1.0 ppm</Text>
            </View>
            <View style={[styles.ladderPill, styles.ladderHigh]}>
              <Text style={styles.ladderPillText}>5-6 Pads: HIGH</Text>
              <Text style={styles.ladderPillSub}>&gt; 1.0 ppm</Text>
            </View>
          </View>
          <Text style={styles.guideNote}>
            • No subjective color comparison. Just count reactive blue pads!
          </Text>
        </View>

        {/* Recent Tests Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Tests in {activeVillage.name.split(' ')[0]}</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
            <Text style={styles.seeAllText}>View All ({tests.length})</Text>
          </TouchableOpacity>
        </View>

        {tests.slice(0, 3).map((item: TestRecord) => (
          <View key={item.id} style={styles.testCard}>
            <View style={styles.testCardHeader}>
              <StatusBadge status={item.status} size="small" />
              <View style={styles.syncIndicator}>
                <Ionicons
                  name={item.sync_status === 'synced' ? 'cloud-done' : 'cloud-offline'}
                  size={14}
                  color={item.sync_status === 'synced' ? Colors.safe : Colors.warning}
                />
                <Text style={styles.syncText}>
                  {item.sync_status === 'synced' ? 'Synced' : 'Pending Sync'}
                </Text>
              </View>
            </View>

            <View style={styles.testCardBody}>
              <View>
                <Text style={styles.testFrcValue}>{item.frc_range}</Text>
                <Text style={styles.testVillage}>{item.village_name}</Text>
              </View>
              <View style={styles.padCountBadge}>
                <Text style={styles.padCountText}>{item.blue_pad_count} / 6</Text>
                <Text style={styles.padCountSub}>pads blue</Text>
              </View>
            </View>

            <View style={styles.testCardFooter}>
              <Text style={styles.testFooterText}>
                Tested: {new Date(item.tested_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • By {item.worker_name?.split(' ')[0]}
              </Text>
              <Text style={styles.batchPill}>Batch: {item.batch_id}</Text>
            </View>
          </View>
        ))}

        {/* Village Selection Modal */}
        <Modal
          visible={villageModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setVillageModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Active Village</Text>
                <TouchableOpacity onPress={() => setVillageModalVisible(false)}>
                  <Ionicons name="close-circle" size={26} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
              <Text style={styles.modalSub}>
                Test records and alerts will be associated with this Gram Panchayat location:
              </Text>

              {MOCK_VILLAGES.map((v) => (
                <TouchableOpacity
                  key={v.id}
                  style={[
                    styles.villageOption,
                    activeVillage.id === v.id && styles.villageOptionSelected,
                  ]}
                  onPress={() => handleSelectVillage(v)}
                >
                  <View>
                    <Text style={styles.villageOptionName}>{v.name}</Text>
                    <Text style={styles.villageOptionDistrict}>
                      {v.district} District • {v.lat.toFixed(4)}, {v.lng.toFixed(4)}
                    </Text>
                  </View>
                  {activeVillage.id === v.id && (
                    <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  syncBanner: {
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  syncBannerSynced: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  syncBannerPending: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
  },
  syncBannerOffline: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  syncBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  syncBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  syncBannerSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  syncNowBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  syncNowBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  simToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    alignSelf: 'flex-end',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  simToggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 16,
  },
  welcomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  roleSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  villageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    maxWidth: 140,
  },
  villageSelectorText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  primaryActionBtn: {
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  statIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  guideCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 20,
  },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
  },
  guideBody: {
    fontSize: 12,
    color: '#1E3A8A',
    lineHeight: 18,
  },
  bold: {
    fontWeight: '700',
  },
  ladderVisualRow: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 10,
  },
  ladderPill: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  ladderLow: {
    backgroundColor: Colors.lowLight,
    borderWidth: 1,
    borderColor: Colors.lowBorder,
  },
  ladderSafe: {
    backgroundColor: Colors.safeLight,
    borderWidth: 1,
    borderColor: Colors.safeBorder,
  },
  ladderHigh: {
    backgroundColor: Colors.highLight,
    borderWidth: 1,
    borderColor: Colors.highBorder,
  },
  ladderPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  ladderPillSub: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    color: Colors.textSecondary,
  },
  guideNote: {
    fontSize: 11,
    color: '#3B82F6',
    fontWeight: '500',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  testCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  testCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  syncIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  syncText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  testCardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  testFrcValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  testVillage: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  padCountBadge: {
    backgroundColor: Colors.surface,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  padCountText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  padCountSub: {
    fontSize: 9,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  testCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  testFooterText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  batchPill: {
    fontSize: 10,
    color: Colors.textSecondary,
    backgroundColor: Colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  modalSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: 16,
  },
  villageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  villageOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  villageOptionName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  villageOptionDistrict: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
