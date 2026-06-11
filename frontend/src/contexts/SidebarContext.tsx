import { createContext, useState, useContext, ReactNode, useEffect } from 'react'

interface SidebarContextType {
  collapsed: boolean
  toggleSidebar: () => void
  setCollapsed: (collapsed: boolean) => void
  mobileOpen: boolean
  toggleMobile: () => void
  setMobileOpen: (open: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export const useSidebar = () => {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar debe usarse dentro de SidebarProvider')
  }
  return context
}

export const SidebarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsedState] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed')
    if (savedState !== null) {
      setCollapsedState(JSON.parse(savedState))
    }
  }, [])

  const setCollapsed = (value: boolean) => {
    setCollapsedState(value)
    localStorage.setItem('sidebarCollapsed', JSON.stringify(value))
  }

  const toggleSidebar = () => {
    const newState = !collapsed
    setCollapsed(newState)
  }

  const toggleMobile = () => setMobileOpen(!mobileOpen)

  return (
    <SidebarContext.Provider value={{ collapsed, toggleSidebar, setCollapsed, mobileOpen, toggleMobile, setMobileOpen }}>
      {children}
    </SidebarContext.Provider>
  )
}