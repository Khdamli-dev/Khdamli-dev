import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Modal,
  Dimensions,
  SafeAreaView,
  KeyboardAvoidingView,
  FlatList,
  Platform,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import axios from "axios";
// Import the interfaces from your interfaces file
import {
  Request,
  BaseRequest,
  RequestOnClient,
  RequestOnWorker,
  UserRole,
} from "../../../../Interfaces/Requestsinterfaces";

const PublicRequest = () => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [pressed, setPressed] = useState(false);
  const [showFullComment, setShowFullComment] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.WORKER); // Default to WORKER, adjust as needed
  const [personnelRequests, setPersonnelRequests] = useState<Request[]>([
    {
      id: 1,
      username_Client: "khalil djaidja",
      category: "Plumbing",
      location: "123 Main St",
      RequestDate: "2025-04-22",
      WorkDate: "2025-04-25",
      WorkTime: "14:00",
      payment: "$100",
      AboutService: "Fix leaky faucet",
      canceled: false,
      service: "Plumbing Services",
      sent_time: "2025-04-22",
      images: [],
    },
  ]);

  const { width: windowWidth } = Dimensions.get("window");
  const scrollViewRef = useRef<ScrollView>(null);
  const isClient = userRole === UserRole.CLIENT; // Use the enum

  const requestImages = [
    require("../../../../assets/images/istockphoto-615086822-170667a.jpg"),
    require("../../../../assets/images/images (1).jpg"),
    require("../../../../assets/images/istockphoto-615086822-170667a.jpg"),
    require("../../../../assets/images/images (1).jpg"),
    require("../../../../assets/images/images (1).jpg"),
    require("../../../../assets/images/images (1).jpg"),
    require("../../../../assets/images/istockphoto-615086822-170667a.jpg"),
    require("../../../../assets/images/images (1).jpg"),
    require("../../../../assets/images/images (1).jpg"),
    require("../../../../assets/images/istockphoto-615086822-170667a.jpg"),
  ];

  useEffect(() => {
    if (imageModalVisible && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: windowWidth * selectedImage,
          animated: false,
        });
      }, 50);
    }
  }, [imageModalVisible, selectedImage]);

  const fetchRequests = async () => {
    try {
      const response = await axios.get("/requests"); // Update with actual endpoint
      const results = response.data as Request[];
      setPersonnelRequests((prevRequests) => [...prevRequests, ...results]);
    } catch (err) {
      console.error("Error fetching requests:", err);
      alert("Error fetching requests");
    }
  };

  const cancelRequest = async (idRequest: number) => {
    try {
      await axios.patch(`http://example.com/api/requests/${idRequest}`, {
        canceled: true,
      });
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
    router.push({
      pathname: "/WorkerComments",
      params: { id },
    });
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const styles = StyleSheet.create({
    size: {
      width: 50,
      height: 50,
    },
  });

  // Helper function to safely access properties regardless of request type
  const getRequestDetail = (request: Request, property: keyof BaseRequest) => {
    return request[property];
  };

  // Helper function for client-specific properties
  const getClientProperty = (
    request: Request,
    property: keyof RequestOnWorker
  ) => {
    if ("username_Client" in request) {
      return request[property];
    }
    return undefined;
  };

  return (
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {isClient ? (
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
                        <MaterialCommunityIcons
                          name="clipboard-text"
                          size={30}
                        />
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
                        {/* Add any additional info here */}
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
                        Date Request:{" "}
                        <Text className="text-green-500">{item.sent_time}</Text>
                      </Text>
                      <Text className="text-lg">
                        Work Date:{" "}
                        <Text className="text-green-500">{item.WorkDate}</Text>
                      </Text>
                      <Text className="text-lg">
                        Work Time:{" "}
                        <Text className="text-green-500">{item.WorkTime}</Text>
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
                        About Service:{" "}
                        <Text className="text-green-500">
                          {item.AboutService}
                        </Text>
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
        ) : (
          <FlatList
            data={personnelRequests}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View>
                {!pressed ? (
                  <TouchableOpacity
                    className="min-h-16 mb-1 flex-row w-full bg-white mt-10 py-3 pr-4"
                    onPress={() => setPressed(true)}
                  >
                    <View className="w-2/12 items-center justify-start pt-2">
                      <Image
                        source={require("../../../../assets/images/images (1).jpg")}
                        className="w-12 h-12 rounded-full"
                      />
                    </View>
                    <View className="flex-1 flex-col">
                      <View className="flex-row justify-between">
                        <Text className="text-lg leading-7">
                          {getClientProperty(item, "username_Client")}
                        </Text>
                        <Text>{item.sent_time}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => setShowFullComment(!showFullComment)}
                      >
                        <Text className="text-green-500">
                          {showFullComment
                            ? item.AboutService
                            : `${item.AboutService.substring(0, 30)}...`}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    className="bg-white mt-10"
                    onPress={() => setPressed(false)}
                  >
                    <View className="flex-row">
                      <View className="items-center justify-center pl-2">
                        <Image
                          source={require("../../../../assets/images/images (1).jpg")}
                          style={styles.size}
                          className="rounded-full"
                        />
                      </View>
                      <View className="w-3/6 pl-2 pt-1">
                        <Text className="text-xl font-medium">
                          {getClientProperty(item, "username_Client") || "User"}
                        </Text>
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
                    <View className="pl-20">
                      <Text className="text-xl">Request Details:</Text>
                      <Text className="text-xl">
                        Request Date:{" "}
                        <Text className="text-green-500">
                          {item.RequestDate}
                        </Text>
                      </Text>
                      <Text className="text-xl">
                        Work Date:{" "}
                        <Text className="text-green-500">{item.WorkDate}</Text>
                      </Text>
                      <Text className="text-xl">
                        Work Time:{" "}
                        <Text className="text-green-500">{item.WorkTime}</Text>
                      </Text>
                      <Text className="text-xl">
                        Work Address:{" "}
                        <Text className="text-green-500">{item.location}</Text>
                      </Text>
                      <Text className="text-xl">
                        Service:{" "}
                        <Text className="text-green-500">{item.service}</Text>
                      </Text>
                      <Text className="text-xl">
                        Payment Method:{" "}
                        <Text className="text-green-500">{item.payment}</Text>
                      </Text>
                      <Text className="text-xl">
                        About Service:{" "}
                        <Text className="text-green-500">
                          {item.AboutService}
                        </Text>
                      </Text>
                    </View>
                    <View className="mt-4 px-4">
                      <Text className="text-xl mb-2">Request Images:</Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="mb-3"
                      >
                        {requestImages.map((img, idx) => (
                          <TouchableOpacity
                            key={idx}
                            onPress={() => {
                              setSelectedImage(idx);
                              setImageModalVisible(true);
                            }}
                            className="mr-2"
                          >
                            <Image source={img} className="w-24 h-24 rounded" />
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                    <TouchableOpacity
                      className="bg-red-600 items-center justify-center py-3 mt-2"
                      onPress={() => cancelRequest(item.id)}
                    >
                      <Text className="text-xl text-white">Delete</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                )}
                <Modal
                  animationType="slide"
                  transparent={true}
                  visible={imageModalVisible}
                  onRequestClose={() => setImageModalVisible(false)}
                >
                  <View className="flex-1 bg-black bg-opacity-90 justify-center items-center">
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
                        <Image
                          key={idx}
                          source={img}
                          style={{ width: windowWidth, height: "70%" }}
                          resizeMode="contain"
                        />
                      ))}
                    </ScrollView>
                    <View className="flex-row mt-4">
                      {requestImages.map((_, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => setSelectedImage(index)}
                          className={`w-3 h-3 rounded-full mx-1 ${
                            selectedImage === index ? "bg-white" : "bg-gray-500"
                          }`}
                        />
                      ))}
                    </View>
                  </View>
                </Modal>
              </View>
            )}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PublicRequest;
