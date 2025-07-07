// src/contexts/ThemeContext.ts
import React, { createContext, useState, useMemo, useContext, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material';
import type { PaletteMode } from '@mui/material';
import type { ReactNode } from 'react';
import CssBaseline from '@mui/material/CssBaseline';

// Define the shape of the context value
interface ThemeContextType {
  mode: PaletteMode;
  toggleColorMode: () => void;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
}

// Create the context with a default undefined value
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const prefersDarkMode = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const [mode, setMode] = useState<PaletteMode>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('themeMode');
      return (savedMode === 'light' || savedMode === 'dark') ? savedMode : (prefersDarkMode ? 'dark' : 'light');
    }
    return 'light';
  });

  const toggleColorMode = () => {
    setMode((prevMode) => {
      const newMode: PaletteMode = prevMode === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') {
        localStorage.setItem('themeMode', newMode);
      }
      return newMode;
    });
  };

  // Define color palettes for light and dark themes
  const colors = useMemo(() => {
    if (mode === 'light') {
      return {
        primary: '#6366f1',      // Indigo - สีหลัก
        secondary: '#3b82f6',    // Blue - สีรอง
        accent: '#8b5cf6',       // Purple - สีเสริม
        background: '#f3f4f6',   // Gray-100 - พื้นหลัง
        surface: '#ffffff',      // White - พื้นผิว
        text: '#374151',         // Gray-700 - ข้อความ
      };
    } else {
      return {
        primary: '#818cf8',      // Indigo-400 - สีหลัก
        secondary: '#60a5fa',    // Blue-400 - สีรอง
        accent: '#a78bfa',       // Purple-400 - สีเสริม
        background: '#111827',   // Gray-900 - พื้นหลัง
        surface: '#1f2937',      // Gray-800 - พื้นผิว
        text: '#f9fafb',         // Gray-50 - ข้อความ
      };
    }
  }, [mode]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: colors.primary,
            light: mode === 'light' ? '#a5b4fc' : '#c7d2fe',
            dark: mode === 'light' ? '#4338ca' : '#6366f1',
          },
          secondary: {
            main: colors.secondary,
            light: mode === 'light' ? '#93c5fd' : '#dbeafe',
            dark: mode === 'light' ? '#1d4ed8' : '#3b82f6',
          },
          background: {
            default: colors.background,
            paper: colors.surface,
          },
          text: {
            primary: colors.text,
            secondary: mode === 'light' ? '#6b7280' : '#9ca3af',
          },
          divider: mode === 'light' ? '#e5e7eb' : '#374151',
          action: {
            active: mode === 'light' ? '#6b7280' : '#9ca3af',
            hover: mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)',
            selected: mode === 'light' ? 'rgba(99, 102, 241, 0.08)' : 'rgba(129, 140, 248, 0.16)',
          },
        },
        components: {
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundColor: colors.surface,
                color: colors.text,
                boxShadow: mode === 'light' ? '0 1px 3px rgba(0, 0, 0, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.3)',
              },
            },
          },
          MuiBreadcrumbs: {
            styleOverrides: {
              root: {
                color: mode === 'light' ? 'rgba(55, 65, 81, 0.7)' : 'rgba(249, 250, 251, 0.7)',
              },
            },
          },
          MuiLink: {
            styleOverrides: {
              root: {
                color: mode === 'light' ? 'rgba(55, 65, 81, 0.7)' : 'rgba(249, 250, 251, 0.7)',
                '&.MuiTypography-colorPrimary': {
                  color: colors.text,
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                boxShadow: mode === 'light' 
                  ? '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
                  : '0 4px 6px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.4)',
                borderRadius: '12px',
              },
            },
          },
        },
        typography: {
          fontFamily: [
            'Inter',
            'system-ui',
            '-apple-system',
            'BlinkMacSystemFont',
            'Segoe UI',
            'sans-serif',
          ].join(','),
        },
      }),
    [mode, colors],
  );

  // Update CSS custom properties for use in non-MUI components
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--theme-primary', colors.primary);
      root.style.setProperty('--theme-secondary', colors.secondary);
      root.style.setProperty('--theme-accent', colors.accent);
      root.style.setProperty('--theme-background', colors.background);
      root.style.setProperty('--theme-surface', colors.surface);
      root.style.setProperty('--theme-text', colors.text);
    }
  }, [colors]);

  return (
    <ThemeContext.Provider value={{ mode, toggleColorMode, colors }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline /> 
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};