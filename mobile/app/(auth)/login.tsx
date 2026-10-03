import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';
import { UserRole } from '../../src/types';
import { Button } from '../../src/components/Button';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();
  const { allUsers, loginAs, currentUser } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('worker');

  const handleRoleCardSelect = (role: UserRole) => {
    setSelectedRole(role);
    const targetUser = allUsers.find((u) => u.role === role);
    if (targetUser) {
      loginAs(targetUser);
      router.replace('/(tabs)');
    }
  };

  const handleCustomPhoneLogin = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    const targetUser = allUsers.find((u) => u.role === selectedRole) || allUsers[0];
    loginAs({
      ...targetUser,
      phone: phoneNumber,
    });
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header Branding */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Ionicons name="water" size={36} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>Cl-Ladder</Text>
          <Text style={styles.subtitle}>Jal Jeevan Mission • Water Quality App</Text>
          <Text style={styles.missionText}>
            Har Ghar Jal • Free Residual Chlorine (FRC) Paper-Strip Monitoring
          </Text>
        </View>

        {/* Role Selection Section */}
        <View style={styles.card}>
          <Text style={styles.sectionHeading}>Select Your JJM Role</Text>
          <Text style={styles.sectionDesc}>
            Choose a profile below for role-based features and permissions:
          </Text>

          {/* Field Worker Card */}
          <TouchableOpacity
            style={[
              styles.roleCard,
              currentUser.role === 'worker' && styles.roleCardActive,
            ]}
            onPress={() => handleRoleCardSelect('worker')}
          >
            <View style={[styles.roleIcon, { backgroundColor: Colors.primaryLight }]}>
              <Ionicons name="person" size={24} color={Colors.primaryDark} />
            </View>
            <View style={styles.roleTextContainer}>
              <Text style={styles.roleTitle}>Field Worker / Village Volunteer</Text>
              <Text style={styles.roleSubtitle}>
                Ramesh Kumar • Khed Gram Panchayat
              </Text>
              <Text style={styles.rolePermissions}>
                ✓ Scan strips • Offline tests • Auto SMS fallback
              </Text>
            </View>
            <Ionicons
              name={currentUser.role === 'worker' ? 'radio-button-on' : 'radio-button-off'}
              size={22}
              color={currentUser.role === 'worker' ? Colors.primary : Colors.borderDark}
            />
          </TouchableOpacity>

          {/* Supervisor Card */}
          <TouchableOpacity
            style={[
              styles.roleCard,
              currentUser.role === 'supervisor' && styles.roleCardActive,
            ]}
            onPress={() => handleRoleCardSelect('supervisor')}
          >
            <View style={[styles.roleIcon, { backgroundColor: Colors.highLight }]}>
              <Ionicons name="shield-checkmark" size={24} color={Colors.high} />
            </View>
            <View style={styles.roleTextContainer}>
              <Text style={styles.roleTitle}>Block / Cluster Supervisor</Text>
              <Text style={styles.roleSubtitle}>
                Sunita Patil • Pune District Cluster
              </Text>
              <Text style={styles.rolePermissions}>
                ✓ Manage Low-FRC alerts • Assign rechecks • Rechlorination
              </Text>
            </View>
            <Ionicons
              name={currentUser.role === 'supervisor' ? 'radio-button-on' : 'radio-button-off'}
              size={22}
              color={currentUser.role === 'supervisor' ? Colors.primary : Colors.borderDark}
            />
          </TouchableOpacity>

          {/* Officer Card */}
          <TouchableOpacity
            style={[
              styles.roleCard,
              currentUser.role === 'officer' && styles.roleCardActive,
            ]}
            onPress={() => handleRoleCardSelect('officer')}
          >
            <View style={[styles.roleIcon, { backgroundColor: '#E0E7FF' }]}>
              <Ionicons name="bar-chart" size={24} color="#4338CA" />
            </View>
            <View style={styles.roleTextContainer}>
              <Text style={styles.roleTitle}>JJM District / State Officer</Text>
              <Text style={styles.roleSubtitle}>
                Vijay Deshmukh • Water Quality Division
              </Text>
              <Text style={styles.rolePermissions}>
                ✓ State overview • Trends • Sync audit & compliance
              </Text>
            </View>
            <Ionicons
              name={currentUser.role === 'officer' ? 'radio-button-on' : 'radio-button-off'}
              size={22}
              color={currentUser.role === 'officer' ? Colors.primary : Colors.borderDark}
            />
          </TouchableOpacity>
        </View>

        {/* Manual Phone Number Login */}
        <View style={styles.card}>
          <Text style={styles.sectionHeading}>Or Login with Mobile Number</Text>
          <View style={styles.phoneInputRow}>
            <View style={styles.countryCodeBox}>
              <Text style={styles.countryCodeText}>+91</Text>
            </View>
            <TextInput
              style={styles.textInput}
              placeholder="10-digit mobile number"
              keyboardType="phone-pad"
              maxLength={10}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
          </View>

          <Button
            title="Continue to Cl-Ladder"
            onPress={handleCustomPhoneLogin}
            style={{ marginTop: 12 }}
            icon="arrow-forward"
          />
        </View>

        {/* JJM Compliance Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Ministry of Jal Shakti • Department of Drinking Water and Sanitation
          </Text>
          <Text style={styles.versionText}>Cl-Ladder v1.0.0 (Phase 1 Core)</Text>
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
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginVertical: 16,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 2,
  },
  missionText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 14,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  roleCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#F0FDFA',
  },
  roleIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  roleTextContainer: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  roleSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  rolePermissions: {
    fontSize: 11,
    color: Colors.primaryDark,
    marginTop: 4,
    fontWeight: '500',
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  countryCodeBox: {
    backgroundColor: Colors.surface,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  countryCodeText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  footer: {
    alignItems: 'center',
    marginTop: 10,
  },
  footerText: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  versionText: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 4,
    fontWeight: '600',
  },
});
