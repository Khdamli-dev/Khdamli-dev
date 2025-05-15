import React from 'react';
import { View, Text } from 'react-native';

interface NotificationBadgeProps {
  count: number;
  size?: 'small' | 'medium' | 'large';
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ 
  count, 
  size = 'medium' 
}) => {
  if (count <= 0) return null;

  // Determine badge size
  const badgeSize = {
    small: 'w-4 h-4 text-[10px]',
    medium: 'w-5 h-5 text-[12px]',
    large: 'w-6 h-6 text-[14px]'
  }[size];

  return (
    <View 
      className={`absolute -top-2 -right-2 bg-red-500 ${badgeSize} rounded-full flex items-center justify-center z-10`}
    >
      <Text className="text-white font-bold">
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  );
};

export default NotificationBadge;
