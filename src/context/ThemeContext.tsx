import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Theme {
  background: string;
  text: string;
}

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState<boolean>(false);
  const toggleTheme = () => setIsDark(!isDark);

  const theme: Theme = isDark 
    ? { background: '#333', text: '#fff' } 
    : { background: '#fff', text: '#000' };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};