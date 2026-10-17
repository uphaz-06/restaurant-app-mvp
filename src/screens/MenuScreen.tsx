import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Button,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MenuItemCard from "../components/MenuItemCard";
import { useCart } from "../context/CartContext";
import { useApi } from "../hooks/useApi";
import { useDebounce } from "../hooks/useDebounce";
import { MenuItem } from "../types";

const CATEGORIES = ["All", "Starters", "Mains", "Sides", "Desserts", "Drinks"];

export default function MenuScreen({ navigation }: { navigation: any }) {
  const [category, setCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const debouncedSearch = useDebounce(searchTerm, 400);
  const searchInputRef = useRef<TextInput>(null);
  const { dispatch } = useCart();

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (category !== "All") params.set("category", category);
    if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
    const qs = params.toString();
    return qs ? `/menu?${qs}` : "/menu";
  }, [category, debouncedSearch]);

  const { data: menuItems, loading, error, refetch } = useApi(query);

  const itemsArray = (menuItems as MenuItem[] | null) ?? [];

  useEffect(() => {
    if (debouncedSearch.trim()) {
      setRecentSearches((prev) => {
        const next = [
          debouncedSearch.trim(),
          ...prev.filter((term) => term !== debouncedSearch.trim()),
        ];
        return next.slice(0, 5);
      });
    }
  }, [debouncedSearch]);

  useEffect(() => {
    navigation.setOptions({ title: `Menu (${itemsArray.length} items)` });
  }, [itemsArray.length, navigation]);

  const onAddToCart = useCallback(
    (item: MenuItem) => {
      dispatch({ type: "ADD_ITEM", payload: item });
    },
    [dispatch],
  );

  if (loading && !menuItems) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E63946" />
      </View>
    );
  }

  if (error && !menuItems) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Retry" onPress={() => refetch()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        ref={searchInputRef}
        placeholder="Search menu..."
        value={searchTerm}
        onChangeText={setSearchTerm}
        style={styles.searchInput}
      />
      {recentSearches.length > 0 ? (
        <View style={styles.recentRow}>
          {recentSearches.map((term) => (
            <TouchableOpacity
              key={term}
              style={styles.recentChip}
              onPress={() => setSearchTerm(term)}
            >
              <Text style={styles.recentText}>{term}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
      <View style={styles.categoryRow}>
        {CATEGORIES.map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.chip, category === item && styles.chipActive]}
            onPress={() => setCategory(item)}
          >
            <Text style={[styles.chipText, category === item && styles.chipTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={itemsArray}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <MenuItemCard item={item} onAdd={onAddToCart} />}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => refetch()} />
        }
        ListEmptyComponent={<Text style={styles.empty}>No menu items found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: { color: "red", marginBottom: 10, textAlign: "center" },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    margin: 10,
    borderRadius: 5,
  },
  recentRow: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 10 },
  recentChip: {
    backgroundColor: "#F1F3F5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  recentText: { color: "#495057", fontSize: 12 },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 10,
    marginBottom: 4,
  },
  chip: {
    borderWidth: 1,
    borderColor: "#DEE2E6",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: { backgroundColor: "#E63946", borderColor: "#E63946" },
  chipText: { color: "#495057", fontWeight: "600" },
  chipTextActive: { color: "#fff" },
  empty: { textAlign: "center", marginTop: 24, color: "#6C757D" },
});
