import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  FlatList,
  Dimensions,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import {
  Trash,
  Calendar,
  Phone,
  Edit,
  MapPin,
  Briefcase,
  Pencil,
  Mail,
  Plus,
  CreditCard,
  Star,
  User,
  Globe,
} from "lucide-react-native";

import { LinearGradient } from "expo-linear-gradient";
import { useFonts, Itim_400Regular } from "@expo-google-fonts/itim";
import * as ImagePicker from "expo-image-picker";
import { NavigationProp } from "@react-navigation/native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CONFIG from "@/config";
import axios from "axios";

const { width } = Dimensions.get("window");

type RootStackParamList = {
  EditProfile: undefined;
};

type ProfileScreenProps = {
  navigation: NavigationProp<RootStackParamList>;
};

interface StarRatingProps {
  rating: number;
}

interface ProfileItemProps {
  label: string;
  value: React.ReactNode;
  Icon?: React.ComponentType<{ size: number; color: string }>;
}

const StarRating: React.FC<StarRatingProps> = ({ rating }) => {
  return (
    <View className="flex-row items-center">
      {[...Array(5)].map((_, index) => (
        <Star
          key={index}
          size={20}
          color={index < rating ? "#facc15" : "#d1d5db"}
        />
      ))}
    </View>
  );
};

const pickProfileImage = async (
  updateProfileImage: (newImage: string) => void
) => {
  const permissionResult =
    await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permissionResult.granted) {
    Alert.alert(
      "Permission Required",
      "You need to enable permissions to access the gallery."
    );
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });

  if (!result.canceled && result.assets?.[0]?.uri) {
    updateProfileImage(result.assets[0].uri);
  }
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  useEffect(() => {}, []);
  const [user, setUser] = useState({
    fullName: "Mohammed",
    email: "mohammed@gmail.com",
    phone: "0669782424",
    bio: "Professional Carpenter With 5 Years Experience In Furniture Making And Wood Decoration Design",
    image: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    region: "tlemcen",
    city: "maghnia",
    accountType: "worker",
    workingDays: [
      { day: "Sunday", from: "8:00", to: "16:00" },
      { day: "Monday", from: "8:00", to: "16:00" },
      { day: "Tuesday", from: "8:00", to: "16:00" },
      { day: "Wednesday", from: "8:00", to: "16:00" },
      { day: "Thursday", from: "8:00", to: "16:00" },
    ],
    age: 23,
    gender: "male",
    paymentMethod: ["baridiMob", "ccp"] as string[],
    category: ["carpenter"] as string[],
    branches: ["carpenter"] as string[],
    gallery: [] as string[],
  });
  const pickGalleryImage = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert(
        "Permission Required",
        "You need to enable permissions to access the gallery."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (result.assets?.length) {
      addGalleryImage(result.assets[0].uri);
    }
  };
  const updateProfileImage = (newImage: string) => {
    setUser((prevUser) => ({
      ...prevUser,
      image: newImage, // ✅ تحديث الصورة داخل `user`
    }));
    console.log(newImage);
  };
  const addGalleryImage = (newImage: string) => {
    setUser((prevUser) => ({
      ...prevUser,
      gallery: prevUser.gallery.includes(newImage)
        ? prevUser.gallery
        : [...prevUser.gallery, newImage],
    }));
  };

  const deleteGalleryImage = (imageToDelete: string) => {
    setUser((prevUser) => ({
      ...prevUser,
      gallery: prevUser.gallery.filter((img) => img !== imageToDelete),
    }));
  };

  const [fontsLoaded] = useFonts({ Itim_400Regular });
  if (!fontsLoaded) return <Text>Loading...</Text>;

  const ProfileItem: React.FC<ProfileItemProps> = ({ label, value, Icon }) => (
    <TouchableOpacity className="flex-row justify-between items-center py-4 px-[10px] mb-[3px]">
      <Text
        className="font-bold text-[16px]"
        style={{ fontFamily: "Itim_400Regular" }}
      >
        {label}
      </Text>
      <View className="flex-row items-center gap-[10px]">
        <Text
          className="mr-[8px] text-[#BD7D06] font-semibold"
          style={{ fontFamily: "Itim_400Regular" }}
        >
          {value}
        </Text>
        {Icon && <Icon size={20} color="#BD7D06" />}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-200">
      <ScrollView>
        <LinearGradient
          colors={["#5EB4A2", "#2B524A"]}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          locations={[0.22, 1]}
          className="relative items-center p-[35px] mb-[10px]"
          style={{ borderBottomLeftRadius: 50, borderBottomRightRadius: 50 }}
        >
          <>
            <TouchableOpacity
              className="absolute top-[30px] right-[30px]"
              onPress={() => router.push("/(tabs)/(profile)/editprofile")}
            >
              <Edit size={38} color="#BD7D06" />
            </TouchableOpacity>

            <View
              className="absolute rounded-[15px] w-[120px] h-[80px] top-[70px] right-[-30px]"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                transform: [{ rotate: "-30deg" }],
                borderRadius: 15,
                overflow: "hidden",
              }}
            />
            <View
              className="absolute rounded-[15px]  w-[110px] h-[80px] bottom-[20px] left-[-20px]"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                transform: [{ rotate: "-30deg" }],
                borderRadius: 15,
                overflow: "hidden",
              }}
            />

            <View className="relative">
              <Image
                source={{ uri: user.image }}
                className="w-[130px] h-[130px] rounded-full border-[3px] border-white"
              />
              <TouchableOpacity
                className="absolute bottom-0 right-0 bg-[#BD7D06] rounded-full p-[6px] border-[1.5px] border-white"
                onPress={() => {
                  pickProfileImage(updateProfileImage);
                }}
              >
                <Pencil size={20} color="white" />
              </TouchableOpacity>
            </View>

            <Text
              className="text-white text-[27px] mb-1.5 mt-2.5 "
              style={{ fontFamily: "Itim_400Regular" }}
            >
              {user.fullName}
            </Text>
          </>
        </LinearGradient>

        <View className="bg-white rounded-[20px] overflow-hidden mb-2.5 mx-1.75 p-4 border border-gray-200 shadow-md">
          <Text
            className="text-center text-[#BD7D06]  mb-2.5"
            style={{ fontFamily: "Itim_400Regular" }}
          >
            Short Bio
          </Text>
          <Text
            className="text-center mt-2 text-[16px]"
            style={{ fontFamily: "Itim_400Regular" }}
          >
            {user.bio}
          </Text>
        </View>

        <View className="bg-white rounded-[20px] overflow-hidden mb-2.5 mx-1.75 p-4 border border-gray-200 shadow-md">
          <Text
            className="text-center text-[#BD7D06]  mb-2.5"
            style={{ fontFamily: "Itim_400Regular" }}
          >
            Working Days
          </Text>
          {user.workingDays.map((item, index) => (
            <View
              key={index}
              className="flex-row justify-between py-2 border-b border-gray-200"
            >
              <Text className="text-[16px] font-semibold">{item.day}</Text>
              <Text
                className="mr-2 text-[#BD7D06]  "
                style={{ fontFamily: "Itim_400Regular" }}
              >
                From {item.from}
              </Text>
              <Text
                className="mr-2 text-[#BD7D06]  "
                style={{ fontFamily: "Itim_400Regular" }}
              >
                To {item.to}
              </Text>
            </View>
          ))}
        </View>

        <View className="bg-white rounded-[20px] overflow-hidden mb-2.5 mx-1.75 p-4 border border-gray-200 shadow-md">
          <ProfileItem
            label="Phone Number"
            value={user.phone}
            Icon={(props) => <Phone {...props} />}
          />
          <ProfileItem
            label="Email"
            value={user.email}
            Icon={(props) => <Mail {...props} />}
          />
          <ProfileItem
            label="Region"
            value={user.region}
            Icon={(props) => <Globe {...props} />}
          />
          <ProfileItem
            label="City"
            value={user.city}
            Icon={(props) => <MapPin {...props} />}
          />
        </View>

        <View className="bg-white rounded-[20px] overflow-hidden mb-2.5 mx-1.75 p-4 border border-gray-200 shadow-md">
          <ProfileItem
            label="Account Type"
            value={user.accountType}
            Icon={(props) => <User {...props} />}
          />
          <ProfileItem
            label="Age"
            value={`${user.age} Years`}
            Icon={(props) => <Calendar {...props} />}
          />
          <ProfileItem
            label="Gender"
            value={user.gender}
            Icon={(props) => <User {...props} />}
          />
          {user.accountType === "worker" && (
            <>
              <ProfileItem
                label="Profession"
                value={user.category}
                Icon={(props) => <Briefcase {...props} />}
              />
              <ProfileItem
                label="Branches"
                value={user.branches}
                Icon={(props) => <Briefcase {...props} />}
              />
            </>
          )}

          <ProfileItem
            label="Payment Method"
            value={user.paymentMethod.join(" / ")}
            Icon={(props) => <CreditCard {...props} />}
          />
          <ProfileItem
            label="Ratings & Reviews"
            value={<StarRating rating={4} />}
          />
        </View>

        <View className="bg-white rounded-[20px] overflow-hidden mb-2.5 mx-1.75 p-4 border border-gray-200 shadow-md">
          <View className="flex-row justify-between items-center mb-2.5">
            <Text
              className="text-center text-[#BD7D06]  mb-2.5 text-[20px]"
              style={{ fontFamily: "Itim_400Regular" }}
            >
              Some Pictures
            </Text>
            <TouchableOpacity
              className="items-center my-2.5 p-1.25"
              onPress={pickGalleryImage}
            >
              <Plus size={22} color="#BD7D06" strokeWidth={4} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={user.gallery}
            renderItem={({ item }) => (
              <View className="relative mx-4">
                <Image
                  source={{ uri: item }}
                  className="h-[300px] rounded-[10px] my-1.5"
                  style={{ width: width - 32 }}
                />
                <TouchableOpacity
                  className="absolute top-[10px] right-[10px] bg-[rgba(255,0,0,0.7)] rounded-[15px] p-2"
                  onPress={() => deleteGalleryImage(item)}
                >
                  <Trash size={20} color="white" />
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item, index) => item + index}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
