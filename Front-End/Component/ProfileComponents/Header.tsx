import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
interface HeaderProps {
  title: string;
}
type RootStackParamList = {
  Profile: undefined;
};
type NavigationProp = StackNavigationProp<RootStackParamList, "Profile">;
const Header: React.FC<HeaderProps> = ({ title }) => {
  const navigation = useNavigation<NavigationProp>();
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
        <ArrowLeft size={38} color="#BD7D06" />
      </TouchableOpacity>
      <Text style={styles.headerText}>{title}</Text>
    </View>
  );
};
const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 28,

    marginLeft: 20,
    fontFamily: "Itim_400Regular",
  },
});
export default Header;
