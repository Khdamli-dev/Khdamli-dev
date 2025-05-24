import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { MapPin, Home } from "lucide-react-native";
import axios from "axios";
import CONFIG from "@/config";
import { router } from "expo-router";
import refreshAccessToken from "@/api/refreshAccessToken";

import DropdownSearch from "./DropdownSearch";
import apiClient from "@/api/appClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AddressSection = ({
  onChange,
}: {
  onChange: (data: {
    region: number | null;
    city: number | null;
    street: string | null;
    addressName: number | null;
  }) => void;
}) => {
  const handleAddressChange = (region: number | null, city: number | null) => {
    const changes: {
      region: number | null;
      city: number | null;
    } = {
      region: region !== initialWilaya ? region : null,
      city: city !== initialDaira ? city : null,
    };

    // Only call onChange if there are actual changes
    if (changes.region !== null || changes.city !== null) {
      onChange(changes as any);
    }
  };
  const [loading, setLoading] = useState(false);
  const [initialWilaya, setInitialWilaya] = useState<number | null>(null);
  const [initialDaira, setInitialDaira] = useState<number | null>(null);
  const [prevwly, setprevwly] = useState();
  const [prevadr, setprevadr] = useState();
  const [wilayas, setWilayas] = useState<{ id: number; name: string }[]>([]);
  const [filteredWilayas, setFilteredWilayas] = useState<
    { id: number; name: string }[]
  >([]);
  const [selectedWilaya, setSelectedWilaya] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const [dairas, setDairas] = useState<{ id: number; name: string }[]>([]);
  const [filteredDairas, setFilteredDairas] = useState<
    { id: number; name: string }[]
  >([]);
  const [selectedDaira, setSelectedDaira] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const [addresses, setAddresses] = useState<
    { id: number; street: string; address_number: number }[]
  >([]);
  const [filteredAddresses, setFilteredAddresses] = useState<
    { id: number; street: string; address_number: number }[]
  >([]);
  const [selectedAddress, setSelectedAddress] = useState<{
    id: number;
    street: string;
    address_number: number;
  } | null>(null);

  const [wilayaInput, setWilayaInput] = useState("");
  const [dairaInput, setDairaInput] = useState("");
  const [addressInput, setAddressInput] = useState("");

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
                  region: response.data.client.location.region,
                  city: response.data.client.location.city,
                }
              : {
                  region: response.data.worker.location.region,
                  city: response.data.worker.location.city,
                };
          setprevwly(newUserData.city);
          setprevadr(newUserData.region);
          setInitialWilaya(newUserData.region?.id);
          setInitialDaira(newUserData.city?.id);
        } else {
          console.log("Unknown role");
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

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(
          `/address/regions/1`
        );
        setWilayas(response.data.regions);
        setFilteredWilayas(response.data.regions);
      } catch (error: any) {
        if (error.response?.status === 401) {
          if (await refreshAccessToken()) {
            await fetchRegions();
          }
        }
        console.error("wrong fetching data", error);
        alert("wrong fetching data");
      } finally {
        setLoading(false);
      }
    };
    fetchRegions();
  }, []);

  useEffect(() => {
    if (selectedWilaya) {
      const fetchMunicipalities = async () => {
        try {
          const response = await apiClient.get(
            `/address/cities/${selectedWilaya.id}`
          );
          setDairas(response.data.cities);
          setFilteredDairas(response.data.cities);
        } catch (error: any) {
          if (error.response?.status === 401) {
            if (await refreshAccessToken()) {
              await fetchMunicipalities();
            }
          }
          console.error("wrong fecthing data", error);
        }
      };
      fetchMunicipalities();
    } else {
      setDairas([]);
      setFilteredDairas([]);
    }
  }, [selectedWilaya]);

  // useEffect(() => {
  //   if (selectedDaira) {
  //     const fetchAddresses = async () => {
  //       try {
  //         // افتراض وجود نقطة نهاية لجلب العناوين بناءً على معرف البلدية
  //         const response = await axios.get(
  //           `${CONFIG.API_URL}/address/addresses/${selectedDaira.id}`
  //         );
  //         setAddresses(response.data.addresses);
  //         setFilteredAddresses(response.data.addresses);
  //       } catch (error) {
  //         console.error("خطأ أثناء جلب العناوين:", error);
  //       }
  //     };
  //     fetchAddresses();
  //   } else {
  //     setAddresses([]);
  //     setFilteredAddresses([]);
  //   }
  // }, [selectedDaira]);

  const handleFilterChange = (
    text: string,
    data: any[],
    setFilteredData: (filtered: any[]) => void,
    key: string
  ) => {
    if (text) {
      if (text.length === 0) {
        setFilteredData([]);
      } else {
        setFilteredData(
          data.filter((item) =>
            item[key].toLowerCase().includes(text.toLowerCase())
          )
        );
      }
    }
  };

  return (
    <View className="flex-1 bg-white p-4 rounded-2xl mb-[18px] shadow-md">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 20}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-[19px] font-bold mb-3 font-itim">
            Edit Address
          </Text>
          <DropdownSearch
            label="Wilaya"
            icon={<MapPin size={22} color="#F8A100" />}
            value={wilayaInput}
            onTextChange={(text) => {
              setWilayaInput(text);
              handleFilterChange(text, wilayas, setFilteredWilayas, "name");
            }}
            data={filteredWilayas}
            onSelectItem={(item) => {
              setSelectedWilaya(item);
              setWilayaInput(item.name);
              setFilteredWilayas([]);
              setSelectedDaira(null);
              setDairaInput("");
              handleAddressChange(item.id, null);
            }}
            renderItem={(item) => (
              <Text className="p-[10px] bg-[#f8f8f8] border-b border-black">
                {item.name}
              </Text>
            )}
            keyExtractor={(item) => item.id.toString()}
            placeholder={prevadr || "Enter Your City"}
          />

          <DropdownSearch
            label="Baladiya"
            icon={<Home size={22} color="#F8A100" />}
            value={dairaInput}
            onTextChange={(text) => {
              setDairaInput(text);
              handleFilterChange(text, dairas, setFilteredDairas, "name");
            }}
            data={filteredDairas}
            onSelectItem={(item) => {
              setSelectedDaira(item);
              setDairaInput(item.name);
              setFilteredDairas([]);
              handleAddressChange(selectedWilaya?.id || null, item.id);
            }}
            renderItem={(item) => (
              <Text className="p-[10px] bg-[#f8f8f8] border-b border-black">
                {item.name}
              </Text>
            )}
            keyExtractor={(item) => item.id.toString()}
            placeholder={prevwly || "Enter Your Address"}
          />

          {/* <DropdownSearch
            label="عنوانك"
            icon={<Home size={22} color="#F8A100" />}
            value={addressInput}
            onTextChange={(text) => {
              setAddressInput(text);
              handleFilterChange(text, addresses, setFilteredAddresses, "street");
              setSelectedAddress({ id: -1, street: text, address_number: 0 });
              onChange({
                wilayaId: selectedWilaya?.id || null,
                dairaId: selectedDaira?.id || null,
                addressname: text,
                addressId: null, // يشير إلى عنوان جديد
              });
            }}
            data={filteredAddresses}
            onSelectItem={(item) => {
              setSelectedAddress(item);
              setAddressInput(
                `${item.street}${item.address_number ? ` - ${item.address_number}` : ""}`
              );
              setFilteredAddresses([]);
              onChange({
                wilayaId: selectedWilaya?.id || null,
                dairaId: selectedDaira?.id || null,
                addressname: item.street,
                addressId: item.id,
              });
            }}
            renderItem={(item) => (
              <Text className="p-[10px] bg-[#f8f8f8] border-b border-black">
                {`${item.street}، رقم: ${item.address_number}`}
              </Text>
            )}
            keyExtractor={(item) => item.id.toString()}
            placeholder="أدخل العنوان"
          /> */}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default AddressSection;
