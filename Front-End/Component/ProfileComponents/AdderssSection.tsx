import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { MapPin, Home } from "lucide-react-native";
import { useFonts, Itim_400Regular } from "@expo-google-fonts/itim";
import { createClient } from "@supabase/supabase-js";

import DropdownSearch from "./DropdownSearch";

const supabase = createClient(
  "https://dliadftpwivpugrbopnh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsaWFkZnRwd2l2cHVncmJvcG5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDI1NzUsImV4cCI6MjA1MzQxODU3NX0.krisX5f0AluQrd9SHnn_gncUqP8tgLB1OQKq-wKQY3k"
);

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
        const [regionsData] = await Promise.all([fetchData("region")]);
        setRegions(regionsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("there is the wrong to fetch data ");
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);
  const handleFilterChange = (
    text: string,
    data: any[],
    setFilteredData: (filtered: any[]) => void,
    key: string
  ) => {
    setFilteredData(
      data.filter((item) =>
        item[key].toLowerCase().includes(text.toLowerCase())
      )
    );
  };
  const [regions, setRegions] = useState<{ id: number; name: string }[]>([]);

  const [wilaya, setWilaya] = useState<{ id: number; name: string } | null>(
    null
  );
  const [daira, setdaira] = useState<{ id: number; name: string } | null>(null);
  const [baladiya, setbaladiya] = useState<{
    id: number;
    name: string;
    num: number;
  } | null>(null);
  interface Region {
    id: number;
    name: string;
    region?: string;
  }

  const [filteredRegions, setFilteredRegions] = useState<Region[]>([]);

  interface adress {
    id: number;
    street: string;
    city: number;
    address_number: number;
  }
  const [address, setaddress] = useState<adress[]>([]);
  const [filteredaddress, setFilteredaddress] = useState<adress[]>([]);
  interface City {
    id: number;
    name: string;
    region: number;
  }

  const [cities, setCities] = useState<City[]>([]);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  {
    /*fetch cities from databases*/
  }
  const fetchCities = async (regionId: number) => {
    const { data, error } = await supabase
      .from("city")
      .select("id, name, region")
      .eq("region", regionId);
    if (!error) setCities(data || []);
  };

  /*fetch address*/
  const fetchAddress = async (cityId: number) => {
    console.log("Fetching address for cityId:", cityId);
    const { data, error } = await supabase
      .from("address")
      .select("id, street, city, address_number")
      .eq("city", cityId);

    if (error) {
      console.error("Fetch Address Error:", error);
      return;
    }

    if (!data || data.length === 0) {
      console.log("No address found in database.");
      setaddress([]);
    } else {
      console.log("Fetched Addresses:", data);
      setaddress(data);
    }
  };

  return (
    <View className="bg-white p-4 rounded-2xl mb-[18px] shadow-md">
      <Text className="text-[19px] font-bold mb-3 font-itim">Edit Address</Text>

      <DropdownSearch<Region>
        label="Your Wilaya"
        icon={<MapPin size={22} color="#F8A100" />}
        value={wilaya?.name || ""}
        onTextChange={(text) =>
          handleFilterChange(text, regions, setFilteredRegions, "name")
        }
        data={filteredRegions}
        onSelectItem={(item) => {
          setWilaya(item);
          fetchCities(item.id);
          setFilteredRegions([]);
          onChange({
            wilayaId: item.id,
            dairaId: daira?.id || null,
            addressname: baladiya?.name || null,
            addressId: baladiya?.id || null,
          });
        }}
        renderItem={(item) => (
          <Text className="p-[10px] bg-[#f8f8f8] border-b border-black">
            {item.name}
          </Text>
        )}
        keyExtractor={(item) => item.id.toString()}
        placeholder="Enter Wilaya"
      />

      <DropdownSearch<City>
        label="Your Daira"
        icon={<Home size={22} color="#F8A100" />}
        value={daira?.name || ""}
        onTextChange={(text) =>
          handleFilterChange(text, cities, setFilteredCities, "name")
        }
        data={filteredCities}
        onSelectItem={(item) => {
          setdaira(item);
          setFilteredCities([]);
          fetchAddress(item.id);
          onChange({
            wilayaId: wilaya?.id || null,
            dairaId: item.id,
            addressname: baladiya?.name || null,
            addressId: baladiya?.id || null,
          });
        }}
        renderItem={(item) => (
          <Text className="p-[10px] bg-[#f8f8f8] border-b border-black">
            {item.name}
          </Text>
        )}
        keyExtractor={(item) => item.id.toString()}
        placeholder="Enter Daira"
      />

      <DropdownSearch<adress>
        label="Your Address"
        icon={<Home size={22} color="#F8A100" />}
        value={
          baladiya
            ? `${baladiya.name}${baladiya.num ? ` - ${baladiya.num}` : ""}`
            : ""
        }
        onTextChange={(text) => {
          handleFilterChange(text, address, setFilteredaddress, "street");
          setbaladiya({ id: -1, name: text, num: 0 });
          onChange({
            wilayaId: wilaya?.id || null,
            dairaId: daira?.id || null,
            addressname: text,
            addressId: baladiya?.id || null,
          });
        }}
        data={filteredaddress}
        onSelectItem={(item) => {
          setbaladiya({
            id: item.id,
            name: item.street,
            num: item.address_number,
          });
          setFilteredaddress([]);
          onChange({
            wilayaId: wilaya?.id || null,
            dairaId: daira?.id || null,
            addressname: item.street,
            addressId: baladiya?.id || null,
          });
        }}
        renderItem={(item) => (
          <Text className="p-[10px] bg-[#f8f8f8] border-b border-black">
            {`${item.street}, Num: ${item.address_number}`}
          </Text>
        )}
        keyExtractor={(item: adress) => item.id?.toString() || ""}
        placeholder="Enter Address"
      />
    </View>
  );
};

export default AddressSection;
