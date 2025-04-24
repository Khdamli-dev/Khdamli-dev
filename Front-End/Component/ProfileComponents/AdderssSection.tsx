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

import DropdownSearch from "./DropdownSearch";

const AddressSection = ({
  onChange,
}: {
  onChange: (data: {
    wilayaId: number | null;
    dairaId: number | null;
    addressname: string | null;
    addressId: number | null;
  }) => void;
}) => {
  const [loading, setLoading] = useState(false);

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
    const fetchRegions = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${CONFIG.API_URL}/address/regions/1`);
        setWilayas(response.data.regions);
        setFilteredWilayas(response.data.regions);
      } catch (error) {
        console.error("خطأ أثناء جلب الولايات:", error);
        alert("حدث خطأ أثناء جلب الولايات");
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
          const response = await axios.get(
            `${CONFIG.API_URL}/address/cities/${selectedWilaya.id}`
          );
          setDairas(response.data.cities);
          setFilteredDairas(response.data.cities);
        } catch (error) {
          console.error("خطأ أثناء جلب البلديات:", error);
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
    if (text.length === 0) {
      setFilteredData([]);
    } else {
      setFilteredData(
        data.filter((item) =>
          item[key].toLowerCase().includes(text.toLowerCase())
        )
      );
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
              // setSelectedAddress(null);
              // setAddressInput("");
              onChange({
                wilayaId: item.id,
                dairaId: null,
                addressname: null,
                addressId: null,
              });
            }}
            renderItem={(item) => (
              <Text className="p-[10px] bg-[#f8f8f8] border-b border-black">
                {item.name}
              </Text>
            )}
            keyExtractor={(item) => item.id.toString()}
            placeholder=" Enter Your Wilaya"
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

              // setSelectedAddress(null);
              // setAddressInput("");
              onChange({
                wilayaId: selectedWilaya?.id || null,
                dairaId: item.id,
                addressname: null,
                addressId: null,
              });
            }}
            renderItem={(item) => (
              <Text className="p-[10px] bg-[#f8f8f8] border-b border-black">
                {item.name}
              </Text>
            )}
            keyExtractor={(item) => item.id.toString()}
            placeholder=" Enter Your Baladiya"
          />

          {/* قائمة منسدلة للعناوين */}
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
