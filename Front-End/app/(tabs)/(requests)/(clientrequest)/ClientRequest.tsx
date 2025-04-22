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
  Request,
  BaseRequest,
  RequestOnClient,
  RequestOnWorker,
  UserRole,
  RequestStatus,
} from "../../../../Interfaces/Requestsinterfaces";
import CONFIG from "@/config";

const PublicRequest = () => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [pressed, setPressed] = useState(false);
  const [showFullComment, setShowFullComment] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.WORKER); // Default to WORKER
  const userid = 1;
  const [personnelRequests, setPersonnelRequests] = useState<Request[]>([
    {
      id: 1,
      username_Client: "khalil djaidja",
      category: "Plumbing",
      location: "123 Main St",
      working_time: "2025-04-25",
      description: "Fix leaky faucet",
      canceled: false,
      sent_time: "2025-04-22",
      images: [],
      worker_comment: "fubisjkf iunj dbsiujjnk deiujk",
      status: RequestStatus.ON_HOLD, // Default status
    },
  ]);

  const requestImages = [
    require("../../../../assets/images/istockphoto-615086822-170667a.jpg"),
    require("../../../../assets/images/images (1).jpg"),
    require("../../../../assets/images/istockphoto-615086822-170667a.jpg"),
    require("../../../../assets/images/images (1).jpg"),
    require("../../../../assets/images/images (1).jpg"),
    require("../../../../assets/images/images (1).jpg"),
    require("../../../../assets/images/istockphoto-615086822-170667a.jpg"),
    require("../../../../assets/images/images (1).jpg"),
    require("../../../../assets/images/images (1).jpg"),
    require("../../../../assets/images/istockphoto-615086822-170667a.jpg"),
  ];
  // Store current viewing request for modal access
  const [currentViewingImages, setCurrentViewingImages] =
    useState<any[]>(requestImages);

  const { width: windowWidth } = Dimensions.get("window");
  const scrollViewRef = useRef<ScrollView>(null);
  const isClient = userRole === UserRole.CLIENT; // Use the enum

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
    try {
      const response = await axios.get(`${CONFIG.API_URL}/work/job-request/`, {
        params:
          userRole === UserRole.CLIENT
            ? { client: userid }
            : { worker: userid },
      });
      // Assuming the API returns status information
      const results = response.data as Request[];
      setPersonnelRequests(results);
    } catch (err) {
      console.error("Error fetching requests:", err);
      alert("Error fetching requests");
    }
  };

  const fetchRequestsDetails = async (requestId: number, type: string) => {
    try {
      const response = await axios.get(
        `${CONFIG.API_URL}/work/job-request/${requestId}`,
        {
          params:
            userRole === UserRole.CLIENT
              ? { role: "client", type }
              : { worker_id: userid, role: "worker", type },
        }
      );
      const results = response.data;
      // Update the specific request rather than appending to the array
      setPersonnelRequests((prevRequests) =>
        prevRequests?.map((req) =>
          req.id === requestId ? { ...req, ...results } : req
        )
      );
    } catch (err) {
      console.error("Error fetching request details:", err);
      alert("Error fetching request details");
    }
  };

  const cancelRequest = async (idRequest: number) => {
    try {
      await axios.patch(`${CONFIG.API_URL}/work/job-request/${idRequest}/`, {
        canceled: true,
        status: RequestStatus.CANCELLED,
      });
      setPersonnelRequests((prev) =>
        prev?.map((req) =>
          req.id === idRequest
            ? {
                ...req,
                canceled: true,
                status: RequestStatus.CANCELLED,
              }
            : req
        )
      );
      alert("Request canceled successfully");
    } catch (err) {
      console.error("Cancellation failed:", err);
      alert("Cancellation failed");
    }
  };

  // Update request status - worker can only accept or reject
  const updateRequestStatus = async (
    idRequest: number,
    newStatus: RequestStatus
  ) => {
    try {
      await axios.patch(`${CONFIG.API_URL}/work/job-request/${idRequest}/`, {
        status: newStatus,
      });

      if (newStatus === RequestStatus.REJECTED) {
        // If rejected, remove from list
        setPersonnelRequests((prev) =>
          prev?.filter((req) => req.id !== idRequest)
        );
        alert("Request rejected");
      } else {
        // Update status in local state
        setPersonnelRequests((prev) =>
          prev?.map((req) =>
            req.id === idRequest ? { ...req, status: newStatus } : req
          )
        );
        alert(`Request ${newStatus.toLowerCase()} successfully`);
      }
    } catch (err) {
      console.error(`Status update failed:`, err);
      alert("Status update failed");
    }
  };

  // Worker marks job as completed - status becomes PENDING_CLIENT_VERIFICATION
  const markAsCompleted = async (idRequest: number) => {
    try {
      await axios.patch(`${CONFIG.API_URL}/work/job-request/${idRequest}/`, {
        status: RequestStatus.PENDING_CLIENT_VERIFICATION,
      });

      setPersonnelRequests((prev) =>
        prev?.map((req) =>
          req.id === idRequest
            ? {
                ...req,
                status: RequestStatus.PENDING_CLIENT_VERIFICATION,
              }
            : req
        )
      );
      Alert.alert(
        "Completion Request Sent",
        "The client will be notified to confirm completion of this work.",
        [{ text: "OK" }]
      );
    } catch (err) {
      console.error("Completion request failed:", err);
      alert("Failed to send completion request");
    }
  };

  const handleSelectRequest = (id: number) => {
    router.push({
      pathname: "/WorkerComments",
      params: { id },
    });
  };

  const handleOpenImageModal = (images: any[], initialIndex: number) => {
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

  useEffect(() => {
    fetchRequests();
  }, []);

  // Filter out rejected requests for worker view
  const filteredRequests = personnelRequests.filter(
    (item) => !item.canceled && item.status !== RequestStatus.REJECTED
  );

  return (
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {true ? (
          <FlatList
            data={personnelRequests.filter((item) => !item.canceled)}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <>
                {selectedId !== item.id ? (
                  <TouchableOpacity
                    className="min-h-[80px] mb-2 flex-row bg-white rounded-lg shadow-sm p-3"
                    onPress={() => {
                      setSelectedId(item.id);
                      fetchRequestsDetails(item.id, "public");
                    }}
                  >
                    {/* Icon Section */}
                    <View className="w-[15%] justify-center items-center">
                      <View className="relative">
                        <View className="bg-red-600 rounded-full h-5 w-5 absolute -top-1 -right-1 items-center justify-center z-10">
                          <Text className="text-white text-xs font-bold">
                            2
                          </Text>
                        </View>
                        <MaterialCommunityIcons
                          name="clipboard-text"
                          size={32}
                          color="#4B5563" // Gray-600
                        />
                      </View>
                    </View>

                    {/* Content Section */}
                    <View className="flex-1 flex-col justify-center px-4">
                      <View className="flex-row justify-between items-center">
                        <Text className="text-base font-semibold text-gray-800">
                          Category:{" "}
                          <Text className="font-normal">{item.category}</Text>
                        </Text>
                        <Text className="text-sm text-gray-500">
                          {item.sent_time}
                        </Text>
                      </View>
                      <Text className="text-sm text-gray-600 mt-1">
                        Location: {item.location}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    className="bg-white mt-2 p-4"
                    onPress={() => setSelectedId(null)}
                  >
                    <View className="pl-10">
                      <Text className="text-lg">Request Details:</Text>
                      <Text className="text-lg">
                        Date Request:{" "}
                        <Text className="text-green-500">{item.sent_time}</Text>
                      </Text>
                      <Text className="text-lg">
                        Work time:{" "}
                        <Text className="text-green-500">
                          {item.working_time}
                        </Text>
                      </Text>
                      <Text className="text-lg">
                        Address:{" "}
                        <Text className="text-green-500">{item.location}</Text>
                      </Text>
                      <Text className="text-lg">
                        Category:{" "}
                        <Text className="text-green-500">{item.category}</Text>
                      </Text>
                      <Text className="text-lg">
                        About Service:{" "}
                        <Text className="text-green-500">
                          {item.description}
                        </Text>
                      </Text>
                    </View>
                    <View className="mt-4 px-4">
                      <Text className="text-xl mb-2">Request Images:</Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="mb-3"
                      >
                        {item.images && item.images.length > 0
                          ? item?.images?.map((img, idx) => (
                              <TouchableOpacity
                                key={idx}
                                onPress={() => {
                                  handleOpenImageModal(item.images, idx);
                                }}
                                className="mr-2"
                              >
                                <Image
                                  source={{ uri: img }}
                                  className="w-24 h-24 rounded"
                                />
                              </TouchableOpacity>
                            ))
                          : requestImages?.map((img, idx) => (
                              <TouchableOpacity
                                key={idx}
                                onPress={() => {
                                  handleOpenImageModal(requestImages, idx);
                                }}
                                className="mr-2"
                              >
                                <Image
                                  source={img}
                                  className="w-24 h-24 rounded"
                                />
                              </TouchableOpacity>
                            ))}
                      </ScrollView>
                    </View>
                    <View className="flex-row py-2">
                      <TouchableOpacity
                        onPress={() => handleSelectRequest(item.id)}
                        className="bg-green-500 w-1/2 justify-center items-center py-2"
                      >
                        <Text className="text-lg text-white">Comments</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="bg-red-500 w-1/2 justify-center items-center py-2"
                        onPress={() => cancelRequest(item.id)}
                      >
                        <Text className="text-lg text-white">Cancel</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Client verification section - when job is marked as completed by worker */}
                    {item.status ===
                      RequestStatus.PENDING_CLIENT_VERIFICATION && (
                      <View className="mt-3">
                        <Text className="text-lg text-blue-600 mb-2">
                          Worker has marked this job as completed.
                        </Text>
                        <View className="flex-row">
                          <TouchableOpacity
                            className="bg-green-500 w-1/2 justify-center items-center py-2 mr-1"
                            onPress={() =>
                              updateRequestStatus(
                                item.id,
                                RequestStatus.COMPLETED
                              )
                            }
                          >
                            <Text className="text-lg text-white">
                              Confirm Completion
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            className="bg-red-500 w-1/2 justify-center items-center py-2 ml-1"
                            onPress={() =>
                              updateRequestStatus(
                                item.id,
                                RequestStatus.ACCEPTED
                              )
                            }
                          >
                            <Text className="text-lg text-white">
                              Reject Completion
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                )}
              </>
            )}
          />
        ) : (
          <FlatList
            data={filteredRequests}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View>
                {!pressed || selectedId !== item.id ? (
                  <TouchableOpacity
                    className="min-h-16 mb-1 flex-row w-full bg-white mt-3 py-3 pr-4"
                    onPress={() => {
                      setPressed(true);
                      setSelectedId(item.id);
                    }}
                  >
                    <View className="w-2/12 items-center justify-start pt-2">
                      <Image
                        source={
                          (item as RequestOnWorker).client_profile_image
                            ? {
                                uri: (item as RequestOnWorker)
                                  .client_profile_image,
                              }
                            : require("../../../../assets/images/images (1).jpg")
                        }
                        className="w-12 h-12 rounded-full"
                      />
                    </View>
                    <View className="flex-1 flex-col">
                      <View className="flex-row justify-between">
                        <Text className="text-lg leading-7">
                          {(item as RequestOnWorker)?.username_Client}
                        </Text>
                        <View className="flex-row items-center">
                          {getStatusIcon(item.status)}
                          <Text className="ml-2">{item.sent_time}</Text>
                        </View>
                      </View>
                      {(item as RequestOnWorker)?.worker_comment && (
                        <TouchableOpacity
                          onPress={() => setShowFullComment(!showFullComment)}
                        >
                          <Text className="text-green-500">
                            {showFullComment
                              ? (item as RequestOnWorker)?.worker_comment
                              : `${(item as RequestOnWorker)?.worker_comment?.substring(0, 30)}...`}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    className="bg-white mt-3 pb-3"
                    onPress={() => {
                      setPressed(false);
                      setSelectedId(null);
                    }}
                  >
                    <View className="flex-row">
                      <View className="items-center justify-center pl-2">
                        <Image
                          source={
                            (item as RequestOnWorker).client_profile_image
                              ? {
                                  uri: (item as RequestOnWorker)
                                    .client_profile_image,
                                }
                              : require("../../../../assets/images/images (1).jpg")
                          }
                          style={{ width: 50, height: 50 }}
                          className="rounded-full"
                        />
                      </View>
                      <View className="w-3/6 pl-2 pt-1">
                        <Text className="text-xl font-medium">
                          {(item as RequestOnWorker)?.username_Client}
                        </Text>
                        <View className="flex-row items-center mt-1">
                          {getStatusIcon(item.status)}
                          <Text className="ml-1 text-gray-600 capitalize">
                            {item.status === RequestStatus.ON_HOLD
                              ? "On Hold"
                              : item.status ===
                                  RequestStatus.PENDING_CLIENT_VERIFICATION
                                ? "Pending Verification"
                                : item.status === RequestStatus.COMPLETED
                                  ? "Completed"
                                  : item.status === RequestStatus.ACCEPTED
                                    ? "Accepted"
                                    : item.status || "On Hold"}
                          </Text>
                        </View>
                      </View>
                      <View className="w-2/6 h-full flex-row items-center justify-between px-2">
                        <TouchableOpacity>
                          <Ionicons name="call" size={40} color="#000" />
                        </TouchableOpacity>
                        <TouchableOpacity>
                          <MaterialCommunityIcons
                            name="message-text-outline"
                            size={40}
                            color="#000"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View className="pl-20">
                      <Text className="text-xl">Request Details:</Text>
                      <Text className="text-xl">
                        Request Date:{" "}
                        <Text className="text-green-500">{item.sent_time}</Text>
                      </Text>
                      <Text className="text-xl">
                        Work Time:{" "}
                        <Text className="text-green-500">
                          {item.working_time}
                        </Text>
                      </Text>
                      <Text className="text-xl">
                        Work Address:{" "}
                        <Text className="text-green-500">{item.location}</Text>
                      </Text>
                      <Text className="text-xl">
                        Category:{" "}
                        <Text className="text-green-500">{item.category}</Text>
                      </Text>
                      <Text className="text-xl">
                        About Service:{" "}
                        <Text className="text-green-500">
                          {item.description}
                        </Text>
                      </Text>
                    </View>
                    <View className="mt-4 px-4">
                      <Text className="text-xl mb-2">Request Images:</Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="mb-3"
                      >
                        {item.images && item.images.length > 0
                          ? item?.images?.map((img, idx) => (
                              <TouchableOpacity
                                key={idx}
                                onPress={() => {
                                  handleOpenImageModal(item.images, idx);
                                }}
                                className="mr-2"
                              >
                                <Image
                                  source={{ uri: img }}
                                  className="w-24 h-24 rounded"
                                />
                              </TouchableOpacity>
                            ))
                          : requestImages?.map((img, idx) => (
                              <TouchableOpacity
                                key={idx}
                                onPress={() => {
                                  handleOpenImageModal(requestImages, idx);
                                }}
                                className="mr-2"
                              >
                                <Image
                                  source={img}
                                  className="w-24 h-24 rounded"
                                />
                              </TouchableOpacity>
                            ))}
                      </ScrollView>
                    </View>

                    {item.status === RequestStatus.ACCEPTED && (
                      <TouchableOpacity
                        className="bg-blue-500 items-center justify-center py-3 mt-3 mx-1"
                        onPress={() => markAsCompleted(item.id)}
                      >
                        <Text className="text-xl text-white">
                          Mark as Completed
                        </Text>
                      </TouchableOpacity>
                    )}

                    {/* For PENDING_CLIENT_VERIFICATION requests - Worker sees waiting status */}
                    {item.status ===
                      RequestStatus.PENDING_CLIENT_VERIFICATION && (
                      <View className="bg-yellow-100 border border-yellow-400 items-center justify-center py-3 mt-3 mx-1">
                        <Text className="text-xl text-yellow-800">
                          Waiting for client confirmation
                        </Text>
                      </View>
                    )}

                    {/* For COMPLETED requests - Worker sees completed status */}
                    {item.status === RequestStatus.COMPLETED && (
                      <View className="bg-green-100 border border-green-400 items-center justify-center py-3 mt-3 mx-1">
                        <Text className="text-xl text-green-800">
                          Job completed and verified by client
                        </Text>
                      </View>
                    )}

                    {/* Delete button */}
                    <TouchableOpacity
                      className="bg-red-600 items-center justify-center py-3 mt-3"
                      onPress={() => cancelRequest(item.id)}
                    >
                      <Text className="text-xl text-white">Delete</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                )}
              </View>
            )}
            ListEmptyComponent={
              <View className="items-center justify-center p-10">
                <Text className="text-lg text-gray-500">
                  No requests available
                </Text>
              </View>
            }
          />
        )}

        {/* Common image modal for both client and worker */}
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
              {currentViewingImages?.map((img, idx) => (
                <Image
                  key={idx}
                  source={typeof img === "string" ? { uri: img } : img}
                  style={{ width: windowWidth, height: windowWidth * 0.7 }}
                  resizeMode="contain"
                />
              ))}
            </ScrollView>
            <View className="flex-row mt-4">
              {currentViewingImages?.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedImage(index)}
                  className={`w-3 h-3 rounded-full mx-1 ${
                    selectedImage === index ? "bg-white" : "bg-gray-500"
                  }`}
                />
              ))}
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PublicRequest;
