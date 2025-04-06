import React, { useState } from "react";
import { View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

// Define an interface for the time object
interface TimeProps {
  onSelectTime: (time: string) => void;
}

const TheTime: React.FC<TimeProps> = ({ onSelectTime }) => {
  // State to manage the selected time
  const [selectedTime, setSelectedTime] = useState(new Date());

  // Function to format the selected time in HH:MM (24-hour format)
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // Use 24-hour format
    });
  };

  // Function to handle time selection
  const handleTimeChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setSelectedTime(selectedDate);
      onSelectTime(formatTime(selectedDate)); // Pass the selected time to the parent
    }
  };

  return (
    <View className="items-center justify-center w-full">
      {/* Time Picker */}
      <DateTimePicker
        value={selectedTime}
        mode="time"
        display="default"
        onChange={handleTimeChange}
      />
    </View>
  );
};

export default TheTime;
