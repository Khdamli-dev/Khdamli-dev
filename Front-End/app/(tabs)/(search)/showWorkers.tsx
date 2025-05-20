import { AntDesign, EvilIcons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import React, { useState, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from "react-native";
import apiClient from "@/api/appClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Worker {
  id: number;
  username: string;
  profile_image: string;
  region: string | null;
  city: string | null;
}

interface SubCategory {
  id: string;
  name: string;
  description: string;
  logo: string;
  parent_category: string;
}


const ServiceProvidersScreen = () => {
  const screenWidth = Dimensions.get("window").width;

  const { subcategory }: { subcategory: string } = useLocalSearchParams();
  const branch = JSON.parse(subcategory);
  const[role, setRole] = useState(1);// 2 for worker, 1 for client
  const [subCategory, setSubCategory] = useState<SubCategory | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [filteredWorkers, setFilteredWorkers] = useState<Worker[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  //Fetch User Role 
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

    fetchWorkers();
  }, [branch.id]);

  // Fetch workers based on subcategory ID
  const fetchWorkers = async () => {
    if (!branch.id) {
      setError("No subcategory ID provided");
      return;
    }
    try {
      setIsLoading(true);
      const userData = await AsyncStorage.getItem("user");
      const user = JSON.parse(userData || "");
  
      // Then fetch workers for this subcategory
      const workersResponse = await apiClient.get(`/work/worker/${user.id}/`, {
        params: { category: branch.id, page: 0 },
      });

      setWorkers(workersResponse.data.workers);
      setFilteredWorkers(workersResponse.data.workers);
      setError(null);
    } catch (error) {
      console.error("Error fetching workers:", error);
      setError("Failed to load workers. Please try again.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Handle search functionality
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredWorkers(workers);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    const filtered = workers.filter(
      (worker) =>
        worker.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        worker.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        worker.region?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredWorkers(filtered);
  };

  // Cancel search and return to all workers
  const cancelSearch = () => {
    setIsSearching(false);
    setSearchQuery("");
    setFilteredWorkers(workers);
  };

  // Navigate directly to worker profile
  const handleWorkerPress = (worker: Worker) => {
    router.push({
      pathname: "./workerProfile",
      params: { workerId: worker.id },
    });
  };

  // Handle send request to worker
  const handleSendRequest = (worker: Worker) => {
    router.push({
      pathname: "./requeste",
      params: { type: "2" },
    });
  };

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchWorkers();
  };

  // Function to truncate text with ellipsis
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
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
                  {subCategory?.name || "Professional"}
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
          {role === 1 && (
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

  // Go back to subcategories screen
  const handleGoBack = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* HEADER */}
      <LinearGradient
        colors={["#2B524A", "#5EB4A2"]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{
          borderBottomLeftRadius: screenWidth * 0.1,
          borderBottomRightRadius: screenWidth * 0.1,
        }}
        className=" pt-10 pb-6 "
      >
        <View className="flex-row items-center px-4">
          <TouchableOpacity onPress={handleGoBack} className="mr-3">
            <AntDesign name="left" size={50} color="#F8A100" />
          </TouchableOpacity>

          <View className="flex-1">
            <Text className="text-white text-xl font-bold">
              {subCategory?.name || "Service Providers"}
            </Text>
            {subCategory && (
              <Text className="text-white text-xs opacity-80">
                {subCategory.description}
              </Text>
            )}
          </View>
        </View>

        {/* SEARCH BAR */}
        <View className="px-4 mt-4">
          <View className="bg-white rounded-md p-2 flex-row items-center">
            <TextInput
              placeholder="Search workers by name or location"
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
      </LinearGradient>

      {/* CONTENT AREA */}
      <View className="px-4 py-4 flex-1">
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#F8A100" />
            <Text className="mt-2 text-gray-600">Loading...</Text>
          </View>
        ) : error ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-red-500">{error}</Text>
            <TouchableOpacity
              onPress={fetchWorkers}
              className="mt-3 bg-[#F8A100] px-4 py-2 rounded-md"
            >
              <Text className="text-white">Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold">Workers List</Text>
              <Text className="text-sm text-[#CB8400]">
                {filteredWorkers.length} worker
              </Text>
            </View>

            {filteredWorkers.length > 0 ? (
              <FlatList
                data={filteredWorkers}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderWorkerItem}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={["#F8A100"]}
                    tintColor="#F8A100"
                  />
                }
              />
            ) : (
              <View className="flex-1 justify-center items-center">
                <Text className="text-gray-500">No workers available</Text>
              </View>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ServiceProvidersScreen;
