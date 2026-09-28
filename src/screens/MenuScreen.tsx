import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { menuData, MenuItem } from '../data/menu';
import { useDebounce } from '../hooks/useDebounce';
import MenuItemCard from '../components/MenuItemCard';
import { useCart } from '../context/CartContext';

export default function MenuScreen({ navigation }: { navigation: any }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debouncedSearch = useDebounce(searchTerm, 400);
  const searchInputRef = useRef<TextInput>(null);
  
  const { dispatch } = useCart();

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) {
        setMenuItems(menuData);
        setIsLoading(false);
      }
    }, 1500);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  const filteredItems = useMemo(() => {
    if (!debouncedSearch) return menuItems;
    return menuItems.filter(item => item.name.toLowerCase().includes(debouncedSearch.toLowerCase()));
  }, [debouncedSearch, menuItems]);

  useEffect(() => {
    navigation.setOptions({ title: `Menu (${filteredItems.length} items)` });
  }, [filteredItems, navigation]);

  const onAddToCart = useCallback((item: MenuItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  }, [dispatch]);

  if (isLoading) return <ActivityIndicator size="large" />;

  return (
    <View>
      <TextInput 
        ref={searchInputRef}
        placeholder="Search menu..." 
        value={searchTerm} 
        onChangeText={setSearchTerm} 
        style={{ borderWidth: 1, padding: 10, margin: 10 }}
      />
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <MenuItemCard item={item} onAdd={onAddToCart} />}
      />
    </View>
  );
}