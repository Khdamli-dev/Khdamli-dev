import React, { useState, useEffect } from "react";
import { ScrollView, TouchableOpacity, Text, View, Image } from "react-native";
import axios from "axios";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Icon1 from "react-native-vector-icons/MaterialIcons";
import CONFIG from "@/config";

interface Category {
  id: string;
  name: string;
  description: string;
  logo: string;
  parent_category: string | null;
}

interface CategorySelectorProps {
  onSelectCategories: (selectedIds: string[]) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  onSelectCategories,
}) => {
  // State to hold fetched categories
  const [categories, setCategories] = useState<Category[]>([]);
  // State to hold selected category IDs
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  // State to control the visibility of the list
  const [isListOpen, setIsListOpen] = useState(false);

  // Fetch categories from API on component mount
  useEffect(() => {
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
    fetchCategories();
  }, []);

  // Handle category selection toggle
  const handleSelectCategory = (id: string) => {
    let updatedSelectedCategories: string[];
    if (selectedCategories.includes(id)) {
      // Remove category if already selected
      updatedSelectedCategories = selectedCategories.filter(
        (item) => item !== id
      );
    } else {
      // Add category if not selected
      updatedSelectedCategories = [...selectedCategories, id];
    }
    setSelectedCategories(updatedSelectedCategories);
    onSelectCategories(updatedSelectedCategories);
  };

  // Toggle the visibility of the category list
  const toggleList = () => setIsListOpen(!isListOpen);

  // Render the toggle button
  const renderButton = () => (
    <TouchableOpacity
      className="flex-row items-center justify-between rounded-full px-4 w-80 h-16 border-2 border-specialGreen mb-2"
      onPress={toggleList}
    >
      <MaterialCommunityIcons name="briefcase" size={30} color="#4C8479" />
      <Text className="text-specialGreen">
        {selectedCategories.length > 0
          ? `Selected (${selectedCategories.length})`
          : "Select Your Category"}
      </Text>
      <Icon1
        name={isListOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"}
        color="#4C8479"
        size={40}
      />
    </TouchableOpacity>
  );

  // Render each category item using ScrollView mapping instead of FlatList
  const renderItem = (item: Category) => (
    <TouchableOpacity
      key={item.id}
      className={`flex-row items-center justify-around h-16 border-2 border-gray-300 rounded-md ${
        selectedCategories.includes(item.id)
          ? "bg-foncyYellow"
          : "bg-specialGray"
      }`}
      onPress={() => handleSelectCategory(item.id)}
    >
      <Image
        source={{ uri: item.logo }}
        style={{ height: 36, width: 36 }}
        className="rounded-full border-2"
        resizeMode="contain"
      />
      <Text style={{ width: 210 }} className="text-black text-center text-lg">
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 items-center mb-8 " >
      {renderButton()}
      {isListOpen && (
        
        <ScrollView
          style={{ maxHeight: 300 ,}}
          className="mt-1 w-80"
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={true}
        >
          {categories.map((category) => renderItem(category))}
        </ScrollView>
      )}
    </View>
  );
};

export default CategorySelector;
