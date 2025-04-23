import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { MapPin, Home } from "lucide-react-native";

interface DropdownSearchProps<T> {
  label: string;
  icon: React.ReactNode;
  value: string;
  onTextChange: (text: string) => void;
  data: T[];
  onSelectItem: (item: T) => void;
  renderItem: (item: T) => React.ReactElement;
  keyExtractor: (item: T) => string;
  placeholder: string;
}

const DropdownSearch = <T extends unknown>({
  label,
  icon,
  value,
  onTextChange,
  data,
  onSelectItem,
  renderItem,
  keyExtractor,
  placeholder,
}: DropdownSearchProps<T>) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const handleTextChange = (text: string) => {
    onTextChange(text);
    setIsDropdownVisible(text.length > 0); // Show dropdown only if there is text
  };

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        {icon}
        <TextInput
          style={styles.input}
          value={value} // Use value instead of defaultValue
          onChangeText={handleTextChange}
          placeholder={placeholder}
        />
      </View>
      {isDropdownVisible && data.length > 0 && (
        <FlatList
          scrollEnabled={false}
          data={data}
          keyExtractor={keyExtractor}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                onSelectItem(item);
                setIsDropdownVisible(false); // Hide dropdown after selection
              }}
            >
              {renderItem(item)}
            </TouchableOpacity>
          )}
          style={styles.dropdownList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: { marginBottom: 12 },
  label: {
    fontSize: 16,
    color: "#CB8400",
    fontFamily: "Itim_400Regular",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#F8A100",
    paddingBottom: 4,
  },
  input: {
    flex: 1,
    marginLeft: 8,
  },
  dropdownList: {
    maxHeight: 150,
    backgroundColor: "#f8f8f8",
    borderRadius: 4,
    marginTop: 4,
  },
});

export default DropdownSearch;
