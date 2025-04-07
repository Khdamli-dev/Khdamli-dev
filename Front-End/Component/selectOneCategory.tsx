import React, { useState, useEffect } from "react";
import { ScrollView, TouchableOpacity, Text, View, Image } from "react-native";
import axios from "axios";
import CONFIG from "@/config";

interface Category {
  id: string;
  name: string;
  description: string;
  logo: string;
  parent_category: string | null;
}

interface SelectedCategory {
  id: string;
  name: string;
}

interface CategorySelectorProps {
  onSelectCategory: (selected: SelectedCategory | null) => void; // Returns both ID & Name
  selectedCategory: SelectedCategory | null; // Pre-selected category
}

const OneCategorySelector: React.FC<CategorySelectorProps> = ({
  onSelectCategory,
  selectedCategory,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<SelectedCategory | null>(
    selectedCategory
  );

  useEffect(() => {
    setSelected(selectedCategory); // Sync with parent state
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${CONFIG.API_URL}/work/categories/`
        );
        const filteredCategories = response?.data?.categories.filter(
          (category: Category) => category.parent_category === null
        );
        setCategories(filteredCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleSelectCategory = (category: Category) => {
    const newSelected =
      selected?.id === category.id
        ? null
        : { id: category.id, name: category.name }; // Toggle selection
    setSelected(newSelected);
    onSelectCategory(newSelected); // Pass to parent
  };

  const renderItem = (item: Category) => (
    <TouchableOpacity
      key={item.id}
      className={`flex-row items-center  mx-2 mb-3 justify-around h-16 border-2 border-gray-300 rounded-md ${
        selected?.id === item.id ? "bg-foncyYellow" : "bg-white"
      }`}
      onPress={() => handleSelectCategory(item)}
    >
      <Image
        source={{ uri: item.logo }}
        style={{ height: 36, width: 36 }}
        className="rounded-full border-2 ml-2"
        resizeMode="contain"
      />
      <View style={{ width:150 }}>
        <Text className="text-black text-center text-lg ">{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 items-end w-full mb-8">
      <ScrollView
        style={{ maxHeight: 300 }}
        className="mt-1 w-10/12 border-2 pt-2 border-specialGreen rounded-xl"
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={true}
      >
        {categories.map((category) => renderItem(category))}
      </ScrollView>
    </View>
  );
};

export default OneCategorySelector;
