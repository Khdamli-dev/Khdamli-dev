import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Modal,
  Dimensions,
  SafeAreaView,
  KeyboardAvoidingView,
  FlatList,
  Platform,
  Alert,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import {
  MaterialCommunityIcons,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { router } from "expo-router";
import axios from "axios";
// Import the interfaces from your interfaces file
import {
  WorkerPublicRequest,
  ClientPublicRequest,
} from "../../../../Interfaces/Requestsinterfaces";
import CONFIG from "@/config";
import apiClient from "@/api/appClient";
import refreshAccessToken from "@/api/refreshAccessToken";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define the UserRole enum
enum UserRole {
  CLIENT = "client",
  WORKER = "worker",
}

// Define the RequestStatus enum
enum RequestStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  ON_HOLD = "on_hold",
  PENDING_CLIENT_VERIFICATION = "pending_client_verification",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

// Default placeholder image for missing profile images
const defaultProfileImage = require("../../../../assets/images/images (1).jpg");

const PublicRequest = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>();
  const [requestIds, setRequestIds] = useState<number[]>([1]);
  const [requests, setRequests] = useState<
    (WorkerPublicRequest | ClientPublicRequest)[]
  >([
    {
      id: 1,
      category: "Plumbing",
      location: {
        city: "Tunis",
        region: "Tunis",
        country: "Tunisia",
      },
      sent_date: "2025-04-15T10:00:00Z",
      work_date: "2025-04-20T09:00:00Z",
      description: "Leaky pipe under kitchen sink",
      media: [
        {
          type: "Photo",
          url: "https://example.com/pipe.jpg",
        },
      ],
      payment_method: "Cash",
      status: "On Hold",
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [expandedRequestId, setExpandedRequestId] = useState<number | null>(
    null
  );
  const [userData, setUserData] = useState<{
    username: string;
    profile_image: string;
  }>({
    username: "",
    profile_image: "",
  });

  // Store current viewing request for modal access
  const [currentViewingImages, setCurrentViewingImages] = useState<string[]>(
    []
  );

  const { width: windowWidth, height: windowHeight } = Dimensions.get("window");
  const scrollViewRef = useRef<ScrollView>(null);

  // Determine if user is client or worker and get user data
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const userDataStr = await AsyncStorage.getItem("user");
        if (userDataStr) {
          const user = JSON.parse(userDataStr);
          setUserRole(user.role == 1 ? UserRole.CLIENT : UserRole.WORKER);
          setUserData({
            username: user.username || "",
            profile_image: user.profile_image || "",
          });
        }
      } catch (error) {
        console.error("Error getting user info:", error);
      }
    };

    getUserInfo();
  }, []);

  useEffect(() => {
    if (imageModalVisible && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: windowWidth * selectedImage,
          animated: false,
        });
      }, 50);
    }
  }, [imageModalVisible, selectedImage, windowWidth]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        const response = await apiClient.get(`/work/job-request/`, {
          params:
            userRole == UserRole.CLIENT
              ? { client: user.id, type: 1 }
              : { worker: user.id, type: 1 },
        });
        const results: number[] = response.data.requests;
        setRequestIds(results); // Filter out any null results
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        if (await refreshAccessToken()) {
          await fetchRequests();
        } else {
          // need to login
          router.push("/(auth)");
        }
      } else {
        console.error(
          "Error fetching requests:",
          err.response?.data?.message || err.message
        );
        Alert.alert("Error", "Failed to fetch requests");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRequestsDetails = async (
    requestId: number,
    worker_id?: number
  ) => {
    try {
      const userData = await AsyncStorage.getItem("user");
      const user = JSON.parse(userData || "");
      let params: { role: string; request_type: string; worker_id?: number };
      if (userRole === UserRole.CLIENT) {
        params = { role: "client", request_type: "public" };
      } else {
        params = { role: "worker", request_type: "public", worker_id: user.id };
      }
      const response = await apiClient.get(`/work/job-request/${requestId}`, {
        params,
      });
      const result = response.data.request;
      // Update the specific request rather than appending to the array
      setRequests((prev) => {
        // Check if this item already exists in the array
        if (prev.some((request) => request.id === result.id)) {
          return prev; // Don't add duplicate
        }
        return [...prev, result];
      });
    } catch (err: any) {
      if (err.response?.status === 401) {
        if (await refreshAccessToken()) {
          await fetchRequestsDetails(requestId, worker_id); // why we use like this the same function under it's selfe?
        } else {
          // need to login
          router.push("/(auth)"); // we have to review this push or replace ?
        }
      }
      console.error("Error fetching request details:", err.response?.data);
      alert("Error fetching request details");
    }
  };

  const handleSelectRequest = (id: number) => {
    router.push({
      pathname: "/WorkerComments",
      params: { id },
    });
  };

  const toggleExpandRequest = (id: number) => {
    setExpandedRequestId(expandedRequestId === id ? null : id);
  };

  const handleOpenImageModal = (images: string[], initialIndex: number) => {
    setCurrentViewingImages(images);
    setSelectedImage(initialIndex);
    setImageModalVisible(true);
  };

  // Get status icon based on request status
  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case RequestStatus.ACCEPTED:
        return <MaterialIcons name="check-circle" size={24} color="green" />;
      case RequestStatus.ON_HOLD:
        return (
          <MaterialIcons name="hourglass-empty" size={24} color="orange" />
        );
      case RequestStatus.PENDING_CLIENT_VERIFICATION:
        return <MaterialIcons name="pending-actions" size={24} color="blue" />;
      case RequestStatus.COMPLETED:
        return <MaterialIcons name="verified" size={24} color="blue" />;
      default:
        return (
          <MaterialIcons name="hourglass-empty" size={24} color="orange" />
        );
    }
  };

  // Truncate text to specified length
  const truncateText = (text: string | undefined, maxLength: number) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  useEffect(() => {
    fetchRequests();
  }, [userRole]);

  useEffect(() => {
    if (requestIds.length > 0) {
      // Clear previous requests when fetching new ones
      setRequests([]);
      requestIds.forEach((id) => {
        fetchRequestsDetails(id); // we have to add the functionnality of press
      });
    }
  }, [requestIds]);

  // Render client collapsed view
  const renderClientCollapsedView = (item: ClientPublicRequest) => {
    return (
      <TouchableOpacity
        onPress={() => toggleExpandRequest(item.id)}
        className="bg-white mt-2 p-4 mb-4 rounded-lg shadow"
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center flex-1">
            <Image
              source={
                userData.profile_image
                  ? { uri: userData.profile_image }
                  : defaultProfileImage
              }
              className="w-12 h-12 rounded-full mr-3"
            />
            <View className="flex-1">
              <Text className="font-medium">
                {userData.username || "Your Request"}
              </Text>
              <Text numberOfLines={1} className="text-gray-500">
                {truncateText(item.description, 40)}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center">
            {getStatusIcon(item.status)}
            <Text className="ml-1 text-gray-600 text-sm capitalize">
              {item.status}
            </Text>
            <MaterialIcons
              name={
                expandedRequestId === item.id ? "expand-less" : "expand-more"
              }
              size={24}
              color="#888"
              style={{ marginLeft: 5 }}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Render worker collapsed view
  const renderWorkerCollapsedView = (item: WorkerPublicRequest) => {
    return (
      <TouchableOpacity
        onPress={() => toggleExpandRequest(item.id)}
        className="bg-white mt-2 p-4 mb-4 rounded-lg shadow"
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center flex-1">
            <Image
              source={
                item.client_profile_image
                  ? { uri: item.client_profile_image }
                  : defaultProfileImage
              }
              className="w-12 h-12 rounded-full mr-3"
            />
            <View className="flex-1">
              <Text className="font-medium">
                {item.client_username || "Client"}
              </Text>
              <Text numberOfLines={1} className="text-gray-500">
                {truncateText(item.description, 40)}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center">
            {getStatusIcon(item.status)}
            <Text className="ml-1 text-gray-600 text-sm capitalize">
              {item.status}
            </Text>
            <MaterialIcons
              name={
                expandedRequestId === item.id ? "expand-less" : "expand-more"
              }
              size={24}
              color="#888"
              style={{ marginLeft: 5 }}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Render client view - using ClientPublicRequest interface
  const renderClientRequest = (item: ClientPublicRequest) => {
    const isExpanded = expandedRequestId === item.id;

    if (!isExpanded) {
      return renderClientCollapsedView(item);
    }

    return (
      <View className="bg-white mt-2 p-4 mb-4 rounded-lg shadow">
        <TouchableOpacity
          onPress={() => toggleExpandRequest(item.id)}
          className="mb-3"
        >
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Image
                source={
                  userData.profile_image
                    ? { uri: userData.profile_image }
                    : defaultProfileImage
                }
                className="w-12 h-12 rounded-full mr-3"
              />
              <View>
                <Text className="font-medium">
                  {userData.username || "Your Request"}
                </Text>
                <Text numberOfLines={1} className="text-gray-500">
                  {truncateText(item.description, 40)}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center">
              {getStatusIcon(item.status)}
              <Text className="ml-1 text-gray-600 text-sm capitalize">
                {item.status}
              </Text>
              <MaterialIcons
                name="expand-less"
                size={24}
                color="#888"
                style={{ marginLeft: 5 }}
              />
            </View>
          </View>
        </TouchableOpacity>

        <View>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-lg font-medium">Request Details:</Text>
          </View>

          <View className="pl-2">
            <Text className="text-base mb-1">
              <Text className="font-bold">Date Request: </Text>
              <Text className="text-green-500">{item.sent_date}</Text>
            </Text>
            <Text className="text-base mb-1">
              <Text className="font-bold">Work time: </Text>
              <Text className="text-green-500">{item.work_date}</Text>
            </Text>
            <Text className="text-base mb-1">
              <Text className="font-bold">Address: </Text>
              <Text className="text-green-500">
                {item.location?.city}, {item.location?.region},{" "}
                {item.location?.country}
              </Text>
            </Text>
            <Text className="text-base mb-1">
              <Text className="font-bold">Category: </Text>
              <Text className="text-green-500">{item.category}</Text>
            </Text>
            <Text className="text-base mb-1">
              <Text className="font-bold">About Service: </Text>
              <Text className="text-green-500">{item.description}</Text>
            </Text>
            <Text className="text-base mb-1">
              <Text className="font-bold">Payment Method: </Text>
              <Text className="text-green-500">{item.payment_method}</Text>
            </Text>
          </View>
        </View>

        <View className="mt-4">
          <Text className="text-lg font-medium mb-2">Request Images:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-3"
          >
            {item.media && item.media.length > 0 ? (
              item.media.map((img, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => {
                    handleOpenImageModal(
                      item.media.map((m) => m.url),
                      idx
                    );
                  }}
                  className="mr-2"
                >
                  <Image
                    source={{ uri: img.url }}
                    className="w-24 h-24 rounded"
                  />
                </TouchableOpacity>
              ))
            ) : (
              <Text className="italic text-gray-500">No images available</Text>
            )}
          </ScrollView>
        </View>

        <View className="flex-row py-2 mt-2">
          <TouchableOpacity
            onPress={() => handleSelectRequest(item.id)}
            className="bg-green-500 w-1/2 justify-center items-center py-2 rounded-l"
          >
            <Text className="text-base text-white">Comments</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-red-500 w-1/2 justify-center items-center py-2 rounded-r"
            onPress={() => console.log("Cancel request")}
          >
            <Text className="text-base text-white">Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Client verification section - when job is marked as completed by worker */}
        {item.status === RequestStatus.PENDING_CLIENT_VERIFICATION && (
          <View className="mt-3">
            <Text className="text-base text-blue-600 mb-2">
              Worker has marked this job as completed.
            </Text>
            <View className="flex-row">
              <TouchableOpacity
                className="bg-green-500 w-1/2 justify-center items-center py-2 mr-1 rounded-l"
                onPress={() => console.log("Confirm completion")}
              >
                <Text className="text-base text-white">Confirm Completion</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-red-500 w-1/2 justify-center items-center py-2 ml-1 rounded-r"
                onPress={() => console.log("Reject completion")}
              >
                <Text className="text-base text-white">Reject Completion</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  // Render worker view - using WorkerPublicRequest interface
  const renderWorkerRequest = (item: WorkerPublicRequest) => {
    const isExpanded = expandedRequestId === item.id;

    if (!isExpanded) {
      return renderWorkerCollapsedView(item);
    }

    return (
      <View className="bg-white mt-3 mb-4 p-4 rounded-lg shadow">
        <TouchableOpacity
          onPress={() => toggleExpandRequest(item.id)}
          className="mb-3"
        >
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Image
                source={
                  item.client_profile_image
                    ? { uri: item.client_profile_image }
                    : defaultProfileImage
                }
                className="w-12 h-12 rounded-full mr-3"
              />
              <View>
                <Text className="font-medium">
                  {item.client_username || "Client"}
                </Text>
                <Text numberOfLines={1} className="text-gray-500">
                  {truncateText(item.description, 40)}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center">
              {getStatusIcon(item.status)}
              <Text className="ml-1 text-gray-600 text-sm capitalize">
                {item.status}
              </Text>
              <MaterialIcons
                name="expand-less"
                size={24}
                color="#888"
                style={{ marginLeft: 5 }}
              />
            </View>
          </View>
        </TouchableOpacity>

        <View className="flex-row mb-3">
          <View className="flex-1">
            <Text className="text-lg font-medium">
              {item.client_username || "Client"}
            </Text>
            <View className="flex-row items-center mt-1">
              {getStatusIcon(item.status)}
              <Text className="ml-1 text-gray-600 capitalize">
                {item.status === RequestStatus.ON_HOLD
                  ? "On Hold"
                  : item.status === RequestStatus.PENDING_CLIENT_VERIFICATION
                    ? "Pending Verification"
                    : item.status === RequestStatus.COMPLETED
                      ? "Completed"
                      : item.status === RequestStatus.ACCEPTED
                        ? "Accepted"
                        : item.status || "On Hold"}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center">
            <TouchableOpacity className="mr-2">
              <Ionicons name="call" size={30} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity>
              <MaterialCommunityIcons
                name="message-text-outline"
                size={30}
                color="#000"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View className="pl-2">
          <Text className="text-base mb-1">
            <Text className="font-bold">Request Date: </Text>
            <Text className="text-green-500">{item.post_date}</Text>
          </Text>
          <Text className="text-base mb-1">
            <Text className="font-bold">Work Address: </Text>
            <Text className="text-green-500">
              {item.location?.city}, {item.location?.region},{" "}
              {item.location?.country}
            </Text>
          </Text>
          <Text className="text-base mb-1">
            <Text className="font-bold">Category: </Text>
            <Text className="text-green-500">{item.category}</Text>
          </Text>
          <Text className="text-base mb-1">
            <Text className="font-bold">About Service: </Text>
            <Text className="text-green-500">{item.description}</Text>
          </Text>
          {item.worker_comment && (
            <Text className="text-base mb-1">
              <Text className="font-bold">Your Comment: </Text>
              <Text className="text-green-500">{item.worker_comment}</Text>
            </Text>
          )}
          {item.comment_date && (
            <Text className="text-base mb-1">
              <Text className="font-bold">Comment Date: </Text>
              <Text className="text-green-500">{item.comment_date}</Text>
            </Text>
          )}
          <Text className="text-base mb-1">
            <Text className="font-bold">Payment Method: </Text>
            <Text className="text-green-500">{item.payment_method}</Text>
          </Text>
        </View>

        <View className="mt-4">
          <Text className="text-lg font-medium mb-2">Request Images:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-3"
          >
            {item.media && item.media.length > 0 ? (
              item.media.map((img, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => {
                    handleOpenImageModal(
                      item.media.map((m) => m.url),
                      idx
                    );
                  }}
                  className="mr-2"
                >
                  <Image
                    source={{ uri: img.url }}
                    className="w-24 h-24 rounded"
                  />
                </TouchableOpacity>
              ))
            ) : (
              <Text className="italic text-gray-500">No images available</Text>
            )}
          </ScrollView>
        </View>

        {/* Action buttons based on status */}
        {item.status === RequestStatus.ACCEPTED && (
          <TouchableOpacity
            className="bg-blue-500 items-center justify-center py-3 mt-3 rounded"
            onPress={() => console.log("Mark as completed")}
          >
            <Text className="text-base text-white">Mark as Completed</Text>
          </TouchableOpacity>
        )}

        {/* For PENDING_CLIENT_VERIFICATION requests - Worker sees waiting status */}
        {item.status === RequestStatus.PENDING_CLIENT_VERIFICATION && (
          <View className="bg-yellow-100 border border-yellow-400 items-center justify-center py-3 mt-3 rounded">
            <Text className="text-base text-yellow-800">
              Waiting for client confirmation
            </Text>
          </View>
        )}

        {/* For COMPLETED requests - Worker sees completed status */}
        {item.status === RequestStatus.COMPLETED && (
          <View className="bg-green-100 border border-green-400 items-center justify-center py-3 mt-3 rounded">
            <Text className="text-base text-green-800">
              Job completed and verified by client
            </Text>
          </View>
        )}

        {/* Comments button */}
        <TouchableOpacity
          className="bg-green-600 items-center justify-center py-3 mt-3 rounded"
          onPress={() => handleSelectRequest(item.id)}
        >
          <Text className="text-base text-white">View Comments</Text>
        </TouchableOpacity>

        {/* Delete button */}
        <TouchableOpacity
          className="bg-red-600 items-center justify-center py-3 mt-3 rounded"
          onPress={() => console.log("Delete request")}
        >
          <Text className="text-base text-white">Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-lg">Loading requests...</Text>
          </View>
        ) : (
          <FlatList
            data={requests}
            keyExtractor={(item: any) => item.id?.toString()}
            renderItem={({ item }: { item: any }) =>
              userRole === UserRole.CLIENT
                ? renderClientRequest(item as ClientPublicRequest)
                : renderWorkerRequest(item as WorkerPublicRequest)
            }
            contentContainerStyle={{ padding: 10 }}
            ListEmptyComponent={
              <View className="items-center justify-center p-10">
                <Text className="text-lg text-gray-500">
                  No public requests available
                </Text>
              </View>
            }
          />
        )}

        {/* Improved centered image modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={imageModalVisible}
          onRequestClose={() => setImageModalVisible(false)}
        >
          <View className="flex-1 bg-black bg-opacity-95 justify-center items-center">
            <TouchableOpacity
              className="absolute top-10 right-5 z-10"
              onPress={() => setImageModalVisible(false)}
            >
              <Ionicons name="close-circle" size={40} color="white" />
            </TouchableOpacity>

            <View className="w-full h-2/3 justify-center items-center">
              <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                  const newIndex = Math.round(
                    e.nativeEvent.contentOffset.x / windowWidth
                  );
                  setSelectedImage(newIndex);
                }}
                className="flex-grow"
                contentContainerStyle={{
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {currentViewingImages?.map((imgUrl, idx) => (
                  <View
                    key={`image-container-${idx}`}
                    style={{
                      width: windowWidth,
                      height: windowHeight * 0.6,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Image
                      key={`image-${idx}`}
                      source={{ uri: imgUrl }}
                      style={{
                        width: windowWidth * 0.9,
                        height: windowHeight * 0.5,
                      }}
                      resizeMode="contain"
                    />
                  </View>
                ))}
              </ScrollView>
            </View>

            <View className="flex-row mt-4 mb-12 items-center justify-center">
              {currentViewingImages?.map((_, index) => (
                <TouchableOpacity
                  key={`dot-${index}`}
                  onPress={() => {
                    setSelectedImage(index);
                    if (scrollViewRef.current) {
                      scrollViewRef.current.scrollTo({
                        x: windowWidth * index,
                        animated: true,
                      });
                    }
                  }}
                  className={`w-3 h-3 rounded-full mx-1 ${
                    selectedImage === index ? "bg-white" : "bg-gray-500"
                  }`}
                />
              ))}
            </View>

            <View className="absolute bottom-10 flex-row justify-center w-full">
              <Text className="text-white text-center">
                {selectedImage + 1} / {currentViewingImages?.length}
              </Text>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PublicRequest;
