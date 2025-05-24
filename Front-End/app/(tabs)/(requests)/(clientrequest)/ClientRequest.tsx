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
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import React, { useState, useRef, useEffect } from "react";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { router } from "expo-router";
// Import the interfaces from your interfaces file
import {
  WorkerPublicRequest,
  ClientPublicRequest,
} from "../../../../Interfaces/Requestsinterfaces";
import apiClient from "@/api/appClient";
import refreshAccessToken from "@/api/refreshAccessToken";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ResizeMode, Video } from "expo-av"; // Import for video playback
import {
  formatDateTime,
  handelcall,
  handleEmailPress,
} from "../SomeStandarFunctions";
import { useNotifications } from "@/context/NotificationContext";
import { Rating } from "react-native-ratings";
import eventEmitter from "@/context/EventBus";

// Define the UserRole enum
enum UserRole {
  CLIENT = "client",
  WORKER = "worker",
}

// Define the RequestStatus enum
enum RequestStatus {
  ACCEPTED = "Accepted",
  ON_HOLD = "On Hold",
  COMPLETED = "Completed",
  CANCELLED = "Cancelled",
  VERIFICATION_PENDING = "verification pending",
}

// Define media types
enum MediaType {
  IMAGE = "image",
  VIDEO = "video",
}

// Interface for media item with type
interface MediaItem {
  url: string;
  type: MediaType;
}

// Default placeholder image for missing profile images
const defaultProfileImage = require("../../../../assets/images/images (1).jpg");

const PublicRequest = () => {
  const notifications = useNotifications();
  const [selectedMedia, setSelectedMedia] = useState(0);
  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>();
  const [requestIds, setRequestIds] = useState<number[]>([]);
  const [requests, setRequests] = useState<
    (WorkerPublicRequest | ClientPublicRequest)[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [expandedRequestId, setExpandedRequestId] = useState<number | null>(
    null
  );
  const [tempRequest, setTempRequest] = useState<ClientPublicRequest | null>();
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [userData, setUserData] = useState<{
    id: number;
    username: string;
    profile_image: string;
  }>({
    id: 0,
    username: "",
    profile_image: "",
  });

  // Store current viewing media for modal access
  const [currentViewingMedia, setCurrentViewingMedia] = useState<MediaItem[]>(
    []
  );
  const videoRef = useRef<Video>(null);

  const { width: windowWidth, height: windowHeight } = Dimensions.get("window");
  const scrollViewRef = useRef<ScrollView>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [initialComment, setInitialComment] = useState<string | null>(null);
  const commentInputRef = useRef<TextInput>(null);

  const handleEditComment = (
    requestId: number,
    currentComment: string = ""
  ) => {
    setEditingId(requestId);
    setCommentModalVisible(true);
    setInitialComment(currentComment);
    // Focus on the text input after a short delay (to ensure modal is visible)
    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 300);
  };

  const navigateToProfile = (id: number, role: number) => {
    router.push({
      pathname: "/(tabs)/(home)/profileAsView",
      params: {
        userId: id,
        userRole: role,
        origin: "publicRequest",
      },
    });
  };

  // Determine if user is client or worker and get user data
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const userDataStr = await AsyncStorage.getItem("user");
        if (userDataStr) {
          const user = JSON.parse(userDataStr);
          setUserRole(user.role == 1 ? UserRole.CLIENT : UserRole.WORKER);
          setUserData({
            id: user.id,
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

  // useEffect(() => {
  //   const handler = (data: { id: number; status: string }) => {
  //     console.log('Public request status update:', data);
      
  //     setRequests((prev) =>
  //       prev.map((request) =>
  //         request.id === data.id 
  //           ? { ...request, status: data.status } 
  //           : request
  //       )
  //     );
  //   };

  //   // Add listener
  //   eventEmitter.on('change-public-request-status', handler);

  //   // Cleanup function
  //   return () => {
  //     eventEmitter.off('change-public-request-status', handler);
  //   };
  // }, []);

  useEffect(() => {
    if (mediaModalVisible && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: windowWidth * selectedMedia,
          animated: false,
        });
      }, 50);
    }
  }, [mediaModalVisible, selectedMedia, windowWidth]);

  // Helper function to detect media type from URL or MIME type
  const detectMediaType = (url: string, mimeType?: string): MediaType => {
    if (mimeType) {
      return mimeType.startsWith("video/") ? MediaType.VIDEO : MediaType.IMAGE;
    }

    // Check file extension if MIME type is not available
    const videoExtensions = [
      ".mp4",
      ".mov",
      ".avi",
      ".wmv",
      ".flv",
      ".mkv",
      ".webm",
    ];
    const lowerCaseUrl = url.toLowerCase();

    return videoExtensions.some((ext) => lowerCaseUrl.endsWith(ext))
      ? MediaType.VIDEO
      : MediaType.IMAGE;
  };

  const deleteRequest = async (requestId: number) => {
    try {
      const response = await apiClient.delete(`work/job-request/${requestId}`);
      if (response.data.success) {
        Alert.alert("request deleted successfully");
        setRequestIds((prevIds) => prevIds.filter((id) => id !== requestId));
      }
    } catch (err: any) {
      console.error(
        "Error deleting request:",
        err.response?.data?.message || err.message
      );

      if (err.response?.status === 401) {
        if (await refreshAccessToken()) {
          await deleteRequest(requestId);
        } else {
          // need to login
          router.push("/(auth)");
        }
      } else {
        console.error(
          "Error deleting request:",
          err.response?.data?.message || err.message
        );
      }
    }
  };

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
          await fetchRequestsDetails(requestId, worker_id);
        } else {
          // need to login
          router.push("/(auth)");
        }
      }
      console.error("Error fetching request details:", err.response?.data);
      alert("Error fetching request details");
    }
  };

  // Reting
  const handleRatingSubmit = async () => {
    try {
      if (!tempRequest) {
        Alert.alert("Error", "Please provide a rating");
        return;
      }

      // First submit the rating
      await apiClient.post(`/work/job-request/${tempRequest.id}/complete`, {
        workerId: tempRequest.workerId,
        clientId: tempRequest.clientId,
        rating: rating,
        review: ratingComment,
      });

      // Then complete the request

      // Update local state
      setRequestIds((prevIds) => prevIds.filter((id) => id !== tempRequest.id));
      setRatingModalVisible(false);
      setTempRequest(null);
      setRating(0);
      setRatingComment(""); // Clear comment

      Alert.alert("Success", "Request completed and rating submitted");
    } catch (err: any) {
      if (err.response?.status === 401) {
        if (await refreshAccessToken()) {
          await handleRatingSubmit();
        } else {
          console.log(err);
        }
      }
      console.error("Failed to submit rating:", err);
      Alert.alert("Error", "Failed to submit rating");
    }
  };

  const handleSelectRequest = (
    id: number,
    status: string,
    workerId: number
  ) => {
    router.push({
      pathname: "/WorkerComments",
      params: { id, status, workerId },
    });
  };

  const toggleExpandRequest = (id: number) => {
    setExpandedRequestId(expandedRequestId === id ? null : id);
  };

  const handleOpenMediaModal = (media: any[], initialIndex: number) => {
    // Transform the media array to include media type
    const mediaWithType: MediaItem[] = media.map((item) => ({
      url: item.url,
      type: detectMediaType(item.url, item.mime_type || item.type),
    }));

    setCurrentViewingMedia(mediaWithType);
    setSelectedMedia(initialIndex);
    setMediaModalVisible(true);
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
      case RequestStatus.VERIFICATION_PENDING:
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
    //realTimePublicRequestStatus(setRequests);
  }, []);

  useEffect(() => {
    if (requestIds.length > 0) {
      // Clear previous requests when fetching new ones
      setRequests([]);
      requestIds.forEach((id) => {
        fetchRequestsDetails(id);
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
            <View className="flex-1">
              <Text className="font-medium">
                {userData.username || "Your Request"}
              </Text>
              <Text numberOfLines={1} className="text-gray-500">
                {truncateText(item.description, 20)}
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
        className={`${item.status === RequestStatus.VERIFICATION_PENDING ? "bg-specialGreen/70" : "bg-white"} mt-2 p-4 mb-4 rounded-lg shadow`}
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity
              onPress={() => navigateToProfile(item.client_id, 1)}
            >
              <Image
                source={
                  item.client_profile_image
                    ? { uri: item.client_profile_image }
                    : defaultProfileImage
                }
                className="w-12 h-12 rounded-full mr-3"
              />
            </TouchableOpacity>

            <View className="flex-1">
              <TouchableOpacity
                onPress={() => navigateToProfile(item.client_id, 1)}
              >
                <Text className="font-medium">
                  {item.client_username || "Client"}
                </Text>
              </TouchableOpacity>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                className="text-gray-500"
              >
                {item.worker_comment}
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
    // Handle confirming completion
    const handleConfirmCompletion = async (request: ClientPublicRequest) => {
      setTempRequest(request);
      setRatingModalVisible(true);
    };

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
          <Text className="text-lg font-medium mb-2">Request Details:</Text>

          <View className="pl-2">
            <Text className="text-base mb-1">
              <Text className="font-bold">Date Request: </Text>
              <Text className="text-specialGreen">
                {formatDateTime(item.sent_date)}
              </Text>
            </Text>
            <Text className="text-base mb-1">
              <Text className="font-bold">Work time: </Text>
              <Text className="text-specialGreen">
                {formatDateTime(item.work_date)}
              </Text>
            </Text>
            <Text className="text-base mb-1">
              <Text className="font-bold">Address: </Text>
              <Text className="text-specialGreen">
                {item.location?.city}, {item.location?.region},{" "}
                {item.location?.country}
              </Text>
            </Text>
            <Text className="text-base mb-1">
              <Text className="font-bold">Category: </Text>
              <Text className="text-specialGreen">{item.category}</Text>
            </Text>
            <Text className="text-base mb-2">
              <Text className="font-bold">About Service: </Text>
            </Text>
            <Text className="text-specialGreen mb-3 pl-1">
              {item.description}
            </Text>
          </View>
        </View>

        <View className="mt-4">
          <Text className="text-lg font-medium mb-2">Request Media:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-3"
          >
            {item.media && item.media.length > 0 ? (
              item.media.map((media, idx) => {
                const mediaType = detectMediaType(media.url, media.type);
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => {
                      handleOpenMediaModal(item.media, idx);
                    }}
                    className="mr-2 relative"
                  >
                    {mediaType === MediaType.VIDEO ? (
                      <>
                        <Video
                          source={{ uri: media.url }}
                          style={{ width: 96, height: 96, borderRadius: 4 }}
                          resizeMode={"cover" as ResizeMode}
                          shouldPlay={false}
                          isLooping={false}
                          useNativeControls={false}
                        />
                        <View className="absolute inset-0 items-center justify-center bg-black bg-opacity-30 rounded">
                          <Ionicons
                            name="play-circle"
                            size={32}
                            color="white"
                          />
                        </View>
                      </>
                    ) : (
                      <Image
                        source={{ uri: media.url }}
                        className="w-24 h-24 rounded"
                      />
                    )}
                  </TouchableOpacity>
                );
              })
            ) : (
              <Text className="italic text-gray-500">No media available</Text>
            )}
          </ScrollView>
        </View>

        <View className="flex-row py-2 mt-2 justify-center items-center">
          {item.status !== "Accepted" ? (
            <TouchableOpacity
              onPress={() =>
                handleSelectRequest(item.id, item.status, item.workerId)
              }
              className="bg-specialGreen w-1/2 justify-center items-center py-2 rounded-l mr-2"
            >
              <Text className="text-base text-white">Comments</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() =>
                handleSelectRequest(item.id, item.status, item.workerId)
              }
              className="bg-green-500 w-1/2 justify-center items-center py-2 rounded-l mr-2"
            >
              <Text className="text-base text-white">Worker comment</Text>
            </TouchableOpacity>
          )}
          {(item.status === RequestStatus.ON_HOLD ||
            item.status === RequestStatus.VERIFICATION_PENDING) && (
            <TouchableOpacity
              className="bg-red-500 w-1/2 justify-center items-center py-2 rounded-r"
              onPress={() => deleteRequest(item.id)}
            >
              <Text className="text-base text-white">Cancel</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Client verification section - when job is marked as completed by worker */}

        {item.status === RequestStatus.ACCEPTED && (
          <TouchableOpacity
            className="bg-green-500 w-full items-center justify-center py-3 mt-3 rounded"
            onPress={() => handleConfirmCompletion(item)}
          >
            <Text className="text-base text-white">Declare Completed</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const saveComment = async (
    requestid?: number | null,
    commentText?: string
  ) => {
    if (!editingId) return;

    setLoading(true);
    try {
      const workerId = userData.id; // Assuming this is the worker ID
      await apiClient.put(`/work/job-request/${requestid}/comment/`, {
        workerId,
        message: commentText,
      });

      setEditingId(null);

      // Show success message
      Alert.alert("Success", "Your comment has been saved to the database");

      // Refresh the requests to ensure we have the latest data from server
      fetchRequests();
    } catch (err: any) {
      if (err.response?.status === 401) {
        if (await refreshAccessToken()) {
          await saveComment(editingId, commentText);
        } else {
          // Token refresh failed, redirect to login
          router.push("/(auth)");
        }
      } else {
        console.error(
          "Error updating comment in database:",
          err.response?.data?.message || err.message
        );
        Alert.alert(
          "Database Error",
          "Failed to save your comment to the database. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (requestId?: number | null) => {
    if (!editingId) return;
    setLoading(true);
    try {
      console.log("editingId", editingId);
      let workerId = userData.id; // Assuming this is the worker ID
      await apiClient.delete(`/work/job-request/${requestId}/comment/`, {
        data: {
          workerId: workerId,
        },
        headers: {
          "Content-Type": "application/json",
        },
      });

      Alert.alert("Success", "Your comment has been deleted");

      // Refresh the requests
      fetchRequests();
    } catch (err: any) {
      if (err.response?.status === 401) {
        if (await refreshAccessToken()) {
          await deleteComment(editingId);
        } else {
          router.push("/(auth)");
        }
      } else {
        console.error(
          "Error deleting comment:",
          err.response?.data?.message || err.message
        );
        Alert.alert("Error", "Failed to delete your comment");
      }
    } finally {
      setLoading(false);
    }
  };

  const CommentEditModal = () => {
    const [commentText, setCommentText] = useState(initialComment || "");
    const commentInputRef = useRef(null);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    useEffect(() => {
      const keyboardDidShowListener = Keyboard.addListener(
        "keyboardDidShow",
        () => setKeyboardVisible(true)
      );
      const keyboardDidHideListener = Keyboard.addListener(
        "keyboardDidHide",
        () => setKeyboardVisible(false)
      );

      return () => {
        keyboardDidShowListener.remove();
        keyboardDidHideListener.remove();
      };
    }, []);

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={commentModalVisible}
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <View className="flex-1  justify-center bg-black/70  ">
          <KeyboardAwareScrollView
            enableOnAndroid={true}
            enableAutomaticScroll={true}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              width: "100%",
              paddingHorizontal: 16,
            }}
          >
            <View className="bg-white/80 rounded-2xl p-6   mt-4">
              <View className="flex-row justify-between items-center mb-5">
                <Text className="text-xl font-bold text-gray-800">
                  Edit Your Comment
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    if (keyboardVisible) {
                      Keyboard.dismiss();
                      setTimeout(() => setCommentModalVisible(false), 100);
                    } else {
                      setCommentModalVisible(false);
                    }
                  }}
                  className="p-2 rounded-full bg-gray-100"
                >
                  <Ionicons name="close" size={22} color="#333" />
                </TouchableOpacity>
              </View>

              <TextInput
                ref={commentInputRef}
                className="bg-white/45 p-4 rounded-xl text-base h-40 mb-5 "
                multiline={true}
                value={commentText}
                onChangeText={setCommentText}
                placeholder="Enter your comment here..."
                textAlignVertical="top"
                autoFocus={false}
                disableFullscreenUI={true}
                keyboardType="default"
                returnKeyType="default"
                onSubmitEditing={() => {}}
              />

              <View className="flex-row justify-between space-x-3 mt-2 px-5 ">
                <TouchableOpacity
                  className="py-3 px-6 rounded-lg items-center border"
                  onPress={() => {
                    if (keyboardVisible) {
                      Keyboard.dismiss();
                      setTimeout(() => {
                        setCommentModalVisible(false);
                      }, 100);
                    } else {
                      setCommentModalVisible(false);
                    }
                    deleteComment(editingId);
                  }}
                >
                  <Text className="text-gray-700 font-medium">
                    Delete Comment
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-specialGreen py-3 px-6 rounded-lg items-center shadow-sm"
                  onPress={() => {
                    if (keyboardVisible) {
                      Keyboard.dismiss();
                      setTimeout(() => {
                        setCommentModalVisible(false);
                      }, 100);
                    } else {
                      setCommentModalVisible(false);
                    }
                    saveComment(editingId, commentText);
                  }}
                >
                  <Text className="text-white font-medium">Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </Modal>
    );
  };

  // Render worker view - using WorkerPublicRequest interface
  const renderWorkerRequest = (item: WorkerPublicRequest) => {
    const isExpanded = expandedRequestId === item.id;
    const modifyRequestStatus = async (status: number) => {
      try {
        await apiClient.put(
          `/work/job-request/${item.id}/public-request/status`,
          {
            status,
          }
        );

        item.status = getStatusTextFromCode(status);
        setRequests((prevRequests) => {
          // Create a new array with the updated item
          return prevRequests.map((req) =>
            req.id === item.id ? { ...req, status: item.status } : req
          );
        });
        notifications?.markPublicRequestAsRead();
      } catch (err: any) {
        if (err.response?.status === 401) {
          if (await refreshAccessToken()) {
            await modifyRequestStatus(status);
          } else {
            // need to login
            router.push("/(auth)");
          }
        } else {
          console.error(
            "Error fetching requests:",
            err.response?.data?.message || err.message
          );
        }
      }
    };

    const getStatusTextFromCode = (statusCode: number): string => {
      switch (statusCode) {
        case 1:
          return RequestStatus.ACCEPTED;
        case 2:
          return RequestStatus.ON_HOLD;
        default:
          return RequestStatus.VERIFICATION_PENDING;
      }
    };

    if (!isExpanded) {
      return renderWorkerCollapsedView(item);
    }

    return (
      <View className="bg-white mt-3 mb-4 p-4 rounded-lg shadow">
        <TouchableOpacity
          onPress={() => toggleExpandRequest(item.id)}
          className="mb-3"
        >
          <View className="flex-row justify-between items-center ">
            <TouchableOpacity
              className="flex-row items-center "
              onPress={() => navigateToProfile(item.client_id, 1)}
            >
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
              </View>
            </TouchableOpacity>
            <View className="flex-row items-center">
              {getStatusIcon(item.status)}
              <Text className="ml-1 text-gray-600 text-base capitalize">
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

        <View className="flex-row mb-3 justify-end">
          <View className="items-center ">
            {item.status == "Accepted" && (
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity
                  className="mr-4"
                  onPress={() => {
                    handelcall(item.client_phone_number);
                  }}
                >
                  <Ionicons name="call" size={32} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    handleEmailPress(item.client_email);
                  }}
                >
                  <MaterialCommunityIcons
                    name="message-badge-outline"
                    size={32}
                    color="#000"
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <View className="pl-2">
          <Text className="text-base mb-1">
            <Text className="font-bold">Request Date:</Text>
            <Text className="text-specialGreen">{item.post_date}</Text>
          </Text>
          <Text className="text-base mb-1">
            <Text className="font-bold">Work Address: </Text>
            <Text className="text-specialGreen">
              {item.location?.city}, {item.location?.region},{" "}
              {item.location?.country}
            </Text>
          </Text>
          <Text className="text-base mb-2">
            <Text className="font-bold text-black">Category:</Text>
            <Text className="text-specialGreen">{item.category}</Text>
          </Text>
          <Text className="text-base mb-2">
            <Text className="font-bold text-black">About Service: </Text>
            <Text className="text-specialGreen">{item.description}</Text>
          </Text>
          {item.worker_comment && (
            <Text className="text-base mb-2">
              <Text className="font-bold text-black">Your Comment: </Text>
              <Text className="text-specialGreen">{item.worker_comment}</Text>
            </Text>
          )}
          {item.comment_date && (
            <Text className="text-base mb-2">
              <Text className="font-bold text-black">Comment Date: </Text>
              <Text className="text-specialGreen">
                {formatDateTime(item.comment_date)}
              </Text>
            </Text>
          )}
        </View>

        <View className="mt-4">
          <Text className="text-lg font-medium mb-2">Request Media:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-3"
          >
            {item.media && item.media.length > 0 ? (
              item.media.map((media, idx) => {
                const mediaType = detectMediaType(media.url, media.type);
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => {
                      handleOpenMediaModal(item.media, idx);
                    }}
                    className="mr-2 relative"
                  >
                    {mediaType === MediaType.VIDEO ? (
                      <>
                        <Video
                          source={{ uri: media.url }}
                          style={{ width: 96, height: 96, borderRadius: 4 }}
                          resizeMode={"cover" as ResizeMode}
                          shouldPlay={false}
                          isLooping={false}
                          useNativeControls={false}
                        />
                        <View className="absolute inset-0 items-center justify-center bg-black bg-opacity-30 rounded">
                          <Ionicons
                            name="play-circle"
                            size={32}
                            color="white"
                          />
                        </View>
                      </>
                    ) : (
                      <Image
                        source={{ uri: media.url }}
                        className="w-24 h-24 rounded"
                      />
                    )}
                  </TouchableOpacity>
                );
              })
            ) : (
              <Text className="italic text-gray-500">No media available</Text>
            )}
          </ScrollView>
        </View>

        {/* For PENDING_WORKER_VERIFICATION requests */}
        {item.status === RequestStatus.VERIFICATION_PENDING && (
          <View className="flex-row justify-between mt-4 px-2">
            <TouchableOpacity
              className="flex-1 bg-green-600 items-center justify-center py-3 rounded-lg shadow mr-2"
              onPress={async () => await modifyRequestStatus(1)}
            >
              <Text className="text-base font-medium text-white">
                Confirm Work
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-red-500 items-center justify-center py-3 rounded-lg shadow"
              onPress={async () => await modifyRequestStatus(2)}
            >
              <Text className="text-base font-medium text-white">
                Cancel Work
              </Text>
            </TouchableOpacity>
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

        {/* ONLY show Edit Comment button for worker */}
        {!(item.status == RequestStatus.ACCEPTED) && (
          <TouchableOpacity
            className="bg-blue-500 items-center justify-center py-3 mt-3 rounded"
            onPress={() => handleEditComment(item.id, item.worker_comment)}
          >
            <Text className="text-base text-white">Edit Comment</Text>
          </TouchableOpacity>
        )}
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

        {/* Enhanced media modal that supports both images and videos */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={mediaModalVisible}
          onRequestClose={() => setMediaModalVisible(false)}
        >
          <View className="flex-1 bg-black bg-opacity-95 justify-center items-center">
            <TouchableOpacity
              className="absolute top-10 right-5 z-10"
              onPress={() => setMediaModalVisible(false)}
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
                  setSelectedMedia(newIndex);
                }}
                className="flex-grow"
                contentContainerStyle={{
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {currentViewingMedia?.map((media, idx) => (
                  <View
                    key={`media-container-${idx}`}
                    style={{
                      width: windowWidth,
                      height: windowHeight * 0.6,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {media.type === MediaType.VIDEO ? (
                      <Video
                        ref={videoRef}
                        source={{ uri: media.url }}
                        style={{
                          width: windowWidth * 0.9,
                          height: windowHeight * 0.5,
                        }}
                        resizeMode={ResizeMode.CONTAIN}
                        useNativeControls
                        shouldPlay={selectedMedia === idx}
                        isLooping={false}
                      />
                    ) : (
                      <Image
                        source={{ uri: media.url }}
                        style={{
                          width: windowWidth * 0.9,
                          height: windowHeight * 0.5,
                        }}
                        resizeMode="contain"
                      />
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>

            <View className="flex-row mt-4 mb-12 items-center justify-center">
              {currentViewingMedia?.map((_, index) => (
                <TouchableOpacity
                  key={`dot-${index}`}
                  onPress={() => {
                    setSelectedMedia(index);
                    if (scrollViewRef.current) {
                      scrollViewRef.current.scrollTo({
                        x: windowWidth * index,
                        animated: true,
                      });
                    }
                  }}
                  className={`w-3 h-3 rounded-full mx-1 ${
                    selectedMedia === index ? "bg-white" : "bg-gray-500"
                  }`}
                />
              ))}
            </View>

            <View className="absolute bottom-10 flex-row justify-center w-full">
              <Text className="text-white text-center">
                {selectedMedia + 1} / {currentViewingMedia?.length}
              </Text>
            </View>
          </View>
        </Modal>
        <CommentEditModal />
        <Modal
          visible={ratingModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setRatingModalVisible(false)}
        >
          <View className="flex-1 bg-black/50 justify-center items-center">
            <View className="bg-white p-6 rounded-xl w-[90%] max-w-[400px]">
              <Text className="text-xl font-bold text-center mb-4">
                Rate Worker Performance
              </Text>

              <Text className="text-center text-gray-600 mb-6">
                Please rate and comment on the worker's service
              </Text>

              <Rating
                type="star"
                ratingCount={5}
                imageSize={40}
                startingValue={rating}
                onFinishRating={(value: number) => setRating(value)}
                style={{ paddingVertical: 10 }}
              />

              <TextInput
                className="border border-gray-300 rounded-xl p-3 mt-4 mb-2"
                placeholder="Add your comment (optional)"
                multiline
                numberOfLines={3}
                maxLength={200}
                value={ratingComment}
                onChangeText={setRatingComment}
              />

              <View className="flex-row justify-between mt-6">
                <TouchableOpacity
                  onPress={() => {
                    setRatingModalVisible(false);
                    setTempRequest(null);
                    setRating(0);
                    setRatingComment(""); // Clear comment
                  }}
                  className="bg-gray-500 py-3 px-6 rounded-xl flex-1 mr-2 justify-center"
                >
                  <Text className="text-white text-center font-semibold">
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleRatingSubmit}
                  className="bg-green-500 py-3 px-6 rounded-xl flex-1 ml-2"
                >
                  <Text className="text-white text-center font-semibold">
                    Submit & Complete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PublicRequest;