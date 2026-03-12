import { useState, useEffect } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform, Alert, Linking } from "react-native";

const NOTIFICATION_ENABLED_KEY = "notifications:enabled";
const NOTIFICATION_INTERVAL_KEY = "notifications:interval";
const NOTIFICATION_CUSTOM_DAYS_KEY = "notifications:customDays";

export type NotificationInterval = "12hours" | "24hours" | "custom";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function useNotifications() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [interval, setInterval] = useState<NotificationInterval>("24hours");
  const [customDays, setCustomDays] = useState(3);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const [savedEnabled, savedInterval, savedCustomDays] =
          await Promise.all([
            AsyncStorage.getItem(NOTIFICATION_ENABLED_KEY),
            AsyncStorage.getItem(NOTIFICATION_INTERVAL_KEY),
            AsyncStorage.getItem(NOTIFICATION_CUSTOM_DAYS_KEY),
          ]);

        setIsEnabled(savedEnabled === "true");

        if (
          savedInterval === "12hours" ||
          savedInterval === "24hours" ||
          savedInterval === "custom"
        ) {
          setInterval(savedInterval);
        }

        if (savedCustomDays) {
          setCustomDays(parseInt(savedCustomDays, 10));
        }
      } catch (error) {
        console.log("Error loading notification preferences:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const requestPermissions = async (): Promise<boolean> => {
    if (!Device.isDevice) {
      Alert.alert(
        "Simulator Detected",
        "Notifications only work on physical devices, not in simulator",
      );
      return false;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      Alert.alert(
        "Notifications Disabled",
        "Please enable notifications in your device settings to receive reminders.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Open Settings",
            onPress: () => {
              if (Platform.OS === "ios") {
                Linking.openURL("app-settings:");
              } else {
                Linking.openSettings();
              }
            },
          },
        ],
      );
      return false;
    }

    return true;
  };

  const getIntervalSeconds = (
    intervalType: NotificationInterval,
    customDaysValue: number,
  ): number => {
    switch (intervalType) {
      case "12hours":
        return 60; // TESTING: 60 seconds instead of 12 hours will change later on
      case "24hours":
        return 24 * 60 * 60;
      case "custom":
        return customDaysValue * 24 * 60 * 60;
      default:
        return 24 * 60 * 60;
    }
  };

  const scheduleReminder = async (
    intervalType: NotificationInterval,
    customDaysValue: number,
  ) => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      const intervalSeconds = getIntervalSeconds(intervalType, customDaysValue);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "📝 Application Reminder",
          body: "Keep it up! Don't forget to make some progress on your application!",
          sound: true,
        },
        trigger: {
          seconds: intervalSeconds,
          repeats: true,
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        },
      });

      console.log(
        `Reminder scheduled successfully with interval: ${intervalType}`,
      );
    } catch (error) {
      console.error("Error scheduling notification:", error);
      throw error;
    }
  };

  const cancelAllNotifications = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log("All notifications canceled");
    } catch (error) {
      console.error("Error canceling notifications:", error);
    }
  };

  const toggleNotifications = async (enabled: boolean) => {
    try {
      if (enabled) {
        const hasPermission = await requestPermissions();
        if (!hasPermission) {
          return;
        }

        await scheduleReminder(interval, customDays);
      } else {
        await cancelAllNotifications();
      }

      await AsyncStorage.setItem(NOTIFICATION_ENABLED_KEY, String(enabled));
      setIsEnabled(enabled);
    } catch (error) {
      console.error("Error toggling notifications:", error);
      Alert.alert(
        "Error",
        "Failed to update notification settings. Please try again.",
      );
    }
  };

  const updateInterval = async (
    newInterval: NotificationInterval,
    newCustomDays?: number,
  ) => {
    try {
      const daysToUse =
        newCustomDays !== undefined ? newCustomDays : customDays;

      await AsyncStorage.setItem(NOTIFICATION_INTERVAL_KEY, newInterval);

      if (newCustomDays !== undefined) {
        await AsyncStorage.setItem(
          NOTIFICATION_CUSTOM_DAYS_KEY,
          String(newCustomDays),
        );
        setCustomDays(newCustomDays);
      }

      setInterval(newInterval);

      if (isEnabled) {
        await scheduleReminder(newInterval, daysToUse);
      }
    } catch (error) {
      console.error("Error updating interval:", error);
      Alert.alert(
        "Error",
        "Failed to update notification interval. Please try again.",
      );
    }
  };

  return {
    isEnabled,
    isLoading,
    interval,
    customDays,
    toggleNotifications,
    updateInterval,
  };
}
