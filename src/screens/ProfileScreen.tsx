import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme, theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>{user?.name}</Text>
      <Text style={{ color: theme.text }}>{user?.email}</Text>
      <Text style={[styles.role, { color: theme.text }]}>Role: {user?.role}</Text>
      <TouchableOpacity style={styles.button} onPress={toggleTheme}>
        <Text style={styles.buttonText}>
          {isDark ? "Switch to light mode" : "Switch to dark mode"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.logout]} onPress={logout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 8 },
  role: { marginTop: 8, marginBottom: 24, textTransform: "capitalize" },
  button: {
    backgroundColor: "#457B9D",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  logout: { backgroundColor: "#E63946" },
  buttonText: { color: "#fff", fontWeight: "700" },
});
