import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { AlertRecord } from '../types';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (err) {
    console.warn('Notification permission error:', err);
    return false;
  }
}

export async function notifyAlertAssigned(alert: AlertRecord): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🚨 JJM Recheck Assigned',
        body: `You are assigned to recheck Low-FRC at ${alert.village_name} (${alert.frc_range}).`,
        data: { alertId: alert.id, villageId: alert.village_id },
      },
      trigger: null, // trigger immediately
    });
  } catch (err) {
    console.warn('Failed to schedule local notification:', err);
  }
}
