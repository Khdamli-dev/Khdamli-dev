import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Dimensions,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Calendar,
  MapPin,
  Clock,
  Globe,
  User,
  Briefcase,
  CreditCard,
  MessageSquare,
} from "lucide-react-native";
import CONFIG from "../../../config";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, Itim_400Regular } from "@expo-google-fonts/itim";
import { useRoute } from "@react-navigation/native";
import { Video, ResizeMode } from "expo-av";
import axios from "axios";
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "@/api/appClient";
import { AntDesign } from "@expo/vector-icons";
import Dashboard from "@/Component/ProfileComponents/Dashboard";
import Reviews from "@/Component/ProfileComponents/Reviews";
import refreshAccessToken from "@/api/refreshAccessToken";
const { width } = Dimensions.get("window");

interface ProfileItemProps {
  label: string;
  value: React.ReactNode;
  Icon?: React.ComponentType<{ size: number; color: string }>;
}

const styles = StyleSheet.create({
  requestButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#BD7D06",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  requestButtonText: {
    color: "white",
    fontFamily: "Itim_400Regular",
    fontSize: 16,
  },
});

const UserProfileView = () => {

  const { status, requestId, userId, userRole, origin } =
    useLocalSearchParams();

  const [role, setRole] = useState(1); // 1 Client 2 worker
  const [user, setUser] = useState<{
    fullName: string | null;
    registration_date: string | null;
    bio: string | null;
    image: string | null;
    region: string | null;
    city: string | null;
    accountType: string | null;
    workingDays: any[] | null;
    age: number | null;
    gender: string | null;
    paymentMethod: string[] | null;
    category: any[] | null;
    gallery: any[] | null;
    sentRequests: number | null;
    completedRequests: number | null;

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
    sentRequests: null,
    completedRequests: null,
  });

  useEffect(() => {

    const fetchUserData = async () => {
      try {
        if (!userId) {
          return;
        }
        const endpoint =`/users/worker/${userId}`;
        const response = await apiClient.get(`${endpoint}`);
          const workerData = {
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
            sentRequests: response.data.worker.activity.sent_requests,
            completedRequests: response.data.worker.activity.completed_requests,
          };
          setUser(workerData);
      } catch (error:any) {
              if (error.response?.status === 401) {
        if (await refreshAccessToken()) {
          await fetchUserData();
        }
      }
        console.error("Failed to fetch user data", error.response?.data);
      }
    };

    fetchUserData();
  }, [userId, userRole]);

  const formatTime = (timeString: string | null) => {
    if (!timeString) return "";
    // Handle various formats, returning just HH:MM
    return timeString.split(":").slice(0, 2).join(":");
  };

  // Profile item component - read-only version
  const ProfileItem = ({ label, value, Icon }: ProfileItemProps) => (
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
          {value || "Unknown"}
          {label === "Age" && value ? " Years" : null}
        </Text>
        {Icon && <Icon size={20} color="#BD7D06" />}
      </View>
    </View>
  );
  const handleSendPrivateRequest = () => {
    console.log(userId)
    router.push({
      pathname: "/(tabs)/(search)/requeste",
      params: { type: "2" , workerId : userId },
    });
  };

   const handleNavigatetoclientprofiele = (clientId: string) => {
      console.log(`Navigate to client: ${clientId}`);
      router.push({
            pathname: "/workerProfile",
            params: {
              userId: clientId,
              userRole: 1,
            },
          });
      // Navigate to client profile
    };

  return (
    <ScrollView>
      {/* Profile Header - Without Edit Buttons */}
      <LinearGradient
        colors={["#5EB4A2", "#2B524A"]}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        locations={[0.22, 1]}
        className="relative items-center p-[35px]  mb-[10px]"
        style={{ borderBottomLeftRadius: 50, borderBottomRightRadius: 50 }}
      >
        <TouchableOpacity

          onPress={() => router.back()}

          className="justify-end w-full"
        >
          <AntDesign name="left" size={50} color="#F8A100" />
        </TouchableOpacity>
        <>
          {/* Decorative elements */}
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

          {/* Profile Image - Without Edit Button */}
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

          {/* User Name */}
          <Text
            className="text-white text-[27px] mb-1.5 mt-2.5"
            style={{ fontFamily: "Itim_400Regular" }}
          >
            {user.fullName}
          </Text>
          {user.accountType === "worker" && role === 1 && (
            <>
              <TouchableOpacity
                onPress={handleSendPrivateRequest}
                style={styles.requestButton}
              >
                <MessageSquare
                  size={20}
                  color="white"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.requestButtonText}>
                  Send Private Request
                </Text>
              </TouchableOpacity>
            </>
          )}
        </>
      </LinearGradient>

      {/* Worker-specific sections */}
      {user.accountType === "worker" && (
        <>
          <Dashboard
            workerId={Array.isArray(userId) ? userId[0] : userId} // Pass the userId to the Dashboard component

            sent_requests={user.sentRequests || 0}
            completed_requests={user.completedRequests || 0}

          />
          {/* Bio Section */}
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

          {/* Working Days Section */}
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

      {/* Location Information Card */}
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

      {/* Personal Information Card */}
      <View className="bg-white rounded-[20px] overflow-hidden mb-2.5 mx-1.75 p-4 border border-gray-200 shadow-md">
        <ProfileItem
          label="Account Type"
          value={user.accountType === "worker" ? "Worker" : "Client"}
          Icon={(props) => <User {...props} />}
        />
        <ProfileItem
          label="Age"
          value={user.age}
          Icon={(props) => <Clock {...props} />}
        />
        <ProfileItem
          label="Gender"
          value={user.gender}
          Icon={(props) => <User {...props} />}
        />

        {/* Worker-specific information */}
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

      {/* Gallery - Worker only */}
      {user.accountType === "worker" &&
        user.gallery &&
        user.gallery.length > 0 && (
          <View className="bg-white rounded-[20px] overflow-hidden mb-2.5 mx-1.75 p-4 border border-gray-200 shadow-md">
            <Text
              className="text-center text-[#BD7D06] mb-2.5 text-[20px]"
              style={{ fontFamily: "Itim_400Regular" }}
            >
              Portfolio
            </Text>

            <FlatList
              data={user.gallery}
              renderItem={({ item }) => (
                <View className="mx-4">
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
      {/* Reviews Section - Worker only */}
      {user.accountType === "worker" && (
        <>
          <Reviews
            workerId={Array.isArray(userId) ? userId[0] : userId}
            onClientPress={(clientId) => {
              handleNavigatetoclientprofiele(clientId);
              // Navigate to client profile
            }}
            onViewAllPress={() => {
              console.log("View all reviews");
              // Navigate to all reviews screen
            }}
          />
        </>
      )}
    </ScrollView>
  );
};

export default UserProfileView;