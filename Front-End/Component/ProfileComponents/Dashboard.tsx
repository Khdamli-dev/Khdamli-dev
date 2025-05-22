import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Send, CheckCircle, Calendar, TrendingUp } from "lucide-react-native";
// import apiClient from "@/api/appClient";

interface DashboardStats {
  sent_requests: number;
  accepted_requests: number;
  completed_requests: number;
}

interface DashboardProps {
  workerId: string;
  onStatPress?: (statType: "sent" | "accepted" | "completed") => void;
}

const Dashboard: React.FC<DashboardProps> = ({ workerId, onStatPress }) => {
  const [stats, setStats] = useState<DashboardStats>({
    sent_requests: 0,
    accepted_requests: 0,
    completed_requests: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, [workerId]);

  // TODO: Implement API call to fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Uncomment and modify this when backend is ready:
      /*
      const response = await apiClient.get(`/workers/${workerId}/dashboard-stats`);
      setStats({
        sent_requests: response.data.sent_requests,
        accepted_requests: response.data.accepted_requests,
        completed_requests: response.data.completed_requests,
      });
      */

      // Fake data for testing - Remove when API is implemented
      setTimeout(() => {
        setStats({
          sent_requests: 15,
          accepted_requests: 12,
          completed_requests: 8,
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      setLoading(false);
    }
  };
const statsData = [
  {
    key: "sent" as const,
    label: "Sent Requests",
    value: stats.sent_requests,
    icon: Send,
    color: "#F8A100",
    bgColor: "#FFF6E6",
  },
  {
    key: "accepted" as const,
    label: "Accepted",
    value: stats.accepted_requests,
    icon: CheckCircle,
    color: "#4C8479",
    bgColor: "#EDF4F2",
  },
  {
    key: "completed" as const,
    label: "Completed",
    value: stats.completed_requests,
    icon: Calendar,
    color: "#2B524A",
    bgColor: "#E8EFED",
  },
];

  if (loading) {
    return (
      <View className="bg-white rounded-[25px] overflow-hidden mb-6 mx-4 p-6">
        <View
          className="absolute inset-0 rounded-[25px]"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8,
          }}
        />
        <View className="flex-row items-center justify-center mb-6">
          <TrendingUp size={28} color="#BD7D06" />
          <Text
            className="text-center text-[#BD7D06] ml-3 text-[24px] font-bold"
            style={{ fontFamily: "Itim_400Regular" }}
          >
            Dashboard
          </Text>
        </View>

        {/* Loading Skeleton */}
        <View className="space-y-4">
          {[1, 2, 3].map((index) => (
            <View
              key={index}
              className="flex-row items-center bg-gray-50 rounded-2xl p-4"
            >
              <View className="w-14 h-14 rounded-full bg-gray-200 mr-4" />
              <View className="flex-1">
                <View className="w-20 h-4 bg-gray-200 rounded mb-2" />
                <View className="w-32 h-3 bg-gray-200 rounded" />
              </View>
              <View className="w-8 h-8 bg-gray-200 rounded-full" />
            </View>
          ))}
        </View>
      </View>
    );
  }

 return (
   <View className="bg-white rounded-3xl px-6 py-3 mb-2">
     {/* Header */}
     <View className="flex-row items-center mb-4">
       <View className="flex-1">
         <Text
           className="text-[#2B524A] text-2xl font-bold"
           style={{ fontFamily: "Itim_400Regular" }}
         >
           Dashboard
         </Text>
         <Text className="text-gray-500 mt-1">Activity Overview</Text>
       </View>
       <View className="bg-[#F8A100]/5 p-3 rounded-2xl">
         <TrendingUp size={24} color="#F8A100" />
       </View>
     </View>

     {/* Stats Grid - New Design */}
     <View className="grid grid-cols-2 gap-4">
       {statsData.map((stat) => (
         <View
           key={stat.key}
           className="rounded-2xl px-4 py-1 my-2"
           style={{
             backgroundColor: stat.bgColor,
           }}
         >
           {/* Top Section */}
           <View className="flex-row items-center justify-between mb-2">
             <View
               className="w-10 h-10 rounded-xl items-center justify-center"
               style={{ backgroundColor: `${stat.color}15` }}
             >
               <stat.icon size={20} color={stat.color} strokeWidth={2.5} />
             </View>
             <Text
               className="text-2xl font-bold"
               style={{
                 fontFamily: "Itim_400Regular",
                 color: stat.color,
               }}
             >
               {stat.value}
             </Text>
           </View>

           {/* Label */}
           <Text
             className="text-sm"
             style={{
               fontFamily: "Itim_400Regular",
               color: stat.color,
             }}
           >
             {stat.label}
           </Text>
         </View>
       ))}
     </View>

     {/* Summary Footer */}
     <View className="mt-4 pt-2 border-t border-gray-100">
       <Text
         className="text-center text-gray-600 text-sm"
         style={{ fontFamily: "Itim_400Regular" }}
       >
         Total Requests:{" "}
         {stats.sent_requests +
           stats.accepted_requests +
           stats.completed_requests}
       </Text>
     </View>
   </View>
 );
};

export default Dashboard;
