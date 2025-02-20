import React, { useState ,useEffect} from 'react';
import { View, Text, TextInput,BackHandler, TouchableOpacity, SafeAreaView, Image,Dimensions, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Fontisto';
import Icoon from 'react-native-vector-icons/AntDesign';
import Icooon from 'react-native-vector-icons/FontAwesome6'
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import { KeyboardAvoidingView,ScrollView,TouchableWithoutFeedback,Keyboard } from 'react-native';


export default function SignUp() {
  const [Age,setAge] =useState('');
  const [checked, setChecked] = useState(false);
  const [isInputFocised,setIsInputFocised]= useState(false);
  const [selectedGender, setSelectedGender] = useState("");

  const{width:screenWidth,height:screenHeight}=Dimensions.get("window");

  return (
    <SafeAreaView className="flex-1 bg-white ">
     
     <KeyboardAvoidingView style={{flex:1}} >
     <ScrollView>

{/*  */}
<View className="flex-1 items-center justify-cente ">
        {/*OtherInformation*/}
          <View  style={{borderBottomLeftRadius:screenWidth * 0.1,borderBottomRightRadius:screenWidth * 0.1}} className='bg-specialGreen w-full mb-safe-offset-5 pl-12 pt-safe-offset-16 pb-2  shadow-md shadow-black'>
                  
                  <Text className=' my-5  text-6xl  font-medium text-white'>Other </Text> 
                  <Text className='mb-5  text-6xl  font-medium text-white'>Information</Text> 
                 
               
         </View>
       
         <View className="relative w-8/12 h-20 mt-14 mb-10 self-center bg-specialGreen rounded-full flex items-center justify-center">
           <Text className='text-white text-center font text-2xl lg:text-4xl'>Select Your Gender</Text>
          </View>


          <View className="relative w-5/12 h-16 mt-6 mb-8 self-center bg-specialGreen rounded-full flex items-center justify-center">
      {/* Male Button */}
              <TouchableOpacity
              onPress={() => setSelectedGender("Male")}
              className={`w-full h-full p-4 rounded-full items-center justify-center border-2 ${
                selectedGender === "Male" ? "bg-specialGreen border-specialGreen" : "bg-white border-specialGreen"
              }`}
            >
              <Text className={`text-xl font-bold ${selectedGender === "Male" ? "text-foncyYellow" : "text-specialGreen"}`}>
                Male
              </Text>
            </TouchableOpacity>
          </View>
          <View className="relative w-5/12 h-16 my-6 self-center bg-specialGreen rounded-full flex items-center justify-center">  
      {/* Female Button */}
                <TouchableOpacity
                  onPress={() => setSelectedGender("Femal")}
                  className={`w-full h-full p-4 rounded-full items-center justify-center border-2 ${
                    selectedGender === "Femal" ? "bg-specialGreen border-specialGreen" : "bg-white border-specialGreen"
                  }`}
                >
                  <Text className={`text-xl font-bold ${selectedGender === "Femal" ? "text-foncyYellow" : "text-specialGreen"}`}>
                    Femal
                  </Text>
                </TouchableOpacity>
          </View>
      
        
        
          <View className='relative w-8/12 h-20 mt-14  self-center  '>
                  <Icooon  name="clipboard-user"  color="#4C8479" size={28}  className='absolute left-16 top-6  text-2xl font-bold '/>
                  <TextInput
                  className=" absolute w-full h-full text-specialGreen text-2xl font-bold border-2 border-specialGreen rounded-full pl-28  py-2"    
                  value={Age}
                  onChangeText={setAge}
                  secureTextEntry
                  placeholder='Enter Your Age'
                  placeholderTextColor="#4C8479"
                  />
          </View>
        
        <View className=" relative w-8/12 h-20 rounded-full bg-black items-center justify-center mt-14">
            <TouchableOpacity
              onPress={() => alert("hhhhh")}
              className="bg-specialGreen p-6 rounded-full  max-w-sm shadow-md shadow-black w-full h-full"
            >
              <Text className="text-white text-center font text-3xl lg:text-xl">Next</Text>
            </TouchableOpacity>
          </View>
  </View>

</ScrollView>
     </KeyboardAvoidingView>
     
    </SafeAreaView>
  );
}




<View className='relative w-10/12 h-20 my-2 self-center '>
          <Icoon  name="user"  color="white" size={30}  className='absolute left-14 top-6  text-2xl font-bold '/>
          <TextInput
            className=" absolute w-full h-full text-white text-2xl font-bold border-2 border-white rounded-full pl-28 py-2"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder='Email Or Phone'
            placeholderTextColor="#ffffff"
            scrollEnabled
          />
          {touched.name && errors.name && <Text style={{ color: "red" }}>{errors.name}</Text>}
         </View>
          <View className='relative w-10/12 h-20 my-2 self-center '>
          <Icon  name="locked"  color="white" size={28}  className='absolute left-16 top-6  text-2xl font-bold '/>
          <TextInput
              className=" absolute w-full h-full text-white text-2xl font-bold border-2 border-white rounded-full pl-28  py-2"    
             value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder='Password'
            placeholderTextColor="#ffffff"
          />
        {touched.password && errors.password && <Text style={{ color: "red" }}>{errors.password}</Text>}
          </View>