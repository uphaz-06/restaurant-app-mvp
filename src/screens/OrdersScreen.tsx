import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { apiClient } from "../api/client";
import { MenuItem, Order } from "../types";

function itemName(item: Order["items"][number]) {
  if (item.menuItem && typeof item.menuItem === "object") {
    return (item.menuItem as MenuItem).name;
  }
  return "Item";
}

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = (await apiClient("/orders/my")) as Order[];
      setOrders(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load orders");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
    const intervalId = setInterval(() => {
      void loadOrders(true);
    }, 10000);
    return () => clearInterval(intervalId);
  }, [loadOrders]);

  if (loading && orders.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E63946" />
      </View>
    );
  }

  if (error && orders.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <Button title="Retry" onPress={() => loadOrders()} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={() => loadOrders()} />
      }
    >
      <Text style={styles.hint}>Status updates automatically every 10 seconds.</Text>
      {orders.length === 0 ? (
        <Text style={styles.empty}>No orders yet. Place one from the cart.</Text>
      ) : (
        orders.map((order) => (
          <View key={order._id} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.status}>{order.status}</Text>
              <Text style={styles.type}>{order.type}</Text>
            </View>
            {order.items.map((item, index) => (
              <Text key={`${order._id}-${index}`}>
                {itemName(item)} x{item.quantity}
              </Text>
            ))}
            <Text style={styles.total}>Total ${order.totalAmount.toFixed(2)}</Text>
            {order.createdAt ? (
              <Text style={styles.date}>{new Date(order.createdAt).toLocaleString()}</Text>
            ) : null}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  hint: { padding: 16, color: "#6C757D" },
  empty: { textAlign: "center", color: "#6C757D", marginTop: 24 },
  error: { color: "red", marginBottom: 10, textAlign: "center" },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
  },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  status: { fontWeight: "800", color: "#E63946" },
  type: { color: "#457B9D", fontWeight: "600" },
  total: { marginTop: 8, fontWeight: "700" },
  date: { color: "#6C757D", marginTop: 4, fontSize: 12 },
});
