import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  TextInput,
  BackHandler,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
  Pressable,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Icon1 from "react-native-vector-icons/MaterialIcons";
import Icon2 from "react-native-vector-icons/Entypo";
import Icon3 from "react-native-vector-icons/FontAwesome6";
import Icon4 from "react-native-vector-icons/FontAwesome";
/* import { RFPercentage, RFValue } from "react-native-responsive-fontsize"; */
import {
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";

export default function Work_Information() {
  const [Age, setAge] = useState("");
  const [checkedMale, setCheckedMale] = useState(false);
  const [checkedFemale, setcheckedFemale] = useState(false);
  const [isInputFocised, setIsInputFocised] = useState(false);
  const [selectedGender, setSelectedGender] = useState("");
  const navigation = useNavigation();
  const [Years, setYears] = useState("");

  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  return (
    <SafeAreaView className="flex-1 bg-white ">
      <KeyboardAvoidingView style={{ flex: 1 }}>
        <ScrollView>
          {/*  */}
          <View className="flex-1 flex items-center  justify-center ">
            {/*OtherInformation*/}
            <View
              style={{
                borderBottomLeftRadius: screenWidth * 0.1,
                borderBottomRightRadius: screenWidth * 0.1,
              }}
              className=" flex-1 bg-specialGreen pt-7 w-full mb-safe-offset-5  shadow-md shadow-black"
            >
              {/* Three points Settings and X exit */}
              <View className="  pl-4">
                <TouchableOpacity>
                  <Icon1
                    name="arrow-back-ios"
                    color="#FFFF"
                    size={40}
                    className="   font-bold "
                  />
                </TouchableOpacity>
              </View>
              <View className="px-10   ">
                <Text className=" my-5  text-xl w-full font-bold text-white ">
                  Information About Your Work
                </Text>
              </View>
            </View>
            <TouchableOpacity className="relative rounded-full w-80 h-16  border-2 border-specialGreen mb-8">
              <Icon1
                name="keyboard-arrow-down"
                color="#4C8479"
                size={40}
                className="   font-bold  absolute top-2 right-3"
              />
              <Text className="text-specialGreen absolute left-20 top-4">
                Enter Your Category{" "}
              </Text>
              <MaterialCommunityIcons
                name="briefcase"
                size={30}
                color="#4C8479"
                className="absolute top-3 left-4"
              />
            </TouchableOpacity>
            {/* the secand button */}
            <TouchableOpacity className="relative rounded-full w-80 h-16  border-2 border-specialGreen mb-20">
              <Icon1
                name="keyboard-arrow-down"
                color="#4C8479"
                size={40}
                className="   font-bold  absolute top-2 right-3"
              />
              <Text className="text-specialGreen absolute left-20 top-4">
                Enter Your Branches{" "}
              </Text>
              <Icon2
                name="flow-tree"
                size={30}
                color="#4C8479"
                className="absolute top-3 left-4"
              />
            </TouchableOpacity>
            <View className="relative rounded-xl w-96 h-28  border-2 border-specialGreen mb-14">
              <Text className="text-specialGreen absolute left-24 top-0 text-xl font-bold">
                Select Working Days
              </Text>
              <View className="bg-yellow-500 border-2 absolute top-8  border-specialGreen w-full"></View>
              <View className="bg-yellow-600 w-full absolute top-10 bottom-0 rounded-b-xl flex-row items-start justify-between">
                <TouchableOpacity className="bg-orange-500 h-full justify-between pb-4  items-center">
                  <Text>Mon</Text>
                  <View className="rounded-full w-3 h-3 bg-black"></View>
                </TouchableOpacity>
                <View className="bg-orange-500 h-full justify-between pb-4  items-center">
                  <Text>Tue</Text>
                  <View className="rounded-full w-3 h-3 bg-black"></View>
                </View>
                <View className="bg-orange-500 h-full justify-between pb-4  items-center">
                  <Text>Wed</Text>
                  <View className="rounded-full w-3 h-3 bg-black"></View>
                </View>
                <View className="bg-orange-500 h-full justify-between pb-4  items-center">
                  <Text>Thu</Text>
                  <View className="rounded-full w-3 h-3 bg-black"></View>
                </View>
                <View className="bg-orange-500 h-full justify-between pb-4  items-center">
                  <Text>Fri</Text>
                  <View className="rounded-full w-3 h-3 bg-black"></View>
                </View>
                <View className="bg-orange-500 h-full justify-between pb-4  items-center">
                  <Text>Sat</Text>
                  <View className="rounded-full w-3 h-3 bg-black"></View>
                </View>
                <View className="bg-orange-500 h-full justify-between pb-4  items-center">
                  <Text>Sun</Text>
                  <View className="rounded-full w-3 h-3 bg-black"></View>
                </View>
              </View>
            </View>
            {/* Select Working Days Choises */}

            <TouchableOpacity className="rounded-full w-64 h-16 bg-specialGreen flex items-center justify-center">
              <Text className="text-white text-xl font-medium">Next</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
