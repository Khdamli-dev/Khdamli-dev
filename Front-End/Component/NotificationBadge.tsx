import React from 'react';
import { View, Text } from 'react-native';

interface NotificationBadgeProps {
  count: number;
  size?: 'small' | 'medium' | 'large';
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  size = 'large'
}) => {
  if (count <= 0) return null;

  // Determine badge size
  const badgeSize = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  }[size];

  const textSize = {
    small: 'text-[8px]',
    medium: 'text-[10px]',
    large: 'text-xs'
  }[size];

  return (
    <View
      className={`absolute top-0 right-0 bg-red-500 ${badgeSize} rounded-full items-center justify-center z-10`}
      style={{ transform: [{ translateX: 6 }, { translateY: -6 }] }}
    >
      <Text className={`text-white font-bold ${textSize}`}>
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  );
};

export default NotificationBadge;
