import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MenuItem } from '../data/menu';

interface MenuItemCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}

const MenuItemCard = React.memo(({ item, onAdd }: MenuItemCardProps) => {
  return (
    <View style={[styles.card, !item.isAvailable && styles.unavailable]}>
      <View style={styles.detailsContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          {item.isSpecial && <Text style={styles.specialBadge}>⭐ Chef's Special</Text>}
        </View>

        <Text style={styles.price}>${item.price.toFixed(2)}</Text>
        
        {item.description && (
          <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        )}
        
        <TouchableOpacity 
          style={[styles.addButton, !item.isAvailable && styles.addButtonDisabled]} 
          disabled={!item.isAvailable} 
          onPress={() => onAdd(item)}
        >
          <Text style={styles.addButtonText}>
            {item.isAvailable ? 'Add to Cart' : 'Sold Out'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20, // Increased padding since there's no image
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 4, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  unavailable: {
    opacity: 0.6,
  },
  detailsContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1D20', // Darker, crisper text
    flex: 1,
  },
  specialBadge: {
    fontSize: 11,
    color: '#E63946', // Coral Red
    fontWeight: 'bold',
    backgroundColor: '#FFE5E7', // Light Coral background
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    marginLeft: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#457B9D', // Elegant Teal/Blue
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: '#6C757D',
    marginBottom: 12,
    lineHeight: 18,
  },
  addButton: {
    backgroundColor: '#E63946', // Modern Coral/Red
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25, // Pill shape
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  addButtonDisabled: {
    backgroundColor: '#E9ECEF',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default MenuItemCard;