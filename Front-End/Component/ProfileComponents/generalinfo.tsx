import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { User, Wallet, Briefcase, Network } from "lucide-react-native";
import { useFonts, Itim_400Regular } from "@expo-google-fonts/itim";
import { createClient } from "@supabase/supabase-js";
import Dropdown from "./Dropdown";
const supabase = createClient(
  "https://dliadftpwivpugrbopnh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsaWFkZnRwd2l2cHVncmJvcG5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDI1NzUsImV4cCI6MjA1MzQxODU3NX0.krisX5f0AluQrd9SHnn_gncUqP8tgLB1OQKq-wKQY3k"
);

interface Category {
  id: number;
  name: string;
}
interface SubCategory {
  id: number;
  name: string;
  parent_category: number;
}
interface Payment {
  id: number;
  name: string;
}
interface GeneralInfoProps {
  onInfoChange: (info: {
    fullName: string;
    accountType: number | null;
    paymentMethods: number[];
    bio: string;
    subCategories: number[];
  }) => void;
}
const GeneralInfo: React.FC<GeneralInfoProps> = ({ onInfoChange }) => {
  const [loading, setLoading] = useState(false);

  const fetchData = async (
    table: string,
    filters?: {
      column: string;
      value: any[] | any;
      operator?: "eq" | "in" | "is";
    }
  ) => {
    let query = supabase.from(table).select("*");

    if (filters) {
      const { column, value, operator } = filters;

      if (operator === "in") {
        if (!Array.isArray(value)) {
          console.error("Value must be an array when using 'in' operator");
          return [];
        }
        query = query.in(column, value);
      } else if (operator === "is") {
        query = query.is(column, value);
      } else {
        query = query.eq(column, value);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error("Fetch Error:", error);
      return [];
    }

    return data;
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [rolesData, categoriesData, paymentData] = await Promise.all([
          fetchData("role", { column: "id", value: [1, 2], operator: "in" }),
          fetchData("category", {
            column: "parent_category",
            value: null,
            operator: "is",
          }),
          fetchData("payment_method"),
        ]);
        setRoles(
          rolesData.map((r: { id: number; name: string }) => ({
            id: r.id,
            name: r.name,
          }))
        );

        setCategories(categoriesData);
        setPayment(paymentData);
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("there is wrong ");
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);
  const [fontsLoaded] = useFonts({ Itim_400Regular });
  const [fullName, setFullName] = useState("Khalil Djajia");
  const [role, setRole] = useState<{ id: number; name: string } | null>(null);

  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [showRoleList, setShowRoleList] = useState(false);
  const [payment, setPayment] = useState<Payment[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<Payment[]>([]);
  const [showPaymentList, setShowPaymentList] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<
    { id: number; name: string; parent_category: number }[]
  >([]);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState<
    SubCategory[]
  >([]);
  const [showCategoryList, setShowCategoryList] = useState(false);
  const [showSubCategoryList, setShowSubCategoryList] = useState(false);
  const [bio, setBio] = useState("");
  const toggleSelection = <T extends { id: number }>(
    setSelectedItems: React.Dispatch<React.SetStateAction<T[]>>,
    item: T
  ) => {
    setSelectedItems((prevSelected) =>
      prevSelected.some((selected) => selected.id === item.id)
        ? prevSelected.filter((selected) => selected.id !== item.id)
        : [...prevSelected, item]
    );
  };

  const togglePaymentSelection = (selectedItem: Payment) => {
    toggleSelection(setSelectedPayments, selectedItem);
  };

  const toggleCategorySelection = (category: Category) => {
    toggleSelection(setSelectedCategories, category);
    fetchSubCategoriesForSelectedCategories(selectedCategories);
  };
  const fetchSubCategoriesForSelectedCategories = async (
    selectedCats: { id: number }[]
  ) => {
    if (selectedCats.length === 0) {
      setSubCategories([]);
      return;
    }

    const categoryIds = selectedCats.map((cat) => cat.id);

    const { data, error } = await supabase
      .from("category")
      .select("id, name, parent_category")
      .in("parent_category", categoryIds);
    if (!error) setSubCategories(data || []);
  };

  const toggleSubCategorySelection = (subCategory: {
    id: number;
    name: string;
    parent_category: number;
  }) => {
    setSelectedSubCategories((prevSelected) => {
      let updatedSubCategories;
      if (prevSelected.some((sub) => sub.id === subCategory.id)) {
        updatedSubCategories = prevSelected.filter(
          (sub) => sub.id !== subCategory.id
        );
      } else {
        updatedSubCategories = [...prevSelected, subCategory];
      }
      return updatedSubCategories;
    });
  };
  useEffect(() => {
    const userInfo = {
      fullName,
      accountType: role?.id ?? null,
      paymentMethods: selectedPayments.map((p) => p.id),
      bio,
      subCategories:
        role?.name === "Worker" ? selectedSubCategories.map((sc) => sc.id) : [],
    };

    onInfoChange(userInfo);
  }, [
    fullName,
    role?.id,
    role?.name,
    selectedPayments.map((p) => p.id).join(),
    selectedSubCategories.map((sc) => sc.id).join(),
    bio,
    onInfoChange,
  ]);

  return (
    <View
      className="bg-white p-4 rounded-[20px] mb-4 shadow-lg"
      style={{ elevation: 3 }}
    >
      <Text
        className="text-lg font-bold mb-3"
        style={{ fontFamily: "Itim_400Regular" }}
      >
        General Information
      </Text>

      {/* Full Name Input */}
      <View className="mb-3">
        <Text
          className="text-base"
          style={{ fontFamily: "Itim_400Regular", color: "#CB8400" }}
        >
          Full Name
        </Text>
        <View style={styles.inputWrapper}>
          <User size={22} color="#F8A100" style={styles.Name} />
          <TextInput
            style={[styles.input, styles.Name]}
            value={fullName}
            onChangeText={setFullName}
          />
        </View>
      </View>

      {/* Account Type Dropdown */}
      <View className="mb-3">
        <Dropdown
          label="Account Type"
          icon={User}
          selectedItems={role ? [{ id: role.id, name: role.name }] : []}
          allItems={roles.map((r, index) => ({
            id: index,
            name: r.name,
          }))}
          showList={showRoleList}
          setShowList={setShowRoleList}
          toggleSelection={(item: { name: string; id: number }) =>
            setRole({ id: item.id, name: item.name })
          }
        />
      </View>

      {/* Worker-specific Fields */}
      {role?.name === "Worker" && (
        <View className="mb-3">
          <Dropdown
            label="Categories"
            icon={Briefcase}
            selectedItems={
              Array.isArray(selectedCategories) ? selectedCategories : []
            }
            allItems={categories}
            showList={showCategoryList}
            setShowList={setShowCategoryList}
            toggleSelection={toggleCategorySelection}
          />

          <Dropdown
            label="Branches"
            icon={Network}
            selectedItems={
              Array.isArray(selectedSubCategories) ? selectedSubCategories : []
            }
            allItems={subCategories}
            showList={showSubCategoryList}
            setShowList={setShowSubCategoryList}
            toggleSelection={toggleSubCategorySelection as any}
          />
        </View>
      )}

      {/* Payment Method Dropdown */}
      <Dropdown
        label="Payment Methods"
        icon={Wallet}
        selectedItems={selectedPayments}
        allItems={payment}
        showList={showPaymentList}
        setShowList={setShowPaymentList}
        toggleSelection={togglePaymentSelection}
      />

      {/* Bio Section */}
      <View style={styles.aa}>
        <Text style={styles.bb}>Edit Your Bio</Text>
        <View style={styles.cc}>
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="Enter your bio"
            multiline
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 20,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 12,
    fontFamily: "Itim_400Regular",
  },
  inputContainer: { marginBottom: 12 },
  label: {
    fontSize: 16,
    color: "#CB8400",
    fontFamily: "Itim_400Regular",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#F8A100",
    paddingBottom: 4,
  },
  input: {
    flex: 1,
    marginLeft: 8,
  },
  Name: {
    marginBottom: -10,
  },
  aa: {
    borderRadius: 5,
  },
  bb: {
    fontFamily: "Itim_400Regular",
    position: "relative",
    left: 3,
    top: 17,
    width: 100,
    color: "#CB8400",
    backgroundColor: "white",
    fontSize: 16,
    marginBottom: 2,
    zIndex: 2,
  },
  cc: {
    borderWidth: 2,
    borderColor: "#F8A100",
    borderRadius: 5,
    padding: 5,
    paddingTop: 10,
  },
});

export default GeneralInfo;
