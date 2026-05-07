import * as Notifications from "expo-notifications";
import { Alert, Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissionsAsync() {
  const existingPermissions = await Notifications.getPermissionsAsync();

  if (existingPermissions.granted) {
    return true;
  }

  const requestedPermissions = await Notifications.requestPermissionsAsync();
  return requestedPermissions.granted;
}

export async function scheduleLocalNotificationAsync({
  title,
  body,
  seconds = 1,
}: {
  title: string;
  body: string;
  seconds?: number;
}) {
  const hasPermission = await requestNotificationPermissionsAsync();

  if (!hasPermission) {
    return null;
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
    },
  });
}

/**
 * Show a toast notification for errors
 * Uses Alert on Android for immediate feedback
 */
export function showErrorToast(message: string) {
  if (Platform.OS === "android") {
    Alert.alert("Error", message, [{ text: "OK" }]);
  } else {
    // Fallback for other platforms
    scheduleLocalNotificationAsync({
      title: "Error",
      body: message,
      seconds: 1,
    });
  }
}

/**
 * Show a toast notification for success messages
 * Uses Alert on Android for immediate feedback
 */
export function showSuccessToast(message: string) {
  if (Platform.OS === "android") {
    Alert.alert("Success", message, [{ text: "OK" }]);
  } else {
    // Fallback for other platforms
    scheduleLocalNotificationAsync({
      title: "Success",
      body: message,
      seconds: 1,
    });
  }
}
