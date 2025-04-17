import {
    createMaterialTopTabNavigator,
    MaterialTopTabNavigationOptions,
    MaterialTopTabNavigationEventMap,
  } from "@react-navigation/material-top-tabs";
  import { ParamListBase, TabNavigationState } from "@react-navigation/native";
  import { withLayoutContext } from "expo-router";
  import { createStackNavigator } from "@react-navigation/stack";
  const { Navigator } = createMaterialTopTabNavigator();
  const Stack = createStackNavigator();
  export const MaterialTopTab = withLayoutContext<
    MaterialTopTabNavigationOptions,
    typeof Navigator,
    TabNavigationState<ParamListBase>,
    MaterialTopTabNavigationEventMap
  >(Navigator);
  
  const TopTabs  = () => {
   
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
        <MaterialTopTab.Screen name="ClientRequest" options={{ title: "Public" }} />
        <MaterialTopTab.Screen name="Private" options={{ title: "Private" }} />
      </MaterialTopTab>
    );
  };  
  
  export default TopTabs ;
  