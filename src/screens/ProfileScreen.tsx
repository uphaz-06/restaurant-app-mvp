import React from 'react';
import { View, Text, Button } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme, theme } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background, padding: 20 }}>
      <Text style={{ color: theme.text }}>Profile: {user?.name}</Text>
      <Text style={{ color: theme.text }}>Role: {user?.role}</Text>
      <Button title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"} onPress={toggleTheme} />
      <Button title="Logout" onPress={logout} color="red" />
    </View>
  );
}