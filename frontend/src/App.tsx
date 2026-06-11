import { BrowserRouter } from 'react-router-dom'
import { SnackbarProvider } from 'notistack'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { SidebarProvider } from './contexts/SidebarContext'
import { AppRoutes } from './routes/AppRoutes'

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ThemeProvider>
        <SnackbarProvider 
          maxSnack={3} 
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          autoHideDuration={3000}
        >
          <AuthProvider>
            <SidebarProvider>
              <AppRoutes />
            </SidebarProvider>
          </AuthProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App