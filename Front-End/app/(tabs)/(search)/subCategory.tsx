import CONFIG from "@/config";
import { AntDesign, EvilIcons } from "@expo/vector-icons";
import axios from "axios";
import { useLocalSearchParams, router } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  SafeAreaView,
  Dimensions,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import apiClient from "@/api/appClient";

interface SubCategory {
  id: string;
  name: string;
  description: string;
  logo: string;
  parent_category: string;
}

interface ParentCategory {
  id: string;
  name: string;
  description: string;
  logo: string;
}

// Mock data for testing
const MOCK_SUBCATEGORIES: SubCategory[] = [
  {
    id: "101",
    name: "Pipe Repair",
    description: "Fix leaking pipes and water systems",
    logo: "https://randomuser.me/api/portraits/men/41.jpg",
    parent_category: "1",
  },
  {
    id: "102",
    name: "Drainage",
    description: "Unblock drains and repair systems",
    logo: "https://randomuser.me/api/portraits/men/42.jpg",
    parent_category: "1",
  },
  {
    id: "103",
    name: "Water Heater",
    description: "Install and repair water heaters",
    logo: "https://randomuser.me/api/portraits/men/43.jpg",
    parent_category: "1",
  },
  {
    id: "104",
    name: "Bathroom",
    description: "Complete bathroom installations",
    logo: "https://randomuser.me/api/portraits/men/44.jpg",
    parent_category: "1",
  },
  {
    id: "201",
    name: "Wiring",
    description: "Home electrical wiring services",
    logo: "https://randomuser.me/api/portraits/men/45.jpg",
    parent_category: "2",
  },
  {
    id: "202",
    name: "Lighting",
    description: "Install and repair lighting fixtures",
    logo: "https://randomuser.me/api/portraits/men/46.jpg",
    parent_category: "2",
  },
  {
    id: "301",
    name: "Furniture",
    description: "Custom furniture making and repair",
    logo: "https://randomuser.me/api/portraits/men/47.jpg",
    parent_category: "3",
  },
  {
    id: "302",
    name: "Cabinets",
    description: "Kitchen and bathroom cabinets",
    logo: "https://randomuser.me/api/portraits/men/48.jpg",
    parent_category: "3",
  },
];

const MOCK_PARENT_CATEGORIES: Record<string, ParentCategory> = {
  "1": {
    id: "1",
    name: "Plumbing",
    description: "All plumbing services",
    logo: "https://randomuser.me/api/portraits/women/20.jpg",
  },
  "2": {
    id: "2",
    name: "Electrical",
    description: "Electrical services and repairs",
    logo: "https://via.placeholder.com/150",
  },
  "3": {
    id: "3",
    name: "Carpentry",
    description: "Wood work and repairs",
    logo: "https://via.placeholder.com/150",
  },
};

const SubCategoriesScreen = () => {
  const { category } : {category : string} = useLocalSearchParams();
  const parentcategory = JSON.parse(category);
  console.log(parentcategory)

  const [parentCategory, setParentCategory] = useState<ParentCategory | null>(null);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSubCategories, setFilteredSubCategories] = useState<SubCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get screen width for responsive sizing
  const screenWidth = Dimensions.get('window').width;
  const subCategoryWidth = (screenWidth - 48) / 2; // 48 is for padding

  useEffect(() => {
    fetchSubCategories();
  }, [parentcategory.id]);

  // Fetch subcategories based on parent category ID
  const fetchSubCategories = async () => {
    if (!parentcategory.id) {
      setError("No category ID provided");
      return;
    }

    try {
      setIsLoading(true);

      // For testing: use mock data instead of API call
      // setTimeout(() => {
      //   // Find parent category
      //   const parent = MOCK_PARENT_CATEGORIES[parentcategory.id];
      //   if (parent) {
      //     setParentCategory(parent);
      //   }

      //   // Filter subcategories by parent_category
      //   const filteredCategories = MOCK_SUBCATEGORIES.filter(
      //     (subCat) => subCat.parent_category === parentcategory.id
      //   );
        
      //   setSubCategories(filteredCategories);
      //   setFilteredSubCategories(filteredCategories);
      //   setError(null);
      //   setIsLoading(false);
      // }, 1000);

      // Uncomment this for real API usage
      
    
      // Then fetch subcategories
      const subCatResponse = await apiClient.get(`/work/categories/`, {
        params: { parent_category: parentcategory.id }
      });
      
      setSubCategories(subCatResponse.data.categories.filter(
        (cat: SubCategory) => cat.parent_category === parentcategory.id));
      setFilteredSubCategories(subCatResponse.data.categories.filter(
        (cat: SubCategory) => cat.parent_category === parentcategory.id));
      setError(null);
     
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      setError("فشل في تحميل الفئات الفرعية. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };


  // Navigate to service providers screen when subcategory is selected
  const handleSubCategoryPress = (subCategory: SubCategory) => {
    console.log("SubCategory pressed:", subCategory.name);
    // Navigate to service providers screen with the subcategory ID
router.push({
  pathname: "./showWorkers",
  params: { subcategory: JSON.stringify(subCategory) },
});  };

  // Function to truncate text with ellipsis
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const renderSubCategoryItem = ({ item }: { item: SubCategory }) => {
    return (
      <TouchableOpacity
        onPress={() => handleSubCategoryPress(item)}
        className="p-2"
        style={{ width: subCategoryWidth, height: 180 }}
      >
        <View className="bg-white rounded-md items-center h-full shadow-sm">
          <Image
            source={{ uri: item.logo }}
            className="w-full h-28 rounded-t-md"
            resizeMode="cover"
          />
          <View className="justify-center flex-1 px-3 py-2 w-full">
            <Text className="font-bold text-center">{truncateText(item.name, 20)}</Text>
            <Text className="text-gray-600 text-xs text-center mt-1">
              {truncateText(item.description, 40)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Go back to home screen
  const handleGoBack = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar barStyle="light-content" />

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
        <View className="flex-row items-center px-4 ">
          <TouchableOpacity onPress={handleGoBack} className="mr-3">
            <AntDesign name="left" size={50} color="#F8A100" />
          </TouchableOpacity>

          <View className="flex-1">
            <Text className="text-white text-2xl font-bold">
              {parentCategory?.name || "Category Details"}
            </Text>
            <Text className="text-white text-ms mt-1 font-bold">
              {parentCategory?.description || "Category Details"}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* SEARCH BAR */}

      {/* CONTENT AREA */}
      <View className="flex-1 justify-center items-center px-4 pt-4">
        <>
          <View className="flex-row w-full justify-between items-center mb-4">
            <Text className="text-xl font-bold">
              {parentCategory?.name || "Services"} Categories
            </Text>
            <Text className="text-sm text-[#CB8400]">
              {filteredSubCategories.length} Services
            </Text>
          </View>

          {filteredSubCategories.length > 0 ? (
            <FlatList
              data={filteredSubCategories}
              keyExtractor={(item) => item.id}
              renderItem={renderSubCategoryItem}
              numColumns={2}
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View className="flex-1 justify-center items-center">
              <Text className="text-gray-500">No subcategories found</Text>
            </View>
          )}
        </>
      </View>
    </SafeAreaView>
  );
};

export default SubCategoriesScreen;
