import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";

import { useFonts, Itim_400Regular } from "@expo-google-fonts/itim";

import DayRow from "./DayRow";
import TimePicker from "./TimePicker";

const WorkingDays = ({
  onChange,
}: {
  onChange: (days: { name: string; from: string; to: string }[]) => void;
}) => {
  type Day = {
    name: string;
    isEnabled: boolean;
    from?: Date;
    to?: Date;
  };

  const [days, setDays] = useState<Day[]>([
    { name: "Sunday", isEnabled: false },
    { name: "Monday", isEnabled: false },
    { name: "Tuesday", isEnabled: false },
    { name: "Wednesday", isEnabled: false },
    { name: "Thursday", isEnabled: false },
    { name: "Friday", isEnabled: false },
    { name: "Saturday", isEnabled: false },
  ]);

  const [showPicker, setShowPicker] = useState<{
    index: number;
    type: "from" | "to";
  } | null>(null);

  const updateDays = (newDays: Day[]) => {
    setDays(newDays);
    const selectedDays = newDays
      .filter((day) => day.isEnabled)
      .map((day) => ({
        name: day.name,
        from: day.from
          ? new Date(day.from).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          : "--:--",
        to: day.to
          ? new Date(day.to).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          : "--:--",
      }));

    onChange(selectedDays);
  };

  const toggleDay = (index: number) => {
    updateDays(
      days.map((day, i) =>
        i === index ? { ...day, isEnabled: !day.isEnabled } : day
      )
    );
  };

  const handleTimeChange = (
    event: any,
    selectedDate: Date | undefined,
    index: number,
    type: "from" | "to"
  ) => {
    setShowPicker(null);
    if (selectedDate) {
      updateDays(
        days.map((day, i) =>
          i === index ? { ...day, [type]: selectedDate } : day
        )
      );
    }
  };

  const formatTime = (time: Date | string | undefined | null): string =>
    time
      ? new Date(time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      : "--:--";

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Edit Working Days</Text>
      <View style={styles.headerRow}>
        <Text style={styles.ghi}>Days</Text>
        <Text style={styles.ghi}>From</Text>
        <Text style={styles.ghi}>To</Text>
      </View>

      {days.map((day, index) => (
        <DayRow
          key={day.name}
          day={day}
          index={index}
          toggleDay={toggleDay}
          setShowPicker={setShowPicker}
          formatTime={formatTime}
        />
      ))}

      <TimePicker
        showPicker={showPicker}
        days={days}
        handleTimeChange={handleTimeChange}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  section: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 20,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 12,
    fontFamily: "Itim_400Regular",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  ghi: {
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
    color: "#CB8400",
    fontFamily: "Itim_400Regular",
  },
  dayRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    flex: 1,
  },
  dayColumn: {
    marginLeft: -10,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    gap: 0,
  },
  dayText: {
    flex: 1,
    fontFamily: "Itim_400Regular",
    textAlign: "center",
  },
});
export default WorkingDays;
