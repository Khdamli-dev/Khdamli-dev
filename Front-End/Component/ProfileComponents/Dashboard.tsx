import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Send, CheckCircle, Calendar, TrendingUp } from 'lucide-react-native';
import apiClient from '@/api/appClient';
// import apiClient from "@/api/appClient";

interface DashboardStats {
  sent_requests: number;
  completed_requests: number;
}

interface DashboardProps {
  workerId: string;
  sent_requests: number;
  completed_requests: number;
}

const Dashboard: React.FC<DashboardProps> = ({
  workerId,
  sent_requests,
  completed_requests,
}) => {
  const [stats, setStats] = useState<DashboardStats>({
    sent_requests: 0,
    completed_requests: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setStats({ sent_requests, completed_requests });
    setLoading(false);
  }, [workerId]);

  const statsData = [
    {
      key: 'sent' as const,
      label: 'Sent Requests',
      value: stats.sent_requests,
      icon: Send,
      color: '#22C55E',
      bgColor: '#F0FDF4',
    },
    {
      key: 'completed' as const,
      label: 'Completed',
      value: stats.completed_requests,
      icon: CheckCircle,
      color: '#22C55E',
      bgColor: '#F0FDF4',
    },
  ];

  if (loading) {
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
          <TrendingUp size={20} color="#22C55E" />
          <Text style={{
            fontSize: 18,
            fontWeight: "600",
            color: "#111827",
            marginLeft: 8,
          }}>
            Dashboard
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

        {[1, 2].map((index) => (
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
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{
                  width: 40,
                  height: 40,
                  backgroundColor: "#E5E7EB",
                  borderRadius: 20,
                  marginRight: 12,
                }} />
                <View>
                  <View style={{
                    width: 100,
                    height: 16,
                    backgroundColor: "#E5E7EB",
                    borderRadius: 4,
                    marginBottom: 4,
                  }} />
                  <View style={{
                    width: 80,
                    height: 12,
                    backgroundColor: "#E5E7EB",
                    borderRadius: 4,
                  }} />
                </View>
              </View>
              <View style={{
                width: 32,
                height: 24,
                backgroundColor: "#E5E7EB",
                borderRadius: 4,
              }} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: "white", padding: 16 }}>
      {/* Header */}
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
          <TrendingUp size={20} color="#22C55E" />
          <Text style={{
            fontSize: 18,
            fontWeight: "600",
            color: "#111827",
            marginLeft: 8,
            fontFamily: 'Itim_400Regular',
          }}>
            Dashboard
          </Text>
        </View>

        {/* Activity Overview Card */}
        {/* <View style={{
          backgroundColor: "#F0FDF4",
          borderRadius: 12,
          padding: 16,
          alignItems: "center",
          marginBottom: 16,
        }}>
          <Text style={{
            fontSize: 24,
            fontWeight: "700",
            color: "#22C55E",
            fontFamily: 'Itim_400Regular',
          }}>
            {stats.sent_requests + stats.completed_requests}
          </Text>
          <Text style={{
            color: "#6B7280",
            fontSize: 14,
            fontFamily: 'Itim_400Regular',
          }}>
            Total Requests
          </Text>
        </View> */}
      </View>

      {/* Stats Cards */}
      {statsData.map((stat) => (
        <View
          key={stat.key}
          style={{
            backgroundColor: "white",
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 2,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {/* Icon Container */}
            <View style={{
              width: 40,
              height: 40,
              backgroundColor: stat.bgColor,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}>
              <stat.icon size={20} color={stat.color} strokeWidth={2.5} />
            </View>

            {/* Content */}
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#111827",
                fontFamily: 'Itim_400Regular',
                marginBottom: 2,
              }}>
                {stat.label}
              </Text>
              <Text style={{
                color: "#6B7280",
                fontSize: 14,
                fontFamily: 'Itim_400Regular',
              }}>
                Activity count
              </Text>
            </View>

            {/* Value */}
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{
                fontSize: 20,
                fontWeight: "700",
                color: stat.color,
                fontFamily: 'Itim_400Regular',
              }}>
                {stat.value}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

export default Dashboard;