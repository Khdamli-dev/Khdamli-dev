import { ChevronDown } from "lucide-react-native";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { ComponentType } from "react";
import { LucideProps } from "lucide-react-native";
type DropdownProps = {
  label: string;
  icon: ComponentType<LucideProps>;
  selectedItems: { id: number; name: string }[];
  allItems: { id: number; name: string }[];
  showList: boolean;
  setShowList: (val: boolean) => void;
  toggleSelection: (item: { id: number; name: string }) => void;
};
import { useEffect } from "react";

const Dropdown: React.FC<DropdownProps> = ({
  label,
  icon: Icon,
  selectedItems,
  allItems,
  showList,
  setShowList,
  toggleSelection,
}) => {
  return (
    <View>
      <Text style={[styles.label, styles.account]}>{label}</Text>
      <TouchableOpacity
        style={styles.inputWrapper}
        onPress={() => setShowList(!showList)}
      >
        <Icon size={22} {...({ stroke: "#F8A100" } as any)} />
        <Text style={styles.input}>
          {selectedItems?.length
            ? selectedItems
                .map((item) =>
                  typeof item.name === "string"
                    ? item.name
                    : JSON.stringify(item.name)
                )
                .join(", ")
            : `Select ${label}`}
        </Text>
        <ChevronDown size={22} color="#F8A100" />
      </TouchableOpacity>

      {showList && (
        <FlatList
          scrollEnabled={false}
          data={allItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const isSelected = selectedItems.some(
              (selected) => selected.id === item.id
            );
            return (
              <TouchableOpacity
                onPress={() => toggleSelection(item)}
                style={[
                  styles.dropdownItem,
                  isSelected && { backgroundColor: "#F8A100" },
                ]}
              >
                <Text style={isSelected && { color: "black" }}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    color: "#CB8400",
    fontFamily: "Itim_400Regular",
  },
  account: { marginVertical: 5 },
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
  dropdownItem: {
    padding: 10,
    backgroundColor: "#f8f8f8",
    borderBottomWidth: 1,
    borderBottomColor: "black",
  },
});

export default Dropdown;
