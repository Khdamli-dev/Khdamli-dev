import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  Modal,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Star,
  MessageCircle,
  ChevronRight,
  X,
  ArrowLeft,
} from 'lucide-react-native';
import apiClient from '@/api/appClient';
import refreshAccessToken from '@/api/refreshAccessToken';
import { router } from 'expo-router';
// import apiClient from "@/api/appClient";

const { width, height } = Dimensions.get('window');

interface Review {
  clientid: string;
  review: string;
  rating: number;
  clientname: string;
  clientprofileimage: string;
}

interface ReviewsProps {
  workerId: string;
  onClientPress?: (clientId: string) => void;
  onViewAllPress?: () => void;
  showAll?: boolean;
}

const Reviews: React.FC<ReviewsProps> = ({
  workerId,
  onClientPress,
  onViewAllPress,
  showAll = false,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [workerId]);

  // TODO: Implement API call to fetch reviews
  const fetchReviews = async () => {
    try {
      setLoading(true);

      // Uncomment and modify this when backend is ready:

      const response = await apiClient.get(`/work/worker/${workerId}/reviews`);
      setReviews(response.data.reviews);
    } catch (error: any) {
      if (error.response?.status === 401) {
        if (await refreshAccessToken()) {
          await fetchReviews();
        } else {
          router.push('/(auth)');
        }
        console.error('Failed to fetch reviews:', error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);
  const hasMoreReviews = reviews.length > 3 && !showAll;

  // Calculate average rating
  const [averageRating, setAverageRating] = useState<number>(0);
  useEffect(() => {
    let sum : number = 0;
    reviews.forEach(e => sum += +e.rating);
    setAverageRating(sum / reviews.length);
  }, [reviews]);

  const renderStars = (rating: number, size: number = 16) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={size}
        color={index < Math.floor(rating) ? '#FFD700' : '#E5E5E5'}
        fill={index < Math.floor(rating) ? '#FFD700' : '#E5E5E5'}
      />
    ));
  };

  const handleViewAllPress = () => {
    setModalVisible(true);
    onViewAllPress?.();
  };

  const handleClientPress = (clientId: string) => {
    setModalVisible(false);
    onClientPress?.(clientId);
  };

  if (loading) {
    return (
      <View className="bg-white rounded-[25px] overflow-hidden mb-2.5 mx-1.75 p-5 border border-gray-200 shadow-lg">
        <View className="flex-row items-center justify-center mb-4">
          <MessageCircle size={24} color="#BD7D06" />
          <Text
            className="text-center text-[#BD7D06] ml-2 text-[22px] font-bold"
            style={{ fontFamily: 'Itim_400Regular' }}
          >
            Reviews
          </Text>
        </View>

        <View className="bg-gray-200 rounded-[15px] p-4 items-center mb-5">
          <View className="w-32 h-6 bg-gray-300 rounded mb-2" />
          <View className="w-16 h-8 bg-gray-300 rounded" />
        </View>

        {[1, 2, 3].map((index) => (
          <View key={index} className="mb-4 bg-gray-100 rounded-[20px] p-4">
            <View className="flex-row items-start">
              <View className="w-12 h-12 bg-gray-300 rounded-full mr-3" />
              <View className="flex-1">
                <View className="w-24 h-4 bg-gray-300 rounded mb-2" />
                <View className="w-full h-3 bg-gray-300 rounded mb-1" />
                <View className="w-3/4 h-3 bg-gray-300 rounded" />
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  }

  const renderReviewItem = ({
    item,
    isModal = false,
  }: {
    item: Review;
    isModal?: boolean;
  }) => (
    <View className={`mb-4 last:mb-0 ${isModal ? 'mx-4' : ''}`}>
      <LinearGradient
        colors={['#FFFFFF', '#F8F9FA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-[20px] p-4 border border-gray-100 shadow-sm"
      >
        <View className="flex-row items-start">
          {/* Client Profile */}
          <TouchableOpacity
            onPress={() =>
              isModal
                ? handleClientPress(item.clientid)
                : onClientPress?.(item.clientid)
            }
            activeOpacity={0.7}
            className="mr-3"
          >
            <View className="relative">
              <Image
                source={{
                  uri:
                    item.clientprofileimage ||
                    'https://cdn-icons-png.flaticon.com/512/149/149071.png',
                }}
                className="w-12 h-12 rounded-full border-2 border-gray-200"
              />
              {/* Online indicator (optional) */}
              <View className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
            </View>
          </TouchableOpacity>

          {/* Review Content */}
          <View className="flex-1">
            {/* Client Name & Rating */}
            <View className="flex-row items-center justify-between mb-2">
              <TouchableOpacity
                onPress={() =>
                  isModal
                    ? handleClientPress(item.clientid)
                    : onClientPress?.(item.clientid)
                }
                activeOpacity={0.7}
              >
                <Text
                  className="text-[16px] font-bold text-gray-800"
                  style={{ fontFamily: 'Itim_400Regular' }}
                >
                  {item.clientname}
                </Text>
              </TouchableOpacity>

              <View className="flex-row items-center">
                {renderStars(item.rating)}
                <Text
                  className="ml-2 text-[14px] font-semibold text-[#BD7D06]"
                  style={{ fontFamily: 'Itim_400Regular' }}
                >
                  {item.rating}
                </Text>
              </View>
            </View>

            {/* Review Text */}
            <Text
              className="text-gray-700 text-[14px] leading-5 mb-2"
              style={{ fontFamily: 'Itim_400Regular' }}
              numberOfLines={isModal ? undefined : 3}
            >
              {item.review}
            </Text>

            {/* Date (if available) */}
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  // Reviews Modal Component
  const ReviewsModal = () => (
    <Modal
      animationType="slide"
      transparent={false}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200 bg-white">
          <TouchableOpacity
            onPress={() => setModalVisible(false)}
            activeOpacity={0.7}
            className="p-2"
          >
            <ArrowLeft size={24} color="#BD7D06" />
          </TouchableOpacity>

          <Text
            className="text-[20px] font-bold text-[#BD7D06]"
            style={{ fontFamily: 'Itim_400Regular' }}
          >
            All Reviews ({reviews.length})
          </Text>

          <View className="w-8" />
        </View>

        {/* Overall Rating Section */}
        <View className="bg-white p-4 border-b border-gray-100">
          <View className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-[15px] p-4 items-center">
            <View className="flex-row items-center mb-2">
              {renderStars(averageRating, 24)}
            </View>
            <Text
              className="text-[28px] font-bold text-[#BD7D06]"
              style={{ fontFamily: 'Itim_400Regular' }}
            >
              {averageRating.toFixed(1)}
            </Text>
            <Text
              className="text-gray-600 text-[16px]"
              style={{ fontFamily: 'Itim_400Regular' }}
            >
              Average Rating from {reviews.length} reviews
            </Text>
          </View>
        </View>

        {/* Reviews List */}
        <FlatList
          data={reviews}
          renderItem={({ item }) => renderReviewItem({ item, isModal: true })}
          keyExtractor={(item, index) => `modal-${item.clientid}-${index}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 16 }}
          ItemSeparatorComponent={() => <View className="h-2" />}
        />
      </SafeAreaView>
    </Modal>
  );

  if (reviews.length === 0) {
    return (
      <View className="bg-white rounded-[25px] overflow-hidden mb-2.5 mx-1.75 p-5 border border-gray-200 shadow-lg">
        <View className="flex-row items-center justify-center mb-4">
          <MessageCircle size={24} color="#BD7D06" />
          <Text
            className="text-center text-[#BD7D06] ml-2 text-[22px] font-bold"
            style={{ fontFamily: 'Itim_400Regular' }}
          >
            Reviews
          </Text>
        </View>

        <View className="items-center py-8">
          <MessageCircle size={48} color="#E5E5E5" />
          <Text
            className="text-gray-500 text-[16px] mt-3 text-center"
            style={{ fontFamily: 'Itim_400Regular' }}
          >
            No reviews yet
          </Text>
          
        </View>
      </View>
    );
  }

  return (
    <>
      <View className="bg-white rounded-[25px] overflow-hidden mb-2.5 mx-1.75 p-5 border border-gray-200 shadow-lg">
        {/* Header with Average Rating */}
        <View className="mb-5">
          <View className="flex-row items-center justify-center mb-3">
            <MessageCircle size={24} color="#BD7D06" />
            <Text
              className="text-center text-[#BD7D06] ml-2 text-[22px] font-bold"
              style={{ fontFamily: 'Itim_400Regular' }}
            >
              Reviews ({reviews.length})
            </Text>
          </View>

          {/* Overall Rating */}
          <View className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-[15px] p-4 items-center">
            <View className="flex-row items-center mb-2">
              {renderStars(averageRating, 20)}
            </View>
            <Text
              className="text-[24px] font-bold text-[#BD7D06]"
              style={{ fontFamily: 'Itim_400Regular' }}
            >
              {averageRating.toFixed(1)}
            </Text>
            <Text
              className="text-gray-600 text-[14px]"
              style={{ fontFamily: 'Itim_400Regular' }}
            >
              Average Rating
            </Text>
          </View>
        </View>

        {/* Reviews List */}
        <FlatList
          data={displayedReviews}
          renderItem={({ item }) => renderReviewItem({ item })}
          keyExtractor={(item, index) => `${item.clientid}-${index}`}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />

        {/* View All Button */}
        {hasMoreReviews && (
          <TouchableOpacity
            onPress={handleViewAllPress}
            activeOpacity={0.7}
            className="mt-4"
          >
            <LinearGradient
              colors={['#BD7D06', '#E8A317']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="rounded-[15px] p-4 flex-row items-center justify-center"
            >
              <Text
                className="text-white text-[16px] font-bold mr-2"
                style={{ fontFamily: 'Itim_400Regular' }}
              >
                View All Reviews ({reviews.length})
              </Text>
              <ChevronRight size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* Reviews Modal */}
      <ReviewsModal />
    </>
  );
};

export default Reviews;
