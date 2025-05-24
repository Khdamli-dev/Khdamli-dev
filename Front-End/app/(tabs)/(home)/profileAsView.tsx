import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import {
  Calendar,
  MapPin,
  Globe,
  User,
  MoreHorizontal,
  CheckCircle,
} from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "@/api/appClient";
import { AntDesign } from "@expo/vector-icons";
import refreshAccessToken from "@/api/refreshAccessToken";

interface ProfileItemProps {
  label: string;
  value: React.ReactNode;
  Icon?: React.ComponentType<{ size: number; color: string }>;
}

const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabButtonActive: {
    borderBottomColor: "#22C55E",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
    marginTop: 4,
  },
  tabTextActive: {
    color: "#22C55E",
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  statLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
});

const UserProfileView = () => {
  const { status, requestId, userId, userRole, origin } = useLocalSearchParams();
  
  const [activeTab, setActiveTab] = useState("about");
  const [user, setUser] = useState<{
    fullName: string | null;
    registration_date: string | null;
    image: string | null;
    region: string | null;
    city: string | null;
    accountType: string | null;
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
    image: null,
    region: null,
    city: null,
    accountType: null,
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

        const endpoint = `/users/client/${userId}`;
        const response = await apiClient.get(`${endpoint}`);

        if (Number(userRole) === 1) {
          // Client data
          const clientData = {
            fullName: response.data.client.username,
            image: response.data.client.profile_image,
            registration_date: response.data.client.registration_date,
            age: response.data.client.age,
            gender: response.data.client.sex,
            region: response.data.client.location.region,
            city: response.data.client.location.city,
            accountType: "client",
            bio: null,
            workingDays: null,
            paymentMethod: null,
            category: null,
            gallery: null,
            sentRequests: null,
            completedRequests: null,
          };

          setUser(clientData);
        } else {
          // Worker data
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
        }
      } catch (error) {
        console.error("Failed to fetch user data", error);
      }
    };

    fetchUserData();
  }, [userId]);

  // Profile item component - read-only version
  const ProfileItem = ({ label, value, Icon }: ProfileItemProps) => (
    <View style={{
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: "#F9FAFB",
    }}>
      {Icon && (
        <View style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: "#F0FDF4",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
        }}>
          <Icon size={20} color="#22C55E" />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 15,
          color: "#6B7280",
          marginBottom: 2,
        }}>
          {label}
        </Text>
        <Text style={{
          fontSize: 16,
          fontWeight: "600",
          color: "#111827",
          fontFamily: "Itim_400Regular"
        }}>
          {value || "Not specified"}
          {label === "Age" && value ? " years old" : null}
        </Text>
      </View>
    </View>
  );
  const handleSendPrivateRequest = () => {
    router.push({
      pathname: "/(tabs)/(home)/createRequest",
      params: { type: "2" },
    });
  };
  const handleNavigatetoclientprofiele = (clientId: string) => {
    console.log(`Navigate to client: ${clientId}`);
    router.push({
      pathname: "/profileAsView",
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
          onPress={() => {
            switch (origin) {
              case "home": {
                router.back();
                break;
              }
              case "publicRequest": {
                router.back();
                router.replace(
                  "/(tabs)/(requests)/(clientrequest)/ClientRequest"
                );
                break;
              }
              case "privateRequest": {
                router.back();
                router.replace("/(tabs)/(requests)/(clientrequest)/Private");
                break;
              }
              case "workerComments": {
                router.back();
                router.replace({
                  pathname: "/(tabs)/(requests)/(comment)/WorkerComments",
                  params: { requestId, status, workerId: userId },
                });
                break;
              }

              default: {
                router.back();
                break;
              }
            }
          }}
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
              {user.bio ? user.bio : "The bio is not entered"}
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
            {user.workingDays && user.workingDays.length > 0 ? (
              user.workingDays.map((item, index) => (
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
              ))
            ) : (
              <Text
                className="text-center mt-2 text-[16px]"
                style={{ fontFamily: "Itim_400Regular" }}
              >
                No working days entered
              </Text>
            )}
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

              <ProfileItem
                label="Account Type"
                value="Client"
                Icon={(props) => <User {...props} />}
              />
              <ProfileItem
                label="Age"
                value={user.age}
                Icon={(props) => <User {...props} />}
              />
              <ProfileItem
                label="Gender"
                value={user.gender}
                Icon={(props) => <User {...props} />}
              />
              <ProfileItem
                label="Location"
                value={`${user.city}, ${user.region}`}
                Icon={(props) => <MapPin {...props} />}
              />
              <ProfileItem
                label="Member since"
                value={user.registration_date ? user.registration_date.split("T")[0] : ""}
                Icon={(props) => <Calendar {...props} />}
              />
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* Header with Back Button */}
      <View style={{
        backgroundColor: "white",
        paddingTop: 50,
        paddingHorizontal: 16,
        paddingBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
      }}>
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <TouchableOpacity
            onPress={() => {
                  router.back();
              }
            }
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#F3F4F6",
              alignItems: "center",
              justifyContent: "center",
            }}
            activeOpacity={0.7}
          >
            <AntDesign name="left" size={20} color="#374151" />
          </TouchableOpacity>
          
          <Text style={{
            fontSize: 18,
            fontWeight: "600",
            color: "#111827",
          }}>
            {user.fullName}
          </Text>
          
          <TouchableOpacity style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "#F3F4F6",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <MoreHorizontal size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Header - Instagram Style */}
      <View style={{ backgroundColor: "white", paddingBottom: 16 }}>
        {/* Profile Image and Stats */}
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingTop: 20,
          paddingBottom: 16,
        }}>
          {/* Profile Image */}
          <View style={{ position: "relative", marginRight: 20 }}>
            <Image
              source={{
                uri: user.image ?? "https://cdn-icons-png.flaticon.com/512/149/149071.png",
              }}
              style={{
                width: 90,
                height: 90,
                borderRadius: 45,
                borderWidth: 3,
                borderColor: "#22C55E",
              }}
            />
            {/* Verified Badge */}
            <View style={{
              position: "absolute",
              bottom: 2,
              right: 2,
              backgroundColor: "#22C55E",
              width: 24,
              height: 24,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 2,
              borderColor: "white",
            }}>
              <CheckCircle size={16} color="white" />
            </View>
          </View>

          {/* Stats */}
          <View style={{ flex: 1 }}>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Name and Info */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
            <Text style={{
              fontSize: 16,
              fontWeight: "700",
              color: "#111827",
              fontFamily: "Itim_400Regular"
            }}>
              {user.fullName}
            </Text>
            <View style={{
              backgroundColor: "#22C55E",
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 12,
              marginLeft: 8,
            }}>
              <Text style={{
                color: "white",
                fontSize: 11,
                fontWeight: "600",
              }}>
                CLIENT
              </Text>
            </View>
          </View>
          
          <Text style={{
            fontSize: 13,
            color: "#6B7280",
            marginTop: 4,
          }}>
            📍 {user.city}, {user.region}
          </Text>
          
          {user.registration_date && (
            <Text style={{
              fontSize: 13,
              color: "#6B7280",
              marginTop: 2,
            }}>
              🗓️ Member since {user.registration_date.split("T")[0]}
            </Text>
          )}
        </View>

        {/* Navigation Tabs */}
        <View style={{
          flexDirection: "row",
          borderTopWidth: 1,
          borderTopColor: "#F3F4F6",
        }}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "about" && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab("about")}
          >
            <User
              size={20}
              color={activeTab === "about" ? "#22C55E" : "#6B7280"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "about" && styles.tabTextActive,
              ]}
            >
              About
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Content */}
      {renderTabContent()}
    </ScrollView>
  );
};

export default UserProfileView;