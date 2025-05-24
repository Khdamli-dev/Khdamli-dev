import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
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
  },[]);
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
        console.log(user.role)
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
        origin: "home",
      },
    });
  };
  // Media Item Renderer - Clean and Modern
const renderMediaItem = ({ item }: { item: MediaItem }) => {
  if (!item) return null;
  
  if (item.type === "image" && item.url) {
    return (
      <TouchableOpacity
        style={{
          marginRight: 8,
          borderRadius: 12,
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
        onPress={() => setSelectedImage(item.url ?? null)}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: item.url }}
          style={{
            width: 200,
            height: 140,
            backgroundColor: '#F3F4F6',
          }}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  }
  
  if (item.type === "video" && item.url) {
    return (
      <TouchableOpacity
        style={{
          marginRight: 8,
          borderRadius: 12,
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
        onPress={() => setSelectedVideo(item.url ?? null)}
        activeOpacity={0.9}
      >
        <View style={{ position: 'relative', width: 200, height: 140 }}>
          <Video
            source={{ uri: item.url }}
            useNativeControls={false}
            resizeMode={ResizeMode.COVER}
            isLooping={false}
            style={{ width: 200, height: 140 }}
            posterSource={{ uri: "https://picsum.photos/800/400" }}
          />
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                backgroundColor: 'rgba(34, 197, 94, 0.9)', // Green with opacity
                borderRadius: 30,
                padding: 12,
              }}
            >
              <Ionicons name="play" size={24} color="white" />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
  return null;
};

// Format working time utility
const formatWorkingTime = (working_time: string): string => {
  if (!working_time) return "Flexible";
  
  if (
    working_time.includes(" - ") ||
    working_time.includes("hours") ||
    working_time.includes("days") ||
    working_time.toLowerCase().includes("flexible")
  ) {
    return working_time;
  }
  
  if (/^\d+h$/i.test(working_time)) {
    const hours = parseInt(working_time, 10);
    return hours === 1 ? "1 hour" : `${hours} hours`;
  }
  
  if (/^\d+d$/i.test(working_time)) {
    const days = parseInt(working_time, 10);
    return days === 1 ? "1 day" : `${days} days`;
  }
  
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
  
  if (diffInSeconds < 60) return `${diffInSeconds}s`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  
  const days = Math.floor(diffInSeconds / 86400);
  return days === 1 ? "1d" : `${days}d`;
};

// Get formatted date string
const getFormattedDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${dayName} ${day}-${month}-${year}`;
  } catch (e) {
    return "";
  }
};

// Single Comment Component - Instagram Style
const renderComment = (comment: Comment) => {
  if (!comment) return null;
  
  const isLongComment = comment.message && comment.message.length > 100;
  const displayText =
    isLongComment && !comment.expanded
      ? `${comment.message.substring(0, 100)}...`
      : comment.message || "";

  return (
    <View
      key={comment.worker_id}
      style={{
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 8,
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#22C55E',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <TouchableOpacity
          onPress={() => navigateToProfile(comment.worker_id, 2)}
          activeOpacity={0.7}
        >
          <Image
            source={{ uri: comment.profile_image }}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              marginRight: 12,
              borderWidth: 2,
              borderColor: '#22C55E',
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigateToProfile(comment.worker_id, 2)}
          activeOpacity={0.7}
        >
          <Text style={{ 
            fontWeight: '600', 
            fontSize: 14,
            color: '#374151'
          }}>
            {comment.username}
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={{ 
        color: '#4B5563', 
        fontSize: 14,
        lineHeight: 20,
        marginLeft: 4
      }}>
        {displayText}
      </Text>
      {isLongComment && (
        <TouchableOpacity
          onPress={() => toggleCommentExpand(comment.worker_id)}
          style={{ marginTop: 8, marginLeft: 4 }}
          activeOpacity={0.7}
        >
          <Text style={{ 
            color: '#22C55E', 
            fontSize: 13,
            fontWeight: '500'
          }}>
            {comment.expanded ? "Show less" : "Read more"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Comment Section - Clean Design
const renderCommentSection = () => {
  return (
    <View style={{ 
      marginTop: 16, 
      marginBottom: 40,
      backgroundColor: '#F9FAFB',
      borderRadius: 12,
      padding: 16
    }}>
      {comments && comments.length > 0 ? (
        <>
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: '#374151',
            marginBottom: 12
          }}>
            Comments ({comments.length})
          </Text>
          {comments.map(renderComment)}
        </>
      ) : (
        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
          <Ionicons name="chatbubble-outline" size={32} color="#D1D5DB" />
          <Text style={{ 
            color: '#9CA3AF', 
            textAlign: 'center',
            marginTop: 8,
            fontSize: 14
          }}>
            No comments yet. Be the first to comment!
          </Text>
        </View>
      )}
      
      {role === 2 && (
        <>
          {!hasUserCommented ? (
            <View style={{ marginTop: 16 }}>
              <TouchableWithoutFeedback onPress={focusCommentInput}>
                <View>
                  <TextInput
                    ref={commentInputRef}
                    style={{
                      borderWidth: 1,
                      borderColor: '#D1D5DB',
                      borderRadius: 12,
                      padding: 12,
                      minHeight: 60,
                      textAlignVertical: 'top',
                      backgroundColor: '#FFFFFF',
                      fontSize: 14,
                      color: '#374151'
                    }}
                    placeholder="Write your comment..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    value={commentText}
                    onChangeText={setCommentText}
                    onFocus={() => {
                      setTimeout(() => {
                        scrollViewRef.current?.scrollToEnd({ animated: true });
                      }, 200);
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => submitComment(selectedPostId!)}
                    style={{
                      backgroundColor: '#22C55E',
                      paddingHorizontal: 20,
                      paddingVertical: 12,
                      borderRadius: 8,
                      marginTop: 12,
                      alignItems: 'center'
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={{ 
                      color: 'white', 
                      fontWeight: '600',
                      fontSize: 14
                    }}>
                      Post Comment
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          ) : (
            <View style={{
              backgroundColor: '#F3F4F6',
              padding: 16,
              borderRadius: 8,
              marginTop: 16,
              borderLeftWidth: 3,
              borderLeftColor: '#22C55E'
            }}>
              <Text style={{
                textAlign: 'center',
                color: '#6B7280',
                fontSize: 14
              }}>
                ✓ You have already commented on this post
              </Text>
            </View>
          )}
        </>
      )}
      
      <TouchableOpacity
        onPress={closeCommentBox}
        style={{
          marginTop: 16,
          backgroundColor: '#FFFFFF',
          borderWidth: 1,
          borderColor: '#D1D5DB',
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderRadius: 8,
          alignItems: 'center'
        }}
        activeOpacity={0.7}
      >
        <Text style={{ 
          color: '#6B7280',
          fontWeight: '500',
          fontSize: 14
        }}>
          Close Comments
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// Main Post Component - Instagram/Facebook Style
const renderPost = ({ item }: { item: Post }) => {
  if (!item) return null;

  const formattedWorkingTime = formatWorkingTime(item.working_time);
  const formattedDate = getFormattedDate(item.sent_time);

  return (
    <View style={{
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      marginHorizontal: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
      overflow: 'hidden'
    }}>
      {/* Header - Instagram Style */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6'
      }}>
        <TouchableOpacity 
          onPress={() => navigateToProfile(item.clientId, 1)}
          activeOpacity={0.7}
        >
          <Image
            source={{ uri: item.profileImage }}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              marginRight: 12,
              borderWidth: 2,
              borderColor: '#22C55E'
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => navigateToProfile(item.clientId, 1)}
          style={{ flex: 1 }}
          activeOpacity={0.7}
        >
          <Text style={{
            fontWeight: '600',
            fontSize: 16,
            color: '#111827',
            marginBottom: 2
          }}>
            {item.userName}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="location-outline" size={14} color="#22C55E" />
            <Text style={{
              fontSize: 13,
              color: '#6B7280',
              marginLeft: 4
            }}>
              {item.region}, {item.city}
            </Text>
            <Text style={{
              fontSize: 13,
              color: '#9CA3AF',
              marginLeft: 8
            }}>
              • {getTimeAgo(item.sent_time)}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Description */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
        <Text style={{
          color: '#374151',
          fontSize: 15,
          lineHeight: 22
        }}>
          {item.description}
        </Text>
      </View>

      {/* Media Section */}
      {item.media && item.media.length > 0 ? (
        <View style={{ paddingVertical: 16 }}>
          <FlatList
            horizontal
            data={item.media}
            keyExtractor={(_, i) => `media-${i}`}
            renderItem={renderMediaItem}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          />
        </View>
      ) : (
        <View style={{ 
          paddingHorizontal: 16, 
          paddingVertical: 12,
          alignItems: 'center'
        }}>
          <View style={{
            backgroundColor: '#F9FAFB',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: '#E5E7EB'
          }}>
            <Text style={{
              color: '#9CA3AF',
              fontSize: 12,
              fontStyle: 'italic'
            }}>
              📝 Text only post
            </Text>
          </View>
        </View>
      )}

      {/* Job Details */}
      <View style={{
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#F9FAFB',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6'
      }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{
              backgroundColor: '#22C55E',
              borderRadius: 12,
              padding: 4,
              marginRight: 6
            }}>
              <MaterialCommunityIcons name="tools" size={12} color="white" />
            </View>
            <Text style={{ fontSize: 13, color: '#374151', fontWeight: '500' }}>
              {item.category}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{
              backgroundColor: '#22C55E',
              borderRadius: 12,
              padding: 4,
              marginRight: 6
            }}>
              <Ionicons name="time-outline" size={12} color="white" />
            </View>
            <Text style={{ fontSize: 13, color: '#374151' }}>
              {formattedWorkingTime}
            </Text>
          </View>
        </View>
        
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center',
          marginTop: 8
        }}>
          <View style={{
            backgroundColor: '#22C55E',
            borderRadius: 12,
            padding: 4,
            marginRight: 6
          }}>
            <Ionicons name="calendar-outline" size={12} color="white" />
          </View>
          <Text style={{ fontSize: 13, color: '#6B7280' }}>
            {formattedDate}
          </Text>
        </View>
      </View>

      {/* Action Button */}
      <View style={{
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6'
      }}>
        <TouchableOpacity
          onPress={() => openCommentBox(item.id)}
          style={{
            backgroundColor: '#22C55E',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 12,
            borderRadius: 8
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="chatbubble-outline" size={18} color="white" />
          <Text style={{
            color: 'white',
            fontWeight: '600',
            fontSize: 15,
            marginLeft: 8
          }}>
            Comment
          </Text>
        </TouchableOpacity>
      </View>

      {/* Comments Section */}
      {selectedPostId === item.id && renderCommentSection()}
    </View>
  );
};

// Main Component Return Statement with Clean Header
return (
  <KeyboardAvoidingView
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    style={{ flex: 1 }}
    keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    enabled
  >
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* Fixed Header at Top */}
      <View style={{
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: 16,
          paddingHorizontal: 20,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{
              fontSize: 28,
              fontWeight: '800',
              color: '#22C55E',
              marginRight: 4
            }}>
              KH
            </Text>
            <Text style={{
              fontSize: 20,
              fontWeight: '600',
              color: '#374151',
              letterSpacing: 0.5
            }}>
              damli
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={handleRefresh}
              style={{
                backgroundColor: '#F3F4F6',
                width: 44,
                height: 44,
                borderRadius: 22,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh-outline" size={22} color="#22C55E" />
            </TouchableOpacity>
            
            {role === 1 && (
              <TouchableOpacity
                style={{
                  backgroundColor: '#22C55E',
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onPress={() =>
                  router.push({
                    pathname: "./createRequest",
                    params: { type: "1" },
                  })
                }
                activeOpacity={0.8}
              >
                <FontAwesome name="plus" size={20} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Content - FlatList */}
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
        contentContainerStyle={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          loading ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#22C55E" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
            <View style={{ 
              padding: 40, 
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
              <Text style={{
                color: '#9CA3AF',
                textAlign: 'center',
                marginTop: 12,
                fontSize: 16
              }}>
                No posts found
              </Text>
            </View>
          ) : null
        }
        removeClippedSubviews={false}
        maxToRenderPerBatch={10}
        windowSize={21}
      />

      {/* Image Modal */}
      <Modal
        visible={!!selectedImage}
        transparent={true}
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.95)' }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            padding: 20,
            paddingTop: Platform.OS === 'ios' ? 60 : 40
          }}>
            <TouchableOpacity
              onPress={() =>
                selectedImage && handleImageDownload(selectedImage)
              }
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 25,
                padding: 12,
                marginRight: 12
              }}
              disabled={downloadingMedia}
              activeOpacity={0.7}
            >
              {downloadingMedia ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="download-outline" size={24} color="white" />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedImage(null)}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 25,
                padding: 12
              }}
              disabled={downloadingMedia}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
          {selectedImage && (
            <View style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 20
            }}>
              <Image
                source={{ uri: selectedImage }}
                style={{ width: '100%', height: '80%' }}
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
        <View style={{ flex: 1, backgroundColor: '#000000' }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            padding: 20,
            paddingTop: Platform.OS === 'ios' ? 60 : 40
          }}>
            <TouchableOpacity
              onPress={() =>
                selectedVideo && handleVideoDownload(selectedVideo)
              }
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 25,
                padding: 12,
                marginRight: 12
              }}
              disabled={downloadingMedia}
              activeOpacity={0.7}
            >
              {downloadingMedia ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="download-outline" size={24} color="white" />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedVideo(null)}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 25,
                padding: 12
              }}
              disabled={downloadingMedia}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
          {selectedVideo && (
            <View style={{ flex: 1, justifyContent: 'center' }}>
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
     </SafeAreaView>
  </KeyboardAvoidingView>
);
}

export default HomeScreen;