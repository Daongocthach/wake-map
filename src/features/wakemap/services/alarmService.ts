import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import * as Notifications from 'expo-notifications';
import { Vibration } from 'react-native';
import { useTrackingStore } from '../stores/trackingStore';

// Use a reliable public alarm sound URL
const ALARM_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/911/911-84.wav';

let audioPlayer: AudioPlayer | null = null;

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

  // Prevent duplicate alarms
  if (store.isAlarming) {
    return;
  }

  // Update Zustand state
  store.triggerAlarm();

  try {
    // 1. Trigger Local Notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'ĐÃ ĐẾN NƠI! / ARRIVED!',
        body: `Bạn đã đi vào bán kính ${radius}m của ${placeName}`,
        sound: notificationMode !== 'silent',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Send immediately
    });

    if (notificationMode === 'ring') {
      // 2. Trigger Vibration (1s shake, 0.5s pause, repeat)
      Vibration.vibrate([1000, 500, 1000, 500], true);

      // 3. Play Sound in Background
      if (!audioPlayer) {
        audioPlayer = createAudioPlayer(ALARM_SOUND_URL);
        audioPlayer.loop = true;
        audioPlayer.play();
      }
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
    // 1. Cancel Vibration
    Vibration.cancel();

    // 2. Stop and Release Audio Player
    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer.release();
      audioPlayer = null;
    }

    // 3. Dismiss Notifications
    await Notifications.dismissAllNotificationsAsync();
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to dismiss proximity alarm:', error);
    }
  }
}
