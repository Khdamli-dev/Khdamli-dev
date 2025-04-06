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
  categorys:string[]
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  onSelectCategories,
  categorys,
}) => {
  // State to hold fetched categories
  const [categories, setCategories] = useState<Category[]>([]);
  // State to hold selected category IDs
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Fetch categories from API on component mount
  useEffect(() => {
    setSelectedCategories(categorys);
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${CONFIG.API_URL}/work/categories/`
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

  // Render each category item using ScrollView mapping instead of FlatList
  const renderItem = (item: Category) => (
    <TouchableOpacity
      key={item.id}
      className={`flex-row items-center mx-2 mb-3 justify-around h-16 border-2 border-gray-300 rounded-md ${
        selectedCategories.includes(item.id)
          ? "bg-foncyYellow"
          : "bg-white"
      }`}
      onPress={() => handleSelectCategory(item.id)}
    >
      <Image
        source={{ uri: item.logo }}
        style={{ height: 36, width: 36 }}
        className="rounded-full border-2 ml-2"
        resizeMode="contain"
      />
      <Text style={{ width: 210 }} className="text-black text-center text-lg ">
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 items-center mb-8 ">
      <ScrollView
        style={{ maxHeight: 300 }}
        className="mt-1 w-80 border-2 pt-2 border-specialGreen rounded-xl"
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={true}
      >
        {categories.map((category) => renderItem(category))}
      </ScrollView>
    </View>
  );
};

export default CategorySelector;
