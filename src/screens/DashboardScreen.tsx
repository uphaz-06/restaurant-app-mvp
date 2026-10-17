import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { apiClient } from "../api/client";
import { useApi } from "../hooks/useApi";
import { MenuItem, Order, Reservation, Table, User } from "../types";

const NEXT_STATUS: Record<string, string | null> = {
  Pending: "Preparing",
  Preparing: "Ready",
  Ready: "Served",
  Served: null,
  Cancelled: null,
};

export default function DashboardScreen() {
  const [tab, setTab] = useState<"menu" | "orders" | "reservations">("menu");
  const menuApi = useApi("/menu");
  const ordersApi = useApi("/orders");
  const reservationsApi = useApi("/reservations");
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    category: "Mains",
  });
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});

  const menuItems = (menuApi.data as MenuItem[] | null) ?? [];
  const orders = (ordersApi.data as Order[] | null) ?? [];
  const reservations = (reservationsApi.data as Reservation[] | null) ?? [];

  const tabs = useMemo(
    () => [
      { id: "menu" as const, label: "Menu" },
      { id: "orders" as const, label: "Orders" },
      { id: "reservations" as const, label: "Reservations" },
    ],
    [],
  );

  const addItem = async () => {
    const price = Number(newItem.price);
    if (!newItem.name.trim() || Number.isNaN(price)) {
      Alert.alert("Invalid item", "Name and a numeric price are required.");
      return;
    }
    try {
      await apiClient("/menu", "POST", {
        name: newItem.name.trim(),
        description: newItem.description.trim(),
        price,
        category: newItem.category.trim() || "Mains",
      });
      setNewItem({ name: "", description: "", price: "", category: "Mains" });
      menuApi.refetch();
    } catch (err) {
      Alert.alert("Add failed", err instanceof Error ? err.message : "Could not add item");
    }
  };

  const savePrice = async (item: MenuItem) => {
    const price = Number(priceDrafts[item._id] ?? item.price);
    if (Number.isNaN(price) || price < 0) {
      Alert.alert("Invalid price", "Price cannot be negative.");
      return;
    }
    try {
      await apiClient(`/menu/${item._id}`, "PUT", { price });
      menuApi.refetch();
    } catch (err) {
      Alert.alert("Update failed", err instanceof Error ? err.message : "Could not update price");
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    try {
      await apiClient(`/menu/${item._id}`, "PUT", { isAvailable: !item.isAvailable });
      menuApi.refetch();
    } catch (err) {
      Alert.alert("Update failed", err instanceof Error ? err.message : "Could not update item");
    }
  };

  const deleteItem = (itemId: string) => {
    Alert.alert("Confirm delete", "Delete this menu item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await apiClient(`/menu/${itemId}`, "DELETE");
            menuApi.refetch();
          } catch (err) {
            Alert.alert("Delete failed", err instanceof Error ? err.message : "Could not delete");
          }
        },
      },
    ]);
  };

  const updateOrderStatus = async (order: Order, status: string) => {
    try {
      await apiClient(`/orders/${order._id}/status`, "PATCH", { status });
      ordersApi.refetch();
    } catch (err) {
      Alert.alert("Status failed", err instanceof Error ? err.message : "Could not update status");
    }
  };

  const updateReservation = async (id: string, status: "Confirmed" | "Declined") => {
    try {
      await apiClient(`/reservations/${id}`, "PATCH", { status });
      reservationsApi.refetch();
    } catch (err) {
      Alert.alert("Update failed", err instanceof Error ? err.message : "Could not update booking");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Manager Dashboard</Text>
      <View style={styles.tabRow}>
        {tabs.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.tab, tab === item.id && styles.tabActive]}
            onPress={() => setTab(item.id)}
          >
            <Text style={[styles.tabText, tab === item.id && styles.tabTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === "menu" ? (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.section}>Add menu item</Text>
          <TextInput
            placeholder="Name"
            value={newItem.name}
            onChangeText={(name) => setNewItem((prev) => ({ ...prev, name }))}
            style={styles.input}
          />
          <TextInput
            placeholder="Description"
            value={newItem.description}
            onChangeText={(description) => setNewItem((prev) => ({ ...prev, description }))}
            style={styles.input}
          />
          <TextInput
            placeholder="Price"
            keyboardType="decimal-pad"
            value={newItem.price}
            onChangeText={(price) => setNewItem((prev) => ({ ...prev, price }))}
            style={styles.input}
          />
          <TextInput
            placeholder="Category"
            value={newItem.category}
            onChangeText={(category) => setNewItem((prev) => ({ ...prev, category }))}
            style={styles.input}
          />
          <Button title="Add item" onPress={addItem} />

          {menuApi.error ? (
            <View style={styles.center}>
              <Text style={styles.error}>{menuApi.error}</Text>
              <Button title="Retry" onPress={() => menuApi.refetch()} />
            </View>
          ) : null}

          {menuItems.map((item) => (
            <View key={item._id} style={styles.card}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text>{item.category}</Text>
              <View style={styles.row}>
                <TextInput
                  keyboardType="decimal-pad"
                  value={priceDrafts[item._id] ?? String(item.price)}
                  onChangeText={(value) =>
                    setPriceDrafts((prev) => ({ ...prev, [item._id]: value }))
                  }
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                />
                <Button title="Save price" onPress={() => savePrice(item)} />
              </View>
              <View style={styles.row}>
                <Text>{item.isAvailable ? "Available" : "Sold out"}</Text>
                <Switch value={item.isAvailable} onValueChange={() => toggleAvailability(item)} />
                <Button title="Delete" color="red" onPress={() => deleteItem(item._id)} />
              </View>
            </View>
          ))}
        </ScrollView>
      ) : null}

      {tab === "orders" ? (
        <ScrollView contentContainerStyle={styles.content}>
          {ordersApi.error ? (
            <View style={styles.center}>
              <Text style={styles.error}>{ordersApi.error}</Text>
              <Button title="Retry" onPress={() => ordersApi.refetch()} />
            </View>
          ) : null}
          {orders.map((order) => {
            const customer = typeof order.user === "object" ? (order.user as User).name : "Customer";
            const next = NEXT_STATUS[order.status];
            return (
              <View key={order._id} style={styles.card}>
                <Text style={styles.itemName}>
                  {customer} · {order.status}
                </Text>
                <Text>{order.type}</Text>
                <Text>Total ${order.totalAmount.toFixed(2)}</Text>
                {next ? (
                  <Button title={`Mark ${next}`} onPress={() => updateOrderStatus(order, next)} />
                ) : null}
                {order.status === "Pending" ? (
                  <Button
                    title="Cancel"
                    color="red"
                    onPress={() => updateOrderStatus(order, "Cancelled")}
                  />
                ) : null}
              </View>
            );
          })}
        </ScrollView>
      ) : null}

      {tab === "reservations" ? (
        <ScrollView contentContainerStyle={styles.content}>
          {reservationsApi.error ? (
            <View style={styles.center}>
              <Text style={styles.error}>{reservationsApi.error}</Text>
              <Button title="Retry" onPress={() => reservationsApi.refetch()} />
            </View>
          ) : null}
          {reservations.map((reservation) => {
            const customer =
              typeof reservation.user === "object" ? (reservation.user as User).name : "Customer";
            const table =
              typeof reservation.table === "object"
                ? `Table ${(reservation.table as Table).tableNumber}`
                : "Table";
            return (
              <View key={reservation._id} style={styles.card}>
                <Text style={styles.itemName}>
                  {customer} · {reservation.status}
                </Text>
                <Text>
                  {table} · {String(reservation.reservationDate).slice(0, 10)} {reservation.timeSlot}
                </Text>
                <Text>Party of {reservation.partySize}</Text>
                {reservation.status === "Pending" ? (
                  <View style={styles.row}>
                    <Button
                      title="Accept"
                      onPress={() => updateReservation(reservation._id, "Confirmed")}
                    />
                    <Button
                      title="Decline"
                      color="red"
                      onPress={() => updateReservation(reservation._id, "Declined")}
                    />
                  </View>
                ) : null}
              </View>
            );
          })}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    fontSize: 22,
    fontWeight: "800",
    padding: 16,
    textAlign: "center",
    backgroundColor: "#fff",
  },
  tabRow: { flexDirection: "row", backgroundColor: "#fff" },
  tab: { flex: 1, padding: 12, alignItems: "center" },
  tabActive: { borderBottomWidth: 3, borderBottomColor: "#E63946" },
  tabText: { fontWeight: "600", color: "#6C757D" },
  tabTextActive: { color: "#E63946" },
  content: { padding: 16, paddingBottom: 40 },
  section: { fontWeight: "800", marginBottom: 8 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  card: { backgroundColor: "#fff", padding: 14, borderRadius: 12, marginTop: 12 },
  itemName: { fontSize: 16, fontWeight: "700" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  center: { padding: 12, alignItems: "center" },
  error: { color: "red", marginBottom: 8, textAlign: "center" },
});
