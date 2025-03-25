import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import CONFIG from "@/config";

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
      const response = await axios.get(`${CONFIG.API_URL}/address/regions/1`);
      setWilayas(response.data.regions);
      setFilteredWilayas(response.data.regions);
    } catch (error) {
      console.log(error)
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
    onSelectWilaya(wilaya);
    setIsOpen(false);
  };

  const arrowRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const renderButton = () => (
    <TouchableOpacity
      className="flex-row items-center justify-between w-9/12 h-20 border-2 border-specialGreen rounded-full px-4"
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
  );

  return (
    <View className="items-center justify-center w-full mt-10">
      {renderButton()}
      {isOpen && (
        <View className="w-9/12 bg-white border border-gray-300 rounded-lg shadow-xl py-4  mt-2">
          <TextInput
            className="border-b-2  border-gray-400 rounded-lg p-3 mb-3 text-lg"
            placeholder="Search Wilaya..."
            value={search}
            onChangeText={handleSearch}
          />
          <ScrollView
            style={{ maxHeight: 200 }}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {filteredWilayas.map((item) => (
              <TouchableOpacity
                key={item.id.toString()}
                className="py-3 h-14 px-4 border-2 mx-2 border-gray-300 rounded-md mb-2 bg-white justify-center items-center"
                onPress={() => handleSelect(item)}
              >
                <Text className="text-lg font-semibold text-gray-700">
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default WilayaDropdown;
