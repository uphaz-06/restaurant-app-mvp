# Restaurant App MVP (Frontend Only)

This is a React Native (Expo) Minimum Viable Product built for Assignment 1 (Fall 2026). It demonstrates a complete frontend flow for a restaurant application without relying on a backend, external API, or third-party state management libraries like Redux.

## Installation & Setup

1. **Node Version:** Ensure you are running Node.js (v18 or higher recommended).
2. **Install Dependencies:**
   Navigate to the project root and run:
   `npm install`
3. **Start the App with Expo:**
   Start the local development server:
   `npx expo start -c`
   _(Note: If encountering local network issues, run `npx expo start --tunnel` to bypass local firewalls)._
4. **Run on Emulator/Device:**
   - Scan the generated QR code using the **Expo Go** app on a physical Android/iOS device.
   - Alternatively, press `a` in the terminal to open an Android emulator.

## Mock Login Credentials

Authenticate using the following hardcoded mock data to test role-based routing:

- **Customer Role:**
  - Email: `customer@test.com`
  - Password: `password1`
- **Manager Role:**
  - Email: `manager@test.com`
  - Password: `password1`

## Hooks Usage Table

| Screen / Component | Hooks Used                                                                            | Purpose                                                                                                                                                         |
| :----------------- | :------------------------------------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **LoginScreen**    | `useState`, `useForm`, `useAuth`                                                      | Manage local form state, handle validation logic via a custom hook, and access global authentication context to log the user in.                                |
| **MenuScreen**     | `useState`, `useEffect`, `useRef`, `useMemo`, `useCallback`, `useDebounce`, `useCart` | Fetch mock data on mount, track search input, debounce queries, filter items without re-rendering, and pass stable cart dispatch functions to child components. |
| **MenuItemCard**   | `React.memo`                                                                          | Wrap the UI component to prevent unnecessary re-renders of list items when the parent state changes.                                                            |
| **CartContext**    | `useReducer`, `useContext`                                                            | Manage complex global cart state transitions (add, remove, decrement, promo codes) and expose them globally.                                                    |
| **ProfileScreen**  | `useAuth`, `useTheme`                                                                 | Access current user data for display and trigger the global theme toggle.                                                                                       |

_(Note: Additional hooks for Reservation and Dashboard screens will be added here as those features are fully implemented)._

## Cart Reducer Test Cases

The `cartReducer` handles complex state transitions for the user's shopping cart. Below are six test cases validating its logic:

| Action Dispatched           | Initial State                              | Expected Next State                                        |
| :-------------------------- | :----------------------------------------- | :--------------------------------------------------------- |
| `ADD_ITEM` (Burger)         | `items: []`                                | `items: [{id: 1, name: "Burger", quantity: 1, note: ""}]`  |
| `ADD_ITEM` (Burger)         | `items: [{id: 1, quantity: 1}]`            | `items: [{id: 1, quantity: 2}]` (Increments existing item) |
| `DECREMENT` (Burger)        | `items: [{id: 1, quantity: 1}]`            | `items: []` (Removes item when quantity reaches zero)      |
| `UPDATE_NOTE`               | `items: [{id: 1, note: ""}]`               | `items: [{id: 1, note: "No onions"}]`                      |
| `APPLY_PROMO` ("WELCOME10") | `promoCode: null, discountPercent: 0`      | `promoCode: "WELCOME10", discountPercent: 10`              |
| `CLEAR_CART`                | `items: [{id: 1}], promoCode: "WELCOME10"` | `items: [], promoCode: null, discountPercent: 0`           |

## Context vs Prop Drilling

Context is used in this application to manage global state such as user authentication and theme preferences. Passing this data via prop drilling would require threading it through multiple intermediate components that do not actually need the data, resulting in cluttered and hard-to-maintain code. By using the Context API, any screen can directly access the user or theme data it needs. However, one significant drawback of context is that all consuming components will automatically re-render whenever the context provider's value changes, which can impact performance if updates are too frequent.

## useReducer vs useState (Cart Management)

For the cart management, `useReducer` is utilized instead of `useState` because the state is complex (managing arrays of items, promo codes, and discount percentages) and next states heavily depend on previous states (like incrementing item quantities). Using `useState` would result in scattered, hard-to-track update logic across components. `useState` would have been perfectly sufficient if the cart only tracked a single independent primitive value, such as a simple item counter.

## Demo Video & Screenshots

- **Demo Video Link:** [INSERT YOUR YOUTUBE/DRIVE LINK HERE]
- **Screenshots:** _(Include your screenshots in the repository and link them here prior to final submission)._
