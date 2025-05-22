import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Dimensions,
  Platform,
} from "react-native";
import { router } from "expo-router";
import {
  AntDesign,
  FontAwesome6,
  EvilIcons,
  Ionicons,
  Entypo,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import OneCategorySelector from "@/Component/selectOneCategory";
import WilayaDropdown from "@/Component/wilayaDropDown";
import AddressDropdown from "@/Component/addressDropDown";
import PaymentMethod from "@/Component/paymentMethods";
import TheTime from "@/Component/time";
import DatePicker from "@/Component/date";
import MediaUploader, { MediaItem } from "@/Component/mediaUploader";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "@/api/appClient";
import refreshAccessToken from '@/api/refreshAccessToken';

interface JobRequest {
  client: number | null;
  region: number | null;
  city: number | null;
  working_time: Date | null;
  category: number | null;
  payment: number | null;
  description: string | null;
  type: number | null; // 1 for Public, 2 for Private
  status: number | null; // 3 for "On Hold" on new requests
}

const CreateRequestScreen = () => {
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
 const getTodayDateString = () => {
   const today = new Date();
   const year = today.getFullYear();
   const month = String(today.getMonth() + 1).padStart(2, "0");
   const day = String(today.getDate()).padStart(2, "0");
   return `${year}/${month}/${day}`;
 };
  const [selectedCategory, setSelectedCategory] = useState<{
    name: string;
    id: string;
  } | null>(null);
  const [selectedWilaya, setSelectedWilaya] = useState<{
    name: string;
    id: number;
  } | null>(null);
  const [selectedMunicipality, setSelectedMunicipality] = useState<{
    name: string;
    id: number;
  } | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<{
    name: string;
    id: number;
  } | null>({ name: "Cash", id: 1 });
  const [date, setDate] = useState<string | null>(getTodayDateString()); // Initialize with today
  const [beginTime, setbeginTime] = useState<string | null>("08:00"); // HH:MM
  const [description, setDescription] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<MediaItem[]>([]);
  //Ctegory ------------------------------------------------------------------------------------------
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const toggleCategoryDropdown = () => {
    setIsCategoryOpen(!isCategoryOpen);
  };
  const handleCategorySelect = (
    category: {
      name: string;
      id: string;
    } | null
  ) => {
    setSelectedCategory(category);
    setIsCategoryOpen(false);
  };
  //WilayaDropDown ------------------------------------------------------------------------------------------
  const [isWilayaOpen, setIsWilayaOpen] = useState(false);
  const toggleDropdown = () => {
    setIsWilayaOpen(!isWilayaOpen);
    isAddressOpen ? setIsAddressOpen(!isAddressOpen) : null;
  };
  useEffect(() => {
    setSelectedMunicipality(null);
  }, [selectedWilaya]);

  //AddressDropDown ------------------------------------------------------------------------------------------
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const toggleAddressDropdown = () => {
    setIsAddressOpen(!isAddressOpen);
    isWilayaOpen ? setIsWilayaOpen(!isWilayaOpen) : null;
  };
  const handleSelectedMunicipality = (municipalitie: any) => {
    setSelectedMunicipality(municipalitie);
    setIsAddressOpen(false);
  };
  //PaymentMethodDropDown ------------------------------------------------------------------------------------------
  const [isPamentOpen, setIsPaymentOpen] = useState(false);
  const togglePaymentDropdown = () => {
    setIsPaymentOpen(!isPamentOpen);
  };
  const handleSelectedPaymentMethod = (PaymentMethod: any) => {
    setSelectedPaymentMethod(PaymentMethod);
    setIsPaymentOpen(false);
  };

  //The Time --------------------------------------------------------------------------------------
  const [isBeginTimeOpen, setIsBeginTimeOpen] = useState(false);
  const toggleBeginTimeDropdown = () => {
    setIsBeginTimeOpen(!isBeginTimeOpen);
  };
  const handleSelectedBeginTime = (time: any) => {
    setbeginTime(time);
    setIsBeginTimeOpen(false);
  };

  //The Date  ------------------------------------------------------------------------------------------
  const [isDateOpen, setIsDateOpen] = useState(false);
  const toggleDateDropdown = () => {
    setIsDateOpen(!isDateOpen);
  };
  const handleSelectedDate = (Date: any) => {
    setDate(Date);
    setIsDateOpen(false);
  };
  //Media  ------------------------------------------------------------------------------------------
  const [pickerOpen, setPickerOpen] = useState<boolean>(false);
  const handleMediaSelect = (media: any) => {
    setSelectedMedia(media);
  };
  const handleOpenPicker = () => {
    setPickerOpen(true);
  };
  const handleClosePicker = () => {
    setPickerOpen(false);
  };
  //convertToDate ------------------------------------------------------------------------------------------
  const convertToDate = (): Date | null => {
    // Check if date or beginTime is null/empty
    if (!date || !beginTime) return null;

    // Split date into [MM, DD, YYYY] (adjust based on your actual date format)
    const [year, month, day] = date.split("/");
    // Split time into [HH, MM]
    const [hours, minutes] = beginTime.split(":");

    // Ensure all parts exist
    if (!month || !day || !year || !hours || !minutes) return null;
    // Create Date object (months are 0-indexed in JavaScript)
    const dateObject = new Date(
      parseInt(year),
      parseInt(month) - 1, // Subtract 1 for month
      parseInt(day),
      parseInt(hours),
      parseInt(minutes)
    );
    return dateObject;
  };
  //UploaderMedia ------------------------------------------------------------------------------------------
const uploadSelectedMedia = async (requestId: number) => {
  if (!selectedMedia.length) {
    console.warn("❌ No media selected to upload.");
    return;
  }
  if (isNaN(requestId)) {
    return;
  }

  const formData = new FormData();

  selectedMedia.forEach((item, index) => {
    const fileExtension = item.type === "image" ? "jpg" : "mp4";
    formData.append("file", {
      uri: item.uri,
      name: `media-${index}.${fileExtension}`,
      type: item.type === "image" ? "image/jpeg" : "video/mp4",
    } as any);
  });

  console.log("📤 FormData being sent:", formData);

  try {
    const response = await apiClient.put(
      `/work/job-request/media/${requestId}`,
      formData,
      {
        headers: {
          // Let Axios handle Content-Type with the correct boundary
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("✅ Media uploaded successfully:", response.data);
  } catch (error: any) {
    if (error.response?.status === 401) {
      if (await refreshAccessToken()) {
        await uploadSelectedMedia(requestId);
      } else {
        // need to login
        router.push('/(auth)');
      }
    }
    console.log(error.response)
  }
};

  //Handle Save ------------------------------------------------------------------------------------------
  const [error, setError] = useState<string>("");
 const handleSubmit = async () => {
   // Basic validation
   if (
     !selectedCategory ||
     !selectedPaymentMethod ||
     !selectedWilaya || // Region is required
     !selectedMunicipality || // City is required
     !date ||
     !beginTime ||
     !description
   ) {
     setError("Please fill in all required fields.");
     return;
   }

   // Validate description length
   const trimmedDescription = description.trim();
   if (trimmedDescription.length < 5) {
     setError("Description must be at least 5 characters.");
     return;
   }

   // Clear any previous errors
   setError("");

   // Convert date and time to a valid Date object
   const working_time = convertToDate();
   try {
     // Retrieve user object from AsyncStorage
     const userData = await AsyncStorage.getItem("user");

     if (userData) {
       const user: any = JSON.parse(userData); // Parse the user data

       // Build the job request payload
       const jobRequest: JobRequest = {
         client: user.id, // Use the user ID from AsyncStorage
         region: selectedWilaya.id, // Convert Wilaya ID to number
         city: selectedMunicipality.id, // Convert Municipality ID to number
         working_time,
         category: Number(selectedCategory.id), // Convert to number
         payment: selectedPaymentMethod.id, // Already a number
         description: trimmedDescription,
         type: 1, // Public request
         status: 3, // "On Hold"
       };
       const response = await apiClient.post(
         `/work/job-request/`,
         jobRequest 
       );

       if (response.status === 201) {
         const requestId: number = +response.data.request.id;
         uploadSelectedMedia(requestId);
        
       }
       router.back();
     } else {
       console.log("No user data found in AsyncStorage");
       setError("User data not found. Please log in again.");
     }
   } catch (error : any) {
     if (error.response?.status === 401) {
              if (await refreshAccessToken()) {
                await handleSubmit();
              } else {
                // need to login
                router.push('/(auth)');
              }
            }

     console.error("Error submitting job request:", error.response.data.message);
     setError("There was an error submitting your request. Please try again.");
   }
 };

  return (
    <SafeAreaView className="flex-1 ">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/*Header  ------------------------------------------------------------------------------------------*/}
          <LinearGradient
            colors={["#2B524A", "#5EB4A2"]}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{
              borderBottomLeftRadius: screenWidth * 0.1,
              borderBottomRightRadius: screenWidth * 0.1,
            }}
            className=" w-full mb-8 pt-6  pb-2  shadow-md shadow-black"
          >
            {/* Go back  */}
            <View className="w-full mb-1 items-start justify-start ">
              <TouchableOpacity onPress={() => router.back()}>
                <AntDesign name="left" size={60} color="white" />
              </TouchableOpacity>
            </View>

            <View className="px-10 pb-5 ">
              <Text
                style={{
                  textShadowColor: "#000",
                  textShadowOffset: { width: 1, height: 1 },
                  textShadowRadius: 5,
                }}
                className="my-5 text-2xl font-semibold text-white"
              >
                Information About
              </Text>
              <Text
                style={{
                  textShadowColor: "#000",
                  textShadowOffset: { width: 1, height: 1 },
                  textShadowRadius: 5,
                }}
                className="mb-10 text-2xl font-semibold text-white"
              >
                Your Request
              </Text>
            </View>
          </LinearGradient>
          <View className="flex-1 w-11/12 py-4 mb-2 items-center bg-white rounded-xl shadow-black shadow-xl">
            {/*  Type Of Services ------------------------------------------------------------------------------------------ */}
            <View className="w-11/12  px-2">
              <Text className="text-[#CB8400] text-lg font-bold pl-16 mb-1">
                Select Type Of Services
              </Text>
              <View className="w-full flex-row items-center">
                <View className="w-2/12">
                  <Entypo name="flow-tree" size={35} color="#F8A100" />
                </View>
                <TouchableOpacity
                  onPress={toggleCategoryDropdown}
                  className="flex-row w-9/12  ml-4  flex-grow items-center justify-between border-b-2 border-foncyYellow"
                >
                  <Text className="text-xl font-bold  ">
                    {selectedCategory
                      ? `${selectedCategory.name}`
                      : "Select Type Of Service"}
                  </Text>
                  <MaterialIcons
                    name={
                      isCategoryOpen
                        ? "keyboard-arrow-up"
                        : "keyboard-arrow-down"
                    }
                    size={30}
                  />
                </TouchableOpacity>
              </View>
              <View className="items-center justify-center mt-1 ">
                {isCategoryOpen && (
                  <OneCategorySelector
                    onSelectCategory={handleCategorySelect}
                    selectedCategory={selectedCategory}
                  />
                )}
              </View>
            </View>
            {/*  Payment Method ------------------------------------------------------------------------------------------ */}
            <View className="w-11/12  px-2 mt-6">
              <Text className="text-[#CB8400] text-lg font-bold pl-16 mb-1">
                Payment Method
              </Text>
              <View className="w-full flex-row items-center">
                <View className="w-2/12">
                  <FontAwesome6 name="money-bills" size={30} color="#F8A100" />
                </View>

                <TouchableOpacity
                  onPress={togglePaymentDropdown}
                  className="flex-row w-9/12  ml-4  flex-grow items-center justify-between border-b-2 border-foncyYellow"
                >
                  <Text className="text-xl font-bold  ">
                    {selectedPaymentMethod
                      ? `${selectedPaymentMethod.name}`
                      : "Select Your Payment Method"}
                  </Text>
                  <MaterialIcons
                    name={
                      isPamentOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"
                    }
                    size={30}
                  />
                </TouchableOpacity>
              </View>
              <View className="items-center justify-center mt-1 ml-6">
                {isPamentOpen && (
                  <PaymentMethod
                    selectedPayment={selectedPaymentMethod}
                    onSelectPayment={handleSelectedPaymentMethod}
                  />
                )}
              </View>
            </View>
            {/*  The Region ------------------------------------------------------------------------------------------*/}
            <View className="w-11/12  px-2 mt-6  ">
              <Text className="text-[#CB8400] text-lg font-bold pl-16 mb-1">
                Enter The Region
              </Text>
              <View className="w-full flex-row items-center">
                <View className="w-2/12">
                  <EvilIcons name="location" size={40} color="#F8A100" />
                </View>

                <TouchableOpacity
                  onPress={toggleDropdown}
                  className="flex-row w-9/12 ml-4 flex-grow items-center justify-between border-b-2 border-foncyYellow"
                >
                  <Text className="text-xl font-bold">
                    {selectedWilaya
                      ? `${selectedWilaya.name}`
                      : "Select Your Region"}
                  </Text>
                  <MaterialIcons
                    name={
                      isWilayaOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"
                    }
                    size={30}
                  />
                </TouchableOpacity>
              </View>
              <View className=" mt-1 ml-4 items-end justify-end">
                {isWilayaOpen && (
                  <WilayaDropdown
                    selectedWilaya={selectedWilaya}
                    onSelectWilaya={(wilaya) => {
                      setSelectedWilaya(wilaya);
                      setIsWilayaOpen(false);
                    }}
                  />
                )}
              </View>
            </View>
            {/*  The City ------------------------------------------------------------------------------------------*/}
            <View className="w-11/12  px-2 mt-6">
              <Text className="text-[#CB8400] text-lg font-bold pl-16 mb-1">
                Enter The City
              </Text>
              <View className="w-full flex-row items-center">
                <View className="w-2/12">
                  <Ionicons name="home-outline" size={33} color="#F8A100" />
                </View>

                <TouchableOpacity
                  onPress={toggleAddressDropdown}
                  className="flex-row w-9/12 ml-4 flex-grow items-center justify-between border-b-2 border-foncyYellow"
                >
                  <Text className="text-xl font-bold">
                    {selectedMunicipality
                      ? `${selectedMunicipality.name}`
                      : "Select Your City"}
                  </Text>
                  <MaterialIcons
                    name={
                      isAddressOpen
                        ? "keyboard-arrow-up"
                        : "keyboard-arrow-down"
                    }
                    size={30}
                  />
                </TouchableOpacity>
              </View>
              <View className="items-end mt-1 ml-4">
                {isAddressOpen && selectedWilaya && (
                  <AddressDropdown
                    selectedCity={selectedMunicipality} // Pass the object, not just selectedWilaya?.name
                    onSelectMunicipality={(municipality) =>
                      handleSelectedMunicipality(municipality)
                    }
                    wilaya={selectedWilaya}
                  />
                )}
              </View>
            </View>
            {/*  The Date ------------------------------------------------------------------------------------------*/}
            <View className="w-11/12  px-2 mt-6">
              <Text className="text-[#CB8400] text-lg font-bold pl-16 mb-1">
                Enter The Date
              </Text>
              <View className="w-full flex-row items-center">
                <View className="w-2/12">
                  <EvilIcons name="calendar" size={45} color="#F8A100" />
                </View>

                <TouchableOpacity
                  onPress={toggleDateDropdown}
                  className="flex-row w-9/12 ml-4 flex-grow items-center justify-start border-b-2 border-foncyYellow"
                >
                  <Text className="text-xl font-bold">
                    {date ? `${date}` : "Select Date"}
                  </Text>
                </TouchableOpacity>
              </View>
              <View className="items-center justify-center mt-1 ml-4">
                {isDateOpen && <DatePicker onSelectDate={handleSelectedDate} />}
              </View>
            </View>
            {/*  The Time ------------------------------------------------------------------------------------------ */}
            <View className="w-11/12  px-2 mt-6">
              <Text className="text-[#CB8400] text-lg font-bold pl-16 mb-1">
                Enter The Time
              </Text>
              <View className="w-full flex-row items-center">
                <View className="w-2/12">
                  <MaterialIcons
                    name="access-time-filled"
                    size={40}
                    color="#F8A100"
                  />
                </View>
                <View className="flex-row w-9/12 ml-4 flex-grow items-center justify-start border-b-2 border-foncyYellow">
                  <TouchableOpacity onPress={toggleBeginTimeDropdown}>
                    <Text className="text-xl font-bold">
                      {beginTime ? `${beginTime}` : "Time"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View className="items-center justify-center mt-1 ml-4">
                {isBeginTimeOpen && (
                  <TheTime onSelectTime={handleSelectedBeginTime} />
                )}
              </View>
            </View>
            {/* About Service ------------------------------------------------------------------------------------------ */}
            <View className="w-11/12 px-2 mt-6">
              <Text className="text-[#CB8400] text-lg font-bold pl-16 mb-1">
                About Your Service
              </Text>

              <View className="w-full flex-row items-center">
                {/* Icon */}
                <View className="w-2/12">
                  <MaterialCommunityIcons
                    name="text"
                    size={45}
                    color="#F8A100"
                  />
                </View>

                {/* Text Input for Service Description */}
                <TextInput
                  className="w-9/12 ml-4 flex-grow border-b-2 max-h-48 bg-slate-50 border-foncyYellow text-md text-black font-bold"
                  placeholder="Enter your service details"
                  placeholderTextColor="#A0A0A0"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  maxLength={3000}
                />
              </View>
            </View>
            {/* Media ------------------------------------------------------------------------------------------ */}
            <View className="w-11/12 px-2 mt-6">
              <View className="w-full flex-row items-center">
                {/* Icon */}
                <View className="w-2/12">
                  <MaterialIcons
                    name="insert-photo"
                    size={45}
                    color="#F8A100"
                  />
                </View>
                <TouchableOpacity
                  onPress={handleOpenPicker}
                  className="flex-row w-9/12 ml-4 flex-grow items-center justify-between "
                >
                  <Text className="text-lg text-center text-[#CB8400]">
                    {selectedMedia.length > 0
                      ? `${selectedMedia.length}/5`
                      : " Media About Service"}
                  </Text>
                  <AntDesign name={"plus"} size={30} color={"#CB8400"} />
                </TouchableOpacity>
              </View>
              {/* Pass the isOpen flag and onClose callback to MediaUploader */}
              <MediaUploader
                onMediaSelect={handleMediaSelect}
                maxMedia={5}
                isOpen={pickerOpen}
                onClose={handleClosePicker}
              />
            </View>
            {error ? (
              <Text className="text-center text-red-600 text-lg  w-9/12 ">
                {error}
              </Text>
            ) : null}
            <View className=" flex-row px-2 mt-6">
              <TouchableOpacity
                onPress={() => router.back()}
                className="flex justify-center items-center w-1/2 bg-red-600  rounded-full"
              >
                <Text className=" text-center text-xl font-semibold text-white">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit as any}
                className="flex justify-center items-center w-1/2 ml-1 bg-specialGreen h-16 rounded-full"
              >
                <Text className=" text-center text-xl font-semibold text-white">
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateRequestScreen;
