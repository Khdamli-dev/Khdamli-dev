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
import {
  Ionicons,
  FontAwesome6,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Dispatch, SetStateAction } from "react";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";

interface WorkerComment {
  id: number;
  username: string;
  sent_time?: string;
  comment?: string;
  image?: string;
  status?: string;
  isConfirmed?: boolean;
}

interface WorkerCommentsProps {
  setBadgeCount: Dispatch<SetStateAction<number>>;
}

const WorkerComments: React.FC<WorkerCommentsProps> = ({
  setBadgeCount = () => {},
}) => {
  const { id } = useLocalSearchParams();
  const parsedIdRequest = id ? parseInt(id as string, 10) : undefined;

  const [workerCommentsArray, setWorkerCommentsArray] = useState<
    WorkerComment[]
  >([
    {
      id: 1,
      username: "Alice Johnson",
      sent_time: "2025-04-17 14:30",
      comment:
        "Fixed the kitchen sink leak. The pipe under the sink was corroded and needed replacement. I installed a new PVC pipe with proper sealing to prevent future leaks.",
      image: undefined,
      status: "pending",
      isConfirmed: false,
    },
    {
      id: 2,
      username: "khalil",
      sent_time: "2025-04-17 14:30",
      comment:
        "Fixed the kitchen sink leak. Used water-resistant sealant to ensure no more leaking occurs. Also checked other pipes in the vicinity for potential issues.",
      image: undefined,
      status: "pending",
      isConfirmed: false,
    },
    {
      id: 3,
      username: "houda",
      sent_time: "2025-04-17 14:30",
      comment:
        "Fixed the kitchen sink leak. Used water-resistant sealant to ensure no more leaking occurs. Also checked other pipes in the vicinity for potential issues.",
      image: undefined,
      status: "pending",
      isConfirmed: false,
    },
    {
      id: 4,
      username: "asma",
      sent_time: "2025-04-17 14:30",
      comment:
        "Fixed the kitchen sink leak. Used water-resistant sealant to ensure no more leaking occurs. Also checked other pipes in the vicinity for potential issues.",
      image: undefined,
      status: "pending",
      isConfirmed: false,
    },
  ]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [expandedCommentIds, setExpandedCommentIds] = useState<Set<number>>(
    new Set()
  );
  const pageSize: number = 20;

  const fetchWorkerComments = async (idRequest: number, pageNum: number) => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      /* const response = await axios.get(
        `https://your-backend.com/api/comments/${idRequest}?page=${pageNum}&size=${pageSize}`
      ); */
      const result: WorkerComment[] = workerCommentsArray; // response.data;
      if (result.length < pageSize) setHasMore(false);

      // Don't add duplicates if we're working with mocked data
      if (pageNum === 1) {
        setWorkerCommentsArray(
          result.filter((comment) => comment.status !== "rejected")
        );
      } else {
        setWorkerCommentsArray((prev) => [
          ...prev,
          ...result.filter(
            (comment) =>
              comment.status !== "rejected" &&
              !prev.some((prevComment) => prevComment.id === comment.id)
          ),
        ]);
      }
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error("Error fetching worker comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (commentId: number) => {
    try {
      /* await axios.put(
        `https://your-backend.com/api/comments/${commentId}/status`,
        { state: "accepted" }
      ); */

      // Keep only the accepted comment and remove all others
      setWorkerCommentsArray((prev) =>
        prev
          .filter((comment) => comment.id === commentId)
          .map((comment) => ({ ...comment, status: "accepted" }))
      );

      // Keep the accepted comment expanded to show the confirmation button
      setExpandedCommentIds((prev) => {
        const newSet = new Set<number>();
        newSet.add(commentId);
        return newSet;
      });
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const handleReject = async (commentId: number) => {
    try {
      /* await axios.put(
        `https://your-backend.com/api/comments/${commentId}/status`,
        { state: "rejected" }
      ); */
      setWorkerCommentsArray((prev) =>
        prev.filter((comment) => comment.id !== commentId)
      );
      // Remove from expanded set when rejected
      setExpandedCommentIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  const handleConfirmCompletion = async (commentId: number) => {
    try {
      /* await axios.put(
        `https://your-backend.com/api/comments/${commentId}/confirm`,
        { confirmed: true }
      ); */

      // Update the comment to mark it as confirmed
      setWorkerCommentsArray((prev) =>
        prev.map((comment) =>
          comment.id === commentId ? { ...comment, isConfirmed: true } : comment
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
    }
  };

  const toggleCommentExpansion = (commentId: number) => {
    setExpandedCommentIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    if (parsedIdRequest && !isNaN(parsedIdRequest)) {
      fetchWorkerComments(parsedIdRequest, page);
    }
  }, [parsedIdRequest]); // Remove page dependency to avoid infinite loop

  useEffect(() => {
    const pendingComments = workerCommentsArray.filter(
      (comment) => comment.status === "pending"
    ).length;
    setBadgeCount(pendingComments);
  }, [workerCommentsArray, setBadgeCount]);

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <FlatList
          data={workerCommentsArray}
          keyExtractor={(item: WorkerComment) => item.id.toString()}
          contentContainerStyle={{ padding: 10 }}
          onEndReached={() => {
            if (
              parsedIdRequest &&
              !isNaN(parsedIdRequest) &&
              hasMore &&
              !loading
            ) {
              fetchWorkerComments(parsedIdRequest, page);
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading ? <ActivityIndicator size="large" color="#0000ff" /> : null
          }
          renderItem={({ item }: { item: WorkerComment }) => {
            const isExpanded = expandedCommentIds.has(item.id);
            return (
              <View className="mb-4">
                <View className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {/* Header with user info */}
                  <View className="flex-row p-4 border-b border-gray-100">
                    <View className="mr-3">
                      {item.image ? (
                        <Image
                          source={{ uri: item.image }}
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <View className="w-12 h-12 rounded-full bg-green-700 items-center justify-center">
                          <Text className="text-white text-lg font-bold">
                            {item.username.charAt(0)}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View className="flex-1 justify-center">
                      <Text className="text-lg font-semibold">
                        {item.username}
                      </Text>
                    </View>
                    <View className="justify-center">
                      <Text className="text-xs text-gray-500">
                        {item.sent_time}
                      </Text>
                    </View>
                  </View>

                  {/* Comment section - clickable */}
                  <TouchableOpacity
                    className="p-4 bg-gray-50"
                    onPress={() => toggleCommentExpansion(item.id)}
                  >
                    <Text className="text-gray-800">
                      {isExpanded
                        ? item.comment
                        : item.comment && item.comment.length > 60
                          ? `${item.comment.substring(0, 60)}...`
                          : item.comment}
                    </Text>
                    {!isExpanded &&
                      item.comment &&
                      item.comment.length > 60 && (
                        <Text className="text-blue-600 mt-1">Read more</Text>
                      )}
                  </TouchableOpacity>

                  {/* Action buttons - only shown when expanded */}
                  {isExpanded && item.status === "pending" && (
                    <View className="flex-col w-full">
                      <TouchableOpacity
                        className="bg-green-600 py-3 items-center"
                        onPress={() => handleAccept(item.id)}
                      >
                        <Text className="text-white font-bold">
                          Accept Work
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="bg-red-500 py-3 items-center"
                        onPress={() => handleReject(item.id)}
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
                          onPress={() => handleConfirmCompletion(item.id)}
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
