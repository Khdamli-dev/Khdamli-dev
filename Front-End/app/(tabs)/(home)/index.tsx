import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { router } from "expo-router";

// Media item can be image, video or none
interface MediaItem {
  type: "image" | "video" | "none";
  url?: string;
}

// Post shape from backend
interface Post {
  id: number;
  clientId: number;
  clientName: string;
  authorImage: string;
  regine: string;
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
  authorImage: string;
  authorName: string;
  text: string;
}

const HomeScreen = () => {
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  // POSTS + PAGINATION STATE
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // COMMENTS STATE
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);

  // FETCH POSTS HELPER
  const fetchPosts = useCallback(
    async (pageToFetch: number) => {
      if (loading) return;
      setLoading(true);
      try {
        // Fake data for testing
        const fakePosts: Post[] = Array.from({ length: 20 }, (_, index) => ({
          id: (pageToFetch - 1) * 20 + index + 1,
          clientId: index + 1,
          clientName: `Client ${(pageToFetch - 1) * 20 + index + 1}`,
          authorImage: `https://randomuser.me/api/portraits/men/${index + 10}.jpg`,
          regine: `Region ${index + 1}`,
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
  };

  // Open comment box and fetch fake comments
  const openCommentBox = (postId: number) => {
    setSelectedPostId(postId);
    const fakeComments: Comment[] = Array.from(
      { length: Math.floor(Math.random() * 9) + 2 },
      (_, i) => ({
        id: i + 1,
        workerId: i + 1,
        authorImage: `https://randomuser.me/api/portraits/women/${i + 10}.jpg`,
        authorName: `User ${i + 1}`,
        text: `This is a fake comment #${i + 1} for post ${postId}.`,
      })
    );
    setComments(fakeComments);
  };

  // Close comment box
  const closeCommentBox = () => {
    setSelectedPostId(null);
    setComments([]);
  };

  // Submit comment (fake)
  const submitComment = () => {
    if (!selectedPostId || commentText.trim() === "") return;
    const newComment: Comment = {
      id: comments.length + 1,
      workerId: comments.length + 1,
      authorImage: `https://randomuser.me/api/portraits/women/20.jpg`,
      authorName: "You",
      text: commentText,
    };
    setComments((prev) => [...prev, newComment]);
    setCommentText("");
  };

  // Render media item
  const renderMediaItem = ({ item }: { item: MediaItem }) => {
    if (item.type === "image" && item.url) {
      return (
        <View className="mr-2">
          <Image
            source={{ uri: item.url }}
            className="w-48 h-32 rounded-xl"
            resizeMode="cover"
          />
        </View>
      );
    }
    if (item.type === "video" && item.url) {
      return (
        <View className="mr-2 bg-gray-200 w-48 h-32 rounded-xl justify-center items-center">
          <Ionicons name="play-circle" size={40} color="gray" />
          <Text className="text-gray-600 text-xs mt-1">Video</Text>
        </View>
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

  // Render post
  const renderPost = ({ item }: { item: Post }) => (
    <View className="bg-white rounded-2xl shadow p-4 mb-4 mx-2">
      {/* Header */}
      <View className="flex-row items-center mb-2">
        <Image
          source={{ uri: item.authorImage }}
          className="w-10 h-10 rounded-full mr-2"
        />
        <View>
          <Text className="font-bold text-lg">{item.clientName}</Text>
          <Text className="text-sm text-gray-500">
            {item.regine}, {item.city}
          </Text>
        </View>
      </View>
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
          <FlatList
            data={comments}
            keyExtractor={(c) => c.id.toString()}
            renderItem={({ item: c }) => (
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/(home)/profileAsView", // Ensure this route exists in your project
                    params: { workerId: c.workerId },
                  })
                }
              >
                <View className="bg-gray-100 p-4 rounded-2xl mb-2">
                  <View className="flex-row items-center mb-2">
                    <Image
                      source={{ uri: c.authorImage }}
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <Text className="font-bold text-sm">{c.authorName}</Text>
                  </View>
                  <Text className="text-gray-600">{c.text}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
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
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPost}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? <ActivityIndicator style={{ margin: 20 }} /> : null
        }
      />
    </View>
  );
};

export default HomeScreen;
