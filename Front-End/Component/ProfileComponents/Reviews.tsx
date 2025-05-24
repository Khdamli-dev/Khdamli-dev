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
import {
  Star,
  MessageCircle,
  ChevronRight,
  X,
  ArrowLeft,
  MoreHorizontal,
} from 'lucide-react-native';
import apiClient from '@/api/appClient';
import refreshAccessToken from '@/api/refreshAccessToken';
import { router } from 'expo-router';

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

  const fetchReviews = async () => {
    try {
      setLoading(true);
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
    let sum: number = 0;
    reviews.forEach(e => sum += +e.rating);
    setAverageRating(sum / reviews.length);
  }, [reviews]);

  const renderStars = (rating: number, size: number = 16) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={size}
        color={index < Math.floor(rating) ? '#22C55E' : '#E5E7EB'}
        fill={index < Math.floor(rating) ? '#22C55E' : '#E5E7EB'}
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
      <View style={{
        backgroundColor: "white",
        padding: 16,
      }}>
        {/* Header */}
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#F3F4F6",
          marginBottom: 16,
        }}>
          <MessageCircle size={20} color="#22C55E" />
          <Text style={{
            fontSize: 18,
            fontWeight: "600",
            color: "#111827",
            marginLeft: 8,
          }}>
            Reviews
          </Text>
        </View>

        {/* Loading Skeleton */}
        <View style={{
          backgroundColor: "#F9FAFB",
          borderRadius: 12,
          padding: 16,
          alignItems: "center",
          marginBottom: 16,
        }}>
          <View style={{
            width: 120,
            height: 20,
            backgroundColor: "#E5E7EB",
            borderRadius: 4,
            marginBottom: 8,
          }} />
          <View style={{
            width: 80,
            height: 28,
            backgroundColor: "#E5E7EB",
            borderRadius: 4,
          }} />
        </View>

        {[1, 2, 3].map((index) => (
          <View key={index} style={{
            backgroundColor: "white",
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 2,
          }}>
            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
              <View style={{
                width: 40,
                height: 40,
                backgroundColor: "#E5E7EB",
                borderRadius: 20,
                marginRight: 12,
              }} />
              <View style={{ flex: 1 }}>
                <View style={{
                  width: 100,
                  height: 16,
                  backgroundColor: "#E5E7EB",
                  borderRadius: 4,
                  marginBottom: 8,
                }} />
                <View style={{
                  width: "100%",
                  height: 12,
                  backgroundColor: "#E5E7EB",
                  borderRadius: 4,
                  marginBottom: 4,
                }} />
                <View style={{
                  width: "75%",
                  height: 12,
                  backgroundColor: "#E5E7EB",
                  borderRadius: 4,
                }} />
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
    <View style={{
      backgroundColor: "white",
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
      marginHorizontal: isModal ? 16 : 0,
    }}>
      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        {/* Client Profile */}
        <TouchableOpacity
          onPress={() =>
            isModal
              ? handleClientPress(item.clientid)
              : onClientPress?.(item.clientid)
          }
          activeOpacity={0.7}
          style={{ marginRight: 12 }}
        >
          <Image
            source={{
              uri:
                item.clientprofileimage ||
                'https://cdn-icons-png.flaticon.com/512/149/149071.png',
            }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              borderWidth: 2,
              borderColor: "#F3F4F6",
            }}
          />
        </TouchableOpacity>

        {/* Review Content */}
        <View style={{ flex: 1 }}>
          {/* Client Name & Rating */}
          <View style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}>
            <TouchableOpacity
              onPress={() =>
                isModal
                  ? handleClientPress(item.clientid)
                  : onClientPress?.(item.clientid)
              }
              activeOpacity={0.7}
            >
              <Text style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#111827",
                fontFamily: 'Itim_400Regular',
              }}>
                {item.clientname}
              </Text>
            </TouchableOpacity>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {renderStars(item.rating, 14)}
              <Text style={{
                marginLeft: 6,
                fontSize: 14,
                fontWeight: "600",
                color: "#22C55E",
                fontFamily: 'Itim_400Regular',
              }}>
                {item.rating}
              </Text>
            </View>
          </View>

          {/* Review Text */}
          <Text style={{
            color: "#374151",
            fontSize: 14,
            lineHeight: 20,
            fontFamily: 'Itim_400Regular',
          }}
            numberOfLines={isModal ? undefined : 3}
          >
            {item.review}
          </Text>
        </View>
      </View>
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
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        {/* Header */}
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: "#F3F4F6",
        }}>
          <TouchableOpacity
            onPress={() => setModalVisible(false)}
            activeOpacity={0.7}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#F3F4F6",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ArrowLeft size={20} color="#374151" />
          </TouchableOpacity>

          <Text style={{
            fontSize: 18,
            fontWeight: "600",
            color: "#111827",
          }}>
            Reviews ({reviews.length})
          </Text>

          <View style={{ width: 40 }} />
        </View>

        {/* Overall Rating Section */}
        <View style={{
          backgroundColor: "white",
          padding: 16,
          borderBottomWidth: 8,
          borderBottomColor: "#F9FAFB",
        }}>
          <View style={{
            backgroundColor: "#F0FDF4",
            borderRadius: 12,
            padding: 16,
            alignItems: "center",
          }}>
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}>
              {renderStars(averageRating, 20)}
            </View>
            <Text style={{
              fontSize: 28,
              fontWeight: "700",
              color: "#22C55E",
              fontFamily: 'Itim_400Regular',
            }}>
              {averageRating.toFixed(1)}
            </Text>
            <Text style={{
              color: "#6B7280",
              fontSize: 14,
              fontFamily: 'Itim_400Regular',
            }}>
              Average from {reviews.length} reviews
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
          style={{ backgroundColor: "#F9FAFB" }}
        />
      </SafeAreaView>
    </Modal>
  );

  if (reviews.length === 0) {
    return (
      <View style={{ backgroundColor: "white", padding: 16 }}>
        {/* Header */}
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#F3F4F6",
          marginBottom: 16,
        }}>
          <MessageCircle size={20} color="#22C55E" />
          <Text style={{
            fontSize: 18,
            fontWeight: "600",
            color: "#111827",
            marginLeft: 8,
          }}>
            Reviews
          </Text>
        </View>

        {/* Empty State */}
        <View style={{
          alignItems: "center",
          paddingVertical: 40,
        }}>
          <MessageCircle size={60} color="#D1D5DB" />
          <Text style={{
            color: "#6B7280",
            fontSize: 16,
            marginTop: 16,
            textAlign: "center",
            fontFamily: 'Itim_400Regular',
          }}>
            No reviews yet
          </Text>
          <Text style={{
            color: "#9CA3AF",
            fontSize: 14,
            marginTop: 8,
            textAlign: "center",
            fontFamily: 'Itim_400Regular',
          }}>
            Complete your first job to get reviews
          </Text>
        </View>
      </View>
    );
  }

  return (
    <>
      <View style={{ backgroundColor: "white", padding: 16 }}>
        {/* Header with Average Rating */}
        <View style={{ marginBottom: 16 }}>
          {/* Section Title */}
          <View style={{
            flexDirection: "row",
            alignItems: "center",
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: "#F3F4F6",
            marginBottom: 16,
          }}>
            <MessageCircle size={20} color="#22C55E" />
            <Text style={{
              fontSize: 18,
              fontWeight: "600",
              color: "#111827",
              marginLeft: 8,
            }}>
              Reviews ({reviews.length})
            </Text>
          </View>

          {/* Overall Rating Card */}
          <View style={{
            backgroundColor: "#F0FDF4",
            borderRadius: 12,
            padding: 16,
            alignItems: "center",
            marginBottom: 16,
          }}>
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}>
              {renderStars(averageRating, 18)}
            </View>
            <Text style={{
              fontSize: 24,
              fontWeight: "700",
              color: "#22C55E",
              fontFamily: 'Itim_400Regular',
            }}>
              {averageRating.toFixed(1)}
            </Text>
            <Text style={{
              color: "#6B7280",
              fontSize: 14,
              fontFamily: 'Itim_400Regular',
            }}>
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
            style={{
              backgroundColor: "#22C55E",
              borderRadius: 12,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 16,
            }}
          >
            <Text style={{
              color: "white",
              fontSize: 16,
              fontWeight: "600",
              marginRight: 8,
              fontFamily: 'Itim_400Regular',
            }}>
              View All Reviews ({reviews.length})
            </Text>
            <ChevronRight size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>

      {/* Reviews Modal */}
      <ReviewsModal />
    </>
  );
};

export default Reviews;