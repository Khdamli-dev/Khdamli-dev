import { API_URL } from "@env";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Animated,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

interface Wilaya {
  name: string;
  id: number;
}

interface WilayaDropdownProps {
  selectedWilaya: Wilaya | null;
  onSelectWilaya: (wilaya: Wilaya) => void;
}

const WilayaDropdown: React.FC<WilayaDropdownProps> = ({
  selectedWilaya,
  onSelectWilaya,
}) => {
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [filteredWilayas, setFilteredWilayas] = useState<Wilaya[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const rotateAnim = useState(new Animated.Value(0))[0];

  const fetchRegions = async () => {
    try {
      const response = await axios.get(`${API_URL}/address/regions`, {
        params: { country: 1 },
      });
      setWilayas(response.data.regions);
      setFilteredWilayas(response.data.regions);
    } catch (error) {
      console.error("Error fetching regions:", error);
    }
  };

  useEffect(() => {
    fetchRegions();
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    Animated.timing(rotateAnim, {
      toValue: isOpen ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    if (text === "") {
      setFilteredWilayas(wilayas);
    } else {
      setFilteredWilayas(
        wilayas.filter((item) =>
          item.name.toLowerCase().includes(text.toLowerCase())
        )
      );
    }
  };

  const handleSelect = (wilaya: Wilaya) => {
    onSelectWilaya(wilaya); // Update parent state
    setIsOpen(false);
  };

  const arrowRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <View className="items-center w-full">
      <TouchableOpacity
        className="relative flex-row items-center justify-between w-9/12 h-20 border-2 border-specialGreen rounded-full px-4"
        onPress={toggleDropdown}
      >
        <Icon name="location-pin" color="#396F65" size={30} />
        <Text className="text-xl text-specialGreen font-bold">
          {selectedWilaya?.name || "Enter your Wilaya"}
        </Text>
        <Animated.View style={{ transform: [{ rotate: arrowRotation }] }}>
          <Icon name="keyboard-arrow-down" color="#396F65" size={30} />
        </Animated.View>
      </TouchableOpacity>
      {isOpen && (
        <View
          className="absolute top-20 w-80 bg-white border border-gray-300 rounded-lg shadow-xl p-2 z-50"
          style={{
            maxHeight: 200,
            position: "absolute",
            top: 70,
            left: 10,
            right: 0,
            zIndex: 50,
          }}
        >
          <TextInput
            className="border border-gray-300 rounded-md p-2 mb-2"
            placeholder="Search Wilaya..."
            value={search}
            onChangeText={handleSearch}
          />
          <FlatList
            style={{ flex: 1 }}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            data={filteredWilayas}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="p-3 border-b border-gray-200"
                onPress={() => handleSelect(item)}
              >
                <Text className="text-lg">{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

export default WilayaDropdown;
