import {
  createMaterialTopTabNavigator,
  MaterialTopTabNavigationOptions,
  MaterialTopTabNavigationEventMap,
} from "@react-navigation/material-top-tabs";
import { ParamListBase, TabNavigationState } from "@react-navigation/native";
import { withLayoutContext } from "expo-router";
import { createStackNavigator } from "@react-navigation/stack";
import NotificationBadge from "@/Component/NotificationBadge";
import { useNotifications } from "@/context/NotificationContext";
import { View, Text } from "react-native";

const { Navigator } = createMaterialTopTabNavigator();
const Stack = createStackNavigator();
export const MaterialTopTab = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

const PrivateTabLabel = ({ title, count = 0 } : {title : string, count : number}) : JSX.Element => {
  return (
    <View className="relative items-center flex">
      <Text className="text-[15px] font-bold capitalize text-[#2B524A]">
        {title}
      </Text>
      <NotificationBadge count={count} size="large" />
    </View>
  );
};

const TopTabs = () => {
  return (
    <MaterialTopTab
      screenOptions={{
        tabBarActiveTintColor: "#131620",
        tabBarIndicatorStyle: { backgroundColor: "#2B524A", height: 3 },
        tabBarLabelStyle: {
          fontSize: 15,
          fontWeight: "bold",
          textTransform: "capitalize",
          color: "#2B524A",
        },
      }}
    >
      <MaterialTopTab.Screen
        name="ClientRequest"
        options={{ title: "Public" }}
      />
      <MaterialTopTab.Screen 
        name="Private" 
        options={{ 
          tabBarLabel: ({ color }) => (
            <PrivateTabLabel title="Private" count={useNotifications()?.unreadRequests || 0} />
          )
        }}
      />
    </MaterialTopTab>
  );
};

export default TopTabs;
