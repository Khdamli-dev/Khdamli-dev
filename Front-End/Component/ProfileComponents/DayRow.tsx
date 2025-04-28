import React from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity } from "react-native";
type Day = {
  name: string;
  isEnabled: boolean;
  begin?: Date;
  end?: Date;
};

type Props = {
  day: Day;
  index: number;
  toggleDay: (index: number) => void;
  setShowPicker: (
    picker: { index: number; type: "begin" | "end" } | null
  ) => void;
  formatTime: (time: Date | string | undefined | null) => string;
};

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
        <Text style={styles.dayText}>{day.name}</Text>
      </View>

      {day.isEnabled ? (
        <>
          <TouchableOpacity
            style={{ flex: 1, alignItems: "center" }}
            onPress={() => setShowPicker({ index, type: "begin" })}
          >
            <Text>{formatTime(day.begin)}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1, alignItems: "center" }}
            onPress={() => setShowPicker({ index, type: "end" })}
          >
            <Text>{formatTime(day.end)}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.placeholderText}>--:--</Text>
          <Text style={styles.placeholderText}>--:--</Text>
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

  placeholderText: {
    flex: 1,
    textAlign: "center",
    color: "#8F8F8F",
  },
});
export default DayRow;
