export interface User {
  _id: string;
  name: string;
  email: string;
  role: "customer" | "manager";
}

export interface MenuItem {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  isAvailable: boolean;
  isSpecial?: boolean;
  imageUrl?: string;
}

export interface Table {
  _id: string;
  tableNumber: number;
  capacity: number;
  location?: string;
}

export interface OrderItem {
  menuItem: MenuItem | string;
  quantity: number;
  price: number;
  note?: string;
}

export interface Order {
  _id: string;
  user: User | string;
  items: OrderItem[];
  totalAmount: number;
  status: "Pending" | "Preparing" | "Ready" | "Served" | "Cancelled";
  type: "Dine-in" | "Takeaway";
  createdAt?: string;
  updatedAt?: string;
}

export interface Reservation {
  _id: string;
  user: User | string;
  table: Table | string;
  reservationDate: string;
  timeSlot: string;
  partySize: number;
  phone?: string;
  status: "Pending" | "Confirmed" | "Declined" | "Cancelled";
  createdAt?: string;
}
