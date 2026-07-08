import { createAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { Platform, Vibration } from 'react-native';
import alarmBeep from '../../../../assets/sounds/alarm-beep.mp3';
import { useTrackingStore } from '../stores/trackingStore';

export const ALARM_NOTIFICATION_CATEGORY_ID = 'alarm-loop';
export const ALARM_DISMISS_ACTION_ID = 'DISMISS_ALARM';
// Bump the channel ID whenever vibration/sound defaults change so Android
// picks up the new configuration instead of reusing a stale channel.
const ALARM_CHANNEL_ID = 'wake-map-alarm-v4';
const ALARM_VIBRATION_PATTERN = [0, 1000, 500, 1000];
const ALARM_VIBRATION_REPEAT_MS = 2500;

let alarmVibrationTimer: ReturnType<typeof setInterval> | null = null;

// Persistent audio player for background/foreground alarm play
const alarmPlayer = createAudioPlayer(alarmBeep);

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
        // Android Expo notifications treat "default" as a custom sound name
        // unless it is bundled in the native app. We do not bundle a custom
        // alarm sound here, so keep Android silent and rely on vibration.
        sound: Platform.OS === 'ios' && shouldPlayFeedback ? 'default' : undefined,
        vibrate: shouldPlayFeedback ? ALARM_VIBRATION_PATTERN : undefined,
        priority: Notifications.AndroidNotificationPriority.MAX,
        categoryIdentifier: ALARM_NOTIFICATION_CATEGORY_ID,
      },
      trigger: Platform.OS === 'android' ? { channelId: ALARM_CHANNEL_ID } : null,
    });

    if (shouldRing) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

      // Start looping alarm sound via expo-audio
      alarmPlayer.loop = true;
      alarmPlayer.volume = 1.0;
      alarmPlayer.play();

      startAlarmVibrationLoop();
    }
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to trigger proximity alarm:', error);
    }
  }
}

export async function registerAlarmNotificationCategory(): Promise<void> {
  await Notifications.setNotificationCategoryAsync(ALARM_NOTIFICATION_CATEGORY_ID, [
    {
      identifier: ALARM_DISMISS_ACTION_ID,
      buttonTitle: '🛑 Tắt Báo thức',
      options: {
        opensAppToForeground: false,
      },
    },
  ]);
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

    // Stop and reset audio player
    alarmPlayer.pause();
    alarmPlayer.seekTo(0);

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
    importance: Notifications.AndroidImportance.MAX,
    bypassDnd: true,
    enableVibrate: true,
    vibrationPattern: ALARM_VIBRATION_PATTERN,
    sound: undefined,
  });
}

function startAlarmVibrationLoop(): void {
  stopAlarmVibrationLoop();

  if (Platform.OS === 'android') {
    // Android supports repeating vibration patterns natively, so keep it
    // running until the user explicitly dismisses the alarm.
    Vibration.vibrate(ALARM_VIBRATION_PATTERN, true);
    return;
  }

  // Fallback for platforms that do not support repeating vibration patterns.
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
