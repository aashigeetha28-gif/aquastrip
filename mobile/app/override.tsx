import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../src/components/Header';
import { LadderView } from '../src/components/LadderView';
import { Button } from '../src/components/Button';
import { StatusBadge } from '../src/components/StatusBadge';
import { Colors } from '../src/constants/theme';
import { useTest } from '../src/context/TestContext';
import { calculateFrc } from '../src/services/frcCalculator';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function OverrideScreen() {
  const router = useRouter();
  const { padDetection, togglePadState, isOverridden } = useTest();

  if (!padDetection) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header showBack title="Manual Override" />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No active strip detection to override.</Text>
          <Button
            title="Go to Scan Screen"
            onPress={() => router.replace('/(tabs)/scan')}
            style={{ marginTop: 16 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const currentFrc = calculateFrc(padDetection.bluePadCount);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header showBack title="Manual Pad Override" subtitle="Tap pads to verify count" />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Instruction Banner */}
        <View style={styles.instructionBanner}>
          <Ionicons name="hand-left" size={24} color={Colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.instructionTitle}>Field Worker Verification</Text>
            <Text style={styles.instructionText}>
              If glare, shadow, or camera angle caused any pad to be misclassified, tap any pad
              below to toggle between <Text style={{ fontWeight: '700' }}>BLUE</Text> and{' '}
              <Text style={{ fontWeight: '700' }}>OFF-WHITE</Text>.
            </Text>
          </View>
        </View>

        {/* Live Calculation Banner */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View>
              <Text style={styles.statusLabel}>Calculated FRC Value</Text>
              <Text style={styles.frcValueText}>{currentFrc.frcRange}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <StatusBadge status={currentFrc.status} size="medium" />
              <Text style={styles.padCountBadge}>
                {padDetection.bluePadCount} of 6 Pads Blue
              </Text>
            </View>
          </View>

          {isOverridden && (
            <View style={styles.overriddenPill}>
              <Ionicons name="create" size={13} color="#92400E" />
              <Text style={styles.overriddenText}>User Override Applied</Text>
            </View>
          )}
        </View>

        {/* Interactive Ladder Component */}
        <LadderView
          pads={padDetection.pads}
          bluePadCount={padDetection.bluePadCount}
          interactive={true}
          onPadPress={(index) => togglePadState(index)}
        />

        {/* Action Controls */}
        <View style={styles.actionSection}>
          <Button
            title="Confirm Count & View Result"
            subtitle={`Proceed with ${currentFrc.frcRange} (${currentFrc.statusLabel})`}
            icon="checkmark-done"
            size="large"
            onPress={() => router.push('/result')}
          />

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelBtnText}>Back to Scan Overview</Text>
          </TouchableOpacity>
        </View>
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
  instructionBanner: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: Colors.primaryLight,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#99F6E4',
    marginBottom: 12,
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  instructionText: {
    fontSize: 12,
    color: '#115E59',
    marginTop: 2,
    lineHeight: 18,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  frcValueText: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  padCountBadge: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primaryDark,
    marginTop: 6,
  },
  overriddenPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  overriddenText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  actionSection: {
    marginTop: 14,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 4,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
