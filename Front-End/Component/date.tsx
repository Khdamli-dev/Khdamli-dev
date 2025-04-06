import React, { useEffect, useState } from "react";
import { View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

export interface DateProps {
  onSelectDate: (date: string) => void;
}

const DatePicker: React.FC<DateProps> = ({ onSelectDate }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [selectedDate, setSelectedDate] = useState(today);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  };

  const handleDateChange = (event: any, selected?: Date) => {
    if (selected) {
      setSelectedDate(selected);
      onSelectDate(formatDate(selected));
    }
  };

  return (
    <View className="items-center justify-center w-full">
      <DateTimePicker
        value={selectedDate}
        mode="date"
        display="default"
        onChange={handleDateChange}
        minimumDate={today}
      />
    </View>
  );
};

export default DatePicker;
