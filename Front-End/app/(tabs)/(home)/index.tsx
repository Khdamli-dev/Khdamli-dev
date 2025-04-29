
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
} from "react-native";
<<<<<<< HEAD
import AsyncStorage from '@react-native-async-storage/async-storage';
// If you're using NativeWind or another Tailwind RN library, import the tailwind function
// import { useTailwind } from "nativewind"; // for example
=======
import axios from "axios";
import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { Video, ResizeMode } from "expo-av";
>>>>>>> main

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
  id: number;
  workerId: number;
  profileImage: string;
  userName: string;
  text: string;
  expanded?: boolean; // New property to track expanded state
}

const HomeScreen = () => {
<<<<<<< HEAD
  // const tailwind = useTailwind(); // If using the NativeWind hook
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [hasClientRole, setHasClientRole] = useState<boolean>(false);

  useEffect(() => {
    setWorkerRole();
    fetchCategories();
  }, []);

  const setWorkerRole = async () => {
    const userRole = await AsyncStorage.getItem('role');
    if (userRole)
    setHasClientRole(userRole === process.env.CLIENT_ROLE_ID);
  }

  // Example fetch - replace with your actual API call
  const fetchCategories = async () => {
=======
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  const flatListRef = useRef<FlatList>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [status, requestPermission] = MediaLibrary.usePermissions();
  const [scrollPosition, setScrollPosition] = useState(0);
  const [viewingSinglePost, setViewingSinglePost] = useState(false);
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

  // Improved media download function that handles both images and videos
  const handleMediaDownload = async (
    mediaUrl: string,
    mediaType: "image" | "video"
  ) => {
>>>>>>> main
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

      // For URLs like https://picsum.photos/800/400?random=123
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

  // ====================
  // دالة جلب البوستات من الباكند (معطلة حالياً)
  // ====================
  // const fetchPosts = useCallback(
  //   async (pageToFetch: number) => {
  //     if (loading) return;
  //     setLoading(true);
  //     try {
  //       const response = await axios.get(`${CONFIG.API_URL}/posts`, {
  //         params: { page: pageToFetch, limit: 20 },
  //       });
  //       const { posts: fetchedPosts, totalPages: backendTotalPages } = response.data;
  //       setPosts((prev) =>
  //         pageToFetch === 1 ? fetchedPosts : [...prev, ...fetchedPosts]
  //       );
  //       setTotalPages(backendTotalPages);
  //       setPage(pageToFetch);
  //     } catch (err) {
  //       console.error("Failed to load posts", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   },
  //   [loading]
  // );

  const fetchPosts = useCallback(
    async (pageToFetch: number) => {
      if (loading) return;
      setLoading(true);
      try {
        // Fake data for testing
        const fakePosts: Post[] = Array.from({ length: 20 }, (_, index) => ({
          id: (pageToFetch - 1) * 20 + index + 1,
          clientId: index + 1,
          userName: `Client ${(pageToFetch - 1) * 20 + index + 1}`,
          profileImage: `https://randomuser.me/api/portraits/men/${index + 10}.jpg`,
          region: `Region ${index + 1}`,
          city: `City ${index + 1}`,
          sent_time: new Date(
            Date.now() - Math.random() * 86400000 * 7
          ).toISOString(),
          working_time: "9am - 5pm",
          category: `Category ${(index % 3) + 1}`,
          description: `This is a sample post #${(pageToFetch - 1) * 20 + index + 1}.`,
          media:
            Math.random() > 0.3
              ? Array.from(
                  { length: Math.floor(Math.random() * 4) + 1 },
                  (_, i) => ({
                    type: Math.random() > 0.7 ? "video" : "image",
                    url:
                      Math.random() > 0.7
                        ? `https://example.com/video${index * 5 + i}.mp4`
                        : `https://picsum.photos/800/400?random=${index * 5 + i}`,
                  })
                )
              : [],
        }));
        // Simulate total_pages
        const simTotalPages = 5;
        setPosts((prev) =>
          pageToFetch === 1 ? fakePosts : [...prev, ...fakePosts]
        );
        setTotalPages(simTotalPages);
        setPage(pageToFetch);
      } catch (err) {
        console.error("Failed to load posts", err);
        Alert.alert("Error", "Failed to load posts. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  // Initial fetch
  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

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
  const openCommentBox = (postId: number) => {
    setSelectedPostId(postId);
    setViewingSinglePost(true);

    // ====================
    // دالة جلب الكومنتات من الباكند (معطلة حالياً)
    // ====================
    // const fetchComments = async (postId: number) => {
    //   try {
    //     const response = await axios.get(`${CONFIG.API_URL}/posts/${postId}/comments`);
    //     setComments(response.data.comments);
    //   } catch (err) {
    //     console.error("Failed to load comments", err);
    //   }
    // };
    // fetchComments(postId);

    const fakeComments: Comment[] = Array.from(
      { length: Math.floor(Math.random() * 9) + 2 },
      (_, i) => ({
        id: i + 1,
        workerId: i + 1,
        profileImage: `https://randomuser.me/api/portraits/women/${i + 10}.jpg`,
        userName: `User ${i + 1}`,
        text:
          i % 2 === 0
            ? `This is a short comment #${i + 1}.`
            : `This is a very long comment #${i + 1} that should be truncated in the UI. It contains a lot of text to demonstrate how we handle long comments in our application. When a comment is this long, we'll show just a part of it initially and provide a way for users to expand it to read the full content. This helps keep the UI clean while still allowing users to read all content.`,
        expanded: false, // Initially all comments are collapsed
      })
    );
    setComments(fakeComments);
  };

  // Close comment box
  const closeCommentBox = () => {
    setSelectedPostId(null);
    setComments([]);
    setViewingSinglePost(false);

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
        comment.id === commentId
          ? { ...comment, expanded: !comment.expanded }
          : comment
      )
    );
  };

  // Submit comment
  const submitComment = () => {
    // ====================
    // دالة حفظ الكومنت في الباكند (معطلة حالياً)
    // ====================
    // const submitComment = async () => {
    //   if (!selectedPostId || commentText.trim() === "") return;
    //   try {
    //     await axios.post(`${CONFIG.API_URL}/posts/${selectedPostId}/comments`, {
    //       postId: selectedPostId,
    //       workerId: user.id, // أو أي متغير يمثل الـworker الحالي
    //       text: commentText,
    //     });
    //     // بعد الحفظ يمكنك إعادة جلب الكومنتات أو إضافته محلياً
    //     // fetchComments(selectedPostId);
    //     setCommentText("");
    //   } catch (err) {
    //     console.error("Failed to submit comment", err);
    //   }
    // };

    if (!selectedPostId || commentText.trim() === "") return;
    const newComment: Comment = {
      id: comments.length + 1,
      workerId: comments.length + 1,
      profileImage: `https://randomuser.me/api/portraits/women/20.jpg`,
      userName: "You",
      text: commentText,
      expanded: true, // New comments are expanded by default
    };
    setComments((prev) => [...prev, newComment]);
    setCommentText("");
  };

  // Navigate to user profile
  const navigateToProfile = (workerId: number) => {
    router.push({
      pathname: "/profileAsView",
      params: { workerId: workerId },
    });
  };

<<<<<<< HEAD
        {/* CATEGORY GRID */}
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCategoryItem}
          numColumns={3}
          contentContainerStyle={{ paddingHorizontal: 8 }}
        />
      </View>
      {/* FLOATING ADD REQUEST BUTTON */}
      {
        hasClientRole &&
        <View className="absolute bottom-4 right-4">
=======
  // Render media item
  const renderMediaItem = ({ item }: { item: MediaItem }) => {
    if (item.type === "image" && item.url) {
      return (
>>>>>>> main
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
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  // Render single comment with expand/collapse functionality
  const renderComment = (comment: Comment) => {
    const isLongComment = comment.text.length > 100;
    const displayText =
      isLongComment && !comment.expanded
        ? `${comment.text.substring(0, 100)}...`
        : comment.text;

    return (
      <View key={comment.id} className="bg-gray-100 p-4 rounded-2xl mb-2">
        <View className="flex-row items-center mb-2">
          <TouchableOpacity onPress={() => navigateToProfile(comment.workerId)}>
            <Image
              source={{ uri: comment.profileImage }}
              className="w-8 h-8 rounded-full mr-2"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigateToProfile(comment.workerId)}>
            <Text className="font-bold text-sm">{comment.userName}</Text>
          </TouchableOpacity>
        </View>
        <Text className="text-gray-600">{displayText}</Text>
        {isLongComment && (
          <TouchableOpacity
            onPress={() => toggleCommentExpand(comment.id)}
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

  // Render post
  const renderPost = ({ item }: { item: Post }) => (
    <View className="bg-white rounded-2xl shadow p-4 mb-4 mx-2">
      {/* Header */}
      <View className="flex-row items-center mb-2">
        <TouchableOpacity onPress={() => navigateToProfile(item.clientId)}>
          <Image
            source={{ uri: item.profileImage }}
            className="w-10 h-10 rounded-full mr-2"
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigateToProfile(item.clientId)}>
          <View>
            <Text className="font-bold text-lg">{item.userName}</Text>
            <Text className="text-sm text-gray-500">
              {item.region}, {item.city}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
<<<<<<< HEAD
      }
    </SafeAreaView>
=======
      {/* Description */}
      <Text className="text-gray-700">{item.description}</Text>
      {/* Media */}
      {item.media.length > 0 ? (
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
      {/* Time & category */}
      <View className="flex-row items-center gap-2 mt-2">
        <Ionicons name="time-outline" size={14} color="green" />
        <Text className="text-sm text-green-700">
          {getTimeAgo(item.sent_time)}
        </Text>
        <MaterialCommunityIcons name="tools" size={14} color="green" />
        <Text className="text-sm text-green-700">
          {item.category} | {item.working_time}
        </Text>
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
      {selectedPostId === item.id && (
        <View className="mt-4">
          {comments.map(renderComment)}
          <TextInput
            className="border border-gray-300 rounded-xl p-2 h-16 text-right mt-2"
            placeholder="Write your comment..."
            multiline
            value={commentText}
            onChangeText={setCommentText}
          />
          <TouchableOpacity
            onPress={submitComment}
            className="bg-green-600 px-4 py-2 rounded-xl mt-2"
          >
            <Text className="text-white text-center">Post Comment</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={closeCommentBox}
            className="mt-4 bg-red-500 px-4 py-2 rounded-xl"
          >
            <Text className="text-white text-center">Close Comments</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
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
              <TouchableOpacity
                className="w-12 h-12 bg-[#F8A100] rounded-full items-center justify-center"
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/(home)/requeste",
                    params: { type: "1" },
                  })
                }
              >
                <FontAwesome name="plus" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LinearGradient>
      {viewingSinglePost ? (
        <ScrollView ref={scrollViewRef}>
          {renderPost({ item: posts.find((p) => p.id === selectedPostId)! })}
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
          // هذا الخيار يحافظ على مخزون البوستات في الذاكرة
          removeClippedSubviews={false}
          // هذا الخيار يضمن عدم إعادة استرجاع العناصر من الذاكرة
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
>>>>>>> main
  );
};

export default HomeScreen;
