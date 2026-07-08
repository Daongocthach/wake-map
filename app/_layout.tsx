import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import '@/features/wakemap/services/backgroundLocationTask';
import { useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import InterBold from '../assets/fonts/Inter-Bold.ttf';
import InterMedium from '../assets/fonts/Inter-Medium.ttf';
import InterRegular from '../assets/fonts/Inter-Regular.ttf';
import InterSemiBold from '../assets/fonts/Inter-SemiBold.ttf';
import { ErrorBoundary } from '@/common/components/ErrorBoundary';
import {
  ALARM_DISMISS_ACTION_ID,
  registerAlarmNotificationCategory,
  dismissProximityAlarm,
} from '@/features/wakemap/services/alarmService';
import { useLocationPermission } from '@/hooks';
import { AppAlertProvider, AppBottomSheetProvider } from '@/providers';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { theme } = useUnistyles();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background.app },
      }}
      initialRouteName="index"
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}

function AppContent() {
  useLocationPermission();

  useEffect(() => {
    void registerAlarmNotificationCategory();

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        if (response.actionIdentifier === ALARM_DISMISS_ACTION_ID) {
          void dismissProximityAlarm();
        }
      }
    );

    return () => {
      responseSubscription.remove();
    };
  }, []);

  return (
    <View style={styles.appContainer}>
      <RootNavigator />
      <Toast />
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': InterRegular,
    'Inter-Medium': InterMedium,
    'Inter-SemiBold': InterSemiBold,
    'Inter-Bold': InterBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.rootView}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <KeyboardProvider>
            <AppAlertProvider>
              <AppBottomSheetProvider>
                <AppContent />
              </AppBottomSheetProvider>
            </AppAlertProvider>
          </KeyboardProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create((theme) => ({
  rootView: {
    flex: 1,
    backgroundColor: theme.colors.background.app,
  },
  appContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.app,
  },
}));
