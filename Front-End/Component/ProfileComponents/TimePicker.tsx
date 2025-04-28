import React from "react";
import DateTimePicker from "@react-native-community/datetimepicker";

type Props = {
  showPicker: { index: number; type: "begin" | "end" } | null;
  days: any[];
  handleTimeChange: (
    event: any,
    selectedDate: Date | undefined,
    index: number,
    type: "begin" | "end"
  ) => void;
};

const TimePicker: React.FC<Props> = ({
  showPicker,
  days,
  handleTimeChange,
}) => {
  if (!showPicker) return null;

  return (
    <>
      <DateTimePicker
        value={days[showPicker.index][showPicker.type] || new Date()}
        mode="time"
        is24Hour={true}
        display="spinner"
        onChange={(event, selectedDate) =>
          handleTimeChange(
            event,
            selectedDate,
            showPicker.index,
            showPicker.type
          )
        }
      />
    </>
  );
};

export default TimePicker;
