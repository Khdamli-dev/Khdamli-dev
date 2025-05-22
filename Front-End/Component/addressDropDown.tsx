import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import apiClient from "@/api/appClient";
import refreshAccessToken from "@/api/refreshAccessToken";
import { router } from "expo-router";

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
  const [municipalities, setMunicipalities] = useState<City[]>([]);
  const [filteredMunicipalities, setFilteredMunicipalities] = useState<City[]>(
    []
  );
  const [search, setSearch] = useState("");
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const fetchMunicipalities = async (wilayaId: number) => {
    try {
      const response = await apiClient.get(`/address/cities/${wilayaId}`);
      setMunicipalities(response.data.cities);
      setFilteredMunicipalities(response.data.cities);
    } catch (error: any) {
      if (error.response?.status === 401) {
        if (await refreshAccessToken()) {
          await fetchMunicipalities(wilayaId);
        } else {
          // need to login
          router.push("/(auth)");
        }
      }
    }
  };

  useEffect(() => {
    if (wilaya) fetchMunicipalities(wilaya.id);
    else {
      setMunicipalities([]);
      setFilteredMunicipalities([]);
    }
    setSearch("");
  }, [wilaya]);

  const handleSelect = (city: City) => {
    onSelectMunicipality(city);
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
    <View className="w-10/12 bg-white border-specialGreen rounded-xl border-2  shadow-2xl py-4 mt-2">
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
  );
};

export default AddressDropdown;
