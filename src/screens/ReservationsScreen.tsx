import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { apiClient } from "../api/client";
import { useApi } from "../hooks/useApi";
import { Reservation, Table } from "../types";

const TIME_SLOTS = Array.from({ length: 11 }, (_, i) => `${String(12 + i).padStart(2, "0")}:00`);

function todayIsoDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function tableLabel(table: Reservation["table"]) {
  if (table && typeof table === "object") {
    return `Table ${(table as Table).tableNumber} (${(table as Table).capacity} seats)`;
  }
  return "Table";
}

export default function ReservationsScreen() {
  const { data: tablesData, refetch: refetchTables } = useApi("/reservations/tables");
  const {
    data: reservationsData,
    loading,
    error,
    refetch,
  } = useApi("/reservations/my");
  const tables = (tablesData as Table[] | null) ?? [];
  const reservations = (reservationsData as Reservation[] | null) ?? [];

  const [tableId, setTableId] = useState("");
  const [date, setDate] = useState(todayIsoDate());
  const [timeSlot, setTimeSlot] = useState("19:00");
  const [partySize, setPartySize] = useState("2");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedTable = useMemo(
    () => tables.find((table) => table._id === tableId),
    [tables, tableId],
  );

  const bookTable = async () => {
    const size = Number.parseInt(partySize, 10);
    if (!tableId) {
      Alert.alert("Missing table", "Choose a table first.");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      Alert.alert("Invalid date", "Use YYYY-MM-DD.");
      return;
    }
    if (!Number.isInteger(size) || size < 1 || size > 12) {
      Alert.alert("Invalid party size", "Party size must be between 1 and 12.");
      return;
    }
    if (selectedTable && size > selectedTable.capacity) {
      Alert.alert("Too many guests", "That table does not have enough seats.");
      return;
    }
    if (phone && !/^03\d{2}-?\d{7}$/.test(phone)) {
      Alert.alert("Invalid phone", "Use the format 03XX-XXXXXXX.");
      return;
    }

    setSubmitting(true);
    try {
      await apiClient("/reservations", "POST", {
        table: tableId,
        reservationDate: date,
        timeSlot,
        partySize: size,
        phone: phone || undefined,
      });
      Alert.alert("Booked", "Your reservation is pending manager confirmation.");
      refetch();
      refetchTables();
    } catch (err) {
      Alert.alert("Booking failed", err instanceof Error ? err.message : "Try another slot.");
    } finally {
      setSubmitting(false);
    }
  };

  const cancelReservation = async (id: string) => {
    try {
      await apiClient(`/reservations/${id}/cancel`, "PATCH");
      refetch();
    } catch (err) {
      Alert.alert("Cancel failed", err instanceof Error ? err.message : "Could not cancel");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Book a table</Text>
      <TextInput
        value={date}
        onChangeText={setDate}
        placeholder="YYYY-MM-DD"
        style={styles.input}
      />
      <TextInput
        value={partySize}
        onChangeText={setPartySize}
        keyboardType="number-pad"
        placeholder="Party size (1-12)"
        style={styles.input}
      />
      <TextInput
        value={phone}
        onChangeText={setPhone}
        placeholder="03XX-XXXXXXX"
        keyboardType="phone-pad"
        style={styles.input}
      />

      <Text style={styles.label}>Time slot</Text>
      <View style={styles.wrap}>
        {TIME_SLOTS.map((slot) => (
          <TouchableOpacity
            key={slot}
            style={[styles.chip, timeSlot === slot && styles.chipActive]}
            onPress={() => setTimeSlot(slot)}
          >
            <Text style={[styles.chipText, timeSlot === slot && styles.chipTextActive]}>
              {slot}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Table</Text>
      <View style={styles.wrap}>
        {tables.map((table) => (
          <TouchableOpacity
            key={table._id}
            style={[styles.chip, tableId === table._id && styles.chipActive]}
            onPress={() => setTableId(table._id)}
          >
            <Text style={[styles.chipText, tableId === table._id && styles.chipTextActive]}>
              T{table.tableNumber} ({table.capacity})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.button, submitting && { opacity: 0.6 }]}
        disabled={submitting}
        onPress={bookTable}
      >
        <Text style={styles.buttonText}>{submitting ? "Booking..." : "Reserve table"}</Text>
      </TouchableOpacity>

      <Text style={styles.header}>My reservations</Text>
      {error ? (
        <View>
          <Text style={styles.error}>{error}</Text>
          <Button title="Retry" onPress={() => refetch()} />
        </View>
      ) : null}
      {loading && reservations.length === 0 ? <Text>Loading...</Text> : null}
      {reservations.map((reservation) => (
        <View key={reservation._id} style={styles.card}>
          <Text style={styles.status}>{reservation.status}</Text>
          <Text>{tableLabel(reservation.table)}</Text>
          <Text>
            {String(reservation.reservationDate).slice(0, 10)} at {reservation.timeSlot}
          </Text>
          <Text>Party of {reservation.partySize}</Text>
          {reservation.status === "Pending" ? (
            <Button
              title="Cancel"
              color="#E63946"
              onPress={() => cancelReservation(reservation._id)}
            />
          ) : null}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  content: { padding: 16, paddingBottom: 40 },
  header: { fontSize: 20, fontWeight: "800", marginVertical: 12 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  label: { fontWeight: "700", marginBottom: 8 },
  wrap: { flexDirection: "row", flexWrap: "wrap", marginBottom: 12 },
  chip: {
    borderWidth: 1,
    borderColor: "#DEE2E6",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: { backgroundColor: "#E63946", borderColor: "#E63946" },
  chipText: { fontWeight: "600", color: "#495057" },
  chipTextActive: { color: "#fff" },
  button: {
    backgroundColor: "#E63946",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  buttonText: { color: "#fff", fontWeight: "700" },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  status: { fontWeight: "800", color: "#457B9D", marginBottom: 4 },
  error: { color: "red", marginBottom: 8 },
});
