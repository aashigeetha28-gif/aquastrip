import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../src/components/Header';
import { LadderView } from '../src/components/LadderView';
import { StatusBadge } from '../src/components/StatusBadge';
import { Button } from '../src/components/Button';
import { Colors } from '../src/constants/theme';
import { useTest } from '../src/context/TestContext';
import { useAuth } from '../src/context/AuthContext';
import { calculateFrc } from '../src/services/frcCalculator';
import { getCurrentLocation, LocationData } from '../src/services/locationService';
import { AlertRecord } from '../src/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ResultScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const {
    padDetection,
    scannedBatch,
    activeVillage,
    isOverridden,
    saveCurrentTest,
    isSaving,
    resetCurrentTest,
    isOnline,
    sendOfflineFallbackSmsForAlert,
    findPendingAlertForVillage,
    markAlertRechlorinated,
  } = useTest();

  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState<LocationData | null>(null);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [savedTestId, setSavedTestId] = useState<string>('');
  const [savedFrcStatus, setSavedFrcStatus] = useState<string>('');
  const [pendingAlertToResolve, setPendingAlertToResolve] = useState<AlertRecord | null>(null);
  const [offlineSmsSent, setOfflineSmsSent] = useState(false);

  useEffect(() => {
    getCurrentLocation().then(setLocation);
  }, []);

  if (!padDetection || !scannedBatch) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header showBack title="Test Result" />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No active test result found.</Text>
          <Button
            title="Scan a Strip First"
            onPress={() => router.replace('/(tabs)/scan')}
            style={{ marginTop: 16 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const frc = calculateFrc(padDetection.bluePadCount);

  // Check if a safe test can resolve a pending recheck alert for this village
  useEffect(() => {
    if (frc.status === 'safe') {
      const match = findPendingAlertForVillage(activeVillage.id);
      if (match) setPendingAlertToResolve(match);
    }
  }, [frc.status, activeVillage.id, findPendingAlertForVillage]);

  const handleSaveAndReport = async () => {
    try {
      const saved = await saveCurrentTest(notes);
      setSavedTestId(saved.id);
      setSavedFrcStatus(frc.status);
      setSuccessModalVisible(true);
    } catch (err: any) {
      Alert.alert('Save Failed', err?.message || 'Could not save test to local storage.');
    }
  };

  const handleSendOfflineSms = async () => {
    const alertId = `alert_${savedTestId}`;
    const sent = await sendOfflineFallbackSmsForAlert(alertId);
    if (sent) {
      setOfflineSmsSent(true);
      Alert.alert('SMS Prepared', 'Offline SMS fallback sent to supervisor.');
    }
  };

  const handleResolveAlertNow = async () => {
    if (pendingAlertToResolve) {
      await markAlertRechlorinated(pendingAlertToResolve.id);
      Alert.alert(
        'Alert Resolved',
        `Village alert for ${pendingAlertToResolve.village_name} marked as Rechlorinated.`
      );
      setPendingAlertToResolve(null);
    }
  };

  const handleDismissSuccess = () => {
    setSuccessModalVisible(false);
    resetCurrentTest();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header showBack title="Test Result" subtitle="Cl-Ladder Water Quality Report" />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Main FRC Value Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View>
              <Text style={styles.heroLabel}>Free Residual Chlorine (FRC)</Text>
              <Text style={styles.heroValue}>{frc.frcRange}</Text>
            </View>
            <StatusBadge status={frc.status} size="large" />
          </View>

          <View style={styles.heroSubRow}>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillText}>
                {padDetection.bluePadCount} of 6 Reactive Pads
              </Text>
            </View>
            {isOverridden && (
              <View style={[styles.heroPill, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="create" size={12} color="#92400E" />
                <Text style={[styles.heroPillText, { color: '#92400E' }]}>Manual Override</Text>
              </View>
            )}
          </View>
        </View>

        {/* Recheck resolution prompt if test is Safe and village had an active alert */}
        {pendingAlertToResolve && (
          <View style={styles.resolutionBanner}>
            <View style={styles.resolutionHeader}>
              <Ionicons name="shield-checkmark" size={24} color={Colors.safe} />
              <View style={{ flex: 1 }}>
                <Text style={styles.resolutionTitle}>Recheck Confirmed Safe!</Text>
                <Text style={styles.resolutionSub}>
                  An open alert for {pendingAlertToResolve.village_name} was waiting for recheck.
                </Text>
              </View>
            </View>
            <Button
              title="Mark Alert as Rechlorinated"
              size="small"
              variant="safe"
              icon="checkmark-circle"
              onPress={handleResolveAlertNow}
              style={{ marginTop: 8 }}
            />
          </View>
        )}

        {/* Low-FRC Warning Alert Banner if <0.2 ppm */}
        {frc.status === 'low' && (
          <View style={styles.alertBanner}>
            <View style={styles.alertBannerHeader}>
              <Ionicons name="warning" size={26} color={Colors.low} />
              <Text style={styles.alertBannerTitle}>LOW-FRC ALERT (&lt;0.2 ppm)</Text>
            </View>
            <Text style={styles.alertBannerBody}>
              Chlorine residual is below the Jal Jeevan Mission safe limit. Tap water is vulnerable to
              bacterial contamination.
            </Text>

            <View style={styles.alertFooterPill}>
              <Ionicons
                name={isOnline ? 'cloud-upload' : 'phone-portrait'}
                size={14}
                color={Colors.low}
              />
              <Text style={styles.alertFooterText}>
                {isOnline
                  ? 'Saving triggers automated cloud SMS to Village Supervisor.'
                  : 'Offline Mode: You can send an SMS alert via the native messaging app.'}
              </Text>
            </View>
          </View>
        )}

        {/* Visual 6-pad Ladder Concept */}
        <LadderView
          pads={padDetection.pads}
          bluePadCount={padDetection.bluePadCount}
          interactive={false}
        />

        {/* Quick action to adjust pads if needed */}
        <TouchableOpacity
          style={styles.tweakPadsBtn}
          onPress={() => router.push('/override')}
        >
          <Ionicons name="create-outline" size={18} color={Colors.primary} />
          <Text style={styles.tweakPadsText}>Adjust Pad Count (Manual Override)</Text>
        </TouchableOpacity>

        {/* Metadata & Verification Details */}
        <View style={styles.metaCard}>
          <Text style={styles.metaCardTitle}>Test Verification & Audit Metadata</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaIcon}>
              <Ionicons name="location" size={18} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.metaLabel}>GPS Coordinates</Text>
              <Text style={styles.metaValue}>
                {location
                  ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)} (±${location.accuracy}m)`
                  : 'Acquiring GPS...'}
              </Text>
              <Text style={styles.metaSub}>Village: {activeVillage.name}</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaIcon}>
              <Ionicons name="time" size={18} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.metaLabel}>Tested At</Text>
              <Text style={styles.metaValue}>
                {new Date().toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}{' '}
                at{' '}
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaIcon}>
              <Ionicons name="person" size={18} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.metaLabel}>Field Worker (Volunteer)</Text>
              <Text style={styles.metaValue}>{currentUser.name}</Text>
              <Text style={styles.metaSub}>ID: {currentUser.id} • {currentUser.phone}</Text>
            </View>
          </View>

          <View style={[styles.metaRow, { borderBottomWidth: 0 }]}>
            <View style={styles.metaIcon}>
              <Ionicons name="barcode" size={18} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.metaLabel}>Strip Batch & Expiry</Text>
              <Text style={styles.metaValue}>{scannedBatch.batch_id}</Text>
              <Text style={styles.metaSub}>
                Expires: {scannedBatch.expiry} • {scannedBatch.manufacturer}
              </Text>
            </View>
          </View>
        </View>

        {/* Optional Field Notes */}
        <View style={styles.notesCard}>
          <Text style={styles.notesTitle}>Sampling Point / Field Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="e.g. Anganwadi tap, Standpost #3, reservoir outlet..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="Save and Report Test"
            subtitle="Save to offline SQLite store & queue sync"
            icon="cloud-upload"
            size="large"
            loading={isSaving}
            onPress={handleSaveAndReport}
          />

          <TouchableOpacity
            style={styles.discardBtn}
            onPress={() => {
              resetCurrentTest();
              router.replace('/(tabs)');
            }}
          >
            <Text style={styles.discardBtnText}>Discard Test</Text>
          </TouchableOpacity>
        </View>

        {/* Success Modal */}
        <Modal
          visible={successModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={handleDismissSuccess}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.successModalCard}>
              <View
                style={[
                  styles.successIconCircle,
                  savedFrcStatus === 'low'
                    ? { backgroundColor: Colors.lowLight }
                    : { backgroundColor: Colors.safeLight },
                ]}
              >
                <Ionicons
                  name={savedFrcStatus === 'low' ? 'alert-circle' : 'checkmark-circle'}
                  size={48}
                  color={savedFrcStatus === 'low' ? Colors.low : Colors.safe}
                />
              </View>

              <Text style={styles.successModalTitle}>
                {savedFrcStatus === 'low' ? 'Low-FRC Alert Saved' : 'Test Recorded Successfully'}
              </Text>

              <Text style={styles.successModalDesc}>
                {savedFrcStatus === 'low'
                  ? 'Test record saved in SQLite. A high-priority alert has been created for the supervisor.'
                  : 'Test record has been securely saved to local storage with GPS and timestamp.'}
              </Text>

              {/* Offline SMS Fallback Action Button */}
              {savedFrcStatus === 'low' && !isOnline && (
                <View style={styles.offlineSmsBox}>
                  <Text style={styles.offlineSmsPrompt}>
                    You are currently offline. Send an immediate SMS alert to the supervisor via your phone?
                  </Text>
                  <Button
                    title={offlineSmsSent ? 'SMS Fallback Prepared ✓' : 'Send SMS Alert Now'}
                    size="small"
                    variant={offlineSmsSent ? 'safe' : 'danger'}
                    icon="chatbox-ellipses"
                    onPress={handleSendOfflineSms}
                    disabled={offlineSmsSent}
                  />
                </View>
              )}

              <View style={styles.successMetaBox}>
                <Text style={styles.successMetaItem}>• FRC: {frc.frcRange}</Text>
                <Text style={styles.successMetaItem}>• Location: {activeVillage.name}</Text>
                <Text style={styles.successMetaItem}>
                  • Sync: {isOnline ? 'Queued to Cloud' : 'Saved in Offline SQLite'}
                </Text>
              </View>

              <Button
                title="Done & Return Home"
                onPress={handleDismissSuccess}
                style={{ width: '100%', marginTop: 10 }}
              />
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
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  heroCard: {
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
    marginBottom: 12,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  heroValue: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  heroSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  heroPill: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  resolutionBanner: {
    backgroundColor: Colors.safeLight,
    borderWidth: 1.5,
    borderColor: Colors.safeBorder,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  resolutionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  resolutionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.safe,
  },
  resolutionSub: {
    fontSize: 12,
    color: '#166534',
    marginTop: 2,
  },
  alertBanner: {
    backgroundColor: Colors.lowLight,
    borderWidth: 1.5,
    borderColor: Colors.lowBorder,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  alertBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.low,
  },
  alertBannerBody: {
    fontSize: 12,
    color: '#991B1B',
    marginTop: 4,
    lineHeight: 18,
  },
  alertFooterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  alertFooterText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.low,
    flex: 1,
  },
  tweakPadsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: Colors.primaryLight,
    borderRadius: 10,
    marginVertical: 4,
  },
  tweakPadsText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  metaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 12,
  },
  metaCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  metaIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 1,
  },
  metaSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  notesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 12,
  },
  notesTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  notesInput: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 50,
  },
  actionButtons: {
    marginTop: 16,
  },
  discardBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  discardBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  successModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  successIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  successModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  successModalDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  offlineSmsBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 12,
    width: '100%',
    marginVertical: 10,
  },
  offlineSmsPrompt: {
    fontSize: 12,
    color: '#991B1B',
    marginBottom: 8,
    lineHeight: 16,
    fontWeight: '600',
  },
  successMetaBox: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 10,
    width: '100%',
    marginVertical: 10,
    gap: 4,
  },
  successMetaItem: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
});
