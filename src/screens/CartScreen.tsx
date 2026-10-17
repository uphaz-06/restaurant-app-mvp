import { useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { apiClient } from "../api/client";
import { useCart } from "../context/CartContext";

export default function CartScreen() {
  const { state, dispatch } = useCart();
  const [promoInput, setPromoInput] = useState("");
  const [orderType, setOrderType] = useState<"Dine-in" | "Takeaway">("Takeaway");
  const [submitting, setSubmitting] = useState(false);

  const subtotal = useMemo(
    () => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [state.items],
  );
  const discounted = subtotal * (1 - state.discountPercent / 100);
  const service = discounted * 0.05;
  const tax = discounted * 0.15;
  const grandTotal = discounted + service + tax;

  const placeOrder = async () => {
    if (state.items.length === 0) {
      Alert.alert("Cart is empty", "Add items from the menu first.");
      return;
    }
    if (state.items.some((item) => !item.isAvailable)) {
      Alert.alert("Unavailable item", "Remove sold-out items before placing the order.");
      return;
    }

    setSubmitting(true);
    try {
      const order = await apiClient("/orders", "POST", {
        type: orderType,
        items: state.items.map((item) => ({
          menuItem: item._id,
          quantity: item.quantity,
          note: item.note || undefined,
        })),
      });
      dispatch({ type: "CLEAR_CART" });
      Alert.alert(
        "Order placed",
        `Server total Rs ${(order.totalAmount as number).toFixed(2)}. Track it on the Orders tab.`,
      );
    } catch (error: unknown) {
      Alert.alert(
        "Order failed",
        error instanceof Error ? error.message : "Could not place the order",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {state.items.length === 0 ? (
        <Text style={styles.empty}>Your cart is empty.</Text>
      ) : (
        state.items.map((item) => (
          <View key={item._id} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>
                ${(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => dispatch({ type: "DECREMENT", payload: { id: item._id } })}
              >
                <Text style={styles.qtyText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qty}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => dispatch({ type: "ADD_ITEM", payload: item })}
              >
                <Text style={styles.qtyText}>+</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              placeholder="Special instructions (allergies, no onions...)"
              value={item.note}
              onChangeText={(note) =>
                dispatch({ type: "UPDATE_NOTE", payload: { id: item._id, note } })
              }
              style={styles.note}
            />
          </View>
        ))
      )}

      <View style={styles.promoRow}>
        <TextInput
          placeholder="Promo code (WELCOME10 / FEAST20)"
          value={promoInput}
          onChangeText={setPromoInput}
          autoCapitalize="characters"
          style={[styles.note, { flex: 1, marginBottom: 0 }]}
        />
        <TouchableOpacity
          style={styles.smallBtn}
          onPress={() => dispatch({ type: "APPLY_PROMO", payload: promoInput.trim() })}
        >
          <Text style={styles.smallBtnText}>Apply</Text>
        </TouchableOpacity>
      </View>
      {state.promoCode ? (
        <Text style={styles.promoOk}>
          {state.promoCode} applied ({state.discountPercent}% off food)
        </Text>
      ) : null}

      <View style={styles.typeRow}>
        {(["Takeaway", "Dine-in"] as const).map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.typeChip, orderType === type && styles.typeChipActive]}
            onPress={() => setOrderType(type)}
          >
            <Text style={[styles.typeText, orderType === type && styles.typeTextActive]}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.totals}>
        <Text>Subtotal: ${subtotal.toFixed(2)}</Text>
        <Text>Service (5%): ${service.toFixed(2)}</Text>
        <Text>Tax (15%): ${tax.toFixed(2)}</Text>
        <Text style={styles.grand}>Estimated total: ${grandTotal.toFixed(2)}</Text>
        <Text style={styles.hint}>
          The server recalculates the food total from current menu prices and rejects unavailable items.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, submitting && { opacity: 0.6 }]}
        disabled={submitting}
        onPress={placeOrder}
      >
        <Text style={styles.buttonText}>{submitting ? "Placing..." : "Place order"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  content: { padding: 16, paddingBottom: 40 },
  empty: { textAlign: "center", marginTop: 40, color: "#6C757D" },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  name: { fontWeight: "700", fontSize: 16, flex: 1 },
  price: { fontWeight: "700", color: "#457B9D" },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E9ECEF",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },
  qtyText: { fontSize: 18, fontWeight: "700" },
  qty: { marginHorizontal: 12, fontWeight: "700" },
  note: {
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  promoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  smallBtn: {
    backgroundColor: "#457B9D",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 8,
  },
  smallBtnText: { color: "#fff", fontWeight: "700" },
  promoOk: { color: "#2A9D8F", marginTop: 6 },
  typeRow: { flexDirection: "row", marginTop: 16 },
  typeChip: {
    borderWidth: 1,
    borderColor: "#DEE2E6",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  typeChipActive: { backgroundColor: "#E63946", borderColor: "#E63946" },
  typeText: { fontWeight: "600", color: "#495057" },
  typeTextActive: { color: "#fff" },
  totals: { marginTop: 16, backgroundColor: "#fff", padding: 14, borderRadius: 12 },
  grand: { fontWeight: "800", marginTop: 8, fontSize: 16 },
  hint: { color: "#6C757D", marginTop: 8, fontSize: 12 },
  button: {
    backgroundColor: "#E63946",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
