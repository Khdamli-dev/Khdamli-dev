import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";

import { useFonts, Itim_400Regular } from "@expo-google-fonts/itim";

import DayRow from "./DayRow";
import TimePicker from "./TimePicker";
import apiClient from "@/api/appClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import refreshAccessToken from "@/api/refreshAccessToken";
const formatTime = (time: Date | string | undefined | null): string => {
  if (!time) return "--:--";

  try {
    let date: Date;
    if (typeof time === "string") {
      const timeString = time.trim();
      if (timeString.match(/^\d{1,2}:\d{1,2}$/)) {
        const [hours, minutes] = timeString
          .split(":")
          .map((num) => parseInt(num));
        date = new Date(2000, 0, 1, hours, minutes);
      } else {
        date = new Date(`2000-01-01T${timeString}`);
      }
    } else {
      date = time;
    }

    if (isNaN(date.getTime())) {
      console.log("Invalid date:", time);
      return "--:--";
    }

    // التأكد من تنسيق الوقت بشكل صحيح
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${hours}:${minutes}`;
  } catch (error) {
    console.error("Error formatting time:", error);
    return "--:--";
  }
};
const WorkingDays = ({
  onChange,
}: {
  onChange: (days: { day : number ;name: string; begin: string; end: string }[]) => void;
}) => {
  type Day = {
    name: string;
    isEnabled: boolean;
    begin?: Date;
    end?: Date;
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        const user: any = JSON.parse(userData as any);

        if (!user) return;

        const { id, role } = user;
        const endpoint = role === 2 ? `/users/worker/` : null;
        if (endpoint) {
          const response = await apiClient.get(`${endpoint}${id}`);
          if (response.data.worker.availability) {
            const availableDays = response.data.worker.availability;
            console.log("Available days from API:", availableDays);

            setDays((prevDays) =>
              prevDays.map((day) => {
                const matchingDay = availableDays.find(
                  (availableDay: any) => availableDay.day === day.name
                );

                return {
                  ...day,
                  isEnabled: !!matchingDay,
                  begin: matchingDay
                    ? new Date(`2000-01-01T${matchingDay.begin}`)
                    : undefined,
                  end: matchingDay
                    ? new Date(`2000-01-01T${matchingDay.end}`)
                    : undefined,
                };
              })
            );
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUser();
  }, []);
  const [days, setDays] = useState<Day[]>([
    { name: "sunday", isEnabled: false },
    { name: "monday", isEnabled: false },
    { name: "tuesday", isEnabled: false },
    { name: "wednesday", isEnabled: false },
    { name: "thursday", isEnabled: false },
    { name: "friday", isEnabled: false },
    { name: "saturday", isEnabled: false },
  ]);

  const [showPicker, setShowPicker] = useState<{
    index: number;
    type: "begin" | "end";
  } | null>(null);

  // Map day names to numbers (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const dayNameToNumber: Record<string, number> = {
    sunday: 1,
    monday: 2,
    tuesday: 3,
    wednesday: 4,
    thursday: 5,
    friday: 6,
    saturday: 7,
  };

  const updateDays = (newDays: Day[]) => {
    setDays(newDays);
    const selectedDays = newDays
      .filter((day) => day.isEnabled)
      .map((day) => ({
        name : day.name,
        day: dayNameToNumber[day.name], // Use number instead of name
        begin: day.begin ? formatTime(day.begin) : "08:00",
        end: day.end ? formatTime(day.end) : "16:00",
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
    type: "begin" | "end"
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
