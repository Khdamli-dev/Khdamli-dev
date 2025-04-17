import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  FlatList,
} from "react-native";
import React, { useEffect, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import axios from "axios";

interface Request {
  id: number;
  service: string;
  location: string;
  sent_time: string;
  contact: string;
  description: string;
  comments: number;
  timeAgo: string;
  canceled: boolean;
}

const PublicRequest = () => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [personnelRequests, setPersonnelRequests] = useState<Request[]>([
    {
      id: 2,
      service: "Plumber",
      location: "M'sila",
      sent_time: "20/04/2003",
      contact: "0657378289",
      description: "The worker should be diligent",
      comments: 1234,
      timeAgo: "3 days ago",
      canceled: false,
    },
    {
      id: 3,
      service: "Plumber",
      location: "M'sila",
      sent_time: "20/04/2003",
      contact: "0657378289",
      description: "The worker should be diligent",
      comments: 1234,
      timeAgo: "3 days ago",
      canceled: false,
    },
    {
      id: 4,
      service: "Plumber",
      location: "M'sila",
      sent_time: "20/04/2003",
      contact: "0657378289",
      description: "The worker should be diligent",
      comments: 1234,
      timeAgo: "3 days ago",
      canceled: false,
    },
    {
      id: 5,
      service: "Plumber",
      location: "M'sila",
      sent_time: "20/04/2003",
      contact: "0657378289",
      description: "The worker should be diligent",
      comments: 1234,
      timeAgo: "3 days ago",
      canceled: false,
    },
  ]);

  const fetchRequests = async () => {
    try {
      // Update the URL with your actual endpoint
      const response = await axios.get("/requests");
      const result: Request[] = response.data;
      setPersonnelRequests((prev) => [...prev, ...result]);
    } catch (err) {
      console.error("Error fetching requests:", err);
      alert("Error fetching requests");
    }
  };

  const cancelRequest = async (idRequest: number) => {
    try {
      const response = await axios.patch(
        `http://example.com/api/requests/${idRequest}`,
        { canceled: true }
      );

      setPersonnelRequests((prev) =>
        prev.map((req) =>
          req.id === idRequest ? { ...req, canceled: true } : req
        )
      );
      alert("Request canceled successfully");
    } catch (err) {
      console.error("Cancellation failed:", err);
      alert("Cancellation failed");
    }
  };

  const handleSelectRequest = (id: number) => {
    console.log("Handling request selection for id:", id);
    router.push({
      pathname: "/WorkerComments",
      params: { id },
    });
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        className="flex-1"
      >
        <FlatList
          data={personnelRequests.filter((item) => !item.canceled)}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <>
              {selectedId !== item.id ? (
                <TouchableOpacity
                  className="h-20 mb-2 flex-row bg-white"
                  onPress={() => setSelectedId(item.id)}
                >
                  <View className="w-1/6 justify-center items-center">
                    <View className="bg-gray-300 rounded-full relative p-2">
                      <View className="bg-red-700 rounded-full h-5 w-5 absolute top-[-3] left-[-5] items-center justify-center">
                        <Text className="text-white text-sm">2</Text>
                      </View>
                      <MaterialCommunityIcons name="clipboard-text" size={30} />
                    </View>
                  </View>
                  <View className="w-5/6 flex-row justify-between px-5 items-center">
                    <View>
                      <Text className="text-base leading-6">
                        Service: <Text>{item.service}</Text>
                      </Text>
                      <Text className="text-base">
                        Location: {item.location}
                      </Text>
                    </View>
                    <View className="items-center">
                      <Text className="leading-6">{item.timeAgo}</Text>
                      <Text>{item.comments} comments</Text>
                    </View>
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
                      Date:{" "}
                      <Text className="text-green-500">{item.sent_time}</Text>
                    </Text>
                    <Text className="text-lg">
                      Address:{" "}
                      <Text className="text-green-500">{item.location}</Text>
                    </Text>
                    <Text className="text-lg">
                      Service:{" "}
                      <Text className="text-green-500">{item.service}</Text>
                    </Text>
                    <Text className="text-lg">
                      Contacts:{" "}
                      <Text className="text-green-500">{item.contact}</Text>
                    </Text>
                    <Text className="text-lg">
                      About Service:{" "}
                      <Text className="text-green-500">{item.description}</Text>
                    </Text>
                  </View>
                  <View className="flex-row py-2">
                    <TouchableOpacity
                      onPress={() => handleSelectRequest(item.id)}
                      className="bg-green-500 w-1/2 justify-center items-center py-2"
                    >
                      <Text className="text-lg">Comments</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="bg-red-500 w-1/2 justify-center items-center py-2"
                      onPress={() => cancelRequest(item.id)}
                    >
                      <Text className="text-lg">Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              )}
            </>
          )}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PublicRequest;
