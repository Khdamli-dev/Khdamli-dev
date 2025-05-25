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
import { handelcall, handleEmailPress } from "../SomeStandarFunctions";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { store } from "expo-router/build/global-state/router-store";
import { CheckCircle } from "lucide-react-native";

// Updated interface to match backend response from getRequestMessages
interface WorkerComment {
  worker_id: number;
  email: string;
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
  const [isWaitingAgreement, setisWaitingAgreement] = useState<number | null>(
    null
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
    } catch (error) {
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
      await storeWaitingAgreement(workerId);
      setisWaitingAgreement(workerId);
      setExpandedCommentIds(() => {
        const newSet = new Set<number>();
        newSet.add(workerId);
        return newSet;
      });
    } catch (error: any) {
      console.error("Error accepting request:", error.response.data);
      Alert.alert(
        "Error",
        "Failed to accept the work request. Please try again."
      );
    }
  };

  const handleReject = async (workerId: number) => {
    try {
      await apiClient.delete(
        `/work/job-request/${requestId}/worker/${workerId}`
      );
      await storeWaitingAgreement(null);
      setisWaitingAgreement(null);
    } catch (error: any) {
      console.error("Error rejecting request:", error.response.data);
      Alert.alert(
        "Error",
        "Failed to reject the work request. Please try again."
      );
    }
  };

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

  const storeWaitingAgreement = async (waiting_agreement: number | null) => {
    try {
      console.log(waiting_agreement, "waiting_agreement");
      if (waiting_agreement === null) {
        await AsyncStorage.removeItem(`waiting_agreement_${requestId}`);
      } else {
        await AsyncStorage.setItem(
          `waiting_agreement_${requestId}`,
          JSON.stringify(waiting_agreement)
        );
      }
    } catch (error) {
      console.error("Error storing waiting agreement:", error);
    }
  };

  const loadWaitingAgreement = async () => {
    try {
      const stored = await AsyncStorage.getItem(
        `waiting_agreement_${requestId}`
      );
      console.log("sotred:", stored);
      if (stored) {
        const parsedValue = parseInt(stored);
        if (!isNaN(parsedValue)) {
          setisWaitingAgreement(parsedValue);
        }
        console.log("Stored waiting agreement: on loadiding", parsedValue);
      }
      console.log("Waiting agreement loaded successfully:", stored);
    } catch (error) {
      console.error("Error loading waiting agreement:", error);
    }
  };

  useEffect(() => {
    const fetchAgreement = async () => {
      await loadWaitingAgreement();
    };
    console.log("Fetching waiting agreement on mount");
    fetchAgreement();
  }, [requestId]);

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
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: "#F3F4F6",
            backgroundColor: "white",
          }}
        >
          <MaterialCommunityIcons
            name="comment-multiple-outline"
            size={20}
            color="#22C55E"
          />
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: "#111827",
              marginLeft: 8,
              fontFamily: "Itim_400Regular",
            }}
          >
            Worker Responses
          </Text>
        </View>

        <FlatList
          data={workerCommentsArray}
          keyExtractor={(item: WorkerComment) => item.worker_id.toString()}
          contentContainerStyle={{ padding: 16 }}
          onEndReached={() => {
            if (requestId && !isNaN(requestId) && hasMore && !loading) {
              fetchWorkerComments(requestId, page);
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading ? (
              <View style={{ padding: 20, alignItems: "center" }}>
                <ActivityIndicator size="large" color="#22C55E" />
              </View>
            ) : null
          }
          ListEmptyComponent={
            !loading ? (
              <View
                style={{
                  backgroundColor: "#F9FAFB",
                  borderRadius: 12,
                  padding: 32,
                  alignItems: "center",
                  marginTop: 20,
                }}
              >
                <MaterialCommunityIcons
                  name="comment-remove-outline"
                  size={48}
                  color="#9CA3AF"
                />
                <Text
                  style={{
                    color: "#6B7280",
                    fontSize: 16,
                    marginTop: 12,
                    fontFamily: "Itim_400Regular",
                  }}
                >
                  No worker responses yet
                </Text>
                <Text
                  style={{
                    color: "#9CA3AF",
                    fontSize: 14,
                    marginTop: 4,
                    textAlign: "center",
                    fontFamily: "Itim_400Regular",
                  }}
                >
                  Workers will appear here when they respond to your request
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }: { item: WorkerComment }) => {
            const isExpanded = expandedCommentIds.has(item.worker_id);
            return (
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: 12,
                  marginBottom: 12,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 2,
                  overflow: "hidden",
                }}
              >
                {/* Header with user info */}
                <View
                  style={{
                    flexDirection: "row",
                    padding: 16,
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    style={{ marginRight: 12 }}
                    onPress={() => {
                      navigateToProfile(item.worker_id, 2);
                    }}
                  >
                    {item.profile_image ? (
                      <Image
                        source={{ uri: item.profile_image }}
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 24,
                        }}
                      />
                    ) : (
                      <View
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 24,
                          backgroundColor: "#22C55E",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            color: "white",
                            fontSize: 18,
                            fontWeight: "600",
                            fontFamily: "Itim_400Regular",
                          }}
                        >
                          {item.username.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  <View style={{ flex: 1 }}>
                    <TouchableOpacity
                      onPress={() => {
                        navigateToProfile(item.worker_id, 2);
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          color: "#111827",
                          fontFamily: "Itim_400Regular",
                          marginBottom: 2,
                        }}
                      >
                        {item.username}
                      </Text>
                    </TouchableOpacity>
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#6B7280",
                        fontFamily: "Itim_400Regular",
                        marginBottom: 2,
                      }}
                    >
                      {item.location.city || "Unknown"},{" "}
                      {item.location.region || "Unknown"}
                    </Text>
                    {item.categories.length > 0 && (
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#9CA3AF",
                          fontFamily: "Itim_400Regular",
                        }}
                      >
                        {item.categories.length > 3
                          ? `${item.categories.slice(0, 3).join(", ")} +${item.categories.length - 3} more`
                          : item.categories.join(", ")}
                      </Text>
                    )}
                  </View>

                  <View style={{ alignItems: "flex-end" }}>
                    {requestStatus == "Accepted" && (
                      <View style={{ flexDirection: "row", marginBottom: 8 }}>
                        <TouchableOpacity
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            backgroundColor: "#F0FDF4",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 8,
                          }}
                          onPress={() => {
                            handelcall(item.phone_number);
                          }}
                        >
                          <Ionicons name="call" size={18} color="#22C55E" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            backgroundColor: "#F0FDF4",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          onPress={() => {
                            handleEmailPress(item.email);
                          }}
                        >
                          <MaterialCommunityIcons
                            name="message-badge-outline"
                            size={18}
                            color="#22C55E"
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                    <Text
                      style={{
                        fontSize: 11,
                        color: "#9CA3AF",
                        fontFamily: "Itim_400Regular",
                      }}
                    >
                      {formatDate(item.created_at)}
                    </Text>
                  </View>
                </View>

                {/* Comment section - clickable */}
                <TouchableOpacity
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    backgroundColor: "#F9FAFB",
                    borderTopWidth: 1,
                    borderTopColor: "#F3F4F6",
                  }}
                  onPress={() => toggleCommentExpansion(item.worker_id)}
                >
                  <Text
                    style={{
                      color: "#374151",
                      fontSize: 14,
                      lineHeight: 20,
                      fontFamily: "Itim_400Regular",
                    }}
                  >
                    {isExpanded
                      ? item.message
                      : item.message && item.message.length > 60
                        ? `${item.message.substring(0, 60)}...`
                        : item.message}
                  </Text>
                  {!isExpanded && item.message && item.message.length > 60 && (
                    <Text
                      style={{
                        color: "#22C55E",
                        fontSize: 13,
                        marginTop: 4,
                        fontWeight: "500",
                        fontFamily: "Itim_400Regular",
                      }}
                    >
                      Read more
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Action buttons - only shown when expanded */}
                {isExpanded && (
                  <View>
                    {!(
                      (isWaitingAgreement == item.worker_id ||
                        status == "verification pending") &&
                      (item.worker_id == workerIdNumber ||
                        item.worker_id == isWaitingAgreement)
                    ) ? (
                      !isWaitingAgreement &&
                      !(status == "Accepted") && (
                        <TouchableOpacity
                          onPress={() => {
                            handleAccept(item.worker_id);
                          }}
                          style={{
                            backgroundColor: "#22C55E",
                            paddingVertical: 14,
                            alignItems: "center",
                            borderTopWidth: 1,
                            borderTopColor: "#F3F4F6",
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <CheckCircle
                              size={16}
                              color="white"
                              strokeWidth={2.5}
                            />
                            <Text
                              style={{
                                color: "white",
                                fontSize: 15,
                                fontWeight: "600",
                                marginLeft: 6,
                                fontFamily: "Itim_400Regular",
                              }}
                            >
                              Accept Worker
                            </Text>
                          </View>
                        </TouchableOpacity>
                      )
                    ) : (
                      <View>
                        <View
                          style={{
                            backgroundColor: "#F3F4F6",
                            paddingVertical: 14,
                            alignItems: "center",
                            borderTopWidth: 1,
                            borderTopColor: "#E5E7EB",
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <MaterialCommunityIcons
                              name="clock-outline"
                              size={16}
                              color="#6B7280"
                            />
                            <Text
                              style={{
                                color: "#6B7280",
                                fontSize: 15,
                                fontWeight: "500",
                                marginLeft: 6,
                                fontFamily: "Itim_400Regular",
                              }}
                            >
                              Waiting for agreement
                            </Text>
                          </View>
                        </View>
                        <TouchableOpacity
                          style={{
                            backgroundColor: "#DC2626",
                            paddingVertical: 14,
                            alignItems: "center",
                          }}
                          onPress={() => handleReject(item.worker_id)}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <MaterialCommunityIcons
                              name="close-circle-outline"
                              size={16}
                              color="white"
                            />
                            <Text
                              style={{
                                color: "white",
                                fontSize: 15,
                                fontWeight: "600",
                                marginLeft: 6,
                                fontFamily: "Itim_400Regular",
                              }}
                            >
                              Cancel
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default WorkerComments;
