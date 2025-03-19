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

interface CategorySelectorProps {
  selectCategories: string[] | null;
  onSelectBranches: (selectedBranches: string[]) => void;
  branshss:string[]
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectCategories,
  onSelectBranches,
  branshss,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [mainCategories, setMainCategories] = useState<Category[]>([]);

  const [branshes, setBranshes] = useState<Category[]>([]);
  const [warning, setWarning] = useState(false);

  // Fetch main categories from API (includes all categories)
  useEffect(() => {
    setSelectedBranches(branshss);
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${CONFIG.API_URL}/work/category/get-category`
        );
        setMainCategories(response.data.categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Update categories based on selected categories prop
  useEffect(() => {
    if (mainCategories.length > 0 && selectCategories) {
      setCategories(
        mainCategories.filter((cat: Category) =>
          selectCategories.includes(cat.id ?? "")
        )
      );
      setBranshes(
        mainCategories.filter((cat: Category) =>
          branshss.includes(cat.id ?? "")
        )
      );
    }
  }, [selectCategories, mainCategories]);

  // Remove branches that don't have a parent in selected categories
  useEffect(() => {
    cleanUnparentedBranches();
  }, [selectCategories]);

  const cleanUnparentedBranches = () => {
    if (!selectCategories) return;
    const validBranches = branshes.filter((branch) =>
      selectCategories.includes(branch.parent_category ?? "")
    );

    if (validBranches.length !== branshes.length) {
      setBranshes(validBranches);
      setSelectedBranches(validBranches.map((b) => b.id));
      onSelectBranches(validBranches.map((b) => b.id));
    }
  };

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

  // Validate selection whenever categories or selected subcategories change
  useEffect(() => {
    validateSelection();
  }, [branshss, categories]);

  const validateSelection = () => {
    const selectedParents = new Set(branshes.map((sub) => sub.parent_category));

    // Check if any category is missing a selected subcategory
    let perentCategorys: string[];
    perentCategorys = categories.map((sub) => sub.id);
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
          className="mt-1 w-full"
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
      className={`flex-row items-center mb-2 w-full  justify-around h-16 border-2 border-gray-300 rounded-md ${
        selectedBranches.includes(item.id) ? "bg-foncyYellow" : "bg-white"
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

  return (
    <View className="flex-1 items-center mb-8 w-full">
      <ScrollView
        style={{ maxHeight: 300 }}
        className="mt-1 w-80 border-2 px-4 border-specialGreen rounded-xl"
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={true}
      >
        
        {categories.map((category) => renderCategory(category))}
      </ScrollView>

      {warning && (
        <Text className="text-center text-green-500 text-lg px-4 pt-8">
          <Text className="text-red-600">warning </Text>
          <Text className="text-black">: </Text>
          Each category must have at least one subcategory selected!
        </Text>
      )}
    </View>
  );
};

export default CategorySelector;
