import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { Vibration } from 'react-native';
import { useTrackingStore } from '../stores/trackingStore';
import {
  ALARM_NOTIFICATION_CATEGORY_ID,
  dismissProximityAlarm,
  registerAlarmNotificationCategory,
  triggerProximityAlarm,
} from './alarmService';

interface MockAudioPlayerType {
  loop: boolean;
  volume: number;
  play: jest.Mock;
  pause: jest.Mock;
  seekTo: jest.Mock;
  release: jest.Mock;
}

let mockPlayerRef: MockAudioPlayerType;

jest.mock('expo-audio', () => {
  const mockPlayerInstance = {
    loop: false,
    volume: 1.0,
    play: jest.fn(),
    pause: jest.fn(),
    seekTo: jest.fn(),
    release: jest.fn(),
  };
  mockPlayerRef = mockPlayerInstance;
  return {
    createAudioPlayer: jest.fn(() => mockPlayerInstance),
  };
});

jest.mock('expo-haptics', () => ({
  NotificationFeedbackType: {
    Warning: 'warning',
  },
  notificationAsync: jest.fn(),
}));

jest.mock('expo-notifications', () => ({
  AndroidImportance: {
    HIGH: 'high',
  },
  AndroidNotificationPriority: {
    HIGH: 'high',
  },
  dismissAllNotificationsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  setNotificationCategoryAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
}));

jest.mock('react-native', () => ({
  Platform: {
    OS: 'android',
  },
  Vibration: {
    cancel: jest.fn(),
    vibrate: jest.fn(),
  },
}));

describe('alarmService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useTrackingStore.setState({
      currentLocation: null,
      isAlarming: false,
      isTracking: false,
      notificationMode: 'ring',
      radius: 100,
      selectedPlace: null,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('keeps Android vibration running until the alarm is dismissed', async () => {
    await registerAlarmNotificationCategory();

    expect(Notifications.setNotificationCategoryAsync).toHaveBeenCalledWith(
      ALARM_NOTIFICATION_CATEGORY_ID,
      [
        {
          identifier: 'DISMISS_ALARM',
          buttonTitle: '🛑 Tắt Báo thức',
          options: {
            opensAppToForeground: false,
          },
        },
      ]
    );

    await triggerProximityAlarm('Test Place', 500);

    expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith(
      'wake-map-alarm-v4',
      expect.objectContaining({
        enableVibrate: true,
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 1000, 500, 1000],
      })
    );
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          vibrate: [0, 1000, 500, 1000],
          categoryIdentifier: ALARM_NOTIFICATION_CATEGORY_ID,
        }),
      })
    );
    expect(Haptics.notificationAsync).toHaveBeenCalledWith(
      Haptics.NotificationFeedbackType.Warning
    );
    expect(mockPlayerRef.play).toHaveBeenCalled();
    expect(mockPlayerRef.loop).toBe(true);
    expect(mockPlayerRef.volume).toBe(1.0);
    expect(Vibration.vibrate).toHaveBeenCalledWith([0, 1000, 500, 1000], true);
    expect(useTrackingStore.getState().isAlarming).toBe(true);

    await dismissProximityAlarm();

    expect(mockPlayerRef.pause).toHaveBeenCalled();
    expect(mockPlayerRef.seekTo).toHaveBeenCalledWith(0);
    expect(Vibration.cancel).toHaveBeenCalled();
    expect(Notifications.dismissAllNotificationsAsync).toHaveBeenCalled();
    expect(useTrackingStore.getState().isAlarming).toBe(false);
  });
});
