import React, { useState } from "react";
import { View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

// Define the props interface for the component
interface DateProps {
  onSelectDate: (date: string) => void;
}

const DatePicker: React.FC<DateProps> = ({ onSelectDate }) => {
  // Get today's date and reset time to midnight (to avoid time-related issues)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // State to manage the selected date (default to today)
  const [selectedDate, setSelectedDate] = useState(today);

  // Function to format the selected date as YYYY/MM/DD
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Ensure 2-digit format
    const day = String(date.getDate()).padStart(2, "0"); // Ensure 2-digit format
    return `${year}/${month}/${day}`;
  };

  // Function to handle date selection
  const handleDateChange = (event: any, selected?: Date) => {
    if (selected) {
      setSelectedDate(selected);
      onSelectDate(formatDate(selected)); // Pass the selected date to the parent
    }
  };

  return (
    <View className="items-center justify-center w-full">
      {/* Date Picker with today's date as the minimum */}
      <DateTimePicker
        value={selectedDate}
        mode="date"
        display="default"
        onChange={handleDateChange}
        minimumDate={today} // Prevent selecting past dates
      />
    </View>
  );
};

export default DatePicker;
