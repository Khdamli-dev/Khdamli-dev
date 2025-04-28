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
  AntDesign,
} from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "@/api/appClient";
import refreshAccessToken from "@/api/refreshAccessToken";
import {
  WorkerPrivateRequest,
  ClientPrivateRequest,
} from "../../../../Interfaces/Requestsinterfaces";

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
  REJECTED = "rejected",
}

const PrivateRequests = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>();
  const [requestIds, setRequestIds] = useState<number[]>([]);
  const [requests, setRequests] = useState<
    (WorkerPrivateRequest | ClientPrivateRequest)[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [expandedRequests, setExpandedRequests] = useState<{
    [key: number]: boolean;
  }>({});
  const [userData, setUserData] = useState<{
    username: string;
    profile_image: string;
  }>({ username: "", profile_image: "" });

  // Store current viewing request for modal access
  const [currentViewingImages, setCurrentViewingImages] = useState<string[]>(
    []
  );

  const { width: windowWidth, height: windowHeight } = Dimensions.get("window");
  const scrollViewRef = useRef<ScrollView>(null);

  // Determine if user is client or worker and get user data
  useEffect(() => {
    const getUserData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem("user");
        if (userDataString) {
          const user = JSON.parse(userDataString);
          setUserRole(user.role == 1 ? UserRole.CLIENT : UserRole.WORKER);
          setUserData({
            username: user.username || "",
            profile_image: user.profile_image || "",
          });
        }
      } catch (error) {
        console.error("Error getting user data:", error);
      }
    };

    getUserData();
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

  const toggleRequestExpansion = (id: number) => {
    setExpandedRequests((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  /*  const fetchRequests = async () => {
    setLoading(true);
    try {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        const response = await apiClient.get(`/work/job-request/`, {
          params:
            userRole == UserRole.CLIENT
              ? { client: user.id, type: 2 }
              : { worker: user.id, type: 2 },
        });
        const results: number[] = response.data.requests;
        setRequestIds(results);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        if (await refreshAccessToken()) {
          await fetchRequests();
        } else {
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

  const fetchRequestsDetails = async (requestId: number) => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (!userData) {
        router.push("/(auth)");
        return;
      }

      const user = JSON.parse(userData);
      let params = {
        role: userRole === UserRole.CLIENT ? "client" : "worker",
        request_type: "private",
      };

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
          await fetchRequestsDetails(requestId);
        } else {
          router.push("/(auth)");
        }
      } else {
        console.error(
          "Error fetching request details:",
          err.response?.data?.message || err.message
        );
        Alert.alert("Error", "Failed to fetch request details");
      }
    }
  }; */

  const handleSelectRequest = (id: number) => {
    router.push({
      pathname: "/WorkerComments",
      params: { id },
    });
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
      case RequestStatus.REJECTED:
        return <MaterialIcons name="cancel" size={24} color="red" />;
      default:
        return (
          <MaterialIcons name="hourglass-empty" size={24} color="orange" />
        );
    }
  };

  // Handle accepting request
  const handleAcceptRequest = async (id: number) => {
    try {
      await apiClient.put(`/work/job-request/${id}/state`, {
        state: RequestStatus.ACCEPTED,
      });

      // Update local state
      setRequests(
        requests.map((request) =>
          request.id === id
            ? { ...request, status: RequestStatus.ACCEPTED }
            : request
        )
      );

      Alert.alert("Success", "Request accepted successfully");
    } catch (err: any) {
      console.error("Failed to accept request:", err);
      Alert.alert("Error", "Failed to accept request");
    }
  };

  // Handle rejecting request
  const handleRejectRequest = async (id: number) => {
    try {
      await apiClient.put(`/work/job-request/${id}/state`, {
        state: RequestStatus.REJECTED,
      });

      // Update local state
      setRequests(
        requests.map((request) =>
          request.id === id
            ? { ...request, status: RequestStatus.REJECTED }
            : request
        )
      );

      Alert.alert("Success", "Request rejected successfully");
    } catch (err: any) {
      console.error("Failed to reject request:", err);
      Alert.alert("Error", "Failed to reject request");
    }
  };

  // Handle marking request as completed
  const handleMarkCompleted = async (id: number) => {
    try {
      await apiClient.put(`/work/job-request/${id}/state`, {
        state: RequestStatus.PENDING_CLIENT_VERIFICATION,
        workCompletedClaimTime: new Date().toISOString(),
      });

      // Update local state
      setRequests(
        requests.map((request) =>
          request.id === id
            ? { ...request, status: RequestStatus.PENDING_CLIENT_VERIFICATION }
            : request
        )
      );

      Alert.alert(
        "Success",
        "Request marked as completed. Waiting for client verification."
      );
    } catch (err: any) {
      console.error("Failed to mark request as completed:", err);
      Alert.alert("Error", "Failed to mark request as completed");
    }
  };

  // Handle confirming completion
  const handleConfirmCompletion = async (id: number) => {
    try {
      await apiClient.put(`/work/job-request/${id}/state`, {
        state: RequestStatus.COMPLETED,
      });

      // Update local state
      setRequests(
        requests.map((request) =>
          request.id === id
            ? { ...request, status: RequestStatus.COMPLETED }
            : request
        )
      );

      Alert.alert("Success", "Request confirmed as completed");
    } catch (err: any) {
      console.error("Failed to confirm completion:", err);
      Alert.alert("Error", "Failed to confirm completion");
    }
  };

  // Handle rejecting completion
  const handleRejectCompletion = async (id: number) => {
    try {
      await apiClient.put(`/work/job-request/${id}/state`, {
        state: RequestStatus.ACCEPTED,
      });

      // Update local state
      setRequests(
        requests.map((request) =>
          request.id === id
            ? { ...request, status: RequestStatus.ACCEPTED }
            : request
        )
      );

      Alert.alert(
        "Success",
        "Completion rejected. Request status set back to accepted."
      );
    } catch (err: any) {
      console.error("Failed to reject completion:", err);
      Alert.alert("Error", "Failed to reject completion");
    }
  };

  // Handle cancelling request
  const handleCancelRequest = async (id: number) => {
    try {
      await apiClient.put(`/work/job-request/${id}/state`, {
        state: RequestStatus.CANCELLED,
      });

      // Update local state
      setRequests(
        requests.map((request) =>
          request.id === id
            ? { ...request, status: RequestStatus.CANCELLED }
            : request
        )
      );

      Alert.alert("Success", "Request cancelled successfully");
    } catch (err: any) {
      console.error("Failed to cancel request:", err);
      Alert.alert("Error", "Failed to cancel request");
    }
  };

  /*  useEffect(() => {
    fetchRequests();
  }, [userRole]); */

  /* useEffect(() => {
    if (requestIds.length > 0) {
      // Clear previous requests when fetching new ones
      setRequests([]);
      requestIds.forEach((id) => {
        fetchRequestsDetails(id);
      });
    }
  }, [requestIds]); */

  // Render collapsed client request
  const renderCollapsedClientRequest = (item: ClientPrivateRequest) => {
    return (
      <TouchableOpacity
        onPress={() => toggleRequestExpansion(item.id)}
        className="bg-white mt-2 p-4 mb-2 rounded-lg shadow flex-row items-center"
      >
        <Image
          source={{ uri: item.worker_profile_image }}
          style={{ width: 50, height: 50 }}
          className="rounded-full mr-3"
        />
        <View className="flex-1">
          <Text className="text-lg font-medium">
            {item.worker_username || "Worker"}
          </Text>
          <View className="flex-row items-center">
            {getStatusIcon(item.status)}
            <Text className="ml-1 text-gray-600 capitalize">{item.status}</Text>
          </View>
          <Text numberOfLines={1} className="text-gray-600 mt-1">
            {item.description || "No description available"}
          </Text>
        </View>
        <AntDesign name="down" size={24} color="gray" />
      </TouchableOpacity>
    );
  };

  // Render collapsed worker request
  const renderCollapsedWorkerRequest = (item: WorkerPrivateRequest) => {
    return (
      <TouchableOpacity
        onPress={() => toggleRequestExpansion(item.id)}
        className="bg-white mt-2 p-4 mb-2 rounded-lg shadow flex-row items-center"
      >
        <Image
          source={{ uri: item.client_profile_image }}
          style={{ width: 50, height: 50 }}
          className="rounded-full mr-3"
        />
        <View className="flex-1">
          <Text className="text-lg font-medium">
            {item.client_username || "Client"}
          </Text>
          <View className="flex-row items-center">
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
          <Text numberOfLines={1} className="text-gray-600 mt-1">
            {item.description || "No description available"}
          </Text>
        </View>
        <AntDesign name="down" size={24} color="gray" />
      </TouchableOpacity>
    );
  };

  // Render expanded client view - using ClientPrivateRequest interface
  const renderExpandedClientRequest = (item: ClientPrivateRequest) => {
    return (
      <View className="bg-white mt-2 p-4 mb-4 rounded-lg shadow">
        <TouchableOpacity
          onPress={() => toggleRequestExpansion(item.id)}
          className="flex-row items-center mb-3"
        >
          <View className="items-center justify-center mr-4">
            <Image
              source={{ uri: item.worker_profile_image }}
              style={{ width: 50, height: 50 }}
              className="rounded-full"
            />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-medium">
              {item.worker_username || "Worker"}
            </Text>
            <View className="flex-row items-center mt-1">
              {getStatusIcon(item.status)}
              <Text className="ml-1 text-gray-600 capitalize">
                {item.status}
              </Text>
            </View>
          </View>
          <AntDesign name="up" size={24} color="gray" />
        </TouchableOpacity>

        <View className="flex-row justify-end mb-3">
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

          {item.status === RequestStatus.PENDING ||
          item.status === RequestStatus.ON_HOLD ? (
            <TouchableOpacity
              className="bg-red-500 w-1/2 justify-center items-center py-2 rounded-r"
              onPress={() => handleCancelRequest(item.id)}
            >
              <Text className="text-base text-white">Cancel</Text>
            </TouchableOpacity>
          ) : null}
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
                onPress={() => handleConfirmCompletion(item.id)}
              >
                <Text className="text-base text-white">Confirm Completion</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-red-500 w-1/2 justify-center items-center py-2 ml-1 rounded-r"
                onPress={() => handleRejectCompletion(item.id)}
              >
                <Text className="text-base text-white">Reject Completion</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  // Render expanded worker view - using WorkerPrivateRequest interface
  const renderExpandedWorkerRequest = (item: WorkerPrivateRequest) => {
    return (
      <View className="bg-white mt-2 p-4 mb-4 rounded-lg shadow">
        <TouchableOpacity
          onPress={() => toggleRequestExpansion(item.id)}
          className="flex-row items-center mb-3"
        >
          <View className="items-center justify-center mr-4">
            <Image
              source={{ uri: item.client_profile_image }}
              style={{ width: 50, height: 50 }}
              className="rounded-full"
            />
          </View>
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
          <AntDesign name="up" size={24} color="gray" />
        </TouchableOpacity>

        <View className="flex-row justify-end mb-3">
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

        <View className="pl-2">
          <Text className="text-base mb-1">
            <Text className="font-bold">Request Date: </Text>
            <Text className="text-green-500">{item.sent_date}</Text>
          </Text>
          <Text className="text-base mb-1">
            <Text className="font-bold">Work Address: </Text>
            <Text className="text-green-500">
              {item.client_location?.city}, {item.client_location?.region},{" "}
              {item.client_location?.country}
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
        {item.status === RequestStatus.ON_HOLD && (
          <View className="flex-row mt-2">
            <TouchableOpacity
              className="bg-green-600 w-1/2 items-center justify-center py-3 mr-1 rounded-l"
              onPress={() => handleAcceptRequest(item.id)}
            >
              <Text className="text-base text-white">Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-red-600 w-1/2 items-center justify-center py-3 ml-1 rounded-r"
              onPress={() => handleRejectRequest(item.id)}
            >
              <Text className="text-base text-white">Reject</Text>
            </TouchableOpacity>
          </View>
        )}

        {item.status === RequestStatus.ACCEPTED && (
          <TouchableOpacity
            className="bg-blue-500 items-center justify-center py-3 mt-3 rounded"
            onPress={() => handleMarkCompleted(item.id)}
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
      </View>
    );
  };

  // Main render for item
  const renderItem = ({ item }: { item: any }) => {
    const isExpanded = expandedRequests[item.id] || false;

    if (userRole === UserRole.CLIENT) {
      return isExpanded
        ? renderExpandedClientRequest(item as ClientPrivateRequest)
        : renderCollapsedClientRequest(item as ClientPrivateRequest);
    } else {
      return isExpanded
        ? renderExpandedWorkerRequest(item as WorkerPrivateRequest)
        : renderCollapsedWorkerRequest(item as WorkerPrivateRequest);
    }
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
            renderItem={renderItem}
            contentContainerStyle={{ padding: 10 }}
            ListEmptyComponent={
              <View className="items-center justify-center p-10">
                <Text className="text-lg text-gray-500">
                  No private requests available
                </Text>
              </View>
            }
          />
        )}

        {/* Improved image modal with better centering */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={imageModalVisible}
          onRequestClose={() => setImageModalVisible(false)}
        >
          <View className="flex-1 bg-black bg-opacity-90 justify-center items-center">
            <TouchableOpacity
              className="absolute top-10 right-5 z-10"
              onPress={() => setImageModalVisible(false)}
            >
              <Ionicons name="close-circle" size={40} color="white" />
            </TouchableOpacity>

            {/* Centered scrollable image view */}
            <View
              style={{
                height: windowHeight * 0.7,
                width: windowWidth,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
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
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Image
                      key={`image-${idx}`}
                      source={{ uri: imgUrl }}
                      style={{
                        width: windowWidth * 0.85,
                        height: windowHeight * 0.6,
                        borderRadius: 8,
                      }}
                      resizeMode="contain"
                    />
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Image pagination indicators */}
            <View className="flex-row mt-4">
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
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: selectedImage === index ? "white" : "gray",
                    marginHorizontal: 4,
                  }}
                />
              ))}
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PrivateRequests;
