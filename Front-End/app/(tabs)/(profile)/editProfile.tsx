import { useState, useCallback } from "react";
import { FlatList } from "react-native";
import { NavigationProp } from "@react-navigation/native";
import WorkingDays from "../../../Component/ProfileComponents/WorkingDays";
import AdderssSection from "../../../Component/ProfileComponents/AdderssSection";
import GeneralInfo from "../../../Component/ProfileComponents/generalinfo";
import Header from "../../../Component/ProfileComponents/Header";

import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "@/api/appClient";
import refreshAccessToken from "@/api/refreshAccessToken";
type RootStackParamList = {
  Profile: undefined;
};

type ProfileScreenProps = {
  navigation: NavigationProp<RootStackParamList>;
};
interface ApiUserData {
  fullName: string;
  accountType: string;
  bio?: string;
  category?: any[];
  paymentMethod?: any[];
  workingDays?: { name: string; begin: string; end: string }[];
  location?: {
    region: { id: number };
    city: { id: number };
  };
}
interface UserInfoData {
  fullName: string;
  accountType: number | null;
  paymentMethods: number[];
  bio: string;
  subCategories: number[];
}

const EditProfileScreen = ({ navigation }: ProfileScreenProps) => {
  const [initialData, setInitialData] = useState<ApiUserData | null>(null);

  const fetchUser = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      const user: any = JSON.parse(userData as any);

      if (!user) return;

      const { id, role } = user;
      const endpoint =
        role === 1 ? "/users/client/" : role === 2 ? "/users/worker/" : null;

      if (endpoint) {
        const response = await apiClient.get(`${endpoint}${id}`);
        const apiData =
          role === 1
            ? {
                fullName: response.data.client.username,
                accountType: "client",
                location: response.data.client.location,
              }
            : {
                fullName: response.data.worker.username,
                accountType: "worker",
                bio: response.data.worker.bio,
                category: response.data.worker.categories,
                paymentMethod: response.data.worker.payment_methods,
                workingDays: response.data.worker.working_days,
                location: response.data.worker.location,
              };
        setInitialData(apiData);
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

  React.useEffect(() => {
    fetchUser();
  }, []);

  const [userInfo, setUserInfo] = useState<UserInfoData>({
    fullName: "",
    accountType: null,
    paymentMethods: [],
    bio: "",
    subCategories: [],
  });

  const [workingDays, setWorkingDays] = useState<
    { name: string; begin: string; end: string }[]
  >([]);
  type AddressInfo = {
    region: number | null;
    city: number | null;
    street: string | null;
    addressNumber: number | null;
  };

  const [personalInfo, setpersonalInfo] = useState<AddressInfo>({
    region: null,
    city: null,
    street: null,
    addressNumber: null,
  });

  // Improved function to compare userInfo with initialData
  const getChangedUserInfo = (): any => {
    if (!initialData) return {};

    const changes: any = {};

    // Compare fullName - only add if it has changed and is not empty
    if (
      userInfo.fullName &&
      userInfo.fullName.trim() !== "" &&
      userInfo.fullName !== initialData.fullName
    ) {
      changes.fullName = userInfo.fullName;
    }

    // Compare accountType - only add if it has changed
    if (
      userInfo.accountType !== null &&
      ((initialData.accountType === "client" && userInfo.accountType !== 1) ||
        (initialData.accountType === "worker" && userInfo.accountType !== 2))
    ) {
      changes.accountType = userInfo.accountType;
    }

    // Compare paymentMethods - only add if it has changed and is not empty
    const initialPaymentIds = (initialData.paymentMethod || []).map(
      (item: any) => (typeof item === "object" ? item.id : item)
    );

    if (
      userInfo.paymentMethods.length > 0 &&
      JSON.stringify(userInfo.paymentMethods.sort()) !==
        JSON.stringify(initialPaymentIds.sort())
    ) {
      changes.paymentMethods = userInfo.paymentMethods;
    }

    // Compare bio - only add if it has changed and is not empty
    if (
      userInfo.bio &&
      userInfo.bio.trim() !== "" &&
      userInfo.bio !== initialData.bio
    ) {
      changes.bio = userInfo.bio;
    }

    // Compare subCategories - only add if it has changed and is not empty
    const initialCategoryIds = (initialData.category || []).map((cat: any) =>
      typeof cat === "object" ? cat.id : cat
    );

    if (
      userInfo.subCategories.length > 0 &&
      JSON.stringify(userInfo.subCategories.sort()) !==
        JSON.stringify(initialCategoryIds.sort())
    ) {
      changes.subCategories = userInfo.subCategories;
    }

    return changes;
  };

  // Improved function to get changed address info
  const getChangedAddressInfo = (): any => {
    if (!initialData || !initialData.location) return {};

    const changes: any = {};
    const initialLocation = initialData.location;
    const initialWilayaId = initialLocation?.region?.id || null;
    const initialDairaId = initialLocation?.city?.id || null;

    // Only add wilayaId if it has changed and is not null
    if (
      personalInfo.region !== null &&
      personalInfo.region !== initialWilayaId
    ) {
      changes.region = personalInfo.region;
    }

    // Only add dairaId if it has changed and is not null
    if (personalInfo.city !== null && personalInfo.city !== initialDairaId) {
      changes.city = personalInfo.city;
    }

    // Add address name and ID if provided
    if (personalInfo.street) {
      changes.street = personalInfo.street;
    }

    if (personalInfo.addressNumber) {
      changes.addressNumber = personalInfo.addressNumber;
    }

    return changes;
  };

  const handleSave = async () => {
    try {
      if (!initialData) return;

      // Create a single changes object to send to backend
      const changes: any = {};

      // Get changed user info and add to changes object if not empty
      const changedUserInfo = getChangedUserInfo();
      if (Object.keys(changedUserInfo).length > 0) {
        changes.userInfo = changedUserInfo;
      }

      // Add workingDays directly if not empty
      if (workingDays.length > 0) {
        changes.workingDays = workingDays;
      }

      // Get changed address info and add to changes object if not empty
      const changedAddressInfo = getChangedAddressInfo();
      console.log("Changed address info:", changedAddressInfo);
      if (Object.keys(changedAddressInfo).length > 0) {
        changes.addressInfo = changedAddressInfo;
      }

      // Only make API request if there are actual changes
      if (Object.keys(changes).length > 0) {
        // Retrieve user data for the API call
        const userData = await AsyncStorage.getItem("user");
        const user: any = JSON.parse(userData as any);

        if (!user) return;

        const { id, role } = user;
        const endpoint = `/users/${id}`;

        if (endpoint) {
          console.log("Changes to be sent:", personalInfo);
          // Make API call to update profile
          const response = await apiClient.put(endpoint, {
            personalInfo: { address: personalInfo },
          });
          // if (response.status === 200 || response.status === 201) {
          console.log("Successfully updated profile with changes:", changes);
          // Navigate back after successful update
          // router.back();
          // } else {
          //   console.error("Failed to update profile:", response.data);
          // }
        }
      } else {
        console.log("No changes to save");
        router.back();
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        if (await refreshAccessToken()) {
          await handleSave();
        }
      }
      console.log("Failed to update profile:", error);
      // Handle error (show alert, etc.)
    }
  };

  const renderItem = () => (
    <>
      <GeneralInfo onInfoChange={setUserInfo} />
      <WorkingDays onChange={setWorkingDays} />
      <AdderssSection onChange={setpersonalInfo as any} />
      <View className="flex-row justify-between mt-5 mb-7">
        <TouchableOpacity
          className="border-2 border-[#396F65] bg-white mr-0.5 py-1.5 rounded-[25px] flex-1 items-center shadow-lg"
          onPress={() => router.back()}
        >
          <Text
            className="text-[#396F65] text-xl "
            style={{ fontFamily: "Itim_400Regular" }}
          >
            Cancel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="py-1.5 rounded-[25px] flex-1 items-center shadow-lg bg-[#396F65]"
          style={{ elevation: 3 }}
          onPress={handleSave}
        >
          <Text
            className="text-white text-xl"
            style={{ fontFamily: "Itim_400Regular" }}
          >
            Save
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
  return (
    <FlatList
      data={[{ id: 1 }]}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={<Header title="Edit profile" />}
    />
  );
};

export default EditProfileScreen;
