import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface AddressDropdownProps {
  selectedWilaya: string | null; // Selected Wilaya from the parent
  onSelectMunicipality: (municipality: string) => void;
}

const municipalities: Record<string, string[]> = {
  // Sample data mapping Wilaya to its municipalities (البلديات)
  Alger: ['Bab El Oued', 'Hydra', 'El Harrach'],
  Oran: ['Es Sénia', 'Bir El Djir', 'Oran Center'],
  Constantine: ['Didouche Mourad', 'El Khroub', 'Oued Rhiou'],
  // Add more Wilaya and their municipalities as needed
};  

const AddressDropdown: React.FC<AddressDropdownProps> = ({
  selectedWilaya,
  onSelectMunicipality,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
    Animated.timing(rotateAnim, {
      toValue: isOpen ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  // Retrieve municipalities for the selected Wilaya; if none is selected, use an empty list.
  const municipalityList =
    selectedWilaya && municipalities[selectedWilaya]
      ? municipalities[selectedWilaya]
      : [];

  // Filter based on search query
  const filteredMunicipalities = municipalityList.filter((m) =>
    m.toLowerCase().includes(search.toLowerCase())
  );

  const arrowRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View className="items-center">
      <TouchableOpacity
        className="relative flex-row items-center justify-between w-80 h-16 border-2 border-specialGreen rounded-full px-4"
        onPress={toggleDropdown}
      >
        <Icon name="location-city" color="#396F65" size={30} />
        <Text className="text-xl text-specialGreen font-bold">
          {selectedWilaya
            ? 'Select Municipality'
            : 'Select Wilaya First'}
        </Text>
        <Animated.View style={{ transform: [{ rotate: arrowRotation }] }}>
          <Icon name="keyboard-arrow-down" color="#396F65" size={30} />
        </Animated.View>
      </TouchableOpacity>

      {isOpen && selectedWilaya && (
        <View
          style={{
            position: 'absolute',
            top: 60, // Adjust based on your layout
            left: 0,
            right: 0,
            zIndex: 1000,
          }}
          className="w-80 bg-white border border-gray-300 rounded-lg shadow-lg p-2"
        >
          <TextInput
            className="border border-gray-300 rounded-md p-2 mb-2"
            placeholder="Search Municipality..."
            value={search}
            onChangeText={setSearch}
          />
          <FlatList
            data={filteredMunicipalities}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="p-3 border-b border-gray-200"
                onPress={() => {
                  onSelectMunicipality(item);
                  toggleDropdown();
                  setSearch('');
                }}
              >
                <Text className="text-lg">{item}</Text>
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}
    </View>
  );
};

export default AddressDropdown;
