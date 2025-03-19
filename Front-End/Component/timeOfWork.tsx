// WorkingDaysTimeSelector.tsx
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

// Define the interface for a working day
export interface WorkingDay {
  day: number;
  label: string; 
  begin: string; 
  end: string; 
  selected: boolean; 
}

interface WorkingDaysTimeSelectorProps {
  onSelectWorkingDays: (selectedDays: WorkingDay[]) => void;
}

// Initial days array with each day unselected and times empty
const initialDays: WorkingDay[] = [
  { day: 1, label: "Sun", begin: "", end: "", selected: false },
  { day: 2, label: "Mon", begin: "", end: "", selected: false },
  { day: 3, label: "Tue", begin: "", end: "", selected: false },
  { day: 4, label: "Wed", begin: "", end: "", selected: false },
  { day: 5, label: "Thu", begin: "", end: "", selected: false },
  { day: 6, label: "Fri", begin: "", end: "", selected: false },
  { day: 7, label: "Sat", begin: "", end: "", selected: false },
];

// Helper function to convert time string "HH:MM" to minutes
const parseTime = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

const WorkingDaysTimeSelector: React.FC<WorkingDaysTimeSelectorProps> = ({
  onSelectWorkingDays,
}) => {
  // State for working days array
  const [workingDays, setWorkingDays] = useState<WorkingDay[]>(initialDays);
  // State to control display of the native time picker
  const [showTimePicker, setShowTimePicker] = useState(false);
  // State to know which day and time type (begin/end) is being set
  const [currentPickerDay, setCurrentPickerDay] = useState<number | null>(null);
  const [currentPickerType, setCurrentPickerType] = useState<
    "begin" | "end" | null
  >(null);

  // Whenever workingDays changes, pass the selected ones (where selected === true) to parent
  useEffect(() => {
     onSelectWorkingDays(workingDays.filter((day) => day.selected));
  }, [workingDays]);

  // Toggle the selection of a day
  const toggleDay = (dayNumber: number) => {
     setWorkingDays((prevDays) =>
      prevDays.map((dayObj) =>
        dayObj.day === dayNumber
          ? { ...dayObj, selected: !dayObj.selected }
          : dayObj
      )
    )
  };

  // Open the time picker for the specified day and type
  const showPicker = (day: number, type: "begin" | "end") => {
    setCurrentPickerDay(day);
    setCurrentPickerType(type);
    setShowTimePicker(true);
  };

  // Handle time selection from the native time picker
  const onTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (
      selectedDate &&
      currentPickerDay !== null &&
      currentPickerType !== null
    ) {
      // Format time as HH:MM (e.g., "08:30")
      const timeString = selectedDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      // Update the selected day with the chosen time
      setWorkingDays((prevDays) =>
        prevDays.map((dayObj) => {
          if (dayObj.day === currentPickerDay) {
            return { ...dayObj, [currentPickerType]: timeString };
          }
          return dayObj;
        })
      );
    }
    setCurrentPickerDay(null);
    setCurrentPickerType(null);
  };

  // Validation: Check if both begin and end times are provided and if end > begin
  const getValidationError = (dayObj: WorkingDay): string | null => {
    if (!dayObj.begin || !dayObj.end) {
      return "For best results, please provide both start and end times.";
    }
    // Here you could add additional checks (e.g., end time within begin + 24h) if needed
    return null;
  };

  return (
    <View className="flex-col p-1 w-full">
      {/* Working days selection section */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row"
      >
        {workingDays.map((dayObj) => (
          <TouchableOpacity
            key={dayObj.day}
            onPress={() => toggleDay(dayObj.day)}
            style={{ width: 64 }}
            className={`h-16 rounded-xl mx-1 justify-center ${dayObj.selected ? "bg-foncyYellow" : "bg-specialGray"}`}
          >
            <Text className="text-white text-center">{dayObj.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* For each selected day, display buttons to set begin and end times */}
      {workingDays
        .filter((dayObj) => dayObj.selected)
        .map((dayObj) => {
          const errorMsg = getValidationError(dayObj);
          return (
            <ScrollView
              key={dayObj.day}
              className="flex-col"
              contentContainerStyle={{
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text className="text-xl text-center font-medium">
                {dayObj.label} Time
              </Text>
              <View className="flex-row justify-around items-center">
                {/* Button for selecting begin time */}
                <TouchableOpacity
                  onPress={() => showPicker(dayObj.day, "begin")}
                  style={{ width: 150 }}
                  className="bg-specialGreen px-1 py-2 items-center rounded-full border-2"
                >
                  <Text
                    className={`${dayObj.begin ? "text-foncyYellow" : "text-white"}`}
                  >
                    {dayObj.begin || "Select Begin Time"}
                  </Text>
                </TouchableOpacity>
                {/* Button for selecting end time */}
                <TouchableOpacity
                  onPress={() => showPicker(dayObj.day, "end")}
                  style={{ width: 150 }}
                  className="bg-specialGreen px-1 py-2 items-center rounded-full border-2"
                >
                  <Text
                    className={`${dayObj.end ? "text-foncyYellow" : "text-white"}`}
                  >
                    {dayObj.end || "Select End Time"}
                  </Text>
                </TouchableOpacity>
              </View>
              {/* Display validation error if present */}
              {errorMsg && (
                <Text
                  
                  className="text-center w-10/12 pt-2 text-specialGray "
                >
                  {errorMsg}
                </Text>
              )}
            </ScrollView>
          );
        })}

      {/* Render the native time picker when needed */}
      {showTimePicker && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          display="default"
          onChange={onTimeChange}
        />
      )}
    </View>
  );
};

export default WorkingDaysTimeSelector;
