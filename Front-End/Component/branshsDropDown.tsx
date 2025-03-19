import React, { useState, useEffect } from "react";
import { ScrollView, TouchableOpacity, Text, View, Image } from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons, Entypo } from "@expo/vector-icons";
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
  selectCategories: string[] | null;
  onSelectBranches: (selectedBranches: string[]) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectCategories,
  onSelectBranches,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [mainCategories, setMainCategories] = useState<Category[]>([]);
  const [isListOpen, setIsListOpen] = useState(false);
  const [branshes, setBranshes] = useState<Category[]>([]);
  const [warning, setWarning] = useState(false);

  // Fetch main categories from API (includes all categories)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${CONFIG.API_URL}/work/category/get-category`
        );
        setMainCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);
 
  // Update categories based on selected categories prop
  useEffect(() => {
    setCategories(
      mainCategories.filter((cat: Category) =>
        selectCategories?.includes(cat.id ?? "")
      )
    );
  }, [selectCategories, mainCategories]);

  // Handle branch selection toggle

  const handleSelectBranch = (bransh: Category) => {
    setSelectedBranches((prev) => {
      let updated: string[];
      if (prev.includes(bransh.id)) {
        // Remove branch if already selected
        updated = prev.filter((item) => item !== bransh.id);
        setBranshes(branshes.filter((item) => item.id !== bransh.id));
      } else {
        // Add branch if not selected
        updated = [...prev, bransh.id];
        setBranshes([...branshes, bransh]);
      }
      onSelectBranches(updated);
      return updated;
    });
  };

  // Toggle the visibility of the list
  const toggleList = () => {
    setIsListOpen(!isListOpen);
  };

  // Validate selection whenever categories or selected subcategories change
  useEffect(() => {
    validateSelection();
  }, [branshes, categories]);

  const validateSelection = () => {
    const selectedParents = new Set(branshes.map((sub) => sub.parent_category));

    // Check if any category is missing a selected subcategory
    let perentCategorys: string[];
    perentCategorys =categories.map((sub) => sub.id);
    const hasMissingCategories = perentCategorys.some(
      (id) => !selectedParents.has(id)
    );

    setWarning(hasMissingCategories);
  };

  // Render each category and its corresponding branches using ScrollView
  const renderCategory = (item: Category) => {
    // Filter branches which are children of the current category
    const branchesForCategory = mainCategories.filter(
      (cat: Category) => cat.parent_category === item.id
    );
    return (
      <View key={item.id}>
        <View className="h-16 flex justify-center">
          <Text className="text-lg font-bold text-center">{item.name}</Text>
        </View>
        <ScrollView
          style={{ maxHeight: 300 }}
          className="mt-1 w-80"
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={true}
        >
          {branchesForCategory.map((branch: Category) => renderBranch(branch))}
        </ScrollView>
      </View>
    );
  };

  // Render each branch item
  const renderBranch = (item: Category) => (
    <TouchableOpacity
      key={item.id}
      className={`flex-row items-center justify-around h-16 border-2 border-gray-300 rounded-md ${
        selectedBranches.includes(item.id) ? "bg-foncyYellow" : "bg-specialGray"
      }`}
      onPress={() => handleSelectBranch(item)}
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

  // Render the toggle button for showing/hiding the list
  const renderButton = () => (
    <TouchableOpacity
      className="flex-row items-center justify-between rounded-full px-4 w-80 h-16 border-2 border-specialGreen mb-2"
      onPress={toggleList}
    >
      <Entypo name="flow-tree" size={30} color="#4C8479" />
      <Text className="text-specialGreen">
        {selectedBranches.length > 0
          ? `Selected Branches: ${selectedBranches.length}`
          : "Select Your Branches"}
      </Text>
      <Icon1
        name={isListOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"}
        color="#4C8479"
        size={40}
      />
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 items-center mb-8 w-full">
      {renderButton()}
      {isListOpen && (
        <ScrollView
          style={{ maxHeight: 300, zIndex: 20 }}
          className="mt-1 w-80 "
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={true}
        >
          {categories.map((category) => renderCategory(category))}
        </ScrollView>
      )}
      {isListOpen && categories.length === 0 && (
        <Text className="text-center text-red-600 text-lg  pt-4  w-8/12">
          You Should Be Select Category First
        </Text>
      )}
      {warning && (
        <Text className="text-center text-green-500 text-lg  pt-4 w-10/12">
          <Text className="text-red-600">warning </Text>
          <Text className="text-black">: </Text>
          Each category must have at least one subcategory selected!
        </Text>
      )}
    </View>
  );
};

export default CategorySelector;
