import { MenuItem } from "../data/menu";

export interface CartItem extends MenuItem {
  quantity: number;
  note: string;
}

export interface CartState {
  items: CartItem[];
  promoCode: string | null;
  discountPercent: number;
}

export type CartAction =
  | { type: "ADD_ITEM"; payload: MenuItem }
  | { type: "DECREMENT"; payload: { id: number } }
  | { type: "UPDATE_NOTE"; payload: { id: number; note: string } }
  | { type: "APPLY_PROMO"; payload: string }
  | { type: "CLEAR_CART" };

export const initialCartState: CartState = {
  items: [],
  promoCode: null,
  discountPercent: 0,
};

export const cartReducer = (
  state: CartState,
  action: CartAction,
): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find((i) => i.id === action.payload.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === action.payload.id ? { ...i, quantity: i.quantity + 1 } : i,
          ),
        };
      }
      return {
        ...state,
        items: [
          ...state.items,
          { ...action.payload, quantity: 1, note: "" } as CartItem,
        ],
      };
    }
    case "DECREMENT": {
      const existing = state.items.find((i) => i.id === action.payload.id);
      if (existing && existing.quantity === 1) {
        return {
          ...state,
          items: state.items.filter((i) => i.id !== action.payload.id),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.payload.id ? { ...i, quantity: i.quantity - 1 } : i,
        ),
      };
    }
    case "UPDATE_NOTE":
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.payload.id ? { ...i, note: action.payload.note } : i,
        ),
      };
    case "APPLY_PROMO":
      if (action.payload === "WELCOME10")
        return { ...state, promoCode: action.payload, discountPercent: 10 };
      if (action.payload === "FEAST20")
        return { ...state, promoCode: action.payload, discountPercent: 20 };
      return state;
    case "CLEAR_CART":
      return initialCartState;
    default:
      return state;
  }
};
