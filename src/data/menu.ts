export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  isAvailable: boolean;
  isSpecial: boolean;
  description?: string;
  image?: string;
}

export const menuData: MenuItem[] = [
  {
    id: 1,
    name: "Garlic Bread",
    price: 5.99,
    category: "Starters",
    isAvailable: true,
    isSpecial: false,
  },
  {
    id: 2,
    name: "Steak",
    price: 25.99,
    category: "Mains",
    isAvailable: true,
    isSpecial: true,
  },
  {
    id: 3,
    name: "Cheesecake",
    price: 7.99,
    category: "Desserts",
    isAvailable: false,
    isSpecial: false,
  },
  // Add 12 more items here later to meet your assignment requirement
];
