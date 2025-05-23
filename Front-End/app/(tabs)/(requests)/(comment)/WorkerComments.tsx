import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  SafeAreaView,
  Platform,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Dispatch, SetStateAction } from "react";
import { router, useLocalSearchParams } from "expo-router";
import apiClient from "@/api/appClient";
import { handelcall } from "../SomeStandarFunctions";
import { Ionicons } from "@expo/vector-icons";
import refreshAccessToken from "@/api/refreshAccessToken";

// Updated interface to match backend response from getRequestMessages
interface WorkerComment {
  worker_id: number;
  phone_number: string;
  username: string;
  profile_image: string | null;
  location: {
    city: string | null;
    region: string | null;
    country: string | null;
  };
  categories: string[];
  message: string;
  created_at: string;
}

interface ApiResponse {
  message: string;
  messages: WorkerComment[];
  page: number;
  limit: number;
  total: number;
  success: boolean;
}

interface WorkerCommentsProps {
  setBadgeCount: Dispatch<SetStateAction<number>>;
}

const WorkerComments: React.FC<WorkerCommentsProps> = ({
  setBadgeCount = () => {},
}) => {
  const { id, status, workerId } = useLocalSearchParams();
  const requestId: number = id ? parseInt(id as string, 10) : 0;
  const requestStatus: string = status ? (status as string) : "On Hold";
  const workerIdNumber: number = workerId
    ? parseInt(workerId as string, 10)
    : 0;
  const [workerCommentsArray, setWorkerCommentsArray] = useState<
    WorkerComment[]
  >([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [expandedCommentIds, setExpandedCommentIds] = useState<Set<number>>(
    new Set()
  );
  const [waiting_agrement_worker, setWaitingAgrementWorker] = useState<
    Set<number>
  >(new Set());
  const [total, setTotal] = useState<number>(0);

  const loadWaitingAgreementWorkers = async () => {
    try {
      const stored = await AsyncStorage.getItem(
        `waiting_agreement_${requestId}`
      );
      if (stored) {
        const workerIds = JSON.parse(stored) as number[];
        setWaitingAgrementWorker(new Set(workerIds));
      }
    } catch (error) {
      console.error("Error loading waiting agreement workers:", error);
    }
  };

  // Save waiting agreement workers to storage
  const saveWaitingAgreementWorkers = async (workers: Set<number>) => {
    try {
      const workersArray = Array.from(workers);
      await AsyncStorage.setItem(
        `waiting_agreement_${requestId}`,
        JSON.stringify(workersArray)
      );
    } catch (error) {
      console.error("Error saving waiting agreement workers:", error);
    }
  };

  const fetchWorkerComments = async (requestId: number, pageNum: number) => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      // API endpoint matches backend structure
      const response = await apiClient.get<ApiResponse>(
        `/work/job-request/${requestId}/messages?page=${pageNum}`
      );

      if (response.data.success) {
        const result = response.data.messages;
        setTotal(response.data.total);

        // Check if we've reached the end of the data
        if (result.length === 0 || result.length < response.data.limit) {
          setHasMore(false);
        }
        if (requestStatus == "Accepted" || requestStatus == "Completed") {
          setWorkerCommentsArray((prev) => [
            ...prev,
            ...result.filter((comment) => comment.worker_id == workerIdNumber),
          ]);
        } else {
          setWorkerCommentsArray(result);
        }
        // Increment page for next fetch
        setPage(pageNum + 1);
      } else {
        console.error("Error in API response:", response.data.message);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        if (await refreshAccessToken()) {
          await fetchWorkerComments(requestId, pageNum);
        } else {
          router.push("/(auth)");
        }
      }
      console.error("Error fetching worker comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (workerId: number) => {
    try {
      // Update the request with status 1 (accepted) and set the workerId
      await apiClient.put(
        `/work/job-request/${requestId}/select-worker/${workerId}`
      );
      setWaitingAgrementWorker((prev) => {
        const newSet = new Set(prev);
        newSet.add(workerId);
        saveWaitingAgreementWorkers(newSet);
        return newSet;
      });
      setExpandedCommentIds(() => {
        const newSet = new Set<number>();
        newSet.add(workerId);
        return newSet;
      });

      // Optional: You might want to update the UI to reflect that a worker has been accepted
      // For example, disabling other worker's accept buttons or showing a success message
    } catch (error :any) {
      if (error.response?.status === 401) {
        if (await refreshAccessToken()) {
          await handleAccept(workerId);
        } else {
          router.push("/(auth)");
        }
      }
      console.error("Error accepting request:", error);
      Alert.alert(
        "Error",
        "Failed to accept the work request. Please try again."
      );
    }
  };

  const handleReject = async (workerId: number) => {
    try {
      // Update the request status to rejected (status 3)
      await apiClient.put(`/work/job-request/status/${requestId}`, {
        status: 2,
      });

      // Remove the rejected worker comment from the list
      setWorkerCommentsArray((prev) =>
        prev.filter((comment) => comment.worker_id !== workerId)
      );

      // Remove from expanded set when rejected
      setExpandedCommentIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(workerId);
        return newSet;
      });
    } catch (error:any) {
      if (error.response?.status === 401) {
        if (await refreshAccessToken()) {
          await handleReject(workerId);
        } else {
          router.push("/(auth)");
        }
      }
      console.error("Error rejecting request:", error);
      Alert.alert(
        "Error",
        "Failed to reject the work request. Please try again."
      );
    }
  };

  useEffect(() => {
    if (requestId) {
      loadWaitingAgreementWorkers();
    }
  }, [requestId]);

  const navigateToProfile = (id: number, role: number) => {
    router.push({
      pathname: "/(tabs)/(home)/profileAsView",
      params: {
        status,
        requestId,
        userId: id,
        userRole: role,
        origin: "workerComments",
      },
    });
  };

  const toggleCommentExpansion = (workerId: number) => {
    setExpandedCommentIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(workerId)) {
        newSet.delete(workerId);
      } else {
        newSet.add(workerId);
      }
      return newSet;
    });
  };

  // Initial data fetch
  useEffect(() => {
    if (requestId && !isNaN(requestId)) {
      fetchWorkerComments(requestId, 1);
    }
  }, [requestId]);

  // Update badge count whenever workerCommentsArray changes
  useEffect(() => {
    const pendingComments = workerCommentsArray.filter(
      (comment) => requestStatus !== "Completed" && requestStatus !== "Accepted"
    ).length;
    setBadgeCount(pendingComments);
  }, [workerCommentsArray, setBadgeCount]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <FlatList
          data={workerCommentsArray}
          keyExtractor={(item: WorkerComment) => item.worker_id.toString()}
          contentContainerStyle={{ padding: 10 }}
          onEndReached={() => {
            if (requestId && !isNaN(requestId) && hasMore && !loading) {
              fetchWorkerComments(requestId, page);
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading ? <ActivityIndicator size="large" color="#0000ff" /> : null
          }
          ListEmptyComponent={
            !loading ? (
              <View className="mt-10 items-center">
                <Text className="text-gray-500 text-lg">
                  No worker responses yet
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }: { item: WorkerComment }) => {
            console.log("Item:", requestStatus);
            const isExpanded = expandedCommentIds.has(item.worker_id);
            const isWaitingAgreement = waiting_agrement_worker.has(
              item.worker_id
            );
            return (
              <View className="mb-4">
                <View className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {/* Header with user info */}
                  <View className=" flex-row p-4 border-b border-gray-100">
                    <TouchableOpacity
                      className=" mr-3"
                      onPress={() => {
                        navigateToProfile(item.worker_id, 2);
                      }}
                    >
                      {item.profile_image ? (
                        <Image
                          source={{ uri: item.profile_image }}
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <View className="w-12 h-12 rounded-full bg-green-700 items-center justify-center">
                          <Text className="text-white text-lg font-bold">
                            {item.username.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                    <View className="flex-1 justify-center">
                      <TouchableOpacity
                        onPress={() => {
                          navigateToProfile(item.worker_id, 2);
                        }}
                      >
                        <Text className="text-lg font-semibold">
                          {item.username}
                        </Text>
                      </TouchableOpacity>
                      <Text className="text-xs text-gray-500">
                        {item.location.city || "Unknown"},{" "}
                        {item.location.region || "Unknown"}
                      </Text>
                      {item.categories.length > 0 && (
                        <Text className="text-xs text-gray-600 mt-1">
                          {item.categories.join(", ")}
                        </Text>
                      )}
                    </View>
                    <View className=" flex-col justify-between py-3">
                      <View className="items-center ">
                        {requestStatus == "Accepted" && (
                          <TouchableOpacity
                            className="mr-4"
                            onPress={() => {
                              handelcall(item.phone_number);
                            }}
                          >
                            <Ionicons name="call" size={32} color="#000" />
                          </TouchableOpacity>
                        )}
                      </View>
                      <Text className="text-xs text-gray-500">
                        {formatDate(item.created_at)}
                      </Text>
                    </View>
                  </View>

                  {/* Comment section - clickable */}
                  <TouchableOpacity
                    className="p-4 bg-gray-50"
                    onPress={() => toggleCommentExpansion(item.worker_id)}
                  >
                    <Text className="text-gray-800">
                      {isExpanded
                        ? item.message
                        : item.message && item.message.length > 60
                          ? `${item.message.substring(0, 60)}...`
                          : item.message}
                    </Text>
                    {!isExpanded &&
                      item.message &&
                      item.message.length > 60 && (
                        <Text className="text-blue-600 mt-1">Read more</Text>
                      )}
                  </TouchableOpacity>

                  {/* Action buttons - only shown when expanded */}
                  {isExpanded && requestStatus === "On Hold" && (
                    <View className="flex-col w-full">
                      <TouchableOpacity
                        onPress={() => handleAccept(item.worker_id)}
                        className={`${isWaitingAgreement ? "bg-blue-700" : "bg-specialGreen"} py-3 items-center`}
                      >
                        <Text className="text-white font-bold">
                          {isWaitingAgreement
                            ? "Waiting for Agreement of worker"
                            : "Accept Worker"}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="bg-red-500 py-3 items-center"
                        onPress={() => handleReject(item.worker_id)}
                      >
                        <Text className="text-white font-bold">Reject</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            );
          }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default WorkerComments;
