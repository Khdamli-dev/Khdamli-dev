import {
  View,
  Text,
  TouchableOpacity,
  Image,
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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CONFIG from "@/config";
import {
  RequestOnWorker,
  RequestOnClient,
  UserRole,
} from "../../../../Interfaces/Requestsinterfaces";

// Union type for requests as defined in your types file
type Request = RequestOnWorker | RequestOnClient;

const PrivateRequests = () => {
  const [privateRequests, setPrivateRequests] = useState<Request[]>([
    // Example for RequestOnWorker (shown to a worker)
    {
      id: 1,
      category: "Plumbing",
      location: "123 Main St, Springfield",
      RequestDate: "2025-04-20",
      WorkDate: "2025-04-22",
      WorkTime: "14:00",
      payment: "Credit Card",
      AboutService: "Plumbing repair for kitchen sink",
      canceled: false,
      service: "Plumbing",
      sent_time: "2025-04-20 10:30",
      images: ["image1.jpg", "image2.jpg"],
      username_Client: "John Doe",
      client_profile_image: "profile1.jpg",
      status: "onhold",
    },

    // Example for RequestOnClient (shown to a client)
    {
      id: 2,
      category: "Electrical",
      location: "456 Oak Ave, Shelbyville",
      RequestDate: "2025-04-19",
      WorkDate: "2025-04-23",
      WorkTime: "09:00",
      payment: "Cash",
      AboutService: "Electrical wiring for new light fixtures",
      canceled: false,
      service: "Electrical",
      sent_time: "2025-04-19 15:45",
      images: ["image3.jpg", "image4.jpg"],
      username_Worker: "Khalil",
      worker_profile_image: "profile2.jpg",
      worker_comment: "I'll bring all necessary equipment",
      workStartedTime: "2025-04-23 09:15",
      status: "accepted",
    },

    // Another example for RequestOnClient (pending verification)
    {
      id: 3,
      category: "Painting",
      location: "789 Pine Rd, Capital City",
      RequestDate: "2025-04-18",
      WorkDate: "2025-04-21",
      WorkTime: "11:00",
      payment: "Bank Transfer",
      AboutService: "Painting living room walls",
      canceled: false,
      service: "Painting",
      sent_time: "2025-04-18 08:20",
      images: ["image5.jpg", "image6.jpg"],
      username_Worker: "Khalil",
      worker_profile_image: "profile2.jpg",
      workStartedTime: "2025-04-21 11:05",
      workCompletedClaimTime: "2025-04-21 14:30",
      status: "pending_client_verification",
    },
  ]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.WORKER);
  const scrollViewRef = useRef<ScrollView>(null);
  const { width: windowWidth } = Dimensions.get("window");

  const fetchPrivateRequests = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (!userData) {
        console.log("No user data found in AsyncStorage");
        return;
      }

      const user = JSON.parse(userData);
      setUserRole(user.role);

      const params =
        user.role === UserRole.CLIENT
          ? { client: user.id }
          : user.role === UserRole.WORKER
            ? { worker: user.id }
            : {};

      const response = await axios.get(`${CONFIG.API_URL}/work/job-request/`, {
        params,
      });

      const requests: Request[] = response.data.requests || [];
      const requestsWithStatus = await Promise.all(
        requests.map(async (request) => {
          const status = await getRequestState(request.id);
          return { ...request, status };
        })
      );

      setPrivateRequests(
        requestsWithStatus.filter((req) => req.status !== "rejected")
      );
    } catch (err) {
      console.error("ERROR FETCHING DATA", err);
      Alert.alert("Error", "Error fetching request data");
    }
  };

  const getRequestState = async (requestId: number): Promise<string> => {
    try {
      const response = await axios.get(
        `${CONFIG.API_URL}/work/job-request/${requestId}/state`
      );
      return response.data.state || "unknown";
    } catch (err) {
      console.error("Error fetching request state", err);
      Alert.alert("Error", "Error fetching request state");
      return "unknown";
    }
  };

  const updateRequestStatus = async (requestId: number, newStatus: string) => {
    try {
      // Prepare the data to send
      const updateData: any = { state: newStatus };

      // Add timestamps for specific status changes
      if (newStatus === "accepted") {
        updateData.workStartedTime = new Date().toISOString();
      } else if (newStatus === "pending_client_verification") {
        updateData.workCompletedClaimTime = new Date().toISOString();
      }

      // Send the update to the server
      await axios.put(
        `${CONFIG.API_URL}/work/job-request/${requestId}/state`,
        updateData
      );

      // Update local state
      setPrivateRequests(
        privateRequests.map((request) =>
          request.id === requestId
            ? {
                ...request,
                status: newStatus,
                ...(newStatus === "accepted" && {
                  workStartedTime: new Date().toISOString(),
                }),
                ...(newStatus === "pending_client_verification" && {
                  workCompletedClaimTime: new Date().toISOString(),
                }),
              }
            : request
        )
      );

      // Show appropriate alert based on status
      if (newStatus === "pending_client_verification") {
        Alert.alert(
          "Completion Request Sent",
          "The client has been notified to verify that the work is complete."
        );
      } else if (newStatus === "completed") {
        Alert.alert("Success", "The job has been marked as completed.");
      } else {
        Alert.alert(
          "Success",
          `Request has been ${getStatusLabel(newStatus).toLowerCase()}`
        );
      }
    } catch (err) {
      console.error("Error updating request status", err);
      Alert.alert("Error", "Failed to update request status");
    }
  };

  // Action handler functions
  const handleAcceptRequest = (requestId: number) => {
    updateRequestStatus(requestId, "accepted");
  };

  const handleRejectRequest = (requestId: number) => {
    updateRequestStatus(requestId, "rejected");
  };

  const handleMarkAsCompleted = (requestId: number) => {
    Alert.alert(
      "Mark Job as Completed",
      "Are you sure you want to mark this job as completed? This will notify the client to verify the completion.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Mark Completed",
          onPress: () =>
            updateRequestStatus(requestId, "pending_client_verification"),
        },
      ]
    );
  };

  const handleVerifyCompletion = (requestId: number) => {
    Alert.alert(
      "Verify Job Completion",
      "Please confirm that the work has been completed satisfactorily.",
      [
        {
          text: "Not Complete",
          style: "destructive",
          onPress: () => {
            updateRequestStatus(requestId, "accepted");
            Alert.alert(
              "Notification Sent",
              "The worker has been notified that the job is not complete."
            );
          },
        },
        {
          text: "Verify Completion",
          style: "default",
          onPress: () => updateRequestStatus(requestId, "completed"),
        },
      ]
    );
  };

  const handleCancelRequest = (requestId: number) => {
    Alert.alert(
      "Cancel Request",
      "Are you sure you want to cancel this request?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => updateRequestStatus(requestId, "cancelled"),
        },
      ]
    );
  };

  // Helper function to get status display label
  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "onhold":
        return "Pending";
      case "accepted":
        return "In Progress";
      case "pending_client_verification":
        return "Awaiting Client Verification";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  // Helper function to get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "onhold":
        return "text-gray-600";
      case "accepted":
        return "text-green-600";
      case "pending_client_verification":
        return "text-yellow-600";
      case "completed":
        return "text-blue-600";
      case "cancelled":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  // Format timestamps to a readable format
  const formatTime = (timestamp: string | undefined) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
  };

  // ImageViewer component for viewing request images
  const ImageViewer = ({
    visible,
    images,
    initialIndex = 0,
    onClose,
  }: {
    visible: boolean;
    images: any[];
    initialIndex?: number;
    onClose: () => void;
  }) => {
    const [selectedImage, setSelectedImage] = useState(initialIndex);

    useEffect(() => {
      if (visible && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          x: windowWidth * selectedImage,
          animated: false,
        });
      }
    }, [visible, selectedImage]);

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <View className="flex-1 bg-black/90 justify-center">
          <TouchableOpacity
            className="absolute top-10 right-5 z-10"
            onPress={onClose}
          >
            <Ionicons name="close-circle" size={40} color="white" />
          </TouchableOpacity>

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
          >
            {images.map((img, idx) => (
              <View
                key={idx}
                style={{
                  width: windowWidth,
                  height: "70%",
                  justifyContent: "center",
                }}
              >
                <Image
                  source={img}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>

          <View className="flex-row mt-4 justify-center">
            {images.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedImage(index)}
                className={`w-3 h-3 rounded-full mx-1 ${
                  selectedImage === index ? "bg-white" : "bg-gray-600"
                }`}
              />
            ))}
          </View>
        </View>
      </Modal>
    );
  };

  // Request detail section component
  const RequestDetails = ({ item }: { item: Request & { status: string } }) => {
    return (
      <View className="pl-5">
        <Text className="text-xl font-bold mb-2">Request Details:</Text>
        <Text className="text-base">
          Work Date:{" "}
          <Text className="text-green-600">{item.WorkDate || "N/A"}</Text>
        </Text>
        <Text className="text-base">
          Work Time:{" "}
          <Text className="text-green-600">{item.WorkTime || "N/A"}</Text>
        </Text>
        <Text className="text-base">
          Address: <Text className="text-green-600">{item.location}</Text>
        </Text>
        <Text className="text-base">
          Service:{" "}
          <Text className="text-green-600">{item.service || "N/A"}</Text>
        </Text>
        <Text className="text-base">
          Payment Method: <Text className="text-green-600">{item.payment}</Text>
        </Text>
        <Text className="text-base">
          About Service:{" "}
          <Text className="text-green-600">{item.AboutService}</Text>
        </Text>
        <Text className="text-base">
          Status:{" "}
          <Text className={`${getStatusColor(item.status)}`}>
            {getStatusLabel(item.status)}
          </Text>
        </Text>

        {/* Show work timeline when applicable */}
        {(item.workStartedTime || item.workCompletedClaimTime) && (
          <View className="mt-2 p-2 bg-gray-100 rounded">
            <Text className="text-lg font-semibold mb-1">Work Timeline:</Text>
            {item.workStartedTime && (
              <Text className="text-sm">
                • Work started:{" "}
                <Text className="text-blue-600">
                  {formatTime(item.workStartedTime)}
                </Text>
              </Text>
            )}
            {item.workCompletedClaimTime && (
              <Text className="text-sm">
                • Worker marked complete:{" "}
                <Text className="text-blue-600">
                  {formatTime(item.workCompletedClaimTime)}
                </Text>
              </Text>
            )}
          </View>
        )}
      </View>
    );
  };

  // Request item component for client view
  const RequestItemOnClient = ({
    item,
  }: {
    item: Request & { status: string };
  }) => {
    const [imageModalVisible, setImageModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);

    // Sample request images (should come from item.images in real app)
    const requestImages = [
      require("../../../../assets/images/istockphoto-615086822-170667a.jpg"),
      require("../../../../assets/images/images (1).jpg"),
    ];

    if (item.status === "rejected") return null;

    const isSelected = selectedId === item.id;
    const workerName = "username_Worker" in item ? item.username_Worker : "";

    return (
      <TouchableOpacity
        className="bg-white my-0.5 p-2"
        onPress={() => setSelectedId(isSelected ? null : item.id)}
      >
        {isSelected ? (
          <View className="p-4">
            <View className="flex-row items-center mb-3">
              <Image
                className="w-16 h-16 rounded-full"
                source={require("../../../../assets/images/images (1).jpg")}
              />
              <View className="flex-1 pl-3">
                <Text className="text-xl font-bold">{workerName}</Text>
                <Text className="text-sm text-gray-600">
                  {item.sent_time || item.RequestDate}
                </Text>
              </View>
              <View className="flex-row justify-between w-24">
                <Ionicons name="call" size={36} color="#000" />
                <MaterialCommunityIcons
                  name="message-text-outline"
                  size={36}
                  color="#000"
                />
              </View>
            </View>

            <RequestDetails item={item} />

            <View className="mt-4">
              <Text className="text-lg mb-2">Request Images:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {requestImages.map((img, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => {
                      setSelectedImage(idx);
                      setImageModalVisible(true);
                    }}
                    className="mr-2"
                  >
                    <Image source={img} className="w-24 h-24 rounded-lg" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View className="flex-row mt-4 justify-between">
              {item.status === "pending_client_verification" && (
                <TouchableOpacity
                  className="flex-1 bg-blue-600 items-center justify-center py-3 mx-1 rounded"
                  onPress={() => handleVerifyCompletion(item.id)}
                >
                  <Text className="text-white text-lg">Verify Completion</Text>
                </TouchableOpacity>
              )}

              {item.status === "onhold" && (
                <TouchableOpacity
                  className="flex-1 bg-red-600 items-center justify-center py-3 mx-1 rounded"
                  onPress={() => handleCancelRequest(item.id)}
                >
                  <Text className="text-white text-lg">Cancel Request</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          <View className="flex-row items-center">
            <Image
              className="w-16 h-16 rounded-full"
              source={require("../../../../assets/images/images (1).jpg")}
            />
            <View className="flex-1 pl-3">
              <View className="flex-row justify-between pr-4">
                <Text className="text-xl font-bold">{workerName}</Text>
                <View className="items-center justify-center">
                  {item.status === "accepted" && (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={35}
                      color="green"
                    />
                  )}
                  {item.status === "completed" && (
                    <MaterialCommunityIcons
                      name="check-all"
                      size={35}
                      color="blue"
                    />
                  )}
                  {item.status === "pending_client_verification" && (
                    <MaterialCommunityIcons
                      name="alert-circle-outline"
                      size={35}
                      color="#F8A100"
                    />
                  )}
                  {item.status === "onhold" && (
                    <MaterialCommunityIcons
                      name="clock-outline"
                      size={35}
                      color="#888"
                    />
                  )}
                </View>
              </View>
              <Text className="font-medium">
                Service:{" "}
                <Text className="text-yellow-500">{item.AboutService}</Text>
              </Text>
              {item.status === "pending_client_verification" && (
                <Text className="text-sm font-semibold text-orange-500">
                  Action needed: Verify completion
                </Text>
              )}
            </View>
          </View>
        )}

        <ImageViewer
          visible={imageModalVisible}
          images={requestImages}
          initialIndex={selectedImage}
          onClose={() => setImageModalVisible(false)}
        />
      </TouchableOpacity>
    );
  };

  // Request item component for worker view
  const RequestItemOnWorker = ({
    item,
  }: {
    item: Request & { status: string };
  }) => {
    const [isPressed, setIsPressed] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);
    const [imageModalVisible, setImageModalVisible] = useState(false);

    // Sample request images (should come from item.images in real app)
    const requestImages = [
      require("../../../../assets/images/istockphoto-615086822-170667a.jpg"),
      require("../../../../assets/images/images (1).jpg"),
    ];

    const clientName = "username_Client" in item ? item.username_Client : "";

    return (
      <View>
        {!isPressed ? (
          <TouchableOpacity
            className="flex-row bg-white py-3 px-4 mb-0.5"
            onPress={() => setIsPressed(true)}
          >
            <Image
              source={require("../../../../assets/images/images (1).jpg")}
              className="w-16 h-16 rounded-full"
            />
            <View className="flex-1">
              <View className="flex-row justify-between">
                <Text className="text-lg font-medium">{clientName}</Text>
                <Text className="text-sm text-gray-600">
                  {item.sent_time || item.RequestDate}
                </Text>
              </View>
              <Text className="text-sm">
                Service: <Text className="text-yellow-500">{item.service}</Text>
              </Text>
              <View className="flex-row items-center">
                <Text className="text-sm mr-1">Status:</Text>
                <Text className={`text-sm ${getStatusColor(item.status)}`}>
                  {getStatusLabel(item.status)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            className="bg-white p-4"
            onPress={() => setIsPressed(false)}
          >
            <View className="flex-row items-center">
              <Image
                source={require("../../../../assets/images/images (1).jpg")}
                className="w-16 h-16 rounded-full"
              />
              <View className="flex-1 pl-2">
                <Text className="text-lg font-medium">{clientName}</Text>
              </View>
              <View className="flex-row justify-between w-24">
                <Ionicons name="call" size={40} color="#000" />
                <MaterialCommunityIcons
                  name="message-text-outline"
                  size={40}
                  color="#000"
                />
              </View>
            </View>

            <RequestDetails item={item} />

            <View className="mt-4 px-4">
              <Text className="text-lg mb-2">Request Images:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {requestImages.map((img, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => {
                      setSelectedImage(idx);
                      setImageModalVisible(true);
                    }}
                    className="mr-2"
                  >
                    <Image source={img} className="w-24 h-24 rounded-lg" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View className="flex-row mt-4">
              {item.status === "onhold" && (
                <>
                  <TouchableOpacity
                    className="flex-1 bg-green-600 items-center justify-center py-3 mx-1"
                    onPress={() => handleAcceptRequest(item.id)}
                  >
                    <Text className="text-white text-lg">Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-red-600 items-center justify-center py-3 mx-1"
                    onPress={() => handleRejectRequest(item.id)}
                  >
                    <Text className="text-white text-lg">Reject</Text>
                  </TouchableOpacity>
                </>
              )}

              {item.status === "accepted" && (
                <TouchableOpacity
                  className="flex-1 bg-blue-600 items-center justify-center py-3 mx-1"
                  onPress={() => handleMarkAsCompleted(item.id)}
                >
                  <Text className="text-white text-lg">Mark as Completed</Text>
                </TouchableOpacity>
              )}

              {item.status === "pending_client_verification" && (
                <View className="flex-1 bg-yellow-500 items-center justify-center py-3 mx-1">
                  <Text className="text-white text-lg">
                    Waiting for Client Verification
                  </Text>
                </View>
              )}

              {item.status === "completed" && (
                <View className="flex-1 bg-green-500 items-center justify-center py-3 mx-1">
                  <Text className="text-white text-lg">Service Completed</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}

        <ImageViewer
          visible={imageModalVisible}
          images={requestImages}
          initialIndex={selectedImage}
          onClose={() => setImageModalVisible(false)}
        />
      </View>
    );
  };

  useEffect(() => {
    fetchPrivateRequests();
  }, []);

  return (
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <FlatList
          data={privateRequests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) =>
            userRole === UserRole.CLIENT ? (
              <RequestItemOnClient
                item={item as Request & { status: string }}
              />
            ) : (
              <RequestItemOnWorker
                item={item as Request & { status: string }}
              />
            )
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PrivateRequests;
