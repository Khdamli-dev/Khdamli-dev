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
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CONFIG from "@/config";

interface Request {
  id: number;
  user: string;
  location: string;
  aboutService: string;
  senttime: string;
  Workdate?: string;
  Worktime?: string;
  service?: string;
  payment?: string;
}

const Sender = () => {
  const [privateRequests, setPrivateRequests] = useState<Request[]>([
    // Example requests
    {
      id: 1,
      user: "John Doe",
      location: "123 Main St, Springfield",
      aboutService: "Plumbing repair for kitchen sink",
      senttime: "2025-04-20 10:30",
      Workdate: "2025-04-22",
      Worktime: "14:00",
      service: "Plumbing",
      payment: "Credit Card",
    },
    {
      id: 2,
      user: "Jane Smith",
      location: "456 Oak Ave, Shelbyville",
      aboutService: "Electrical wiring for new light fixtures",
      senttime: "2025-04-19 15:45",
      Workdate: "2025-04-23",
      Worktime: "09:00",
      service: "Electrical",
      payment: "Cash",
    },
    {
      id: 3,
      user: "Bob Johnson",
      location: "789 Pine Rd, Capital City",
      aboutService: "Painting living room walls",
      senttime: "2025-04-18 08:20",
      Workdate: "2025-04-21",
      Worktime: "11:00",
      service: "Painting",
      payment: "Bank Transfer",
    },
  ]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [clientId, setClientId] = useState<boolean>(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const { width: windowWidth } = Dimensions.get("window");

  const fetchPrivateRequests = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (!userData) {
        console.log("No user data found in AsyncStorage");
        return;
      }

      const user = JSON.parse(userData);
      const params =
        user.role === 1
          ? { client: user.id }
          : user.role === 2
            ? { worker: user.id }
            : {};

      const response = await axios.get(`${CONFIG.API_URL}/work/job-request/`, {
        params,
      });

      const requests: Request[] = response.data.requests || [];
      const requestsWithStatus = await Promise.all(
        requests.map(async (request) => {
          const status = await stateRequest(request.id);
          return { ...request, status };
        })
      );

      setPrivateRequests(
        requestsWithStatus.filter((req) => req.status !== "rejected")
      );
    } catch (err) {
      console.error("ERROR FETCHING DATA", err);
      alert("Error fetching data");
    }
  };

  const stateRequest = async (idRequest: number): Promise<string> => {
    try {
      const response = await axios.get(
        `http://example.com/api/privateRequests/${idRequest}/state`
      );
      return response.data.state || "";
    } catch (err) {
      console.error("Error fetching status Request", err);
      alert("Error fetching status request");
      return "";
    }
  };

  const RequestItemOnClient = ({ item }: { item: Request }) => {
    const [status, setStatus] = useState<string>("");
    const [imageModalVisible, setImageModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);

    const requestImages = [
      require("../../../../assets/images/istockphoto-615086822-170667a.jpg"),
      require("../../../../assets/images/images (1).jpg"),
    ];

    useEffect(() => {
      const fetchStatus = async () => {
        const currentStatus = "onhold"; //await stateRequest(item.id);
        setStatus(currentStatus);
      };
      fetchStatus();
    }, [item.id]);

    useEffect(() => {
      if (imageModalVisible && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          x: windowWidth * selectedImage,
          animated: false,
        });
      }
    }, [imageModalVisible, selectedImage]);

    if (status === "rejected") return null;

    const isSelected = selectedId === item.id;

    return (
      <TouchableOpacity
        className="bg-white my-0.5 p-2"
        onPress={() => setSelectedId(isSelected ? null : item.id)}
      >
        {isSelected ? (
          <View className="p-4">
            <View className="flex-row items-center mb-3">
              <Image
                className="w-16 h-16 rounded-full"
                source={require("../../../../assets/images/images (1).jpg")}
              />
              <View className="flex-1 pl-3">
                <Text className="text-xl font-bold">Khalil</Text>
                <Text className="text-sm text-gray-600">{item.senttime}</Text>
              </View>
              <View className="flex-row justify-between w-24">
                <Ionicons name="call" size={36} color="#000" />
                <MaterialCommunityIcons
                  name="message-text-outline"
                  size={36}
                  color="#000"
                />
              </View>
            </View>

            <Text className="text-xl font-bold mb-2">Request Details:</Text>
            <Text className="text-base">
              Work Date:{" "}
              <Text className="text-green-600">{item.Workdate || "N/A"}</Text>
            </Text>
            <Text className="text-base">
              Work Time:{" "}
              <Text className="text-green-600">{item.Worktime || "N/A"}</Text>
            </Text>
            <Text className="text-base">
              Address: <Text className="text-green-600">{item.location}</Text>
            </Text>
            <Text className="text-base">
              Service: <Text className="text-green-600">{item.service}</Text>
            </Text>
            <Text className="text-base">
              Payment Method:{" "}
              <Text className="text-green-600">{item.payment || "N/A"}</Text>
            </Text>
            <Text className="text-base">
              About Service:{" "}
              <Text className="text-green-600">{item.aboutService}</Text>
            </Text>

            <View className="mt-4">
              <Text className="text-lg mb-2">Request Images:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {requestImages.map((img, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => {
                      setSelectedImage(idx);
                      setImageModalVisible(true);
                    }}
                    className="mr-2"
                  >
                    <Image source={img} className="w-24 h-24 rounded-lg" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View className="flex-row mt-4 justify-between">
              {status === "accepted" ? (
                <TouchableOpacity className="flex-1 bg-blue-600 items-center justify-center py-3 mx-1 rounded">
                  <Text className="text-white text-lg">Mark as Completed</Text>
                </TouchableOpacity>
              ) : status === "onhold" ? (
                <TouchableOpacity className="flex-1 bg-red-600 items-center justify-center py-3 mx-1 rounded">
                  <Text className="text-white text-lg">Cancel Request</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        ) : (
          <View className="flex-row items-center">
            <Image
              className="w-16 h-16 rounded-full"
              source={require("../../../../assets/images/images (1).jpg")}
            />
            <View className="flex-1 pl-3">
              <View className="flex-row justify-between pr-4">
                <Text className="text-xl font-bold">Khalil</Text>
                <View className="items-center justify-center">
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
                  {status === "Accpeted" && (
                    <MaterialCommunityIcons
                      name="clock-time-four"
                      size={35}
                      color="#F8A100"
                    />
                  )}
                </View>
              </View>
              <Text className="font-medium">
                Service:{" "}
                <Text className="text-yellow-500">{item.aboutService}</Text>
              </Text>
            </View>
          </View>
        )}

        <Modal
          animationType="slide"
          transparent={true}
          visible={imageModalVisible}
          onRequestClose={() => setImageModalVisible(false)}
        >
          <View className="flex-1 bg-black/90 justify-center">
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
              {requestImages.map((img, idx) => (
                <View
                  key={idx}
                  style={{
                    width: windowWidth,
                    height: "70%",
                    justifyContent: "center",
                  }}
                >
                  <Image
                    source={img}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="contain"
                  />
                </View>
              ))}
            </ScrollView>

            <View className="flex-row mt-4 justify-center">
              {requestImages.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedImage(index)}
                  className={`w-3 h-3 rounded-full mx-1 ${
                    selectedImage === index ? "bg-white" : "bg-gray-600"
                  }`}
                />
              ))}
            </View>
          </View>
        </Modal>
      </TouchableOpacity>
    );
  };

  const RequestItemOnWorker = ({ item }: { item: Request }) => {
    const [isPressed, setIsPressed] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);
    const [imageModalVisible, setImageModalVisible] = useState(false);

    const requestImages = [
      require("../../../../assets/images/istockphoto-615086822-170667a.jpg"),
      require("../../../../assets/images/images (1).jpg"),
    ];

    useEffect(() => {
      if (imageModalVisible && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          x: windowWidth * selectedImage,
          animated: false,
        });
      }
    }, [imageModalVisible, selectedImage]);

    return (
      <View>
        {!isPressed ? (
          <TouchableOpacity
            className="flex-row bg-white py-3 px-4 mb-0.5"
            onPress={() => setIsPressed(true)}
          >
            <Image
              source={require("../../../../assets/images/images (1).jpg")}
              className="w-16 h-16 rounded-full"
            />
            <View className="flex-1">
              <View className="flex-row justify-between">
                <Text className="text-lg font-medium">{item.user}</Text>
                <Text className="text-sm text-gray-600">{item.senttime}</Text>
              </View>
              <Text className="text-sm">
                Service: <Text className="text-yellow-500">{item.service}</Text>
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            className="bg-white p-4"
            onPress={() => setIsPressed(false)}
          >
            <View className="flex-row items-center">
              <Image
                source={require("../../../../assets/images/images (1).jpg")}
                className="w-16 h-16 rounded-full"
              />
              <View className="flex-1 pl-2">
                <Text className="text-lg font-medium">{item.user}</Text>
              </View>
              <View className="flex-row justify-between w-24">
                <Ionicons name="call" size={40} color="#000" />
                <MaterialCommunityIcons
                  name="message-text-outline"
                  size={40}
                  color="#000"
                />
              </View>
            </View>

            <View className="pl-5">
              <Text className="text-xl font-bold">Request Details:</Text>
              <Text className="text-base">
                Request Date:{" "}
                <Text className="text-green-600">{item.Workdate}</Text>
              </Text>
              <Text className="text-base">
                Work Date:{" "}
                <Text className="text-green-600">{item.Workdate}</Text>
              </Text>
              <Text className="text-base">
                Work Time:{" "}
                <Text className="text-green-600">{item.Worktime}</Text>
              </Text>
              <Text className="text-base">
                Work Address:{" "}
                <Text className="text-green-600">{item.location}</Text>
              </Text>
              <Text className="text-base">
                Service: <Text className="text-green-600">{item.service}</Text>
              </Text>
              <Text className="text-base">
                Payment Method:{" "}
                <Text className="text-green-600">{item.payment}</Text>
              </Text>
              <Text className="text-base">
                About Service:{" "}
                <Text className="text-green-600">{item.aboutService}</Text>
              </Text>
            </View>

            <View className="mt-4 px-4">
              <Text className="text-lg mb-2">Request Images:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {requestImages.map((img, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => {
                      setSelectedImage(idx);
                      setImageModalVisible(true);
                    }}
                    className="mr-2"
                  >
                    <Image source={img} className="w-24 h-24 rounded-lg" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View className="flex-row mt-2">
              <TouchableOpacity className="flex-1 bg-green-600 items-center justify-center py-3">
                <Text className="text-white text-lg">Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-red-600 items-center justify-center py-3">
                <Text className="text-white text-lg">Reject</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}

        <Modal
          animationType="slide"
          transparent={true}
          visible={imageModalVisible}
          onRequestClose={() => setImageModalVisible(false)}
        >
          <View className="flex-1 bg-black/90 justify-center">
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
              {requestImages.map((img, idx) => (
                <View
                  key={idx}
                  style={{
                    width: windowWidth,
                    height: "70%",
                    justifyContent: "center",
                  }}
                >
                  <Image
                    source={img}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="contain"
                  />
                </View>
              ))}
            </ScrollView>

            <View className="flex-row mt-4 justify-center">
              {requestImages.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedImage(index)}
                  className={`w-3 h-3 rounded-full mx-1 ${
                    selectedImage === index ? "bg-white" : "bg-gray-600"
                  }`}
                />
              ))}
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  useEffect(() => {
    fetchPrivateRequests();
  }, []);

  return (
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <FlatList
          data={privateRequests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) =>
            clientId ? (
              <RequestItemOnClient item={item} />
            ) : (
              <RequestItemOnWorker item={item} />
            )
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Sender;
