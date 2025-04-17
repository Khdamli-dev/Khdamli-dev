import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from "react-native";
import React, { useEffect, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";

interface Request {
  id: number;
  user: string;
  location: string;
  sent_time: string;
  contact: string;
  description: string;
  aboutService: number;
  timeAgo: string;
  date?: string;
  time?: string;
  service?: string;
  phone?: string;
  payment?: string;
}

const Sender = () => {
  const [privateRequests, setPrivateRequests] = useState<Request[]>([
    {
      id: 2,
      user: "khalil djaidja",
      location: "M'sila",
      sent_time: "20/04/2003",
      contact: "0657378289",
      description: "The worker should be diligent",
      aboutService: 1234,
      timeAgo: "3 days ago",
    },
  ]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const fetchPrivateRequests = async () => {
    try {
      const response = await axios.get(
        "http://example.com/api/privateRequests"
      );
      const result: Request[] = response.data;
      // Fetch status for each request and filter out rejected ones
      const requestsWithStatus = await Promise.all(
        result.map(async (request) => {
          const status = await stateRequest(request.id);
          return { ...request, status };
        })
      );
      setPrivateRequests((prev) => [
        ...prev,
        ...requestsWithStatus.filter((req) => req.status !== "rejected"),
      ]);
    } catch (err) {
      console.error("ERROR FETCHING DATA", err);
      alert("ERROR FETCHING DATA");
    }
  };

  const stateRequest = async (idRequest: number): Promise<string> => {
    try {
      const response = await axios.get(
        `http://example.com/api/privateRequests/${idRequest}/state`
      );
      const state: string = response.data.state;
      switch (state) {
        case "accepted":
          return "accepted";
        case "rejected":
          return "rejected";
        case "onhold":
          return "onhold";
        case "completed":
          return "completed";
        default:
          return "";
      }
    } catch (err) {
      console.error("Error fetching status Request", err);
      alert("Error fetching status Request");
      return "";
    }
  };

  const RequestItem = ({ item }: { item: Request }) => {
    const [status, setStatus] = useState<string>("");
    const isSelected = selectedId === item.id;

    useEffect(() => {
      const fetchStatus = async () => {
        const s = "accepted"; //await stateRequest(item.id);
        setStatus(s);
        // Remove item from state if rejected
        if (s === "rejected") {
          setPrivateRequests((prev) =>
            prev.filter((req) => req.id !== item.id)
          );
        }
      };
      fetchStatus();
    }, [item.id]);

    // Don't render if status is rejected
    if (status === "rejected") {
      return null;
    }

    return (
      <TouchableOpacity
        style={{
          flexDirection: "row",
          backgroundColor: "#fff",
          marginTop: 1,
          padding: 8,
        }}
        onPress={() => setSelectedId(isSelected ? null : item.id)}
      >
        {isSelected ? (
          <View style={{ flex: 1 }}>
            <View className="p-4">
              <Text className="text-xl font-bold">Request Details:</Text>
              <Text className="text-lg">
                Date:{" "}
                <Text className="text-specialGreen">
                  {item.sent_time || "N/A"}
                </Text>
              </Text>
              <Text className="text-lg">
                Address:{" "}
                <Text className="text-specialGreen">{item.location}</Text>
              </Text>
              <Text className="text-lg">
                Service:{" "}
                <Text className="text-specialGreen">{item.description}</Text>
              </Text>
              <Text className="text-lg">
                Contact:{" "}
                <Text className="text-specialGreen">{item.contact}</Text>
              </Text>
              <Text className="text-lg">
                About Service:{" "}
                <Text className="text-specialGreen">{item.aboutService}</Text>
              </Text>
            </View>
          </View>
        ) : (
          <>
            <View style={{ padding: 4 }}>
              <Image
                style={{ width: 64, height: 64, borderRadius: 32 }}
                source={require("../../../../assets/images/images (1).jpg")}
              />
            </View>
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingRight: 16,
                }}
              >
                <View style={{ paddingLeft: 12, flex: 1 }}>
                  <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                    {item.user}
                  </Text>
                  <Text style={{ fontWeight: "500" }}>
                    Phone:{" "}
                    <Text style={{ color: "#F8A100" }}>{item.contact}</Text>
                  </Text>
                  <Text>
                    Service:{" "}
                    <Text style={{ color: "#F8A100" }}>{item.description}</Text>
                  </Text>
                </View>
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    paddingVertical: 8,
                  }}
                >
                  {status === "accepted" && (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={35}
                      color="green"
                    />
                  )}
                  {status === "completed" && (
                    <MaterialCommunityIcons
                      name="check-all"
                      size={35}
                      color="blue"
                    />
                  )}
                  {status === "onhold" && (
                    <MaterialCommunityIcons
                      name="clock-time-four"
                      size={35}
                      color="#F8A100"
                    />
                  )}
                </View>
              </View>
            </View>
          </>
        )}
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    fetchPrivateRequests();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <FlatList
          data={privateRequests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <RequestItem item={item} />}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Sender;
