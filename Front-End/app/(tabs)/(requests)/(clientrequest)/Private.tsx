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
  Alert,
} from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import {
  MaterialCommunityIcons,
  Ionicons,
  MaterialIcons,
} from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '@/api/appClient';
import refreshAccessToken from '@/api/refreshAccessToken';
import {
  WorkerPrivateRequest,
  ClientPrivateRequest,
} from '../../../../Interfaces/Requestsinterfaces';
import { ResizeMode, Video } from 'expo-av';
import { getSocket } from '@/api/socket';
import { useNotifications } from '@/context/NotificationContext';
//import { realTimePrivateRequestStatus, realTimeRequests } from '@/api/realTime';

// Define the UserRole enum
enum UserRole {
  CLIENT = 'client',
  WORKER = 'worker',
}

// Define the RequestStatus enum
enum RequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'Accepted',
  ON_HOLD = 'On Hold',
  PENDING_CLIENT_VERIFICATION = 'pending_client_verification',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
  REJECTED = 'Rejected',
}

// Default placeholder image for missing profile images
const defaultProfileImage = require('../../../../assets/images/images (1).jpg');

const PrivateRequests = () => {
  const notifications = useNotifications();
  const [selectedMedia, setSelectedMedia] = useState(0);
  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>();
  const [requestIds, setRequestIds] = useState<number[]>([]);
  const [requests, setRequests] = useState<
    (WorkerPrivateRequest | ClientPrivateRequest)[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [expandedRequestId, setExpandedRequestId] = useState<number | null>(
    null,
  );
  const [userData, setUserData] = useState<{
    username: string;
    profile_image: string;
  }>({ username: '', profile_image: '' });

  // Store current viewing media for modal access
  const [currentViewingMedia, setCurrentViewingMedia] = useState<
    { url: string; type: string }[]
  >([]);

  const { width: windowWidth, height: windowHeight } = Dimensions.get('window');
  const scrollViewRef = useRef<ScrollView>(null);
  const videoRef = useRef<Video>(null);

  // Determine if user is client or worker and get user data
  useEffect(() => {
    const getUserData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('user');
        if (userDataString) {
          const user = JSON.parse(userDataString);
          setUserRole(user.role == 1 ? UserRole.CLIENT : UserRole.WORKER);
          setUserData({
            username: user.username || '',
            profile_image: user.profile_image || '',
          });
        }
      } catch (error) {
        console.error('Error getting user data:', error);
      }
    };

    getUserData();
  }, []);

  useEffect(() => {
    if (mediaModalVisible && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: windowWidth * selectedMedia,
          animated: false,
        });
      }, 50);
    }
  }, [mediaModalVisible, selectedMedia, windowWidth]);

  const toggleExpandRequest = (id: number) => {
    setExpandedRequestId(expandedRequestId === id ? null : id);
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        const response = await apiClient.get(`/work/job-request/`, {
          params:
            userRole == UserRole.CLIENT
              ? { client: user.id, type: 2 }
              : { worker: user.id, type: 2 },
        });
        const results: number[] = response.data.requests;
        setRequestIds(results);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        if (await refreshAccessToken()) {
          await fetchRequests();
        } else {
          router.push('/(auth)');
        }
      } else {
        console.error(
          'Error fetching requests:',
          err.response?.data?.message || err.message,
        );
        Alert.alert('Error', 'Failed to fetch requests');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRequestsDetails = async (requestId: number) => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (!userData) {
        router.push('/(auth)');
        return;
      }

      const user = JSON.parse(userData);
      let params = {
        role: userRole === UserRole.CLIENT ? 'client' : 'worker',
        request_type: 'private',
      };

      const response = await apiClient.get(`/work/job-request/${requestId}`, {
        params,
      });
      const result = response.data.request;

      // Update the specific request rather than appending to the array
      setRequests((prev) => {
        // Check if this item already exists in the array
        if (prev.some((request) => request.id === result.id)) {
          return prev; // Don't add duplicate
        }
        return [...prev, result];
      });
    } catch (err: any) {
      if (err.response?.status === 401) {
        if (await refreshAccessToken()) {
          await fetchRequestsDetails(requestId);
        } else {
          router.push('/(auth)');
        }
      } else {
        console.error(
          'Error fetching request details:',
          err.response?.data?.message || err.message,
        );
        Alert.alert('Error', 'Failed to fetch request details');
      }
    }
  };

  const handleOpenMediaModal = (media: any[], initialIndex: number) => {
    // Transform media to include type
    const mediaWithType = media.map((item) => {
      // Simple check for video files - could be improved based on actual API response
      const isVideo =
        item.url.toLowerCase().includes('.mp4') ||
        item.url.toLowerCase().includes('.mov') ||
        item.url.toLowerCase().includes('.avi') ||
        (item.type && item.type.includes('video'));

      return {
        url: item.url,
        type: isVideo ? 'video' : 'image',
      };
    });

    setCurrentViewingMedia(mediaWithType);
    setSelectedMedia(initialIndex);
    setMediaModalVisible(true);
  };

  // Get status icon based on request status
  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case RequestStatus.ACCEPTED:
        return <MaterialIcons name="check-circle" size={24} color="green" />;
      case RequestStatus.ON_HOLD:
        return (
          <MaterialIcons name="hourglass-empty" size={24} color="orange" />
        );
      case RequestStatus.PENDING_CLIENT_VERIFICATION:
        return <MaterialIcons name="pending-actions" size={24} color="blue" />;
      case RequestStatus.COMPLETED:
        return <MaterialIcons name="verified" size={24} color="blue" />;
      case RequestStatus.REJECTED:
        return <MaterialIcons name="cancel" size={24} color="red" />;
      default:
        return (
          <MaterialIcons name="hourglass-empty" size={24} color="orange" />
        );
    }
  };

  // Truncate text to specified length
  const truncateText = (text: string | undefined, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text;
  };

  // Handle accepting request
  const handleAcceptRequest = async (requestId: number) => {
    try {
      await apiClient.put(`/work/job-request/status/${requestId}`, {
        status: 1,
      });

      // Update local state
      setRequests(
        requests.map((request) =>
          request.id === requestId
            ? { ...request, status: RequestStatus.ACCEPTED }
            : request,
        ),
      );

      // mark request as read
      if (notifications) notifications.markRequestAsRead();

      Alert.alert('Success', 'Request accepted successfully');
    } catch (err: any) {
      if (err.response?.status === 401) {
        if (await refreshAccessToken()) {
          await handleAcceptRequest(requestId);
        } else {
          router.push('/(auth)');
        }
      } else {
        console.error('Failed to accept request:', err);
        Alert.alert('Error', 'Failed to accept request');
      }
    }
  };

  // Handle rejecting request
  const handleRejectRequest = async (requestId: number) => {
    try {
      await apiClient.put(`/work/job-request/status/${requestId}`, {
        status: 2,
      });

      // Update local state
      setRequestIds((prev) => prev.filter((id) => id != requestId));

      // mark request as read
      if (notifications) notifications.markRequestAsRead();

      Alert.alert('Success', 'Request rejected successfully');
    } catch (err: any) {
      if (err.response?.status === 401) {
        if (await refreshAccessToken()) {
          await handleRejectRequest(requestId);
        } else {
          router.push('/(auth)');
        }
      } else {
        console.error('Failed to reject request:', err);
        Alert.alert('Error', 'Failed to reject request');
      }
    }
  };

  // Handle deleting request
  const handleDeleteRequest = async (id: number) => {
    try {
      const response = await apiClient.delete(`/work/job-request/${id}`);
      if (response.data.success) {
        Alert.alert('Success', 'Request deleted successfully');
        setRequestIds((prevIds) => prevIds.filter((reqId) => reqId !== id));
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        if (await refreshAccessToken()) {
          await handleDeleteRequest(id);
        } else {
          router.push('/(auth)');
        }
      } else {
        console.error('Failed to delete request:', err);
        Alert.alert('Error', 'Failed to delete request');
      }
    }
  };

  // Handle marking request as completed
  const handleMarkCompleted = async (id: number) => {
    try {
      await apiClient.put(`/work/job-request/${id}/state`, {
        state: RequestStatus.PENDING_CLIENT_VERIFICATION,
        workCompletedClaimTime: new Date().toISOString(),
      });

      // Update local state
      setRequests(
        requests.map((request) =>
          request.id === id
            ? { ...request, status: RequestStatus.PENDING_CLIENT_VERIFICATION }
            : request,
        ),
      );

      Alert.alert(
        'Success',
        'Request marked as completed. Waiting for client verification.',
      );
    } catch (err: any) {
      console.error('Failed to mark request as completed:', err);
      Alert.alert('Error', 'Failed to mark request as completed');
    }
  };

  // Handle confirming completion
  const handleConfirmCompletion = async (requestId: number) => {
    try {
      await apiClient.put(`/work/job-request/status/${requestId}`, {
        status: 4,
      });

      // Update local state
      setRequestIds((prevIds) => prevIds.filter((id) => id !== requestId));

      Alert.alert('Success', 'Request confirmed as completed');
    } catch (err: any) {
      if (err.response?.status === 401) {
        if (await refreshAccessToken()) {
          await handleConfirmCompletion(requestId);
        } else {
          router.push('/(auth)');
        }
      }
      console.error('Failed to confirm completion:', err);
      Alert.alert('Error', 'Failed to confirm completion');
    }
  };

  // Handle rejecting completion
  const handleRejectCompletion = async (id: number) => {
    try {
      await apiClient.put(`/work/job-request/${id}/state`, {
        state: RequestStatus.ACCEPTED,
      });

      // Update local state
      setRequests(
        requests.map((request) =>
          request.id === id
            ? { ...request, status: RequestStatus.ACCEPTED }
            : request,
        ),
      );

      Alert.alert(
        'Success',
        'Completion rejected. Request status set back to accepted.',
      );
    } catch (err: any) {
      console.error('Failed to reject completion:', err);
      Alert.alert('Error', 'Failed to reject completion');
    }
  };

  // Handle cancelling request
  const handleCancelRequest = async (id: number) => {
    try {
      await apiClient.put(`/work/job-request/${id}/state`, {
        state: RequestStatus.CANCELLED,
      });

      // Update local state
      setRequests(
        requests.map((request) =>
          request.id === id
            ? { ...request, status: RequestStatus.CANCELLED }
            : request,
        ),
      );

      Alert.alert('Success', 'Request cancelled successfully');
    } catch (err: any) {
      console.error('Failed to cancel request:', err);
      Alert.alert('Error', 'Failed to cancel request');
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [userRole]);

  // Set up socket listeners for real-time updates
  useEffect(() => {
    const setupSocketListeners = async () => {
      try {
        // Ensure socket is connected
        const socket = getSocket();

        // Listen for new requests
        socket.on('private-request', (data :any) => {
          console.log('New request received:', data);
          setRequestIds((prev) => [...prev, data]);
        });

        return () => {
          socket.off('new-request');
        };
      } catch (error) {
        console.error('Error setting up notification socket listeners:', error);
      }
    };

    setupSocketListeners();
  }, []);

  useEffect(() => {
    if (requestIds.length >= 0) {
      // Clear previous requests when fetching new ones
      setRequests([]);
      requestIds.forEach((id) => {
        fetchRequestsDetails(id);
      });
    }
  }, [requestIds]);

  // Render client collapsed view
  const renderClientCollapsedView = (item: ClientPrivateRequest) => {
    return (
      <TouchableOpacity
        onPress={() => toggleExpandRequest(item.id)}
        className="bg-white mt-2 p-4 mb-4 rounded-lg shadow"
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center flex-1">
            <Image
              source={
                item.worker_profile_image
                  ? { uri: item.worker_profile_image }
                  : defaultProfileImage
              }
              className="w-12 h-12 rounded-full mr-3"
            />
            <View className="flex-1">
              <Text className="font-medium">
                {item.worker_username || 'Worker'}
              </Text>
              <Text numberOfLines={1} className="text-gray-500">
                {truncateText(item.description, 40)}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center">
            {getStatusIcon(item.status)}
            <Text className="ml-1 text-gray-600 text-sm capitalize">
              {item.status}
            </Text>
            <MaterialIcons
              name={
                expandedRequestId === item.id ? 'expand-less' : 'expand-more'
              }
              size={24}
              color="#888"
              style={{ marginLeft: 5 }}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Render worker collapsed view
  const renderWorkerCollapsedView = (item: WorkerPrivateRequest) => {
    return (
      <TouchableOpacity
        onPress={() => toggleExpandRequest(item.id)}
        className="bg-white mt-2 p-4 mb-4 rounded-lg shadow"
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center flex-1">
            <Image
              source={
                item.client_profile_image
                  ? { uri: item.client_profile_image }
                  : defaultProfileImage
              }
              className="w-12 h-12 rounded-full mr-3"
            />
            <View className="flex-1">
              <Text className="font-medium">
                {item.client_username || 'Client'}
              </Text>
              <Text numberOfLines={1} className="text-gray-500">
                {truncateText(item.description, 40)}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center">
            {getStatusIcon(item.status)}
            <Text className="ml-1 text-gray-600 text-sm capitalize">
              {item.status}
            </Text>
            <MaterialIcons
              name={
                expandedRequestId === item.id ? 'expand-less' : 'expand-more'
              }
              size={24}
              color="#888"
              style={{ marginLeft: 5 }}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Render client expanded view - using ClientPrivateRequest interface
  const renderClientExpandedView = (item: ClientPrivateRequest) => {
    return (
      <View className="bg-white mt-2 p-4 mb-4 rounded-lg shadow">
        <TouchableOpacity
          onPress={() => toggleExpandRequest(item.id)}
          className="mb-3"
        >
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Image
                source={
                  item.worker_profile_image
                    ? { uri: item.worker_profile_image }
                    : defaultProfileImage
                }
                className="w-12 h-12 rounded-full mr-3"
              />
              <View>
                <Text className="font-medium">
                  {item.worker_username || 'Worker'}
                </Text>
                <Text numberOfLines={1} className="text-gray-500">
                  {truncateText(item.description, 40)}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center">
              {getStatusIcon(item.status)}
              <Text className="ml-1 text-gray-600 text-sm capitalize">
                {item.status}
              </Text>
              <MaterialIcons
                name="expand-less"
                size={24}
                color="#888"
                style={{ marginLeft: 5 }}
              />
            </View>
          </View>
        </TouchableOpacity>

        <View className="flex-row justify-end mb-3">
          <TouchableOpacity className="mr-2">
            <Ionicons name="call" size={30} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity>
            <MaterialCommunityIcons
              name="message-text-outline"
              size={30}
              color="#000"
            />
          </TouchableOpacity>
        </View>

        <View>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-lg font-medium">Request Details:</Text>
          </View>

          <View className="pl-2">
            <Text className="text-base mb-1">
              <Text className="font-bold">Date Request: </Text>
              <Text className="text-green-500">{item.sent_date}</Text>
            </Text>
            <Text className="text-base mb-1">
              <Text className="font-bold">Address: </Text>
              <Text className="text-green-500">
                {item.location?.city}, {item.location?.region},{' '}
                {item.location?.country}
              </Text>
            </Text>
            <Text className="text-base mb-1">
              <Text className="font-bold">Category: </Text>
              <Text className="text-green-500">{item.category}</Text>
            </Text>
            <Text className="text-base mb-1">
              <Text className="font-bold">About Service: </Text>
              <Text className="text-green-500">
                {item.description || 'No description available'}
              </Text>
            </Text>
            <Text className="text-base mb-1">
              <Text className="font-bold">Payment Method: </Text>
              <Text className="text-green-500">{item.payment_method}</Text>
            </Text>
          </View>
        </View>

        <View className="mt-4">
          <Text className="text-lg font-medium mb-2">Request Media:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-3"
          >
            {item.media && item.media.length > 0 ? (
              item.media.map((media, idx) => {
                const isVideo =
                  media.url.toLowerCase().includes('.mp4') ||
                  media.url.toLowerCase().includes('.mov') ||
                  media.url.toLowerCase().includes('.avi') ||
                  (media.type && media.type.includes('video'));

                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => {
                      handleOpenMediaModal(item.media, idx);
                    }}
                    className="mr-2 relative"
                  >
                    {isVideo ? (
                      <View className="w-24 h-24 rounded bg-black justify-center items-center">
                        <Ionicons name="play-circle" size={40} color="white" />
                      </View>
                    ) : (
                      <Image
                        source={{ uri: media.url }}
                        className="w-24 h-24 rounded"
                      />
                    )}
                  </TouchableOpacity>
                );
              })
            ) : (
              <Text className="italic text-gray-500">No media available</Text>
            )}
          </ScrollView>
        </View>

        {/* Action buttons based on status */}
        {item.status === RequestStatus.ON_HOLD && (
          <TouchableOpacity
            className="bg-red-500 w-full items-center justify-center py-3 mt-3 rounded"
            onPress={() => handleDeleteRequest(item.id)}
          >
            <Text className="text-base text-white">Delete Request</Text>
          </TouchableOpacity>
        )}

        {item.status === RequestStatus.ACCEPTED && (
          <TouchableOpacity
            className="bg-green-500 w-full items-center justify-center py-3 mt-3 rounded"
            onPress={() => handleConfirmCompletion(item.id)}
          >
            <Text className="text-base text-white">Declare Completed</Text>
          </TouchableOpacity>
        )}

        {/* Client verification section - when job is marked as completed by worker */}
        {item.status === RequestStatus.PENDING_CLIENT_VERIFICATION && (
          <View className="mt-3">
            <Text className="text-base text-blue-600 mb-2">
              Worker has marked this job as completed.
            </Text>
            <View className="flex-row">
              <TouchableOpacity
                className="bg-green-500 w-1/2 justify-center items-center py-2 mr-1 rounded-l"
                onPress={() => handleConfirmCompletion(item.id)}
              >
                <Text className="text-base text-white">Confirm Completion</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-red-500 w-1/2 justify-center items-center py-2 ml-1 rounded-r"
                onPress={() => handleRejectCompletion(item.id)}
              >
                <Text className="text-base text-white">Reject Completion</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  // Render worker expanded view - using WorkerPrivateRequest interface
  const renderWorkerExpandedView = (item: WorkerPrivateRequest) => {
    return (
      <View className="bg-white mt-2 p-4 mb-4 rounded-lg shadow">
        <TouchableOpacity
          onPress={() => toggleExpandRequest(item.id)}
          className="mb-3"
        >
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Image
                source={
                  item.client_profile_image
                    ? { uri: item.client_profile_image }
                    : defaultProfileImage
                }
                className="w-12 h-12 rounded-full mr-3"
              />
              <View>
                <Text className="font-medium">
                  {item.client_username || 'Client'}
                </Text>
                <Text numberOfLines={1} className="text-gray-500">
                  {truncateText(item.description, 40)}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center">
              {getStatusIcon(item.status)}
              <Text className="ml-1 text-gray-600 text-sm capitalize">
                {item.status}
              </Text>
              <MaterialIcons
                name="expand-less"
                size={24}
                color="#888"
                style={{ marginLeft: 5 }}
              />
            </View>
          </View>
        </TouchableOpacity>

        <View className="flex-row justify-end mb-3">
          <TouchableOpacity className="mr-2">
            <Ionicons name="call" size={30} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity>
            <MaterialCommunityIcons
              name="message-text-outline"
              size={30}
              color="#000"
            />
          </TouchableOpacity>
        </View>

        <View className="pl-2">
          <Text className="text-base mb-1">
            <Text className="font-bold">Request Date: </Text>
            <Text className="text-green-500">{item.sent_date}</Text>
          </Text>
          <Text className="text-base mb-1">
            <Text className="font-bold">Work Address: </Text>
            <Text className="text-green-500">
              {item.client_location?.city}, {item.client_location?.region},{' '}
              {item.client_location?.country}
            </Text>
          </Text>
          <Text className="text-base mb-1">
            <Text className="font-bold">Category: </Text>
            <Text className="text-green-500">{item.category}</Text>
          </Text>
          <Text className="text-base mb-1">
            <Text className="font-bold">About Service: </Text>
            <Text className="text-green-500">{item.description}</Text>
          </Text>
          <Text className="text-base mb-1">
            <Text className="font-bold">Payment Method: </Text>
            <Text className="text-green-500">{item.payment_method}</Text>
          </Text>
        </View>

        <View className="mt-4">
          <Text className="text-lg font-medium mb-2">Request Media:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-3"
          >
            {item.media && item.media.length > 0 ? (
              item.media.map((media, idx) => {
                const isVideo =
                  media.url.toLowerCase().includes('.mp4') ||
                  media.url.toLowerCase().includes('.mov') ||
                  media.url.toLowerCase().includes('.avi') ||
                  (media.type && media.type.includes('video'));

                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => {
                      handleOpenMediaModal(item.media, idx);
                    }}
                    className="mr-2 relative"
                  >
                    {isVideo ? (
                      <View className="w-24 h-24 rounded bg-black justify-center items-center">
                        <Ionicons name="play-circle" size={40} color="white" />
                      </View>
                    ) : (
                      <Image
                        source={{ uri: media.url }}
                        className="w-24 h-24 rounded"
                      />
                    )}
                  </TouchableOpacity>
                );
              })
            ) : (
              <Text className="italic text-gray-500">No media available</Text>
            )}
          </ScrollView>
        </View>

        {/* Action buttons based on status */}
        {item.status === RequestStatus.ON_HOLD && (
          <View className="flex-row mt-2">
            <TouchableOpacity
              className="bg-green-600 w-1/2 items-center justify-center py-3 mr-1 rounded-l"
              onPress={() => handleAcceptRequest(item.id)}
            >
              <Text className="text-base text-white">Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-red-600 w-1/2 items-center justify-center py-3 ml-1 rounded-r"
              onPress={() => handleRejectRequest(item.id)}
            >
              <Text className="text-base text-white">Reject</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* For PENDING_CLIENT_VERIFICATION requests - Worker sees waiting status */}
        {item.status === RequestStatus.PENDING_CLIENT_VERIFICATION && (
          <View className="bg-yellow-100 border border-yellow-400 items-center justify-center py-3 mt-3 rounded">
            <Text className="text-base text-yellow-800">
              Waiting for client confirmation
            </Text>
          </View>
        )}

        {/* For COMPLETED requests - Worker sees completed status */}
        {item.status === RequestStatus.COMPLETED && (
          <View className="bg-green-100 border border-green-400 items-center justify-center py-3 mt-3 rounded">
            <Text className="text-base text-green-800">
              Job completed and verified by client
            </Text>
          </View>
        )}
      </View>
    );
  };

  // Main render for item
  const renderItem = ({ item }: { item: any }) => {
    const isExpanded = expandedRequestId === item.id;

    if (userRole === UserRole.CLIENT) {
      return isExpanded
        ? renderClientExpandedView(item as ClientPrivateRequest)
        : renderClientCollapsedView(item as ClientPrivateRequest);
    } else {
      return isExpanded
        ? renderWorkerExpandedView(item as WorkerPrivateRequest)
        : renderWorkerCollapsedView(item as WorkerPrivateRequest);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-lg">Loading requests...</Text>
          </View>
        ) : (
          <FlatList
            data={requests}
            keyExtractor={(item: any) => item.id?.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 10 }}
            ListEmptyComponent={
              <View className="items-center justify-center p-10">
                <Text className="text-lg text-gray-500">
                  No private requests available
                </Text>
              </View>
            }
          />
        )}

        {/* Media modal with better centering - Updated to handle both images and videos */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={mediaModalVisible}
          onRequestClose={() => setMediaModalVisible(false)}
        >
          <View className="flex-1 bg-black bg-opacity-90 justify-center items-center">
            <TouchableOpacity
              className="absolute top-10 right-5 z-10"
              onPress={() => setMediaModalVisible(false)}
            >
              <Ionicons name="close-circle" size={40} color="white" />
            </TouchableOpacity>

            {/* Centered scrollable media view */}
            <View
              style={{
                height: windowHeight * 0.7,
                width: windowWidth,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                  const newIndex = Math.round(
                    e.nativeEvent.contentOffset.x / windowWidth,
                  );
                  setSelectedMedia(newIndex);
                }}
                contentContainerStyle={{
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {currentViewingMedia?.map((media, idx) => (
                  <View
                    key={`media-container-${idx}`}
                    style={{
                      width: windowWidth,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    {media.type === 'video' ? (
                      <Video
                        ref={idx === selectedMedia ? videoRef : null}
                        source={{ uri: media.url }}
                        useNativeControls
                        resizeMode={'contain' as ResizeMode}
                        isLooping
                        style={{
                          width: windowWidth * 0.85,
                          height: windowHeight * 0.6,
                          borderRadius: 8,
                        }}
                      />
                    ) : (
                      <Image
                        source={{ uri: media.url }}
                        style={{
                          width: windowWidth * 0.85,
                          height: windowHeight * 0.6,
                          borderRadius: 8,
                        }}
                        resizeMode="contain"
                      />
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Media pagination indicators */}
            <View className="flex-row mt-4">
              {currentViewingMedia?.map((_, index) => (
                <TouchableOpacity
                  key={`dot-${index}`}
                  onPress={() => {
                    setSelectedMedia(index);
                    if (scrollViewRef.current) {
                      scrollViewRef.current.scrollTo({
                        x: windowWidth * index,
                        animated: true,
                      });
                    }
                  }}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: selectedMedia === index ? 'white' : 'gray',
                    marginHorizontal: 4,
                  }}
                />
              ))}
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PrivateRequests;
