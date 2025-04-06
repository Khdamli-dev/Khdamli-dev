import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ScrollView,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import CategorySelector from "@/Component/categorysDropDown";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import Branshes from "@/Component/branshsDropDown";
import WorkingDaysTimeSelector, { WorkingDay } from "@/Component/timeOfWork";
import axios from "axios";
import CONFIG from "@/config";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Work_Information() {
  // State to store the selected payment method
  const [paymentMethod, setPaymentMethod] = useState<number[]>([]);

  // State to store selected categories from CategorySelector component
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // State to store selected branches from Branshes component
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);

  // State to store selected working days (as WorkingDay objects)
  const [selectedDays, setSelectedDays] = useState<WorkingDay[]>([]);

  // Get screen width for responsive styling in the header
  const { width: screenWidth } = Dimensions.get("window");

  // Handle selected categories
  const handleSelectedCategories = (selectedIds: string[]) => {
    setSelectedCategories(selectedIds);
  };

  // Handle selected branches
  const handleSelectedBranches = (selectedIds: string[]) => {
    setSelectedBranches(selectedIds);
  };

  // Handle selected working days from the WorkingDaysTimeSelector component
  const handleSelectedDays = (selectedDays: WorkingDay[]) => {
    setSelectedDays(selectedDays);
  };
  // Toggle selection: add the id if it's not selected, or remove it if it is
  const handleTogglePaymentMethod = (id: number) => {
    setPaymentMethod((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  //HandleSubmit
  const [errorSubmit, setErrorSubmit] = useState("")
  const handleSubmit = async () => {
    try {
      const categories = selectedBranches.map(Number);
      const workingHours = selectedDays
        .filter((day) => day.selected)
        .map(({ day, begin, end }) => ({ day, begin, end }));

      if (categories.length === 0) {
        setErrorSubmit("You must select at least one category");
        setTimeout(() => setErrorSubmit(""), 30000);
        return;
      }
      const storedId = await AsyncStorage.getItem("userId");
      const id: number = Number(storedId);
      
      await axios.post(`${CONFIG.API_URL}/work/categories/${id}`, {
        categories
      });
      await axios.put(`${CONFIG.API_URL}/work/working-time/${id}`, {
        workingHours
      });
      await axios.post(`${CONFIG.API_URL}/work/payment/${id}`, {
        payments: paymentMethod,
      });
       router.replace("/(auth)/(signUp)/terms");
    } catch (error) {
      setErrorSubmit("Error Failed to submit data");
      setTimeout(() => setErrorSubmit(""), 30000);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        nestedScrollEnabled={true}
      >
        <View className="flex-1 items-center">
          {/* Header section with gradient background */}
          <LinearGradient
            colors={["#2B524A", "#5EB4A2"]}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{
              borderBottomLeftRadius: screenWidth * 0.1,
              borderBottomRightRadius: screenWidth * 0.1,
            }}
            className="w-full pt-6 pb-2 mb-4"
          >
            <View className="w-full mb-4 items-start">
              {/* Back button to navigate to the previous screen */}
              <TouchableOpacity onPress={() => router.back()}>
                <AntDesign name="left" size={60} color="white" />
              </TouchableOpacity>
            </View>
            {/* Page title */}
            <Text className="my-5 px-12 text-4xl font-medium text-white">
              Information about your work
            </Text>
          </LinearGradient>

          {/* Category selection component */}
          <View className="flex-1">
            <CategorySelector onSelectCategories={handleSelectedCategories} />
          </View>

          {/* Branch selection component based on selected categories */}
          <Branshes
            selectCategories={selectedCategories}
            onSelectBranches={handleSelectedBranches}
          />

          {/* Working days selection component */}
          <View className="items-center mb-2 ">
            <Text className="text-2xl  mb-4">Select Time Of Work </Text>
            <WorkingDaysTimeSelector onSelectWorkingDays={handleSelectedDays} />
          </View>

          {/* Payment method selection section */}
          <View className="flex-col w-full items-center mb-4 py-2">
            <Text className="text-2xl mb-8">Select Payment Method</Text>
            {["Cash", "Baridimob", "CCP"].map((method, index) => (
              <TouchableOpacity
                key={method}
                onPress={() => handleTogglePaymentMethod(index + 1)}
                className={`w-9/12 h-14 my-1 ${
                  paymentMethod?.includes(index + 1)
                    ? "bg-foncyYellow"
                    : "bg-specialGray"
                } items-center justify-center rounded-3xl shadow-xl shadow-black`}
              >
                <Text className="font-bold text-xl">{method}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Submit button */}
          <TouchableOpacity
            onPress={handleSubmit as any}
            className="bg-specialGreen p-6 rounded-full w-11/12 max-w-sm shadow-2xl shadow-black mb-6"
          >
            <Text className="text-white text-center font-bold text-2xl">
              Submit
            </Text>
          </TouchableOpacity>
          {errorSubmit ? (
            <Text className="text-center text-red-600 text-lg  w-9/12 ">
              {errorSubmit}
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
