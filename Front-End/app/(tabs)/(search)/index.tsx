import CONFIG from "@/config";
import { EvilIcons } from "@expo/vector-icons";
import axios from "axios";
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
  workerId: number;
  workerName: string;
  profileImage: string;
  region: string | null;
  city: string | null;
  parentCategory?: {
    name: string;
    id: number;
  };
}

// Mock data for testing
const MOCK_CATEGORIES: Category[] = [
  {
    id: "1",
    name: "Plumbing",
    description: "All plumbing services",
    logo: "https://randomuser.me/api/portraits/women/20.jpg",
    parent_category: null,
  },
  {
    id: "2",
    name: "Electrical",
    description: "Electrical services and repairs",
    logo: "https://via.placeholder.com/150",
    parent_category: null,
  },
  {
    id: "3",
    name: "Carpentry",
    description: "Wood work and repairs",
    logo: "https://via.placeholder.com/150",
    parent_category: null,
  },
  {
    id: "4",
    name: "Painting",
    description: "Interior and exterior painting",
    logo: "https://via.placeholder.com/150",
    parent_category: null,
  },
  {
    id: "5",
    name: "Cleaning",
    description: "Home and office cleaning",
    logo: "https://via.placeholder.com/150",
    parent_category: null,
  },
  {
    id: "6",
    name: "Gardening with Very Long Service Name",
    description: "Garden maintenance",
    logo: "https://via.placeholder.com/150",
    parent_category: null,
  },
];

// Modified mock workers data to match the new Worker interface
const MOCK_WORKERS: Worker[] = [
  {
    workerId: 1,
    workerName: "Ahmed Hassan",
    profileImage: "https://randomuser.me/api/portraits/men/20.jpg",
    region: "Algeria",
    city: "Sidi Bel Abbes",
    parentCategory: { name: "Plumbing", id: 1 },
  },
  {
    workerId: 2,
    workerName: "Mohammed Ali",
    profileImage: "https://randomuser.me/api/portraits/men/22.jpg",
    region: "Algeria",
    city: "Oran",
    parentCategory: { name: "Electrical", id: 2 },
  },
  {
    workerId: 3,
    workerName: "Said Mezouar",
    profileImage: "https://randomuser.me/api/portraits/men/23.jpg",
    region: "Algeria",
    city: "Algiers",
    parentCategory: { name: "Carpentry", id: 3 },
  },
  {
    workerId: 4,
    workerName: "Karim Benali",
    profileImage: "https://randomuser.me/api/portraits/men/24.jpg",
    region: "Algeria",
    city: "Constantine",
    parentCategory: { name: "Painting", id: 4 },
  },
  {
    workerId: 5,
    workerName: "Omar Taleb with a very long name that should be truncated",
    profileImage: "https://randomuser.me/api/portraits/men/25.jpg",
    region: "Algeria",
    city: "Annaba",
    parentCategory: { name: "Cleaning", id: 5 },
  },
];

const MOCK_SEARCH_RESULTS: SearchResult[] = [
  {
    id: "1",
    name: "Pipe Repair",
    description: "Fix leaking pipes and water systems",
    logo: "https://randomuser.me/api/portraits/women/20.jpg",
    category: "Plumbing",
  },
  {
    id: "2",
    name: "Electrical Wiring",
    description: "Install or repair electrical wiring",
    logo: "https://randomuser.me/api/portraits/women/20.jpg",
    category: "Electrical",
  },
  {
    id: "3",
    name: "Furniture Assembly",
    description: "Assemble new furniture",
    logo: "https://via.placeholder.com/150",
    category: "Carpentry",
  },
];

const HomeScreen = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Worker[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get screen width for responsive sizing
  const screenWidth = Dimensions.get("window").width;
  const categoryWidth = (screenWidth - 48) / 3; // 48 is for padding

  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch categories for initial display
  const fetchCategories = async () => {
    try {
      setIsLoading(true);

      // For testing: use mock data instead of API call
      setTimeout(() => {
        setCategories(MOCK_CATEGORIES);
        setError(null);
        setIsLoading(false);
      }, 1000);

      // Uncomment this for real API usage
      /*
      const response = await axios.get(`${CONFIG.API_URL}/work/categories/`);
      // Filter categories to include only top-level categories
      const filteredCategories = response.data.categories.filter(
        (category: Category) => category.parent_category === null
      );
      setCategories(filteredCategories);
      setError(null);
      */
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("فشل في تحميل الفئات. يرجى المحاولة مرة أخرى.");
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

      // For testing: use mock data instead of API call
      setTimeout(() => {
        // Filter mock workers by name containing the search query
        const filteredWorkers = MOCK_WORKERS.filter((worker) =>
          worker.workerName.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(filteredWorkers);
        setError(null);
        setIsLoading(false);
      }, 1000);

      // Uncomment this for real API usage
      /*
      // Make API call to backend with search query
      const response = await axios.get(`${CONFIG.API_URL}/work/search-workers/`, {
        params: { query: searchQuery }
      });
      
      // Assuming the API returns data that matches the Worker interface
      setSearchResults(response.data.results);
      setError(null);
      */
    } catch (error) {
      console.error("Error searching:", error);
      setError("فشل في البحث. يرجى المحاولة مرة أخرى.");
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
    console.log("Category pressed:", category.name);
    router.push({
      pathname: "./subCategory",
      params: { parentCategoryId: category.id },
    }); 
  };

  // Handle worker selection
  const handleWorkerPress = (worker: Worker) => {
    // Navigate or show details for the selected worker
    console.log("Worker pressed:", worker.workerName);
    // Example: router.push(`/workers/${worker.workerId}`);
  };

  // Function to truncate text with ellipsis
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
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
        <View className="bg-white p-4 rounded-lg shadow-sm flex-row">
          <Image
            source={{ uri: item.profileImage }}
            className="w-16 h-16 rounded-full"
            resizeMode="cover"
          />
          <View className="flex-1 ml-3 justify-center">
            <Text className="font-bold text-lg">
              {truncateText(item.workerName, 20)}
            </Text>

            <View className="flex-row items-center mt-1">
              <View className="bg-green-100 px-2 py-1 rounded-md">
                <Text className="text-green-800 text-xs">
                  {item.parentCategory?.name || "Professional"}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center mt-2">
              <EvilIcons name="location" size={16} color="#4C8479" />
              <Text className="text-gray-600 text-xs">
                {item.city}
                {item.region ? `, ${item.region}` : ""}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            className="bg-[#F8A100] h-8 w-8 rounded-full items-center justify-center self-center"
            onPress={() => console.log(`Contact worker ${item.workerId}`)}
          >
            <EvilIcons name="envelope" size={22} color="white" />
          </TouchableOpacity>
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
                keyExtractor={(item) => item.workerId.toString()}
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
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
