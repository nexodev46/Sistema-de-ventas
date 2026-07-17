import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react'
import { ThemeProvider as MuiThemeProvider, createTheme, darken, lighten } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

interface ThemeContextType {
  darkMode: boolean
  toggleDarkMode: () => void
  setDarkMode: (value: boolean) => void
  primaryColor: string
  setPrimaryColor: (color: string) => void
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

  const [primaryColor, setPrimaryColorState] = useState(() => {
    // Intentar leer de localStorage primero (guardado por Apariencia.tsx)
    const saved = localStorage.getItem('primaryColor')
    // Si no está en localStorage, intentar leer la CSS variable que se setea dinámicamente
    if (saved) return saved
    // Default color - Cyan/Turquoise
    return '#06b6d4'
  })

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString())
  }, [darkMode])

  useEffect(() => {
    localStorage.setItem('primaryColor', primaryColor)
  }, [primaryColor])

  const toggleDarkMode = () => setDarkModeState(prev => !prev)
  const setDarkMode = (value: boolean) => setDarkModeState(value)
  const setPrimaryColor = (color: string) => setPrimaryColorState(color)

  const theme = useMemo(() => {
    const primaryLight = lighten(primaryColor, 0.16)
    const primaryDark = darken(primaryColor, 0.16)

    return createTheme({
      palette: {
        mode: darkMode ? 'dark' : 'light',
        primary: {
          main: primaryColor,
          light: primaryLight,
          dark: primaryDark,
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
          default: darkMode ? '#081123' : '#f3f4f6',
          paper: darkMode ? '#0f172a' : '#ffffff',
        },
        text: {
          primary: darkMode ? '#e2e8f0' : '#111827',
          secondary: darkMode ? '#94a3b8' : '#6b7280',
        },
        divider: darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.08)',
        action: {
          hover: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
        },
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: (themeParam) => ({
            body: {
              backgroundColor: themeParam.palette.background.default,
              color: themeParam.palette.text.primary,
              transition: 'background-color 0.25s ease, color 0.25s ease',
            },
          }),
        },
        MuiAppBar: {
          styleOverrides: {
            root: ({ theme: appBarTheme }) => ({
              backgroundColor: appBarTheme.palette.background.paper,
              color: appBarTheme.palette.text.primary,
              borderBottom: `1px solid ${appBarTheme.palette.divider}`,
            }),
          },
        },
        MuiDrawer: {
          styleOverrides: {
            paper: ({ theme: drawerTheme }) => ({
              backgroundColor: drawerTheme.palette.background.paper,
              color: drawerTheme.palette.text.primary,
            }),
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: ({ theme: paperTheme }) => ({
              backgroundColor: paperTheme.palette.background.paper,
              color: paperTheme.palette.text.primary,
            }),
          },
        },
        MuiCard: {
          styleOverrides: {
            root: ({ theme: cardTheme }) => ({
              backgroundColor: cardTheme.palette.background.paper,
              color: cardTheme.palette.text.primary,
            }),
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              borderRadius: 10,
            },
            containedPrimary: ({ theme: buttonTheme }) => ({
              backgroundColor: buttonTheme.palette.mode === 'dark'
                ? darken(buttonTheme.palette.primary.main, 0.22)
                : buttonTheme.palette.primary.main,
              color: buttonTheme.palette.primary.contrastText,
              '&:hover': {
                backgroundColor: buttonTheme.palette.mode === 'dark'
                  ? darken(buttonTheme.palette.primary.main, 0.32)
                  : buttonTheme.palette.primary.dark,
              },
            }),
            containedSecondary: ({ theme: buttonTheme }) => ({
              backgroundColor: buttonTheme.palette.mode === 'dark'
                ? darken(buttonTheme.palette.secondary.main, 0.22)
                : buttonTheme.palette.secondary.main,
              color: buttonTheme.palette.secondary.contrastText,
              '&:hover': {
                backgroundColor: buttonTheme.palette.mode === 'dark'
                  ? darken(buttonTheme.palette.secondary.main, 0.32)
                  : buttonTheme.palette.secondary.dark,
              },
            }),
            outlinedPrimary: ({ theme: buttonTheme }) => ({
              borderColor: buttonTheme.palette.mode === 'dark'
                ? buttonTheme.palette.divider
                : buttonTheme.palette.primary.main,
              color: buttonTheme.palette.text.primary,
            }),
          },
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: ({ theme: inputTheme }) => ({
              backgroundColor: inputTheme.palette.background.paper,
              color: inputTheme.palette.text.primary,
            }),
          },
        },
        MuiInputBase: {
          styleOverrides: {
            root: ({ theme: inputBaseTheme }) => ({
              color: inputBaseTheme.palette.text.primary,
            }),
          },
        },
      },
    })
  }, [darkMode, primaryColor])

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, setDarkMode, primaryColor, setPrimaryColor }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  )
}