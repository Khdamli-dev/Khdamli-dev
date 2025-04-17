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
  name: string;
  phone: string;
  location: string;
  sent_time: string;
  service: string;
  payment: string;
  date: string;
  time: string;
  description: string;
  image?: string;
  status?: string;
}

interface WorkerCommentsProps {
  setBadgcount: Dispatch<SetStateAction<number>>;
}

const WorkerComments: React.FC<WorkerCommentsProps> = ({
  setBadgcount = () => {},
}) => {
  const { id } = useLocalSearchParams();
  const parsedIdRequest = id ? parseInt(id as string, 10) : undefined;

  const [workerCommentsArray, setWorkerCommentsArray] = useState<
    WorkerComment[]
  >([
    {
      id: 1,
      name: "Alice Johnson",
      phone: "5551234567",
      location: "New York, NY",
      sent_time: "2025-04-17 14:30",
      service: "Plumbing",
      payment: "Credit Card",
      date: "2025-04-17",
      time: "14:30",
      description: "Fixed the kitchen sink leak",
      image: undefined,
      status: "pending",
    },
    {
      id: 2,
      name: "Alice Johnson",
      phone: "5551234567",
      location: "New York, NY",
      sent_time: "2025-04-17 14:30",
      service: "Plumbing",
      payment: "Credit Card",
      date: "2025-04-17",
      time: "14:30",
      description: "Fixed the kitchen sink leak",
      image: undefined,
      status: "pending",
    },
    {
      id: 3,
      name: "Alice Johnson",
      phone: "5551234567",
      location: "New York, NY",
      sent_time: "2025-04-17 14:30",
      service: "Plumbing",
      payment: "Credit Card",
      date: "2025-04-17",
      time: "14:30",
      description: "Fixed the kitchen sink leak",
      image: undefined,
      status: "pending",
    },
    {
      id: 4,
      name: "Alice Johnson",
      phone: "5551234567",
      location: "New York, NY",
      sent_time: "2025-04-17 14:30",
      service: "Plumbing",
      payment: "Credit Card",
      date: "2025-04-17",
      time: "14:30",
      description: "Fixed the kitchen sink leak",
      image: undefined,
      status: "pending",
    },
    {
      id: 5,
      name: "Alice Johnson",
      phone: "5551234567",
      location: "New York, NY",
      sent_time: "2025-04-17 14:30",
      service: "Plumbing",
      payment: "Credit Card",
      date: "2025-04-17",
      time: "14:30",
      description: "Fixed the kitchen sink leak",
      image: undefined,
      status: "pending",
    },
    {
      id: 6,
      name: "Alice Johnson",
      phone: "5551234567",
      location: "New York, NY",
      sent_time: "2025-04-17 14:30",
      service: "Plumbing",
      payment: "Credit Card",
      date: "2025-04-17",
      time: "14:30",
      description: "Fixed the kitchen sink leak",
      image: undefined,
      status: "pending",
    },
    {
      id: 7,
      name: "Alice Johnson",
      phone: "5551234567",
      location: "New York, NY",
      sent_time: "2025-04-17 14:30",
      service: "Plumbing",
      payment: "Credit Card",
      date: "2025-04-17",
      time: "14:30",
      description: "Fixed the kitchen sink leak",
      image: undefined,
      status: "pending",
    },
  ]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const pageSize: number = 20;

  const fetchWorkerComments = async (idRequest: number, pageNum: number) => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      /* const response = await axios.get(
        `https://your-backend.com/api/comments/${idRequest}?page=${pageNum}&size=${pageSize}`
      ); */
      const result: WorkerComment[] = workerCommentsArray; //response.data;
      if (result.length < pageSize) setHasMore(false);
      setWorkerCommentsArray((prev) => [
        ...prev,
        ...result.filter((comment) => comment.status !== "rejected"),
      ]);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error("Error fetching worker comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (commentId: number) => {
    try {
      await axios.put(
        `https://your-backend.com/api/comments/${commentId}/status`,
        { state: "accepted" }
      );
      setWorkerCommentsArray((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? { ...comment, status: "accepted" }
            : comment
        )
      );
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
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  useEffect(() => {
    if (parsedIdRequest && !isNaN(parsedIdRequest)) {
      fetchWorkerComments(parsedIdRequest, page);
    }
  }, [parsedIdRequest]);

  useEffect(() => {
    setBadgcount(workerCommentsArray.length);
  }, [workerCommentsArray, setBadgcount]);

  return (
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        className="flex-1"
      >
        <FlatList
          data={workerCommentsArray}
          keyExtractor={(item: WorkerComment) => item.id.toString()}
          onEndReached={() => {
            if (parsedIdRequest && !isNaN(parsedIdRequest)) {
              fetchWorkerComments(parsedIdRequest, page);
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading ? <ActivityIndicator size="large" color="#0000ff" /> : null
          }
          renderItem={({ item }: { item: WorkerComment }) => (
            <View>
              {selectedId !== item.id ? (
                // Collapsed view
                <TouchableOpacity 
                  className="h-20 mb-1 flex-row w-full bg-white rounded-lg shadow-md"
                  onPress={() => setSelectedId(item.id)}
                >
                  <View className="w-2/12 h-full items-center justify-center">
                    {item.image ? (
                      <Image
                        source={{ uri: item.image }}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <View className="w-12 h-12 rounded-full bg-[#15803d]" />
                    )}
                  </View>
                  <View className="w-10/12 h-full flex-row">
                    <View className="w-2/3 pl-3 justify-center">
                      <Text className="text-lg font-semibold leading-7">
                        {item.name}
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <MaterialCommunityIcons
                          name="cellphone-basic"
                          size={30}
                          color="#000"
                        />
                        <Text className="text-sm ml-1">{item.phone}</Text>
                      </View>
                    </View>
                    <View className="w-1/3 items-center justify-between py-2">
                      <Text className="text-sm">{item.sent_time}</Text>
                      <View className="flex-row items-center">
                        <FontAwesome6
                          name="map-location-dot"
                          size={25}
                          color="#000"
                        />
                        <Text className="text-sm ml-1">{item.location}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ) : (
                // Expanded view
                <TouchableOpacity
                  className="bg-white mt-1 rounded-lg shadow-md"
                  onPress={() => setSelectedId(null)}
                >
                  {/* Worker Info */}
                  <View className="flex-row p-2 items-center">
                    <View className="items-center justify-center pl-2">
                      {item.image ? (
                        <Image
                          source={{ uri: item.image }}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <View className="w-10 h-10 rounded-full bg-[#15803d]" />
                      )}
                    </View>
                    <View className="w-3/6 pl-2 pt-1">
                      <Text className="text-xl font-medium">{item.name}</Text>
                    </View>
                    <View className="w-2/6 h-full flex-row items-center justify-between px-2">
                      <Ionicons name="call" size={40} color="#000" />
                      <MaterialCommunityIcons
                        name="message-text-outline"
                        size={40}
                        color="#000"
                      />
                    </View>
                  </View>
                  {/* Request Details */}
                  <View className="pl-20 pb-4">
                    <Text className="text-xl font-semibold mb-2">
                      Request Details:
                    </Text>
                    <Text className="text-xl mb-1">
                      Date: <Text className="text-[#15803d]">{item.date}</Text>
                    </Text>
                    <Text className="text-xl mb-1">
                      Time: <Text className="text-[#15803d]">{item.time}</Text>
                    </Text>
                    <Text className="text-xl mb-1">
                      Address:{" "}
                      <Text className="text-[#15803d]">{item.location}</Text>
                    </Text>
                    <Text className="text-xl mb-1">
                      Service:{" "}
                      <Text className="text-[#15803d]">{item.service}</Text>
                    </Text>
                    <Text className="text-xl mb-1">
                      Contacts:{" "}
                      <Text className="text-[#15803d]">{item.phone}</Text>
                    </Text>
                    <Text className="text-xl mb-1">
                      Payment:{" "}
                      <Text className="text-[#15803d]">{item.payment}</Text>
                    </Text>
                    <Text className="text-xl mb-1">
                      About Service:{" "}
                      <Text className="text-[#15803d]">{item.description}</Text>
                    </Text>
                  </View>
                  {/* Accept/Reject Buttons */}
                  <View className="flex-row">
                    <TouchableOpacity
                      className="bg-[#15803d] w-1/2 items-center justify-center py-3 rounded-bl-lg"
                      onPress={() => handleAccept(item.id)}
                    >
                      <Text className="text-xl text-white font-semibold">
                        Accept ✓
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="bg-red-700 w-1/2 items-center justify-center py-3 rounded-br-lg"
                      onPress={() => handleReject(item.id)}
                    >
                      <Text className="text-xl text-white font-semibold">
                        Reject ✗
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default WorkerComments;
