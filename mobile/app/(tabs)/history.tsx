import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/Header';
import { StatusBadge } from '../../src/components/StatusBadge';
import { LadderView } from '../../src/components/LadderView';
import { Button } from '../../src/components/Button';
import { Colors } from '../../src/constants/theme';
import { useTest } from '../../src/context/TestContext';
import { TestRecord, FrcStatus } from '../../src/types';
import { Ionicons } from '@expo/vector-icons';

export default function HistoryScreen() {
  const { tests, syncStats, isOnline, isSyncing, triggerSync } = useTest();
  const [filterStatus, setFilterStatus] = useState<FrcStatus | 'all'>('all');
  const [filterSync, setFilterSync] = useState<'all' | 'pending' | 'synced'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTest, setSelectedTest] = useState<TestRecord | null>(null);

  const filteredTests = tests.filter((item) => {
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesSync = filterSync === 'all' || item.sync_status === filterSync;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.village_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.batch_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.worker_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSync && matchesSearch;
  });

  const handleManualSync = async () => {
    try {
      const res = await triggerSync();
      Alert.alert('Sync Status', res.message);
    } catch {
      Alert.alert('Sync Failed', 'Could not sync records.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header title="Test History" subtitle="SQLite Offline Store & Cloud Sync" />

      <View style={styles.container}>
        {/* Phase 2: Top Sync Indicator & Action Strip */}
        <View style={styles.syncStrip}>
          <View style={styles.syncStripLeft}>
            <Ionicons
              name={syncStats.pending > 0 ? 'cloud-upload' : 'cloud-done'}
              size={18}
              color={syncStats.pending > 0 ? Colors.high : Colors.safe}
            />
            <Text style={styles.syncStripText}>
              {syncStats.pending > 0
                ? `${syncStats.pending} tests pending sync in SQLite`
                : 'All tests synced to Supabase'}
            </Text>
          </View>

          {syncStats.pending > 0 && isOnline && (
            <TouchableOpacity
              style={styles.syncAllBtn}
              onPress={handleManualSync}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.syncAllBtnText}>Sync All</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Search Bar */}
        <View style={styles.searchRow}>
          <Ionicons name="search" size={18} color={Colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search village, batch, or worker..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {(['all', 'safe', 'low', 'high'] as const).map((st) => (
            <TouchableOpacity
              key={st}
              style={[styles.filterPill, filterStatus === st && styles.filterPillActive]}
              onPress={() => setFilterStatus(st)}
            >
              <Text
                style={[
                  styles.filterPillText,
                  filterStatus === st && styles.filterPillTextActive,
                ]}
              >
                {st.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Sync status quick toggle */}
          <TouchableOpacity
            style={[styles.filterPill, filterSync === 'pending' && styles.filterPillPending]}
            onPress={() => setFilterSync(filterSync === 'pending' ? 'all' : 'pending')}
          >
            <Text
              style={[
                styles.filterPillText,
                filterSync === 'pending' && styles.filterPillTextActive,
              ]}
            >
              {filterSync === 'pending' ? 'PENDING ONLY' : `PENDING (${syncStats.pending})`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* List of Tests */}
        <FlatList
          data={filteredTests}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="documents-outline" size={44} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No Tests Found</Text>
              <Text style={styles.emptySub}>
                Try adjusting your search or filters.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.testCard}
              activeOpacity={0.7}
              onPress={() => setSelectedTest(item)}
            >
              <View style={styles.cardHeader}>
                <StatusBadge status={item.status} size="small" />
                <View
                  style={[
                    styles.syncPill,
                    item.sync_status === 'synced' ? styles.syncPillDone : styles.syncPillWait,
                  ]}
                >
                  <Ionicons
                    name={item.sync_status === 'synced' ? 'cloud-done' : 'cloud-offline'}
                    size={13}
                    color={item.sync_status === 'synced' ? Colors.safe : '#B45309'}
                  />
                  <Text
                    style={[
                      styles.syncText,
                      { color: item.sync_status === 'synced' ? Colors.safe : '#B45309' },
                    ]}
                  >
                    {item.sync_status === 'synced' ? 'Synced to Cloud' : 'Pending Sync (SQLite)'}
                  </Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.frcValue}>{item.frc_range}</Text>
                  <Text style={styles.villageName}>{item.village_name}</Text>
                </View>
                <View style={styles.padPill}>
                  <Text style={styles.padCount}>{item.blue_pad_count} / 6</Text>
                  <Text style={styles.padLabel}>pads blue</Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.timestampText}>
                  {new Date(item.tested_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                  })}{' '}
                  •{' '}
                  {new Date(item.tested_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                <Text style={styles.batchText}>Batch: {item.batch_id}</Text>
              </View>
            </TouchableOpacity>
          )}
        />

        {/* Detailed Test Inspection Modal */}
        <Modal
          visible={!!selectedTest}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setSelectedTest(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              {selectedTest && (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Test Inspection</Text>
                    <TouchableOpacity onPress={() => setSelectedTest(null)}>
                      <Ionicons name="close-circle" size={26} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.modalFrcRow}>
                    <View>
                      <Text style={styles.modalFrcValue}>{selectedTest.frc_range}</Text>
                      <Text style={styles.modalVillage}>{selectedTest.village_name}</Text>
                    </View>
                    <StatusBadge status={selectedTest.status} size="medium" />
                  </View>

                  <LadderView bluePadCount={selectedTest.blue_pad_count} interactive={false} />

                  <View style={styles.modalMetaBox}>
                    <Text style={styles.modalMetaLine}>
                      • Record ID: {selectedTest.id}
                    </Text>
                    <Text style={styles.modalMetaLine}>
                      • Worker: {selectedTest.worker_name} ({selectedTest.worker_id})
                    </Text>
                    <Text style={styles.modalMetaLine}>
                      • GPS: {selectedTest.lat.toFixed(5)}, {selectedTest.lng.toFixed(5)}
                    </Text>
                    <Text style={styles.modalMetaLine}>
                      • Tested At: {new Date(selectedTest.tested_at).toLocaleString()}
                    </Text>
                    <Text style={styles.modalMetaLine}>
                      • Batch ID: {selectedTest.batch_id} (Expires {selectedTest.batch_expiry || '2026-12-31'})
                    </Text>
                    <Text
                      style={[
                        styles.modalMetaLine,
                        {
                          fontWeight: '700',
                          color: selectedTest.sync_status === 'synced' ? Colors.safe : Colors.high,
                        },
                      ]}
                    >
                      • Sync Status:{' '}
                      {selectedTest.sync_status === 'synced'
                        ? `Synced to Supabase (${new Date(selectedTest.synced_at || selectedTest.tested_at).toLocaleTimeString()})`
                        : 'Saved Locally in SQLite (Pending Cloud Sync)'}
                    </Text>
                    {selectedTest.notes ? (
                      <Text style={styles.modalNotes}>Note: {selectedTest.notes}</Text>
                    ) : null}
                  </View>

                  <Button
                    title="Close Details"
                    onPress={() => setSelectedTest(null)}
                    style={{ marginTop: 14 }}
                  />
                </>
              )}
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
  syncStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  syncStripLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  syncStripText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  syncAllBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  syncAllBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
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
  filterPillPending: {
    backgroundColor: Colors.high,
    borderColor: Colors.high,
  },
  filterPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 24,
  },
  testCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  syncPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  syncPillDone: {
    backgroundColor: Colors.safeLight,
    borderColor: Colors.safeBorder,
  },
  syncPillWait: {
    backgroundColor: Colors.highLight,
    borderColor: Colors.highBorder,
  },
  syncText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  frcValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  villageName: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  padPill: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  padCount: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  padLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  timestampText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  batchText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  emptyBox: {
    padding: 30,
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  modalFrcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalFrcValue: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  modalVillage: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  modalMetaBox: {
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 12,
    marginVertical: 10,
    gap: 4,
  },
  modalMetaLine: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  modalNotes: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
});
