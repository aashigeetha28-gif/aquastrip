import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useTest } from '../context/TestContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, showBack = false }) => {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { activeVillage, syncStats, isOnline, isSyncing, triggerSync } = useTest();

  const handleSyncPress = () => {
    if (!isSyncing && isOnline && syncStats.pending > 0) {
      triggerSync();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.leftGroup}>
          {showBack && (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          )}
          <View>
            <Text style={styles.mainTitle}>{title || 'Cl-Ladder'}</Text>
            <Text style={styles.subTitle}>
              {subtitle || 'Jal Jeevan Mission • Water Quality'}
            </Text>
          </View>
        </View>

        {/* Phase 2: Dynamic Offline & Sync Badge */}
        <TouchableOpacity
          onPress={handleSyncPress}
          activeOpacity={0.7}
          style={styles.badgeContainer}
        >
          <View
            style={[
              styles.syncPill,
              !isOnline
                ? styles.syncPillOffline
                : syncStats.pending > 0
                ? styles.syncPillPending
                : styles.syncPillSynced,
            ]}
          >
            {isSyncing ? (
              <ActivityIndicator size="small" color={Colors.primaryDark} style={{ marginRight: 4 }} />
            ) : (
              <View
                style={[
                  styles.statusDot,
                  !isOnline
                    ? styles.dotOffline
                    : syncStats.pending > 0
                    ? styles.dotPending
                    : styles.dotSynced,
                ]}
              />
            )}
            <Text
              style={[
                styles.syncText,
                !isOnline
                  ? styles.textOffline
                  : syncStats.pending > 0
                  ? styles.textPending
                  : styles.textSynced,
              ]}
            >
              {!isOnline
                ? `Offline (${syncStats.pending})`
                : isSyncing
                ? 'Syncing...'
                : syncStats.pending > 0
                ? `Sync (${syncStats.pending})`
                : 'Synced'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Village and User context bar */}
      <View style={styles.contextBar}>
        <View style={styles.contextItem}>
          <Ionicons name="location-sharp" size={14} color={Colors.primary} />
          <Text style={styles.contextText} numberOfLines={1}>
            {activeVillage.name}
          </Text>
        </View>

        <View style={styles.contextDivider} />

        <View style={styles.contextItem}>
          <Ionicons name="person-circle-outline" size={15} color={Colors.textSecondary} />
          <Text style={styles.contextText} numberOfLines={1}>
            {currentUser.name.split(' ')[0]} ({currentUser.role.toUpperCase()})
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: Colors.surface,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primaryDark,
    letterSpacing: -0.3,
  },
  subTitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  badgeContainer: {
    alignItems: 'flex-end',
  },
  syncPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    gap: 5,
  },
  syncPillSynced: {
    backgroundColor: Colors.safeLight,
    borderColor: Colors.safeBorder,
  },
  syncPillPending: {
    backgroundColor: Colors.highLight,
    borderColor: Colors.highBorder,
  },
  syncPillOffline: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  dotSynced: {
    backgroundColor: Colors.safe,
  },
  dotPending: {
    backgroundColor: Colors.high,
  },
  dotOffline: {
    backgroundColor: '#64748B',
  },
  syncText: {
    fontSize: 11,
    fontWeight: '700',
  },
  textSynced: {
    color: Colors.safe,
  },
  textPending: {
    color: Colors.high,
  },
  textOffline: {
    color: '#475569',
  },
  contextBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 8,
  },
  contextItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  contextText: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  contextDivider: {
    width: 1,
    height: 12,
    backgroundColor: Colors.borderDark,
  },
});
