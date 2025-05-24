import { Alert, Linking } from "react-native";
export const timeAgo = (dateString: string): string => {
  const now = new Date();
  const sentDate = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - sentDate.getTime()) / 1000);

  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
    }
  }
  return "just now";
};

export const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${formattedDate} - ${formattedTime}`;
};

export const handelcall = (phoneNumber: string) => {
  const phoneNumberWithCountryCode = `+213${phoneNumber}`;
  Linking.openURL(`tel:${phoneNumberWithCountryCode}`);
};
export const handleEmailPress = (recipientEmail: string) => {
  try {
    const url = `mailto:${recipientEmail}`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert("Error", "Email client not found on this device");
      }
    });
  } catch (error) {
    console.error("Error opening email:", error);
    Alert.alert("Error", "Could not open email client");
  }
};
