import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Animated,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import { API_URL } from "@env";

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
      const response = await axios.get(`${API_URL}/address/cities`, {
        params: { region: wilayaId },
      });
      // Assuming the API returns { municipalities: string[] }
      setMunicipalities(response.data.cities);
      setFilteredMunicipalities(response.data.cities);
    } catch (error) {
      console.error("Error fetching municipalities:", error);
    }
  };

  // Fetch municipalities whenever selectedWilaya changes
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
    //console.log(filteredMunicipalities);
    if (!wilaya) setNotSelectedWilaya(true);
    else setNotSelectedWilaya(false);
    Animated.timing(rotateAnim, {
      toValue: isOpen ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const [notSelectedWilaya, setNotSelectedWilaya] = useState<boolean>(false);
  const handleSelect = (city: City) => {
    onSelectMunicipality(city); // Update parent state
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

  return (
    <>
      <View className="items-center">
        <TouchableOpacity
          className="relative flex-row items-center justify-between w-9/12 h-20 mt-6 border-2 border-specialGreen rounded-full px-4 bg-white shadow-md"
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

        {isOpen && wilaya && (
          <View
            className="absolute  top-16 w-80 bg-white border border-gray-300 rounded-2xl shadow-xl p-2 z-50"
            style={{
              maxHeight: 200,
              position: "absolute",
              top: 90,
              left: 10,
              right: 0,
              zIndex: 20,
            }}
          >
            <TextInput
              className="w-full rounded-md border-b-2 border-specialGreen p-2 mb-2"
              placeholder="Search Municipality..."
              value={search}
              onChangeText={handleSearch}
            />
            <FlatList
              style={{ flex: 1 }}
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              data={filteredMunicipalities}
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
      {/* {notSelectedWilaya && (
        <Text className="text-red-700 text-center w-9/12">
          you must select wilaya first
        </Text>
      )} */}
    </>
  );
};

export default AddressDropdown;
