import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  Dimensions,
  KeyboardAvoidingView,
  ScrollView 
} from 'react-native';
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Icon1 from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/Entypo';
import Icon3 from 'react-native-vector-icons/FontAwesome6';
import Icon4 from 'react-native-vector-icons/FontAwesome';
import Icon5 from 'react-native-vector-icons/AntDesign';
import Icon6 from 'react-native-vector-icons/Foundation';
import AddressDropdown from '@/Component/BaladayaSelect';
import WilayaDropdown from '@/Component/WilayaSelect';
import { Icon } from 'lucide-react-native';     

export default function LocationInformation() {
  const [Age, setAge] = useState('');
  const [checkedMale, setCheckedMale] = useState(false);
  const [checkedFemale, setcheckedFemale] = useState(false);
  const [selectedGender, setSelectedGender] = useState("");
  const navigation = useNavigation();
  const [Years, setYears] = useState("");
  const [checkedItemsWilaya, setcheckedItemsWilaya] = useState(false);
  const { width: screenWidth } = Dimensions.get("window");
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
          <View className="flex-1 flex items-center justify-center">
            {/* Header Section */}
            <View
              style={{ borderBottomLeftRadius: screenWidth * 0.1, borderBottomRightRadius: screenWidth * 0.1 }}
              className="flex-1 bg-specialGreen pt-7 w-full mb-safe-offset-5 shadow-md shadow-black"
            >
              <View className="pl-4 p-2 flex-row justify-between items-center">
                <TouchableOpacity>
                  <Icon1 name="arrow-back-ios" color="#FFFF" size={60} />
                </TouchableOpacity>
                <View className="h-24 w-24 bg-[#F8A100] rounded-full border-4 border-yellow-700 items-center justify-center">
                  <Icon1 name="location-pin" color="#396F65" size={60} />
                </View>
              </View>
              <View className="px-10 pb-12 pt-12">
                <Text className="text-6xl w-full font-medium text-white">Other</Text>
                <Text className="text-6xl w-full font-medium text-white">Information</Text>
              </View>
            </View>

            <View className="w-full h-16 px-2 items-center justify-center bg-yellow-600 mb-1">
              <Text className="text-xl font-medium">
                you can edit it later
              </Text>
            </View>

            {/* Wrap the Wilaya selector in a relative container */}
            <View className="flex-1 items-center justify-center relative">
              <WilayaDropdown />
              <AddressDropdown selectedWilaya={null} onSelectMunicipality={function (municipality: string): void {
                throw new Error('Function not implemented.');
              } }/>               
              

              <View className="relative w-80 h-16 mt-6 mb-4 self-center">
                <Icon5
                  name="user"
                  color="#4C8479"
                  size={30}
                  style={{ position: 'absolute', left: 16, top: 8 }}
                />
                <TextInput
                  className="absolute w-full h-full text-specialGreen text-xl font-bold border-2 border-specialGreen rounded-full pl-16 py-2"
                  value={Age}
                  onChangeText={setAge}
                  keyboardType="email-address"
                  placeholder="Enter Your Age +18"
                  placeholderTextColor="#4C8479"
                  scrollEnabled
                />
              </View>
            </View>

            {/* Gender Selection */}
            <View className="flex-row px-20 w-full pb-4 pt-2 items-center justify-between bg-red-500">
              <View className="flex-col">
                <TouchableOpacity className="rounded-full w-40 h-40 border-2 border-specialGreen items-center justify-center mb-3">
                  <Icon6 name="female-symbol" color="#F8A100" size={70} />
                </TouchableOpacity>
                <View className="items-center justify-center bg-yellow-400">
                  <Text className="text-2xl text-white">Female</Text>
                </View>
              </View>
              <View className="flex-col">
                <TouchableOpacity className="rounded-full w-40 h-40 border-2 border-specialGreen items-center justify-center mb-3">
                  <Icon6 name="male-symbol" color="#F8A100" size={70} />
                </TouchableOpacity>
                <View className="items-center justify-center bg-yellow-400">
                  <Text className="text-2xl text-white">Male</Text>
                </View>
              </View>
            </View>

            <View style={{ flex: 1 }} />
            <View className="w-full items-center justify-center bg-blue-600 p-6">
              <TouchableOpacity className="rounded-full w-80 h-16 bg-specialGreen items-center justify-center">
                <Text className="text-white text-3xl">Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}




