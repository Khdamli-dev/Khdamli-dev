import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import apiClient from '@/api/appClient';
import refreshAccessToken from '@/api/refreshAccessToken';
import { router } from 'expo-router';

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

  const [search, setSearch] = useState('');
  const rotateAnim = useState(new Animated.Value(0))[0];

  const fetchRegions = async () => {
    try {
      const response = await apiClient.get(`/address/regions/1`);
      setWilayas(response.data.regions);
      setFilteredWilayas(response.data.regions);
    } catch (error: any) {
      if (error.response?.status === 401) {
        if (await refreshAccessToken()){
          await fetchRegions();
        }  
        else{
          // need to login
          router.push('/(auth)');
        }
      }
    }
  };

  useEffect(() => {
    fetchRegions();
  }, []);

  const handleSearch = (text: string) => {
    setSearch(text);
    if (text === '') {
      setFilteredWilayas(wilayas);
    } else {
      setFilteredWilayas(
        wilayas.filter((item) =>
          item.name.toLowerCase().includes(text.toLowerCase()),
        ),
      );
    }
  };

  const handleSelect = (wilaya: Wilaya) => {
    onSelectWilaya(wilaya);
  };

  return (
    <View className="w-10/12 bg-white border-2 border-specialGreen rounded-xl shadow-xl py-4  mt-2">
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
  );
};

export default WilayaDropdown;
