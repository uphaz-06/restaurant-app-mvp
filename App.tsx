import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { CartProvider } from './src/context/CartContext';

// --- DIAGNOSTIC LOGS ---
console.log("--- DEBUGGING IMPORTS ---");
console.log("ThemeProvider:", ThemeProvider ? "OK ✅" : "UNDEFINED ❌");
console.log("AuthProvider:", AuthProvider ? "OK ✅" : "UNDEFINED ❌");
console.log("CartProvider:", CartProvider ? "OK ✅" : "UNDEFINED ❌");
console.log("AppNavigator:", AppNavigator ? "OK ✅" : "UNDEFINED ❌");
console.log("NavigationContainer:", NavigationContainer ? "OK ✅" : "UNDEFINED ❌");
// -----------------------

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}