import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { Platform, Vibration } from 'react-native';
import { useTrackingStore } from '../stores/trackingStore';

const ALARM_CHANNEL_ID = 'wake-map-alarm';
const ALARM_VIBRATION_PATTERN = [0, 1000, 500, 1000];
const ALARM_VIBRATION_REPEAT_MS = 2500;

let alarmVibrationTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Configure notifications behaviour when app is in foreground
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: useTrackingStore.getState().notificationMode !== 'silent',
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Triggers the alarm (Vibration, Audio, Notification)
 */
export async function triggerProximityAlarm(placeName: string, radius: number): Promise<void> {
  const store = useTrackingStore.getState();
  const { notificationMode } = store;
  const shouldPlayFeedback = notificationMode !== 'silent';
  const shouldRing = notificationMode === 'ring';

  // Prevent duplicate alarms
  if (store.isAlarming) {
    return;
  }

  // Update Zustand state
  store.triggerAlarm();

  try {
    await ensureAlarmNotificationChannel();

    // 1. Trigger Local Notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'ĐÃ ĐẾN NƠI! / ARRIVED!',
        body: `Bạn đã đi vào bán kính ${radius}m của ${placeName}`,
        sound: shouldPlayFeedback ? 'default' : undefined,
        vibrate: shouldPlayFeedback ? ALARM_VIBRATION_PATTERN : undefined,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: Platform.OS === 'android' ? { channelId: ALARM_CHANNEL_ID } : null,
    });

    if (shouldRing) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      startAlarmVibrationLoop();
    }
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to trigger proximity alarm:', error);
    }
  }
}

/**
 * Dismisses/stops the alarm (Vibration, Audio, Notification)
 */
export async function dismissProximityAlarm(): Promise<void> {
  const store = useTrackingStore.getState();

  // Reset store state
  store.dismissAlarm();

  try {
    stopAlarmVibrationLoop();

    // 1. Cancel Vibration
    Vibration.cancel();

    // 2. Dismiss Notifications
    await Notifications.dismissAllNotificationsAsync();
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to dismiss proximity alarm:', error);
    }
  }
}

async function ensureAlarmNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(ALARM_CHANNEL_ID, {
    name: 'WakeMap alarms',
    importance: Notifications.AndroidImportance.HIGH,
    enableVibrate: true,
    vibrationPattern: ALARM_VIBRATION_PATTERN,
    sound: 'default',
  });
}

function startAlarmVibrationLoop(): void {
  stopAlarmVibrationLoop();

  const pulse = () => {
    const { isAlarming, notificationMode } = useTrackingStore.getState();

    if (!isAlarming || notificationMode !== 'ring') {
      stopAlarmVibrationLoop();
      return;
    }

    Vibration.cancel();
    Vibration.vibrate(ALARM_VIBRATION_PATTERN);
  };

  pulse();

  alarmVibrationTimer = setInterval(() => {
    pulse();
  }, ALARM_VIBRATION_REPEAT_MS);
}

function stopAlarmVibrationLoop(): void {
  if (alarmVibrationTimer) {
    clearInterval(alarmVibrationTimer);
    alarmVibrationTimer = null;
  }

  Vibration.cancel();
}
