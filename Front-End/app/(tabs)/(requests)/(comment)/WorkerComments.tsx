import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  Ionicons,
  FontAwesome6,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Dispatch, SetStateAction } from "react";
import axios from "axios";
import { useRoute } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
interface WorkerCommentsProps {
  setBadgcount: Dispatch<SetStateAction<number>>;
}

type WorkerComment = {
  id: 1;
  name: String;
  phone: number;
  location: String;
  sent_time: number;
  service: String;
  payment: String;
  date: String;
  time: String;
  description: String;
  image: 0;
};

const [workerCommentsArray, setworkerCommentsArray] = useState<WorkerComment[]>(
  []
);
const [page, setPage] = useState(1);
const [loading, setLoading] = useState(false);
const [hasMore, setHasMore] = useState(true);
const pageSize = 20;
const fetchWorkerComments = async (IdRequest: number) => {
  if (loading || !hasMore) return;

  setLoading(true);
  try {
    const response = await axios.get(
      `https://your-backend.com/api/comments/${IdRequest}`
    );

    const result = await response.data;
    if (result.length < pageSize) setHasMore(false);
    setPage((prev) => prev + 1);
    setworkerCommentsArray((prevComments) => [
      ...prevComments,
      ...result,
    ]);
  } catch (error) {
    console.error("Error fetching worker comments:", error);
  }
};

const WorkerComments: React.FC<WorkerCommentsProps> = ({
  setBadgcount = () => {},
}) => {
  const { id } = useLocalSearchParams();
  console.log("the length is :", workerCommentsArray.length);

  // If the idRequest is passed through navigation, it will be available here
  const IdRequest: any = id;
  const parsedIdRequest = IdRequest ? parseInt(IdRequest, 10) : undefined;
  const [selectedId, setSelectedId] = useState<number | null>(null);
  console.log("the id request is :", parsedIdRequest);

  useEffect(() => {
    if (setBadgcount) {
      setBadgcount(workerCommentsArray.length);
    }

    if (parsedIdRequest !== undefined && !isNaN(parsedIdRequest)) {
      fetchWorkerComments(parsedIdRequest);
    }
  }, [workerCommentsArray, setBadgcount, parsedIdRequest]);

  return (
    <FlatList
      data={workerCommentsArray}
      keyExtractor={(item) => item.id.toString()}
      onEndReachedThreshold={0.5}
      ListFooterComponent={loading ? <ActivityIndicator /> : null}
      renderItem={({ item }) => (
        <View>
          {selectedId !== item.id ? (
            // Collapsed view
            <TouchableOpacity
              className="h-20 mb-1 flex-row w-full bg-white"
              onPress={() => setSelectedId(item.id)}
            >
              <View className="w-2/12 h-full items-center justify-center">
                <View className="w-12 h-12 rounded-full bg-green-800" />
              </View>

              <View className="w-10/12 h-full flex-row">
                <View className="w-2/3 pl-3">
                  <Text className="text-lg leading-7">{item.name}</Text>
                  <View className="flex-row items-center">
                    <MaterialCommunityIcons name="cellphone-basic" size={30} />
                    <Text className="text-sm">{item.phone}</Text>
                  </View>
                </View>
                <View className="items-center justify-between py-2 w-1/3">
                  <Text>{item.sent_time}</Text>
                  <View className="flex-row items-center">
                    <FontAwesome6 name="map-location-dot" size={25} />
                    <Text>{item.location}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            // Expanded view
            <TouchableOpacity
              className="bg-white mt-1"
              onPress={() => setSelectedId(null)}
            >
              {/* Worker Info */}
              <View className="flex-row">
                <View className="items-center justify-center pl-2">
                  <View className="rounded-full bg-green-800" />
                </View>
                <View className="w-3/6 pl-2 pt-1">
                  <Text className="text-xl font-medium">{item.name}</Text>
                </View>
                <View className="w-2/6 h-full flex-row items-center justify-between px-2">
                  <Ionicons name="call" size={40} />
                  <MaterialCommunityIcons
                    name="message-text-outline"
                    size={40}
                  />
                </View>
              </View>

              {/* Request Details */}
              <View className="pl-20">
                <Text className="text-xl">Request Details:</Text>
                <Text className="text-xl">
                  Date: <Text className="text-specialGreen">{item.date}</Text>
                </Text>
                <Text className="text-xl">
                  Time: <Text className="text-specialGreen">{item.time}</Text>
                </Text>
                <Text className="text-xl">
                  Address:{" "}
                  <Text className="text-specialGreen">{item.location}</Text>
                </Text>
                <Text className="text-xl">
                  Service:{" "}
                  <Text className="text-specialGreen">{item.service}</Text>
                </Text>
                <Text className="text-xl">
                  Contacts:{" "}
                  <Text className="text-specialGreen">{item.phone}</Text>
                </Text>
                <Text className="text-xl">
                  Payment:{" "}
                  <Text className="text-specialGreen">{item.payment}</Text>
                </Text>
                <Text className="text-xl">
                  About Service:
                  <Text className="text-specialGreen"> {item.description}</Text>
                </Text>
              </View>

              {/* Accept/Reject Buttons */}
              <View className="flex-row">
                <TouchableOpacity className="bg-specialGreen w-1/2 items-center justify-center">
                  <Text className="text-xl">Accept✓</Text>
                </TouchableOpacity>
                <TouchableOpacity className="bg-red-700 w-1/2 items-center justify-center">
                  <Text className="text-xl">RejectX</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        </View>
      )}
    />
  );
};

export default WorkerComments;

const styles = StyleSheet.create({
  size: {
    width: 40,
    height: 40,
  },
});
