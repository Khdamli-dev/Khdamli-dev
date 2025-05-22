import React from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity } from "react-native";
type Day = {
  name: string;
  isEnabled: boolean;
  begin?: Date;
  end?: Date;
};
const DEFAULT_BEGIN_TIME = "08:00";
const DEFAULT_END_TIME = "16:00";
type Props = {
  day: Day;
  index: number;
  toggleDay: (index: number) => void;
  setShowPicker: (
    picker: { index: number; type: "begin" | "end" } | null
  ) => void;
  formatTime: (time: Date | string | undefined | null) => string;
};
const getDayShortName = (dayName: string): string => {
  const dayMap: { [key: string]: string } = {
    sunday: "Sun",
    monday: "Mon",
    tuesday: "Tue",
    wednesday: "Wed",
    thursday: "Thu",
    friday: "Fri",
    saturday: "Sat",
  };
  return dayMap[dayName.toLowerCase()] || dayName;
};
// Add default time constants at the top of the file

const DayRow: React.FC<Props> = ({
  day,
  index,
  toggleDay,
  setShowPicker,
  formatTime,
}) => {
  return (
    <View key={day.name} style={styles.dayRow}>
      <View style={styles.dayColumn}>
        <Switch
          trackColor={{ false: "#D9D9D9", true: "#D9D9D9" }}
          thumbColor={day.isEnabled ? "#BD7D06" : "#8F8F8F"}
          onValueChange={() => toggleDay(index)}
          value={day.isEnabled}
        />
        <Text style={styles.dayText}>{getDayShortName(day.name)}</Text>
      </View>

      {day.isEnabled ? (
        <>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowPicker({ index, type: "begin" })}
          >
            <Text style={styles.timeText}>
              {formatTime(day.begin) === "--:--"
                ? DEFAULT_BEGIN_TIME
                : formatTime(day.begin)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowPicker({ index, type: "end" })}
          >
            <Text style={styles.timeText}>
              {formatTime(day.end) === "--:--"
                ? DEFAULT_END_TIME
                : formatTime(day.end)}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.placeholderText}>{DEFAULT_BEGIN_TIME}</Text>
          <Text style={styles.placeholderText}>{DEFAULT_END_TIME}</Text>
        </>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  dayRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    flex: 1,
  },
  dayColumn: {
    marginLeft: 8,
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
    fontSize: 16,
    margin: 0,
  },

  timeButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  timeText: {
    fontFamily: "Itim_400Regular",
    fontSize: 16,
    textAlign: "center",
  },
  placeholderText: {
    flex: 1,
    textAlign: "center",
    color: "#8F8F8F",
    fontFamily: "Itim_400Regular",
    fontSize: 16,
  },
});
export default DayRow;
