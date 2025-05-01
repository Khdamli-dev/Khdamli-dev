import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Calendar,
  Clock,
  MapPin,
  Briefcase,
  CreditCard,
  User,
  Globe,
  MessageSquare,
} from "lucide-react-native";
import CONFIG from "../../../config";
import { Video, ResizeMode } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, Itim_400Regular } from "@expo-google-fonts/itim";
import { router, useLocalSearchParams } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import apiClient from "@/api/appClient";

const { width } = Dimensions.get("window");

interface ProfileItemProps {
  label: string;
  value: React.ReactNode;
  Icon?: React.ComponentType<{ size: number; color: string }>;
}

const UserProfileScreen: React.FC = () => {
  type MediaItem = {
    type: "image" | "video";
    uri: string;
  };
  const { workerId } = useLocalSearchParams();
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

  // Sample data for demonstration (fake data)
  // const fakeData = {
  //   fullName: "Ahmed Mohamed",
  //   registration_date: "2023-10-15T14:30:00",
  //   bio: "Professional plumber with 7 years of experience. I specialize in fixing leaks, installing fixtures, and maintenance work.",
  //   image: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  //   region: "Cairo",
  //   city: "Maadi",
  //   accountType: "worker",
  //   workingDays: [
  //     { day: "Monday", begin: "09:00", end: "17:00" },
  //     { day: "Tuesday", begin: "09:00", end: "17:00" },
  //     { day: "Wednesday", begin: "09:00", end: "17:00" },
  //     { day: "Thursday", begin: "09:00", end: "17:00" },
  //     { day: "Friday", begin: "09:00", end: "14:00" },
  //   ],
  //   age: 32,
  //   gender: "Male",
  //   paymentMethod: ["Cash", "Credit Card"],
  //   category: [{ name: "Plumbing", price: 150, unity: "Hour" }],
  //   gallery: [
  //     { type: "image" as const, uri: "https://picsum.photos/id/1/800/600" },
  //     { type: "image" as const, uri: "https://picsum.photos/id/28/800/600" },
  //     { type: "image" as const, uri: "https://picsum.photos/id/42/800/600" },
  //   ],
  // };

  useEffect(() => {
    // Set fake data for demonstration
    // setUser(fakeData);

    //Commented out as requested
    const fetchUser = async () => {
      try {
        // Use the workerId prop passed to the component instead of getting from AsyncStorage
        if (workerId) {
          // Worker profile endpoint using the worker ID parameter
          const endpoint = `/users/worker/${workerId}`;
          console.log(`Fetching worker profile with ID: ${workerId}`);
          console.log(endpoint);
          
          const response = await apiClient.get(endpoint);
          console.log(response);
          
          const newUserData = {
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
          console.log("No worker ID provided");
        }
      } catch (error) {
        console.error("Failed to fetch worker data", error);
      }
    };

    fetchUser();
   
  }, [workerId]); // Add workerId as a dependency to refetch when it changes

  const formatTime = (timeString: any) => {
    if (!timeString) return "";
    return timeString.split(":").slice(0, 2).join(":");
  };

  const handleSendPrivateRequest = () => {
    router.push({
      pathname: "/(tabs)/(home)/createRequest",
      params: { type: "2" },
    });
  };

  const [fontsLoaded] = useFonts({ Itim_400Regular });

  const ProfileItem: React.FC<ProfileItemProps> = ({ label, value, Icon }) => (
    <View className="flex-row justify-between items-center py-4 px-[10px] mb-[3px]">
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
    </View>
  );

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ paddingBottom: 32, paddingTop: 16 }}
    >
      <LinearGradient
        colors={["#5EB4A2", "#2B524A"]}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        locations={[0.22, 1]}
        className="relative items-center pt-2 justify-center pb-[35px] pl-0 mb-[10px]"
        style={{ borderBottomLeftRadius: 50, borderBottomRightRadius: 50 }}
      >
        <View className="w-full mb-1 items-start justify-start ">
          <TouchableOpacity onPress={() => router.back()}>
            <AntDesign name="left" size={50} color="white" />
          </TouchableOpacity>
        </View>
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
          className="absolute rounded-[15px] w-[110px] h-[80px] bottom-[20px] left-[-20px]"
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
        </View>

        <Text
          className="text-white text-[27px] mb-1.5 mt-2.5"
          style={{ fontFamily: "Itim_400Regular" }}
        >
          {user.fullName}
        </Text>

        <TouchableOpacity
          onPress={handleSendPrivateRequest}
          style={styles.requestButton}
        >
          <MessageSquare size={20} color="white" style={{ marginRight: 8 }} />
          <Text style={styles.requestButtonText}>Send Private Request</Text>
        </TouchableOpacity>
      </LinearGradient>

      {user.accountType === "worker" && (
        <>
          <View className="bg-white rounded-[20px] overflow-hidden mb-2.5 mx-1.75 p-4 border border-gray-200 shadow-md">
            <Text
              className="text-center text-[#BD7D06] mb-2.5"
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
              className="text-center text-[#BD7D06] mb-2.5"
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

      {user.accountType === "worker" &&
        user.gallery &&
        user.gallery.length > 0 && (
          <View className="bg-white rounded-[20px] overflow-hidden mb-2.5 mx-1.75 p-4 border border-gray-200 shadow-md">
            <Text
              className="text-center text-[#BD7D06] mb-2.5 text-[20px]"
              style={{ fontFamily: "Itim_400Regular" }}
            >
              Gallery
            </Text>
            <FlatList
              data={user.gallery}
              renderItem={({ item }) => (
                <View className="relative items-center justify-center my-2">
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

const styles = StyleSheet.create({
  requestButton: {
    backgroundColor: "#BD7D06",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginTop: 10,
  },
  requestButtonText: {
    color: "white",
    fontFamily: "Itim_400Regular",
    fontSize: 16,
  },
});

export default UserProfileScreen;
