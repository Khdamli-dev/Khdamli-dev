import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import CONFIG from "../config";

interface City {
  name: string;
  id: number;
}
interface AddressDropdownProps {
  selectedCity: City | null;
  onSelectMunicipality: (municipality: City) => void;
  wilaya: City | null;
}

const AddressDropdown: React.FC<AddressDropdownProps> = ({
  selectedCity,
  onSelectMunicipality,
  wilaya,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [municipalities, setMunicipalities] = useState<City[]>([]);
  const [filteredMunicipalities, setFilteredMunicipalities] = useState<City[]>(
    []
  );
  const [search, setSearch] = useState("");
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const fetchMunicipalities = async (wilayaId: number) => {
    try {
      const response = await axios.get(`${CONFIG.API_URL}/address/cities`, {
        params: { region: wilayaId },
      });
      setMunicipalities(response.data.cities);
      setFilteredMunicipalities(response.data.cities);
    } catch (error) {}
  };

  useEffect(() => {
    if (wilaya) fetchMunicipalities(wilaya.id);
    else {
      setMunicipalities([]);
      setFilteredMunicipalities([]);
    }
    setSearch("");
  }, [wilaya]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    Animated.timing(rotateAnim, {
      toValue: isOpen ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleSelect = (city: City) => {
    onSelectMunicipality(city);
    setIsOpen(false);
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    if (text === "") {
      setFilteredMunicipalities(municipalities);
    } else {
      setFilteredMunicipalities(
        municipalities.filter((m: City) =>
          m.name.toLowerCase().includes(text.toLowerCase())
        )
      );
    }
  };

  const arrowRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const renderButton = () => (
    <TouchableOpacity
      className="flex-row items-center justify-between w-9/12 h-20 border-2 border-specialGreen rounded-full px-4 bg-white shadow-md"
      onPress={toggleDropdown}
    >
      <Icon name="location-city" color="#396F65" size={30} />
      <Text className="text-xl text-specialGreen font-bold">
        {selectedCity?.name || "Enter your City"}
      </Text>
      <Animated.View style={{ transform: [{ rotate: arrowRotation }] }}>
        <Icon name="keyboard-arrow-down" color="#396F65" size={30} />
      </Animated.View>
    </TouchableOpacity>
  );

  return (
    <View className="items-center justify-center w-full mt-6">
      {renderButton()}
      {isOpen && wilaya && (
        <View className="w-9/12 bg-white border border-gray-300  shadow-2xl py-4 mt-2">
          <TextInput
            className="border-b-2 border-gray-400 p-3 mb-3 text-lg"
            placeholder="Search Municipality..."
            value={search}
            onChangeText={handleSearch}
          />
          <ScrollView
            style={{ maxHeight: 200 }}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {filteredMunicipalities.map((item) => (
              <TouchableOpacity
                key={item.id.toString()}
                className="py-3 h-14  px-4 border-2 mx-2 border-gray-300 rounded-md mb-2 bg-white justify-center items-center"
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

export default AddressDropdown;
