import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0f766e',
      light: '#3fc5b7',
      dark: '#0b5e55',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#b7892a',
      light: '#d6a84a',
      dark: '#8f6a20',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444',
    },
    warning: {
      main: '#f59e0b',
    },
    info: {
      main: '#3b82f6',
    },
    success: {
      main: '#10b981',
    },
    background: {
      default: '#f3f4f6',
      paper: '#ffffff',
    },
    text: {
      primary: '#111827',
      secondary: '#6b7280',
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
    h4: {
      fontSize: '2rem',
      fontWeight: 700,
      letterSpacing: '-0.02em'
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 700,
      letterSpacing: '-0.01em'
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        },
      },
    },
  },
})