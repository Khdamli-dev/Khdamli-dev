import apiClient from "@/api/appClient";
import { EvilIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
} from "react-native";

interface Category {
  id: string;
  name: string;
  description: string;
  logo: string;
  parent_category: string | null;
}

interface SearchResult {
  id: string;
  name: string;
  description: string;
  logo: string;
  category: string;
}

interface Worker {
  id: number;
  username: string;
  profile_image: string;
  region: string | null;
  city: string | null;
  parentCategory?: {
    name: string;
    id: number;
  };
}

const HomeScreen = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Worker[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState(1); //1 for client 2 for worker
  // Get screen width for responsive sizing
  const screenWidth = Dimensions.get("window").width;
  const categoryWidth = (screenWidth - 48) / 3; // 48 is for padding
  // Fetch user Role
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        const user = JSON.parse(userData || "");
        setRole(user.role);
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    fetchUserRole();
  }, []);
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch categories for initial display
  const fetchCategories = async () => {
    try {
      const response = await apiClient.get(`/work/categories`);
      // Filter categories to include only top-level categories
      const filteredCategories = response.data.categories.filter(
        (category: Category) => category.parent_category === null
      );
      setCategories(filteredCategories);
      setError(null);
    } catch (error: any) {
      console.error("Error fetching categories:", error.response.data);
      setError(" search failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Search functionality
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setIsSearching(false);
      return;
    }

    try {
      setIsLoading(true);
      setIsSearching(true);

      // Make API call to backend with search query
      const response = await apiClient.get(`/work/worker/`, {
        params: { name: searchQuery },
      });

      // Assuming the API returns data that matches the Worker interface
      setSearchResults(response.data.workers);
      setError(null);
    } catch (error) {
      console.error("Error searching:", error);
      setError("search faild");
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel search and return to categories view
  const cancelSearch = () => {
    setIsSearching(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Handle category selection
  const handleCategoryPress = (category: Category) => {
    // Navigate or show details for the selected category
    router.push({
      pathname: "./subCategory",
      params: { category: JSON.stringify(category) },
    });
  };

  // Handle worker selection
  const handleWorkerPress = (worker: Worker) => {
    // Navigate or show details for the selected worker
    router.push({
      pathname: "./workerProfile",
      params: {  userId: worker.id,
        userRole: role, },
    });
  };

  // Function to truncate text with ellipsis
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };
  const handleSendRequest = (worker: Worker) => {
    router.push({
      pathname: "./requeste",
      params: { workerId: worker.id },
    });
  };

  const renderCategoryItem = ({ item }: { item: Category }) => {
    return (
      <TouchableOpacity
        onPress={() => handleCategoryPress(item)}
        className="p-2"
        style={{ width: categoryWidth, height: 140 }}
      >
        <View className="bg-white rounded-md items-center h-full shadow-sm">
          <Image
            source={{ uri: item.logo }}
            className="w-full h-20 rounded-t-md"
            resizeMode="cover"
          />
          <View className="justify-center flex-1 px-2">
            <Text className="text-center font-semibold text-sm">
              {truncateText(item.name, 12)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderWorkerItem = ({ item }: { item: Worker }) => {
    return (
      <TouchableOpacity
        onPress={() => handleWorkerPress(item)}
        className="w-full mb-3"
      >
        <View className="bg-white p-4 rounded-lg shadow-sm">
          <View className="flex-row">
            {/* Worker Image */}
            <Image
              source={{ uri: item.profile_image }}
              className="w-20 h-20 rounded-full"
              resizeMode="cover"
            />

            {/* Worker Details */}
            <View className="flex-1 ml-3 justify-center">
              <Text className="font-bold text-lg">
                {truncateText(item.username, 20)}
              </Text>

              {/* Subcategory name */}
              <View className="bg-[#4C8479]/20 px-2 py-1 rounded-md mt-1 self-start">
                <Text className="text-[#4C8479] text-xs font-medium">
                  {item.parentCategory?.name || "Professional"}
                </Text>
              </View>

              {/* Location */}
              <View className="flex-row items-center mt-2">
                <EvilIcons name="location" size={16} color="#4C8479" />
                <Text className="text-gray-600 text-xs">
                  {item.city}
                  {item.region ? `, ${item.region}` : ""}
                </Text>
              </View>
            </View>
          </View>

          {/* Send Request Button */}
          {role == 1 && (
            <>
              <TouchableOpacity
                className="bg-[#F8A100] py-2 px-4 rounded-md mt-3 flex-row items-center justify-center"
                onPress={() => handleSendRequest(item)}
              >
                <EvilIcons name="envelope" size={24} color="white" />
                <Text className="text-white font-medium ml-1">
                  Send Request
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="relative w-full h-2/6">
        <Image
          source={require("../../../assets/images/homeImg.jpg")}
          className="absolute w-full h-5/6"
        />
        <View
          style={{
            backgroundColor: "rgba(76, 132, 121, 0.9)",
          }}
          className="absolute w-full h-5/6"
        >
          <View className="items-start px-4 py-2">
            <Text className="text-white font-bold mr-2">Location</Text>
            <View className="flex-row items-center justify-start my-2">
              <EvilIcons name="location" size={30} color="#F8A100" />
              <Text className="text-[#F8A100]">Sidi Bel Abbes, Algeria</Text>
            </View>
          </View>

          {/* HEADER TEXT & SEARCH */}
          <View className="px-4 pt-2 items-center">
            <Text className="text-4xl mb-2 text-white font-bold">
              How Can We Help You Today?
            </Text>
            <View className="bg-white rounded-md p-2 flex-row items-center w-10/12">
              <TextInput
                placeholder="Search for workers by name"
                placeholderTextColor="#A0A0A0"
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="flex-1 text-black"
                returnKeyType="search"
                onSubmitEditing={handleSearch}
              />
              <TouchableOpacity
                onPress={handleSearch}
                className="bg-[#F8A100] p-2 rounded-md"
              >
                <EvilIcons name="search" size={24} color="white" />
              </TouchableOpacity>
              {isSearching && (
                <TouchableOpacity onPress={cancelSearch} className="ml-2">
                  <Text className="text-red-500">Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* CONTENT AREA */}
      <View className="px-4 py-4 mb-16 flex-1">
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#F8A100" />
            <Text className="mt-2 text-gray-600">Loading...</Text>
          </View>
        ) : error ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-red-500">{error}</Text>
            <TouchableOpacity
              onPress={isSearching ? handleSearch : fetchCategories}
              className="mt-3 bg-[#F8A100] px-4 py-2 rounded-md"
            >
              <Text className="text-white">Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : isSearching ? (
          // Search Results View (Workers)
          <>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold">Worker Results</Text>
              <Text className="text-sm text-gray-500">
                Found {searchResults.length} results
              </Text>
            </View>

            {searchResults.length > 0 ? (
              <FlatList
                key="searchResults"
                data={searchResults}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderWorkerItem}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View className="flex-1 justify-center items-center">
                <Text className="text-gray-500">No results found</Text>
              </View>
            )}
          </>
        ) : (
          // Categories View
          <>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-xl font-bold">Top Categories</Text>
              <Text className="text-sm text-[#CB8400]">Click On Service</Text>
            </View>
            <View className="flex justify-center items-center">
              <FlatList
                key="categories"
                data={categories}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderCategoryItem}
                numColumns={3}
                contentContainerStyle={{
                  paddingBottom: 20,
                }}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
