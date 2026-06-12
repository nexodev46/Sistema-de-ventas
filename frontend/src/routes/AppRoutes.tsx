import { Routes, Route, Navigate } from 'react-router-dom'
import { PrivateRoute } from './PrivateRoute'
import { Login } from '../pages/Login/Login'
import { Register } from '../pages/Register/Register'
import { AdminSetup } from '../pages/AdminSetup/AdminSetup'
import { Dashboard } from '../pages/Dashboard/Dashboard'
import { ListadoProductos } from '../pages/Inventario/Productos/ListadoProductos'
import { FormularioProducto } from '../pages/Inventario/Productos/FormularioProducto'
import { ListadoClientes } from '../pages/Clientes/ListadoClientes'
import { FormularioCliente } from '../pages/Clientes/FormularioCliente'
import { Configuracion } from '../pages/Configuracion/Configuracion'
import { Usuarios } from '../pages/Configuracion/Usuarios'
import { Empresa } from '../pages/Configuracion/Empresa'
import { MiPerfil } from '../pages/Configuracion/MiPerfil'
import { Seguridad } from '../pages/Configuracion/Seguridad'
import { Apariencia } from '../pages/Configuracion/Apariencia'
import { Notificaciones } from '../pages/Configuracion/Notificaciones'
import { Facturacion } from '../pages/Configuracion/Facturacion'
import { Almacenamiento } from '../pages/Configuracion/Almacenamiento'
import { InventarioGeneral } from '../pages/Inventario/Inventario/InventarioGeneral'
import { Entradas } from '../pages/Inventario/Entradas/Entradas'
import { Salidas } from '../pages/Inventario/Salidas/Salidas'
import { MovimientosInventario } from '../pages/Inventario/Movimientos/MovimientosInventario'
import { AjustesInventario } from '../pages/Inventario/Ajustes/AjustesInventario'
import { ListadoCategorias } from '../pages/Inventario/Categorias/ListadoCategorias'
import { ListadoMarcas } from '../pages/Inventario/Marcas/ListadoMarcas'
import { ListadoDevoluciones } from '../pages/Devoluciones/ListadoDevoluciones'
import { NuevaDevolucion } from '../pages/Devoluciones/NuevaDevolucion'
import { ReporteVentas } from '../pages/Reportes/ReporteVentas'
import { ReporteInventario } from '../pages/Reportes/ReporteInventario'
import { ReporteClientes } from '../pages/Reportes/ReporteClientes'
import { PuntoVenta } from '../pages/PuntoVenta/PuntoVenta'
import { ListadoVentas } from '../pages/Ventas/ListadoVentas'
import { DetalleVenta } from '../pages/Ventas/DetalleVenta'
import { Buscar } from '../pages/Buscar/Buscar'

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin-setup" element={<AdminSetup />} />
      
      {/* Rutas protegidas */}
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/buscar" element={<Buscar />} />
        
        {/* Productos */}
        <Route path="/productos" element={<ListadoProductos />} />
        <Route path="/categorias" element={<ListadoCategorias />} />
        <Route path="/marcas" element={<ListadoMarcas />} />
        <Route path="/inventario" element={<InventarioGeneral />} />
        <Route path="/productos/nuevo" element={<FormularioProducto />} />
        <Route path="/productos/editar/:id" element={<FormularioProducto />} />
        <Route path="/clientes" element={<ListadoClientes />} />
        <Route path="/clientes/nuevo" element={<FormularioCliente />} />
        <Route path="/clientes/editar/:id" element={<FormularioCliente />} />
        <Route path="/ventas" element={<ListadoVentas />} />
        <Route path="/ventas/:id" element={<DetalleVenta />} />
        <Route path="/devoluciones" element={<ListadoDevoluciones />} />
        <Route path="/devoluciones/nueva" element={<NuevaDevolucion />} />
        <Route path="/reportes/ventas" element={<ReporteVentas />} />
        <Route path="/reportes/inventario" element={<ReporteInventario />} />
        <Route path="/reportes/clientes" element={<ReporteClientes />} />
        <Route path="/entradas" element={<Entradas />} />
        <Route path="/salidas" element={<Salidas />} />
        <Route path="/movimientos" element={<MovimientosInventario />} />
        <Route path="/punto-venta" element={<PuntoVenta />} />
        <Route path="/ajustes-inventario" element={<AjustesInventario />} />
        
        {/* Configuración */}
        <Route path="/configuracion" element={<Configuracion />} />
        <Route path="/configuracion/usuarios" element={<Usuarios />} />
        <Route path="/configuracion/empresa" element={<Empresa />} />
        <Route path="/configuracion/perfil" element={<MiPerfil />} />
        <Route path="/configuracion/seguridad" element={<Seguridad />} />
        <Route path="/configuracion/apariencia" element={<Apariencia />} />
        <Route path="/configuracion/notificaciones" element={<Notificaciones />} />
        <Route path="/configuracion/facturacion" element={<Facturacion />} />
        <Route path="/configuracion/almacenamiento" element={<Almacenamiento />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}