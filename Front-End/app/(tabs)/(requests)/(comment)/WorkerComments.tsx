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
import { Dispatch, SetStateAction } from "react";
import { useLocalSearchParams } from "expo-router";
import apiClient from "@/api/appClient";

// Updated interface to match backend response from getRequestMessages
interface WorkerComment {
  worker_id: number;
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
  // Local state fields (not from backend)
  status?: string;
  isConfirmed?: boolean;
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
  const { id } = useLocalSearchParams();
  const requestId : number = id ? parseInt(id as string, 10) : 0;

  const [workerCommentsArray, setWorkerCommentsArray] = useState<
    WorkerComment[]
  >([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [expandedCommentIds, setExpandedCommentIds] = useState<Set<number>>(
    new Set()
  );
  const [total, setTotal] = useState<number>(0);

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

        // Add status field to each comment (for local state management)
        const commentsWithStatus = result.map((comment) => ({
          ...comment,
          status: "pending",
          isConfirmed: false,
        }));

        // For page 1, replace the data, otherwise append
        if (pageNum === 1) {
          setWorkerCommentsArray(commentsWithStatus);
        } else {
          setWorkerCommentsArray((prev) => [
            ...prev,
            ...commentsWithStatus.filter(
              (comment) =>
                !prev.some(
                  (prevComment) => prevComment.worker_id === comment.worker_id
                )
            ),
          ]);
        }

        // Increment page for next fetch
        setPage(pageNum + 1);
      } else {
        console.error("Error in API response:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching worker comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (workerId: number) => {
    try {
      // Update the request with status 1 (accepted) and set the workerId
      await apiClient.put(`/work/job-request/${requestId}/select-worker/${workerId}`);

      // Update UI to show only the accepted worker's comment
      setWorkerCommentsArray((prev) =>
        prev
          .filter((comment) => comment.worker_id === workerId)
          .map((comment) => ({ ...comment, status: "accepted" }))
      );

      // Keep the accepted comment expanded to show the confirmation button
      setExpandedCommentIds((prev) => {
        const newSet = new Set<number>();
        newSet.add(workerId);
        return newSet;
      });

      // Optional: You might want to update the UI to reflect that a worker has been accepted
      // For example, disabling other worker's accept buttons or showing a success message
    } catch (error) {
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
    } catch (error) {
      console.error("Error rejecting request:", error);
      Alert.alert(
        "Error",
        "Failed to reject the work request. Please try again."
      );
    }
  };

  const handleConfirmCompletion = async (workerId: number) => {
    try {
      // Update the request status to completed (assuming 4 means "completed")
      await apiClient.put(`/work/job-request/status/${requestId}`, {
        status: 4,
      });

      // Update the comment to mark it as confirmed
      setWorkerCommentsArray((prev) =>
        prev.map((comment) =>
          comment.worker_id === workerId
            ? { ...comment, isConfirmed: true }
            : comment
        )
      );

      // Show confirmation message
      Alert.alert(
        "Work Completed",
        "You have successfully confirmed the completion of this work.",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error confirming work completion:", error);
      Alert.alert(
        "Error",
        "Failed to confirm work completion. Please try again."
      );
    }
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
      (comment) => comment.status === "pending"
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
            const isExpanded = expandedCommentIds.has(item.worker_id);
            return (
              <View className="mb-4">
                <View className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {/* Header with user info */}
                  <View className="flex-row p-4 border-b border-gray-100">
                    <View className="mr-3">
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
                    </View>
                    <View className="flex-1 justify-center">
                      <Text className="text-lg font-semibold">
                        {item.username}
                      </Text>
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
                    <View className="justify-center">
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
                  {isExpanded && item.status === "pending" && (
                    <View className="flex-col w-full">
                      <TouchableOpacity
                        className="bg-green-600 py-3 items-center"
                        onPress={() => handleAccept(item.worker_id)}
                      >
                        <Text className="text-white font-bold">
                          Accept Worker
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

                  {/* Show status if already accepted with confirmation button */}
                  {isExpanded &&
                    item.status === "accepted" &&
                    !item.isConfirmed && (
                      <View className="flex-col w-full">
                        <View className="bg-green-100 p-2 items-center">
                          <Text className="text-green-700 font-medium">
                            Work Accepted
                          </Text>
                        </View>
                        <TouchableOpacity
                          className="bg-blue-600 py-3 items-center mt-2"
                          onPress={() =>
                            handleConfirmCompletion(item.worker_id)
                          }
                        >
                          <Text className="text-white font-bold">
                            Confirm Work Completion
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}

                  {/* Show completion confirmed status */}
                  {item.status === "accepted" && item.isConfirmed && (
                    <View className="bg-blue-100 p-2 items-center">
                      <Text className="text-blue-700 font-medium">
                        Work Completion Confirmed
                      </Text>
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
