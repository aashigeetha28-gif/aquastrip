import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/Header';
import { Button } from '../../src/components/Button';
import { Colors } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';
import { useTest } from '../../src/context/TestContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const {
    syncStats,
    tests,
    isOnline,
    isSyncing,
    triggerSync,
    setSimulatedNetworkStatus,
  } = useTest();

  const handleRoleSwitch = () => {
    router.push('/(auth)/login');
  };

  const handleManualSync = async () => {
    try {
      const res = await triggerSync();
      Alert.alert('Sync Result', res.message);
    } catch {
      Alert.alert('Sync Error', 'Could not sync with Supabase cloud.');
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      'Reset Local Data',
      'This will refresh your local SQLite test views.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => router.replace('/(tabs)') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header title="Worker Profile" subtitle="Device & JJM Settings" />

      <ScrollView contentContainerStyle={styles.container}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={32} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{currentUser.name}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{currentUser.role.toUpperCase()}</Text>
            </View>
            <Text style={styles.userPhone}>{currentUser.phone}</Text>
            <Text style={styles.userDistrict}>
              Jurisdiction: {currentUser.district || 'Pune'} District
            </Text>
          </View>
        </View>

        {/* Quick Role Switcher Button */}
        <Button
          title="Switch User Role / Profile"
          subtitle="Volunteer • Supervisor • Officer"
          variant="outline"
          icon="swap-horizontal"
          size="normal"
          onPress={handleRoleSwitch}
          style={{ marginBottom: 14 }}
        />

        {/* Phase 2: Offline SQLite & Cloud Sync Diagnostics */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Phase 2: Offline SQLite & Supabase Sync</Text>

          <View style={styles.diagRow}>
            <View style={styles.diagLeft}>
              <Ionicons name="server" size={18} color={Colors.primary} />
              <Text style={styles.diagLabel}>Local SQLite Database</Text>
            </View>
            <Text style={styles.diagValue}>{tests.length} tests stored</Text>
          </View>

          <View style={styles.diagRow}>
            <View style={styles.diagLeft}>
              <Ionicons
                name={syncStats.pending > 0 ? 'cloud-offline' : 'cloud-done'}
                size={18}
                color={syncStats.pending > 0 ? Colors.high : Colors.safe}
              />
              <Text style={styles.diagLabel}>Pending Cloud Sync</Text>
            </View>
            <Text
              style={[
                styles.diagValue,
                { color: syncStats.pending > 0 ? Colors.high : Colors.safe },
              ]}
            >
              {syncStats.pending} tests
            </Text>
          </View>

          <View style={styles.diagRow}>
            <View style={styles.diagLeft}>
              <Ionicons
                name={isOnline ? 'wifi' : 'airplane'}
                size={18}
                color={isOnline ? Colors.safe : '#64748B'}
              />
              <Text style={styles.diagLabel}>Network Status</Text>
            </View>
            <Text style={[styles.diagValue, { color: isOnline ? Colors.safe : '#64748B' }]}>
              {isOnline ? 'Online (JJM Cloud Connected)' : 'Offline (Airplane Mode)'}
            </Text>
          </View>

          <View style={[styles.diagRow, { borderBottomWidth: 0 }]}>
            <View style={styles.diagLeft}>
              <Ionicons name="shield-checkmark" size={18} color={Colors.primary} />
              <Text style={styles.diagLabel}>Deduplication Guard</Text>
            </View>
            <Text style={styles.diagValue}>Idempotent UUID Keys</Text>
          </View>

          {/* Sync action buttons */}
          <View style={styles.diagActionRow}>
            <Button
              title={isSyncing ? 'Syncing...' : 'Sync Pending with Supabase'}
              size="small"
              icon="cloud-upload"
              loading={isSyncing}
              disabled={syncStats.pending === 0 || !isOnline}
              onPress={handleManualSync}
              style={{ flex: 1, marginRight: 8 }}
            />

            <Button
              title={isOnline ? 'Simulate Offline' : 'Simulate Online'}
              size="small"
              variant="secondary"
              icon={isOnline ? 'airplane' : 'wifi'}
              onPress={() => setSimulatedNetworkStatus(!isOnline)}
            />
          </View>
        </View>

        {/* JJM Chlorine Standards Reference */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>JJM Water Quality Standards (IS 10500)</Text>
          <Text style={styles.standardSub}>
            Ministry of Jal Shakti • Standard Free Residual Chlorine (FRC)
          </Text>

          <View style={styles.standardTable}>
            <View style={styles.tableRow}>
              <Text style={styles.tableColHeader}>FRC Level</Text>
              <Text style={styles.tableColHeader}>Pads</Text>
              <Text style={styles.tableColHeader}>Guideline Status</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={[styles.tableColValue, { color: Colors.low, fontWeight: '700' }]}>
                &lt; 0.2 ppm
              </Text>
              <Text style={styles.tableColValue}>0 - 1</Text>
              <Text style={[styles.tableColValue, { color: Colors.low, fontWeight: '700' }]}>
                LOW (Alert)
              </Text>
            </View>

            <View style={[styles.tableRow, { backgroundColor: Colors.safeLight }]}>
              <Text style={[styles.tableColValue, { color: Colors.safe, fontWeight: '700' }]}>
                0.2 - 1.0 ppm
              </Text>
              <Text style={styles.tableColValue}>2 - 4</Text>
              <Text style={[styles.tableColValue, { color: Colors.safe, fontWeight: '700' }]}>
                SAFE (JJM Goal)
              </Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={[styles.tableColValue, { color: Colors.high, fontWeight: '700' }]}>
                &gt; 1.0 ppm
              </Text>
              <Text style={styles.tableColValue}>5 - 6</Text>
              <Text style={[styles.tableColValue, { color: Colors.high, fontWeight: '700' }]}>
                HIGH (Overdose)
              </Text>
            </View>
          </View>
          <Text style={styles.tableNote}>
            * Minimum 0.2 ppm residual chlorine is mandatory at the furthest household tap to prevent
            water-borne pathogens and diarrhoeal disease outbreaks.
          </Text>
        </View>

        {/* Reset / Logout */}
        <TouchableOpacity style={styles.resetBtn} onPress={handleClearCache}>
          <Ionicons name="trash-outline" size={16} color={Colors.low} />
          <Text style={styles.resetBtnText}>Reset Demo Test Data</Text>
        </TouchableOpacity>
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
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
    gap: 14,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  roleBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginVertical: 4,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  userPhone: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  userDistrict: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  standardSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  diagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  diagLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  diagLabel: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  diagValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  diagActionRow: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  standardTable: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 6,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tableColHeader: {
    flex: 1,
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  tableColValue: {
    flex: 1,
    fontSize: 12,
    color: Colors.textPrimary,
  },
  tableNote: {
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 16,
    marginTop: 8,
    fontStyle: 'italic',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    marginTop: 10,
  },
  resetBtnText: {
    fontSize: 13,
    color: Colors.low,
    fontWeight: '600',
  },
});
