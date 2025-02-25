import { API_URL } from '@env';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
 import { twMerge } from 'tailwind-merge'; 


const WilayaDropdown = () => {
    console.log(API_URL);
    const [wilayas, setWilaya] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedWilaya, setSelectedWilaya] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const rotateAnim = useState(new Animated.Value(0))[0];

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
        Animated.timing(rotateAnim, {
            toValue: isOpen ? 0 : 1,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };
    useEffect(() => {
        const fetchRegions = async () => {
            try {
              const response = await axios.get(`http://localhost:8000/address/regions`, {
                params: { country: 1 }, // Send country as a query parameter
              });
      
              if (response.data.status === 200) {
                setWilaya(response.data.regions);
              }
            } catch (error) {
              console.error("Error fetching regions:", error);
            }
          };
      
          fetchRegions();
    }, []);

    const handleSelect = (wilaya: string) => {
        setSelectedWilaya(wilaya);
        setIsOpen(false);
    };

    //const filteredWilayas = wilayas.filter(w => w.toLowerCase().includes(search.toLowerCase()));

    const arrowRotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    return (
        <View className='items-center w-full'>
            <TouchableOpacity
                className='relative flex-row items-center justify-between w-80 h-16 border-2 border-specialGreen rounded-full px-4'
                onPress={toggleDropdown}
            >
                <Icon name='location-pin' color='#396F65' size={30} />
                <Text className='text-xl text-specialGreen font-bold'>{selectedWilaya || 'Enter your Wilaya'}</Text>
                <Animated.View style={{ transform: [{ rotate: arrowRotation }] }}>
                    <Icon name='keyboard-arrow-down' color='#396F65' size={30} />
                </Animated.View>
            </TouchableOpacity>
            {isOpen && (
                <View 
                className='absolute top-20 w-80 bg-white border border-gray-300 rounded-lg shadow-lg p-2'
                style={{
                    position: 'absolute',
                    top: 60, // adjust as needed
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                  }}
                >
                    <TextInput
                        className='border border-gray-300 rounded-md p-2 mb-2'
                        placeholder='Search Wilaya...'
                        value={search}
                        onChangeText={setSearch}
                    />
                    <FlatList
                        data={wilayas}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                className='p-3 border-b border-gray-200'
                                onPress={() => handleSelect(item)}
                            >
                                <Text className='text-lg'>{item}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>                             
            )}
        </View>
    );
};

export default WilayaDropdown;
