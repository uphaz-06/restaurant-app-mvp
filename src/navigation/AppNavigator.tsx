import React, { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuth } from "../context/AuthContext";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import MenuScreen from "../screens/MenuScreen";
import ProfileScreen from "../screens/ProfileScreen";
import CartScreen from "../screens/CartScreen";
import DashboardScreen from "../screens/DashboardScreen";
import OrdersScreen from "../screens/OrdersScreen";
import ReservationsScreen from "../screens/ReservationsScreen";

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const { user, loading } = useAuth();
  const [authScreen, setAuthScreen] = useState<"login" | "signup">("login");

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#E63946" />
      </View>
    );
  }

  if (!user) {
    if (authScreen === "signup") {
      return <SignupScreen onGoLogin={() => setAuthScreen("login")} />;
    }
    return <LoginScreen onGoSignup={() => setAuthScreen("signup")} />;
  }

  return (
    <Tab.Navigator
      screenOptions={{
        headerTitleStyle: { fontWeight: "700" },
        tabBarActiveTintColor: "#E63946",
      }}
    >
      <Tab.Screen name="Menu" component={MenuScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Reservations" component={ReservationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      {user.role === "manager" && (
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
      )}
    </Tab.Navigator>
  );
}
