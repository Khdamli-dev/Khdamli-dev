import CONFIG from "@/config";
import { EvilIcons } from "@expo/vector-icons";
import axios from "axios";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  SafeAreaView,
} from "react-native";
// If you're using NativeWind or another Tailwind RN library, import the tailwind function
// import { useTailwind } from "nativewind"; // for example

interface Category {
  id: string;
  name: string;
  description: string;
  logo: string;
  parent_category: string | null;
}
const HomeScreen = () => {
  // const tailwind = useTailwind(); // If using the NativeWind hook
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  // Example fetch - replace with your actual API call
  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${CONFIG.API_URL}/work/category/get-category`
      );
      // Filter categories to include only top-level categories
      const filteredCategories = response.data.categories.filter(
        (category: Category) => category.parent_category === null
      );
      setCategories(filteredCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleCategoryPress = (category: Category) => {
    // Navigate or show details for the selected category
    console.log("Category pressed:", category.name);
  };

  const renderCategoryItem = ({ item }: { item: Category }) => {
    return (
      <TouchableOpacity
        onPress={() => handleCategoryPress(item)}
        // Example Tailwind classes for styling
        className="w-1/3 p-2"
      >
        <View className="bg-white p-2 rounded-md items-center">
          <Image
            source={{ uri: item.logo }}
            className="w-16 h-16 mb-2"
            resizeMode="contain"
          />
          <Text className="text-center font-semibold">{item.name}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 ">
      <View className="flex-1 bg-gray-100">
        {/* TOP BAR / NAV BAR */}

        <View className="items-start px-4 py-2 bg-orange-500">
          <Text className="text-white font-bold mr-2">Location</Text>
          <View className="flex-row items-center justify-start my-2">
            <EvilIcons name="location" size={30} color="#F8A100" />
            <Text className="text-white">Sidi Bel Abbes, Algeria</Text>
          </View>
        </View>

        {/* HEADER TEXT & SEARCH */}
        <View className="px-4 pt-4 items-center">
          <Text className="text-4xl font-bold my-14">
            How Can We Help You Today ?
          </Text>
          <View className="bg-white rounded-md p-2 flex-row items-center w-10/12">
            <EvilIcons name="location" size={30} color="#F8A100" />
            <TextInput
              placeholder="Search For Service"
              placeholderTextColor="#A0A0A0"
              value={search}
              onChangeText={setSearch}
              className="flex-1 text-black"
            />
          </View>
        </View>

        {/* TOP CATEGORIES TITLE */}
        <View className="px-6 py-4 ">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold">Top Categories</Text>
            <Text className="text-lm text-gray-600">Click On Service</Text>
          </View>

          {/* CATEGORY GRID */}
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderCategoryItem}
            numColumns={3}
            contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 80 }}
          />
        </View>
        {/* FLOATING ADD REQUEST BUTTON */}
        <View className="absolute bottom-4 right-4">
          <TouchableOpacity
            className="bg-orange-500 p-4 rounded-full shadow-lg"
            onPress={() => console.log("Add Request pressed")}
          >
            <Text className="text-white font-bold px-2">+ Add Request</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
