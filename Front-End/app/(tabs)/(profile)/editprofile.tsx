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
type RootStackParamList = {
  Profile: undefined;
};

type ProfileScreenProps = {
  navigation: NavigationProp<RootStackParamList>;
};

const EditProfileScreen = ({ navigation }: ProfileScreenProps) => {
  const [userInfo, setUserInfo] = useState({});
  const [workingDays, setWorkingDays] = useState<
    { name: string; from: string; to: string }[]
  >([]);
  type AddressInfo = {
    wilayaId: number | null;
    dairaId: number | null;
    addressname: string | null;
    addressId: number | null;
  };

  const [addressInfo, setAddressInfo] = useState<AddressInfo>({
    wilayaId: null,
    dairaId: null,
    addressname: null,
    addressId: null,
  });

  const handleSave = () => {
    console.log("User Info:", userInfo);
    console.log("Working Days:", workingDays);
    console.log("Address Info:", addressInfo);
  };

  const renderItem = () => (
    <>
      <GeneralInfo onInfoChange={setUserInfo} />
      <WorkingDays onChange={setWorkingDays} />
      <AdderssSection onChange={setAddressInfo} />
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
