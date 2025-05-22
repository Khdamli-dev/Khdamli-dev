import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { User, Wallet, Briefcase, Network } from "lucide-react-native";
import { useFonts, Itim_400Regular } from "@expo-google-fonts/itim";
import Dropdown from "./Dropdown";
import apiClient from "@/api/appClient";
import refreshAccessToken from "@/api/refreshAccessToken";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Category {
  id: string | number;
  name: string;
  description: string;
  logo: string;
  parent_category: string | null;
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
  const [prevpay, setPrevpay] = useState<string[]>([]);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        const user: any = JSON.parse(userData as any);

        if (!user) {
          return;
        }
        const { id, role } = user;
        const endpoint =
          role === 1 ? `/users/client/` : role === 2 ? `/users/worker/` : null;
        if (endpoint) {
          const response = await apiClient.get(`${endpoint}${id}`);
          const newUserData =
            role === 1
              ? {
                  fullName: response.data.client.username,
                  accountType: "client",
                }
              : role === 2
                ? {
                    fullName: response.data.worker.username,
                    accountType: "worker",
                    bio: response.data.worker.bio,
                    category: response.data.worker.categories.filter(
                      (cat: Category) => cat.parent_category !== null
                    ),
                    paymentMethod: response.data.worker.payment_methods,
                  }
                : null;
          const initialRoleValue =
            newUserData?.accountType === "client"
              ? { id: 1, name: "Client" }
              : newUserData?.accountType === "worker"
                ? { id: 2, name: "Worker" }
                : null;

          setPreviousName(newUserData?.fullName || null);
          setRole(initialRoleValue);
          setInitialRole(initialRoleValue);
          setprevcat(newUserData?.category);
          setPrevpay(newUserData?.paymentMethod || []);

          setBio(newUserData?.bio);
        }
      } catch (error: any) {
        if (error.response?.status === 401) {
          if (await refreshAccessToken()) {
            await fetchUser();
          }
        }
        console.error("Failed to fetch user data", error);
      }
    };

    fetchUser();
  }, []);

  // Fetch Categories
  const [filteredCategories, setfilteredCategories] = useState<Category[]>([]);

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get(`/work/categories`);
      // Filter categories to include only top-level categories
      setfilteredCategories(response.data.categories);
    } catch (error: any) {
      if (error.response?.status === 401) {
        if (await refreshAccessToken()) {
          await fetchCategories();
        } else {
          // need to login
          router.push("/(auth)");
        }
      }
      console.log(error);
    }
  };
  //Fetch Payment Methods
  const fetchPaymentMethods = async () => {
    try {
      const response = await apiClient.get(`/work/payment`);
      if (response.status === 200) setPayment(response.data.paymentMethods);
    } catch (error: any) {
      if (error.response?.status === 401) {
        if (await refreshAccessToken()) {
          await fetchPaymentMethods();
        } else {
          // need to login
          router.push("/(auth)");
        }
      }
      console.log(error);
    }
  };
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        fetchCategories();
        fetchPaymentMethods();
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("there is wrong ");
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);
  // Add a separate useEffect to handle filtering categories
  useEffect(() => {
    if (filteredCategories.length > 0) {
      const parentCategories = filteredCategories.filter(
        (category: Category) => category?.parent_category === null
      );
      setCategories(parentCategories);
    }
  }, [filteredCategories]);

  const [fontsLoaded] = useFonts({ Itim_400Regular });
  const [fullName, setFullName] = useState<string | null>(null);
  const [previousName, setPreviousName] = useState<string | null>(null);
  const [role, setRole] = useState<{ id: number; name: string } | null>(null);
  const [prevcat, setprevcat] = useState<Category[]>([]);

  const [roles] = useState<{ id: number; name: string }[]>([
    { id: 1, name: "Client" },
    { id: 2, name: "Worker" },
  ]);
  const [showRoleList, setShowRoleList] = useState(false);
  const [initialRole, setInitialRole] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [payment, setPayment] = useState<Payment[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<Payment[]>([]);
  const [showPaymentList, setShowPaymentList] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState<
    SubCategory[]
  >([]);
  const [showCategoryList, setShowCategoryList] = useState(false);
  const [showSubCategoryList, setShowSubCategoryList] = useState(false);
  const [bio, setBio] = useState<string>("");
  const toggleCategorySelection = (item: { id: number; name: string }) => {
    const category = categories.find((c) => String(c.id) === String(item.id));
    if (category) {
      setSelectedCategories((prevSelected) => {
        const newSelected = prevSelected.some(
          (selected) => selected.id === category.id
        )
          ? prevSelected.filter((selected) => selected.id !== category.id)
          : [...prevSelected, category];

        fetchSubCategoriesForSelectedCategories(newSelected);
        return newSelected;
      });
    }
  };

  const toggleSelection = <T extends { id: number }>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    item: T
  ) => {
    setter((prev) =>
      prev.some((selected) => selected.id === item.id)
        ? prev.filter((selected) => selected.id !== item.id)
        : [...prev, item]
    );
  };

  const togglePaymentSelection = (selectedItem: Payment) => {
    toggleSelection(setSelectedPayments, selectedItem);
  };
  const fetchSubCategoriesForSelectedCategories = (
    selectedCats: Category[]
  ) => {
    if (selectedCats.length === 0) {
      setSubCategories([]);
      return;
    }

    const categoryIds = selectedCats.map((cat) => cat.id.toString());

    const newSubCategories = filteredCategories.filter((cat: Category) =>
      categoryIds.includes(String(cat.parent_category))
    );

    setSubCategories(newSubCategories);
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
      fullName: fullName || "",
      accountType: role?.id || null,
      paymentMethods: selectedPayments.map((p) => p.id),
      bio: bio || "",
      subCategories: selectedSubCategories.map((sc) => sc.id),
    };

    onInfoChange(userInfo);
  }, [
    fullName,
    role?.id,
    selectedPayments,
    selectedSubCategories,
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
            value={fullName || ""}
            onChangeText={(e) => setFullName(e)}
            placeholder="Enter your full name"
          />
        </View>
      </View>

      {/* Account Type Dropdown */}
      <View className="mb-3">
        <Dropdown
          label="Account Type"
          prev={role?.name || ""}
          icon={User}
          selectedItems={role ? [{ id: role.id, name: role.name }] : []}
          allItems={roles}
          showList={showRoleList}
          setShowList={setShowRoleList}
          toggleSelection={(item: { name: string; id: number }) =>
            setRole({ id: item.id, name: item.name })
          }
        />
      </View>

      {/* Worker-specific Fields */}
      {role?.name === "Worker" && (
        <>
          <View className="mb-3">
            <Dropdown
              label="Categories"
              prev={prevcat?.map((cat) => cat.name).join(", ") || ""}
              icon={Briefcase}
              selectedItems={
                Array.isArray(selectedCategories)
                  ? selectedCategories.map((cat) => ({
                      id:
                        typeof cat.id === "string" ? parseInt(cat.id) : cat.id,
                      name: cat.name,
                    }))
                  : []
              }
              allItems={categories.map((cat) => ({
                id: typeof cat.id === "string" ? parseInt(cat.id) : cat.id,
                name: cat.name,
              }))}
              showList={showCategoryList}
              setShowList={setShowCategoryList}
              toggleSelection={toggleCategorySelection}
            />

            <Dropdown
              label="Branches"
              prev={prevcat?.map((cat) => cat.name).join(", ") || ""}
              icon={Network}
              selectedItems={
                Array.isArray(selectedSubCategories)
                  ? selectedSubCategories
                  : []
              }
              allItems={subCategories.map((cat) => ({
                id: typeof cat.id === "string" ? parseInt(cat.id) : cat.id,
                name: cat.name,
              }))}
              showList={showSubCategoryList}
              setShowList={setShowSubCategoryList}
              toggleSelection={toggleSubCategorySelection as any}
            />
          </View>
          {/* Payment Method Dropdown */}
          <Dropdown
            label="Payment Methods"
            prev={
              prevpay.length > 0
                ? prevpay.join(", ")
                : "Payment Method Not Selected"
            }
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
                placeholder="Write your bio here..."
                multiline
              />
            </View>
          </View>
        </>
      )}
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
