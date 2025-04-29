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
  Edit,
  Clock,
  MapPin,
  Briefcase,
  Pencil,
  Plus,
  CreditCard,
  User,
  Globe,
} from "lucide-react-native";
import CONFIG from "../../../config";
import { Video, ResizeMode } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, Itim_400Regular } from "@expo-google-fonts/itim";
import * as ImagePicker from "expo-image-picker";
import { NavigationProp } from "@react-navigation/native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { FontAwesome } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

type RootStackParamList = {
  EditProfile: undefined;
};

type ProfileScreenProps = {
  navigation: NavigationProp<RootStackParamList>;
};
interface ProfileItemProps {
  label: string;
  value: React.ReactNode;
  Icon?: React.ComponentType<{ size: number; color: string }>;
}

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
  type MediaItem = {
    type: "image" | "video";
    uri: string;
  };

  const [user, setUser] = useState<{
    fullName: string | null;
    registration_date: string | null;
    bio: string | null;
    image: string | null;
    region: string | null;
    city: string | null;
    accountType: string | null;
    workingDays: { day: string; begin: string; end: string }[] | null;
    age: number | null;
    gender: string | null;
    paymentMethod: string[] | null;
    category: { name: string; price: number; unity: string }[] | null;
    gallery: MediaItem[] | null;
  }>({
    fullName: null,
    registration_date: null,
    bio: null,
    image: null,
    region: null,
    city: null,
    accountType: null,
    workingDays: null,
    age: null,
    gender: null,
    paymentMethod: null,
    category: null,
    gallery: null,
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        const user: any = JSON.parse(userData as any);

        if (!user) {
          console.log("User does not exist");
          return;
        }

        const { id, role } = user;
        const endpoint =
          role === 1 ? `/users/client/` : role === 2 ? `/users/worker/` : null;
        console.log(endpoint);
        if (endpoint) {
          const response = await axios.get(`${CONFIG.API_URL}${endpoint}${id}`);
          console.log(response);
          const newUserData =
            role === 1
              ? {
                  fullName: response.data.client.username,
                  image: response.data.client.profile_image,
                  registration_date: response.data.client.registration_date,
                  age: response.data.client.age,
                  gender: response.data.client.sex,
                  region: response.data.client.location.region,
                  city: response.data.client.location.city,
                  accountType: "client",
                }
              : {
                  fullName: response.data.worker.username,
                  image: response.data.worker.profile_image,
                  registration_date: response.data.worker.registration_date,
                  age: response.data.worker.age,
                  gender: response.data.worker.sex,
                  region: response.data.worker.location.region,
                  city: response.data.worker.location.city,
                  accountType: "worker",
                  bio: response.data.worker.bio,
                  workingDays: response.data.worker.availability,
                  category: response.data.worker.categories,
                  paymentMethod: response.data.worker.payment_methods,
                  gallery: response.data.worker.media,
                };

          setUser((prev) => ({ ...prev, ...newUserData }));
        } else {
          console.log("Unknown role");
        }
      } catch (error) {
        console.error("Failed to fetch user data", error);
      }
    };

    fetchUser();
  }, []);
  const formatTime = (timeString: any) => {
    if (!timeString) return "";
    // Handle various formats, returning just HH:MM
    return timeString.split(":").slice(0, 2).join(":");
  };
  const pickGalleryMedia = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert(
        "Permission Required",
        "You need to enable permissions to access the gallery."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (result.assets?.length) {
      const selectedMedia = result.assets[0];
      const newMedia: MediaItem = {
        uri: selectedMedia.uri,
        type: selectedMedia.type === "video" ? "video" : "image",
      };
      addGalleryImage(newMedia);
    }
  };

  const addGalleryImage = (newMedia: MediaItem) => {
    setUser((prevUser) => ({
      ...prevUser,
      gallery: prevUser.gallery
        ? prevUser.gallery.some((item) => item.uri === newMedia.uri)
          ? prevUser.gallery
          : [...prevUser.gallery, newMedia]
        : null,
    }));
  };
  const log = () => {
    console.log(user.workingDays);
  };

  const updateProfileImage = (newImage: string) => {
    setUser((prevUser) => ({
      ...prevUser,
      image: newImage,
    }));
    console.log(newImage);
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
            className="absolute top-[30px] left-[30px]"
            onPress={() => router.push("/(tabs)/(profile)/(settings)")}
          >
            <FontAwesome name="user" size={38} color="#BD7D06" />
          </TouchableOpacity>
          <TouchableOpacity
            className="absolute top-[30px] right-[30px]"
            onPress={() => router.push("/(tabs)/(profile)/editProfile")}
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
              source={{
                uri:
                  user.image ??
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png",
              }}
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
      {user.accountType === "worker" && (
        <>
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
            {user.workingDays?.map((item, index) => (
              <View
                key={index}
                className="flex-row justify-between py-2 border-b border-gray-200"
              >
                <Text className="text-[16px] font-semibold">{item.day}</Text>
                <Text
                  className="mr-2 text-[#BD7D06]"
                  style={{ fontFamily: "Itim_400Regular" }}
                >
                  From {formatTime(item.begin)}
                </Text>
                <Text
                  className="mr-2 text-[#BD7D06]"
                  style={{ fontFamily: "Itim_400Regular" }}
                >
                  To {formatTime(item.end)}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}
      <View className="bg-white rounded-[20px] overflow-hidden mb-2.5 mx-1.75 p-4 border border-gray-200 shadow-md">
        <ProfileItem
          label="Registration Date"
          value={
            user.registration_date ? user.registration_date.split("T")[0] : ""
          }
          Icon={(props) => <Calendar {...props} />}
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
          Icon={(props) => <Clock {...props} />}
        />
        <ProfileItem
          label="Gender"
          value={user.gender}
          Icon={(props) => <User {...props} />}
        />
        {user.accountType === "worker" && (
          <>
            {user.category?.map((cat, index) => (
              <ProfileItem
                key={index}
                label={`Profession ${index + 1}`}
                value={`${cat.name}`}
                Icon={(props) => <Briefcase {...props} />}
              />
            ))}

            {user.paymentMethod && (
              <ProfileItem
                label="Payment Method"
                value={user.paymentMethod.join(" / ")}
                Icon={(props) => <CreditCard {...props} />}
              />
            )}
          </>
        )}
      </View>
      {user.accountType === "worker" && (
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
              onPress={pickGalleryMedia}
            >
              <Plus size={22} color="#BD7D06" strokeWidth={4} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={user.gallery}
            renderItem={({ item }) => (
              <View className="relative mx-4">
                {item.type === "image" ? (
                  <Image
                    source={{ uri: item.uri }}
                    className="h-[300px] rounded-[10px] my-1.5"
                    style={{ width: width - 32 }}
                  />
                ) : (
                  <Video
                    source={{ uri: item.uri }}
                    className="h-[300px] rounded-[10px] my-1.5"
                    style={{ width: width - 32 }}
                    useNativeControls={true}
                    resizeMode={ResizeMode.CONTAIN}
                    shouldPlay={false}
                  />
                )}

                <TouchableOpacity
                  className="absolute top-[10px] right-[10px] bg-[rgba(255,0,0,0.7)] rounded-[15px] p-2"
                  onPress={() => log()}
                >
                  <Trash size={20} color="white" />
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item, index) => item.uri + index}
            scrollEnabled={false}
          />
        </View>
      )}
    </ScrollView>
  );
};

export default ProfileScreen;
