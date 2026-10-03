import * as SMS from 'expo-sms';
import { Platform, Alert } from 'react-native';

export interface OfflineSmsParams {
  village: string;
  frcRange: string;
  time: string;
  workerId: string;
  supervisorPhone?: string;
}

export async function sendOfflineSmsFallback(params: OfflineSmsParams): Promise<boolean> {
  const supervisorPhone = params.supervisorPhone || '+919876543211';
  const messageBody = `JJM LOW-FRC ALERT: ${params.village} | FRC: ${params.frcRange} | Time: ${params.time} | Worker ID: ${params.workerId}. Disinfection rechlorination required.`;

  if (Platform.OS === 'web') {
    // Web fallback simulator
    console.log(`[Web SMS Fallback] To: ${supervisorPhone} | Body: ${messageBody}`);
    Alert.alert(
      'Offline SMS Fallback (Simulated)',
      `Pre-filled SMS for Supervisor (${supervisorPhone}):\n\n"${messageBody}"`
    );
    return true;
  }

  try {
    const isAvailable = await SMS.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert(
        'SMS Not Available',
        'SMS service is not supported or active on this device. Alert saved in SQLite for cloud sync.'
      );
      return false;
    }

    const { result } = await SMS.sendSMSAsync([supervisorPhone], messageBody);
    return result === 'sent' || result === 'unknown';
  } catch (err) {
    console.warn('Error launching SMS composer:', err);
    Alert.alert('SMS Fallback Error', 'Could not open native SMS composer.');
    return false;
  }
}
