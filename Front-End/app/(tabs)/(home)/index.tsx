import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  Modal,
  Share,
  Platform,
  Alert,
  KeyboardAvoidingView, // Add for keyboard handling
  Keyboard, // Add for keyboard management
  TouchableWithoutFeedback, // Add for dismissing keyboard
} from "react-native";
import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { Video, ResizeMode } from "expo-av";
import apiClient from "@/api/appClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import refreshAccessToken from "@/api/refreshAccessToken";

// Media item can be image, video or none
interface MediaItem {
  type: "image" | "video" | "none";
  url?: string;
}

// Post shape
interface Post {
  id: number;
  clientId: number;
  userName: string;
  profileImage: string;
  region: string;
  city: string;
  sent_time: string;
  working_time: string;
  category: string;
  description: string;
  media: MediaItem[];
}

// Comment shape
interface Comment {
  worker_id: number;
  profile_image: string;
  username: string;
  message: string;
  expanded?: boolean; // New property to track expanded state
}
const HomeScreen = () => {
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  const flatListRef = useRef<FlatList>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const commentInputRef = useRef<TextInput>(null); // Add ref for comment input
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [status, requestPermission] = MediaLibrary.usePermissions();
  const [scrollPosition, setScrollPosition] = useState(0);
  const [viewingSinglePost, setViewingSinglePost] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false); // Track keyboard visibility
  const [role, setRole] = useState(1); // Default role to 1 (client)
  // POSTS + PAGINATION STATE
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  // COMMENTS STATE
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Array<Comment>>([]);
  const [downloadingMedia, setDownloadingMedia] = useState<boolean>(false);
  // Track if the current user has already commented
  const [hasUserCommented, setHasUserCommented] = useState<boolean>(false);
  // Add keyboard event listeners
  useEffect(() => {
    // When keyboard shows
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
        // Auto scroll to the comment input
        if (viewingSinglePost && scrollViewRef.current) {
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      }
    );

    // When keyboard hides
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    // Cleanup
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [viewingSinglePost]);
  // Improved media download function that handles both images and videos
  const handleMediaDownload = async (
    mediaUrl: string,
    mediaType: "image" | "video"
  ) => {
    try {
      if (Platform.OS === "web") {
        window.open(mediaUrl, "_blank");
        return;
      }

      // Check permissions
      if (!status?.granted) {
        const permission = await requestPermission();
        if (!permission.granted) {
          Alert.alert(
            "Permission Needed",
            "Need permission to save media to your device"
          );
          return;
        }
      }

      setDownloadingMedia(true);

      // Extract a clean filename from the URL
      // For picsum.photos URLs, we need to handle the format correctly
      let filename = `khdamli-${Date.now()}`;
      // We need to remove the dimensions from the path
      if (mediaUrl.includes("picsum.photos")) {
        // Just use the default extension based on media type
        filename += mediaType === "image" ? ".jpg" : ".mp4";
      } else {
        // For regular URLs, try to extract extension from the URL
        const match = mediaUrl.match(/\.([^.?]+)(?:\?|$)/);
        const extension = match
          ? match[1]
          : mediaType === "image"
            ? "jpg"
            : "mp4";
        filename += `.${extension}`;
      }

      // Use the cache directory directly without additional folders
      const path = `${FileSystem.cacheDirectory}${filename}`;

      // Show download progress
      const downloadResumable = FileSystem.createDownloadResumable(
        mediaUrl,
        path,
        {},
        (downloadProgress) => {
          const progress =
            downloadProgress.totalBytesWritten /
            downloadProgress.totalBytesExpectedToWrite;
          // You could update a progress state here if you want to show a progress bar
        }
      );

      const result = await downloadResumable.downloadAsync();

      // Save to media library
      if (result?.uri) {
        const uri = result.uri;
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert(
          "Download Complete",
          `${mediaType === "image" ? "Image" : "Video"} saved successfully!`
        );

        // Clean up the cache file
        await FileSystem.deleteAsync(uri, { idempotent: true });
      }
    } catch (error) {
      console.error(`Error downloading ${mediaType}:`, error);
      Alert.alert(
        "Download Failed",
        `Failed to save ${mediaType}. Please try again.`
      );
    } finally {
      setDownloadingMedia(false);
    }
  };
  // Simplified wrappers for image/video downloads
  const handleImageDownload = (imageUrl: string) =>
    handleMediaDownload(imageUrl, "image");

  const handleVideoDownload = (videoUrl: string) =>
    handleMediaDownload(videoUrl, "video");

  const fetchPosts = useCallback(
    async (pageToFetch: number) => {
      if (loading) return;
      setLoading(true);
      try {
        const userData: string | null = await AsyncStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);
          const response = await apiClient.get(
            `work/job-request/public/${user.id}`,
            {
              params: {
                role: user.role === 1 ? "client" : "worker",
                page: pageToFetch,
                limit: 20,
              },
            }
          );
          if (response.data && response.data.requests) {
            const { requests: fetchedPosts, page: backendTotalPages } =
              response.data;
            setPosts((prev) =>
              pageToFetch === 1 ? fetchedPosts : [...prev, ...fetchedPosts]
            );
            setTotalPages(backendTotalPages || 1);
            setPage(pageToFetch);
          } else {
            console.error("Invalid response format", response.data);
          }
        }
      } catch (err: any) {
        console.error(
          "Failed to load posts",
          err.response?.data?.message,
          err.response?.status
        );
        if (err.response?.status === 401) {
          if (await refreshAccessToken()) {
            await fetchPosts(pageToFetch);
          } else {
            // need to login
            router.push("/(auth)");
          }
        }
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );
  // Initial fetch
  useEffect(() => {
    const fetchUserRole = async () => {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        setRole(user.role);
      }
    };
    fetchUserRole();
    // Fetch posts when the component mounts
    fetchPosts(1);
  }, []);
  // Load next page when reaching end
  const handleEndReached = () => {
    if (!loading && page < totalPages) {
      fetchPosts(page + 1);
    }
  };
  // Refresh list back to first page
  const handleRefresh = () => {
    setPosts([]);
    setSelectedPostId(null);
    fetchPosts(1);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };
  // Open comment box and fetch comments
  const openCommentBox = async (postId: number) => {
    setSelectedPostId(postId);
    setViewingSinglePost(true);
    setComments([]); // Initialize comments as empty array while loading
    setHasUserCommented(false); // Reset user comment status
    const fetchComments = async (postId: number) => {
      try {
        const userData = await AsyncStorage.getItem("user");
        const user = userData ? JSON.parse(userData) : null;

        const response = await apiClient.get(
          `/work/job-request/${postId}/messages`
        );
        if (response.data && response.data.messages) {
          setComments(response.data.messages);

          // Check if the current user has already commented
          if (user) {
            const userComment = response.data.messages.find(
              (comment: Comment) => comment.worker_id === user.id
            );
            setHasUserCommented(!!userComment);
          }
        } else {
          setComments([]); // Set empty array if no messages found
          console.log("No comments found or invalid response format");
        }
      } catch (err: any) {
        console.error("Failed to load comments", err);
        setComments([]); // Set empty array on error
        if (err.response?.status === 401) {
          if (await refreshAccessToken()) {
            await fetchComments(postId);
          } else {
            router.push("/(auth)");
          }
        }
      }
    };
    fetchComments(postId);
  };
  // Close comment box
  const closeCommentBox = () => {
    setSelectedPostId(null);
    setComments([]);
    setViewingSinglePost(false);
    setHasUserCommented(false);
    setCommentText(""); // Clear comment text when closing
    // Dismiss keyboard
    Keyboard.dismiss();
    // أعط وقتًا للتطبيق لإعادة عرض القائمة قبل محاولة التمرير
    setTimeout(() => {
      if (flatListRef.current) {
        // استخدم scrollToOffset للتمرير إلى الموقع المحفوظ
        flatListRef.current.scrollToOffset({
          offset: scrollPosition,
          animated: false,
        });
      }
    }, 1000);
  };
  // Toggle comment expanded state
  const toggleCommentExpand = (commentId: number) => {
    setComments(
      comments.map((comment) =>
        comment.worker_id === commentId
          ? { ...comment, expanded: !comment.expanded }
          : comment
      )
    );
  };
  // Focus comment input and scroll to it
  const focusCommentInput = () => {
    if (commentInputRef.current) {
      commentInputRef.current.focus();
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };
  // Submit comment
  const submitComment = async (postId: number) => {
    if (!selectedPostId || commentText.trim() === "" || hasUserCommented)
      return;
    // Dismiss keyboard after submitting
    Keyboard.dismiss();
    try {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const user: any = JSON.parse(userData);
        const newComment = {
          workerId: user.id, // Using timestamp as a temporary ID
          comment: commentText,
        };
        const response = await apiClient.post(
          `/work/job-request/${postId}/comment`,
          newComment
        );
        if (response.data.success) {
          const workerComment: Comment = {
            worker_id: user.id,
            profile_image: user.profile_image,
            message: commentText,
            username: user.username,
          };
          setComments((prev) => [...prev, workerComment]);
          setCommentText("");
          setHasUserCommented(true); // Mark that the user has comments

          // Scroll to bottom to show the new comment
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      }
    } catch (err: any) {
      console.error("Failed to submit comment", err.response?.data);
      if (err.response?.status === 401) {
        if (await refreshAccessToken()) {
          await submitComment(postId);
        } else {
          router.push("/(auth)");
        }
      }
    }
  };
  // Navigate to user profile
  const navigateToProfile = (id: number, role: number) => {
    router.push({
      pathname: "/profileAsView",
      params: {
        userId: id,
        userRole: role,
      },
    });
  };
  // Render media item
  const renderMediaItem = ({ item }: { item: MediaItem }) => {
    if (!item) return null;
    if (item.type === "image" && item.url) {
      return (
        <TouchableOpacity
          className="mr-2"
          onPress={() => setSelectedImage(item.url ?? null)}
        >
          <Image
            source={{ uri: item.url }}
            className="w-48 h-32 rounded-xl"
            resizeMode="cover"
          />
        </TouchableOpacity>
      );
    }
    if (item.type === "video" && item.url) {
      return (
        <TouchableOpacity
          className="mr-2"
          onPress={() => setSelectedVideo(item.url ?? null)}
        >
          <View className="relative w-48 h-32 rounded-xl overflow-hidden">
            <Video
              source={{ uri: item.url }}
              useNativeControls={false}
              resizeMode={ResizeMode.COVER}
              isLooping={false}
              style={{ width: 192, height: 128 }}
              posterSource={{ uri: "https://picsum.photos/800/400" }}
            />
            <View className="absolute inset-0 flex items-center justify-center">
              <View className="bg-black/40 rounded-full p-2">
                <Ionicons name="play" size={28} color="white" />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    }
    return null;
  };
  // Format working time
  const formatWorkingTime = (working_time: string): string => {
    if (!working_time) return "Flexible";
    // If working_time is already formatted nicely, just return it
    if (
      working_time.includes(" - ") ||
      working_time.includes("hours") ||
      working_time.includes("days") ||
      working_time.toLowerCase().includes("flexible")
    ) {
      return working_time;
    }
    // Try to parse simple time formats like "2h" or "3d"
    if (/^\d+h$/i.test(working_time)) {
      const hours = parseInt(working_time, 10);
      return hours === 1 ? "1 hour" : `${hours} hours`;
    }
    if (/^\d+d$/i.test(working_time)) {
      const days = parseInt(working_time, 10);
      return days === 1 ? "1 day" : `${days} days`;
    }
    // If we have a timestamp or date format, try to extract a readable time
    if (
      working_time.includes(":") ||
      /\d{1,2}\/\d{1,2}\/\d{2,4}/.test(working_time)
    ) {
      try {
        const date = new Date(working_time);
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch (e) {
        // If parsing fails, return the original
        return working_time;
      }
    }
    return working_time;
  };
  // Time ago helper
  const getTimeAgo = (dateString: string): string => {
    const now = new Date();
    const sentDate = new Date(dateString);
    const diffInSeconds = Math.floor(
      (now.getTime() - sentDate.getTime()) / 1000
    );
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    // Calculate days more precisely
    const days = Math.floor(diffInSeconds / 86400);
    return days === 1 ? "1 day ago" : `${days} days ago`;
  };
  // Get day name for the post date
  const getDayName = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", { weekday: "long" });
    } catch (e) {
      return "";
    }
  };
  // Get formatted date string for the post date (e.g. "Sunday 05-05-2023")
  const getFormattedDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
      // Format the date as DD-MM-YYYY
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${dayName} ${day}-${month}-${year}`;
    } catch (e) {
      return "";
    }
  };
  // Render single comment with expand/collapse functionality
  const renderComment = (comment: Comment) => {
    if (!comment) return null;
    // Add null check before accessing text.length
    const isLongComment = comment.message && comment.message.length > 100;
    const displayText =
      isLongComment && !comment.expanded
        ? `${comment.message.substring(0, 100)}...`
        : comment.message || "";

    return (
      <View
        key={comment.worker_id}
        className="bg-gray-100 p-4 rounded-2xl mb-2"
      >
        <View className="flex-row items-center mb-2">
          <TouchableOpacity
            onPress={() => navigateToProfile(comment.worker_id, 2)}
          >
            <Image
              source={{ uri: comment.profile_image }}
              className="w-8 h-8 rounded-full mr-2"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigateToProfile(comment.worker_id, 2)}
          >
            <Text className="font-bold text-sm">{comment.username}</Text>
          </TouchableOpacity>
        </View>
        <Text className="text-gray-600">{displayText}</Text>
        {isLongComment && (
          <TouchableOpacity
            onPress={() => toggleCommentExpand(comment.worker_id)}
            className="mt-1"
          >
            <Text className="text-blue-500 text-sm">
              {comment.expanded ? "Show less" : "Read more"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };
  // Render comment section
  const renderCommentSection = () => {
    return (
      <View className="mt-4 mb-10">
        {/* Add bottom margin to prevent keyboard overlap */}
        {comments && comments.length > 0 ? (
          comments.map(renderComment)
        ) : (
          <Text className="text-gray-500 text-center py-4">
            No comments yet
          </Text>
        )}
        {role === 2 && (
          <>
            {!hasUserCommented ? (
              <TouchableWithoutFeedback onPress={focusCommentInput}>
                <View>
                  <TextInput
                    ref={commentInputRef}
                    className="border border-gray-300 rounded-xl p-2 h-16 text-right mt-2"
                    placeholder="Write your comment..."
                    multiline
                    value={commentText}
                    onChangeText={setCommentText}
                    onFocus={() => {
                      // When input is focused, scroll to it
                      setTimeout(() => {
                        scrollViewRef.current?.scrollToEnd({ animated: true });
                      }, 200);
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => submitComment(selectedPostId!)}
                    className="bg-green-600 px-4 py-2 rounded-xl mt-2"
                  >
                    <Text className="text-white text-center">Post Comment</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            ) : (
              <View className="bg-gray-100 p-3 rounded-xl mt-2">
                <Text className="text-center text-gray-600">
                  You have already commented on this post
                </Text>
              </View>
            )}
          </>
        )}
        <TouchableOpacity
          onPress={closeCommentBox}
          className="mt-4 bg-red-500 px-4 py-2 rounded-xl"
        >
          <Text className="text-white text-center">Close Comments</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render post
  const renderPost = ({ item }: { item: Post }) => {
    if (!item) return null;

    const formattedWorkingTime = formatWorkingTime(item.working_time);
    const formattedDate = getFormattedDate(item.sent_time);

    return (
      <View className="bg-white rounded-2xl shadow p-4 mb-4 mx-2">
        {/* Header */}
        <View className="flex-row items-center mb-2">
          <TouchableOpacity onPress={() => navigateToProfile(item.clientId, 1)}>
            <Image
              source={{ uri: item.profileImage }}
              className="w-10 h-10 rounded-full mr-2"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigateToProfile(item.clientId, 1)}>
            <View>
              <Text className="font-bold text-lg">{item.userName}</Text>
              <Text className="text-sm text-gray-500">
                {item.region}, {item.city}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        {/* Description */}
        <Text className="text-gray-700">{item.description}</Text>
        {/* Media */}
        {item.media && item.media.length > 0 ? (
          <View className="mt-2">
            <FlatList
              horizontal
              data={item.media}
              keyExtractor={(_, i) => `media-${i}`}
              renderItem={renderMediaItem}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        ) : (
          <View className="mt-2 py-2">
            <Text className="text-gray-500 text-sm italic">Text only post</Text>
          </View>
        )}
        {/* Time & category - Updated format */}
        <View className="mt-2">
          <View className="flex-row items-center gap-2">
            <Ionicons name="time-outline" size={14} color="green" />
            <Text className="text-sm text-green-700">
              {getTimeAgo(item.sent_time)}
            </Text>
          </View>
          <View className="flex-row items-center gap-2 mt-1">
            <MaterialCommunityIcons name="tools" size={14} color="green" />
            <Text className="text-sm text-green-700">{item.category}</Text>
          </View>
          <View className="flex-row items-center gap-2 mt-1">
            <Ionicons name="calendar-outline" size={14} color="green" />
            <Text className="text-sm text-green-700">
              {formattedDate} | Work time: {formattedWorkingTime}
            </Text>
          </View>
        </View>
        {/* Comment button */}
        <View className="flex-row justify-end mt-2">
          <TouchableOpacity
            onPress={() => openCommentBox(item.id)}
            className="bg-blue-500 rounded-xl px-4 py-1"
          >
            <Text className="text-white">💬 Comment</Text>
          </TouchableOpacity>
        </View>
        {/* Comments */}
        {selectedPostId === item.id && renderCommentSection()}
      </View>
    );
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      enabled
    >
      <View className="flex-1 bg-gray-100 pt-4">
        <LinearGradient
          colors={["#2B524A", "#BED2D0"]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          className="shadow-2xl"
        >
          <View className="overflow-hidden border-b border-gray-800/30">
            <View className="flex-row justify-between items-center py-3 px-4">
              <View className="flex-row items-baseline space-x-1">
                <Text
                  className="text-4xl font-black text-foncyYellow"
                  style={{
                    textShadowColor: "rgba(0,0,0,0.3)",
                    textShadowOffset: { width: 2, height: 2 },
                    textShadowRadius: 5,
                  }}
                >
                  KH
                </Text>
                <Text
                  className="text-2xl font-semibold text-white tracking-wider"
                  style={{
                    textShadowColor: "rgba(0,0,0,0.2)",
                    textShadowOffset: { width: 1, height: 1 },
                    textShadowRadius: 3,
                  }}
                >
                  damli
                </Text>
              </View>
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={handleRefresh}
                  className="bg-white/10 w-12 h-12 p-2 mx-2 rounded-full"
                >
                  <Ionicons name="refresh-outline" size={24} color="#fff" />
                </TouchableOpacity>
                {role === 1 && (
                  <>
                    <TouchableOpacity
                      className="w-12 h-12 bg-[#F8A100] rounded-full items-center justify-center"
                      onPress={() =>
                        router.push({
                          pathname: "./createRequest",
                          params: { type: "1" },
                        })
                      }
                    >
                      <FontAwesome name="plus" size={24} color="white" />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </View>
        </LinearGradient>
        {viewingSinglePost && selectedPostId ? (
          <ScrollView
            ref={scrollViewRef}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              flexGrow: 1, // Add this
              paddingBottom: 20,
            }}
          >
            {posts.find((p) => p.id === selectedPostId) ? (
              renderPost({ item: posts.find((p) => p.id === selectedPostId)! })
            ) : (
              <View className="p-4">
                <Text>Post not found</Text>
              </View>
            )}
          </ScrollView>
        ) : (
          <FlatList
            ref={flatListRef}
            data={posts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderPost}
            onEndReached={handleEndReached}
            onScroll={(event) => {
              setScrollPosition(event.nativeEvent.contentOffset.y);
            }}
            scrollEventThrottle={16}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loading ? <ActivityIndicator style={{ margin: 20 }} /> : null
            }
            ListEmptyComponent={
              !loading ? (
                <View className="p-10 items-center">
                  <Text className="text-gray-500 text-center">
                    No posts found
                  </Text>
                </View>
              ) : null
            }
            removeClippedSubviews={false}
            maxToRenderPerBatch={10}
            windowSize={21}
          />
        )}
        {/* Image Modal */}
        <Modal
          visible={!!selectedImage}
          transparent={true}
          onRequestClose={() => setSelectedImage(null)}
        >
          <View className="flex-1 bg-black/90">
            <View className="flex-row justify-end p-4">
              <TouchableOpacity
                onPress={() =>
                  selectedImage && handleImageDownload(selectedImage)
                }
                className="bg-white/20 rounded-full p-3 mr-2"
                disabled={downloadingMedia}
              >
                {downloadingMedia ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="download-outline" size={24} color="white" />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSelectedImage(null)}
                className="bg-white/20 rounded-full p-3"
                disabled={downloadingMedia}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
            {selectedImage && (
              <View className="flex-1 justify-center items-center">
                <Image
                  source={{ uri: selectedImage }}
                  className="w-full h-[80%]"
                  resizeMode="contain"
                />
              </View>
            )}
          </View>
        </Modal>
        {/* Video Modal */}
        <Modal
          visible={!!selectedVideo}
          transparent={true}
          onRequestClose={() => setSelectedVideo(null)}
        >
          <View className="flex-1 bg-black">
            <View className="flex-row justify-end p-4">
              <TouchableOpacity
                onPress={() =>
                  selectedVideo && handleVideoDownload(selectedVideo)
                }
                className="bg-white/20 rounded-full p-3 mr-2"
                disabled={downloadingMedia}
              >
                {downloadingMedia ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="download-outline" size={24} color="white" />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSelectedVideo(null)}
                className="bg-white/20 rounded-full p-3"
                disabled={downloadingMedia}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
            {selectedVideo && (
              <View className="flex-1 justify-center">
                <Video
                  source={{ uri: selectedVideo }}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                  isLooping
                  shouldPlay
                  style={{ width: "100%", height: 300 }}
                />
              </View>
            )}
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
};

export default HomeScreen;
