import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

interface ThemeContextType {
  darkMode: boolean
  toggleDarkMode: () => void
  setDarkMode: (value: boolean) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useThemeMode = () => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useThemeMode must be used within ThemeProvider')
  return context
}

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [darkMode, setDarkModeState] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved === 'true'
  })

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString())
  }, [darkMode])

  const toggleDarkMode = () => setDarkModeState(prev => !prev)
  const setDarkMode = (value: boolean) => setDarkModeState(value)

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#10b981',
        light: '#34d399',
        dark: '#059669',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#22c55e',
        light: '#4ade80',
        dark: '#16a34a',
        contrastText: '#ffffff',
      },
      success: { main: '#10b981' },
      warning: { main: '#f59e0b' },
      error: { main: '#ef4444' },
      info: { main: '#38bdf8' },
      background: {
        default: darkMode ? '#0b1120' : '#f3f4f6',
        paper: darkMode ? '#111827' : '#ffffff',
      },
      text: {
        primary: darkMode ? '#e5e7eb' : '#111827',
        secondary: darkMode ? '#9ca3af' : '#6b7280',
      },
    },
    components: {
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: darkMode ? '#9ca3af' : '#6b7280',
            '&:hover': {
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
        },
      },
    },
  })

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, setDarkMode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  )
}