import { ReactNode } from 'react'
import { Box, useMediaQuery, useTheme } from '@mui/material'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useSidebar } from '../../contexts/SidebarContext'

export const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { collapsed, mobileOpen, setMobileOpen } = useSidebar()
  const sidebarWidth = collapsed ? 80 : 260

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {!isMobile && (
        <Box component="nav" sx={{ width: sidebarWidth, flexShrink: 0, transition: theme.transitions.create('width'), position: 'sticky', top: 0, height: '100vh' }}>
          <Sidebar />
        </Box>
      )}
      {isMobile && <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />}
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', width: { xs: '100%', md: `calc(100% - ${sidebarWidth}px)` }, bgcolor: 'background.default', height: '100vh', overflow: 'hidden' }}>
        <Header />
        <Box component="div" sx={{ p: { xs: 2, sm: 3 }, flexGrow: 1, overflowY: 'auto' }}>{children}</Box>
      </Box>
    </Box>
  )
}