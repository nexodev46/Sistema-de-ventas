import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  limit,
} from 'firebase/firestore'
import { db } from './firebase'

export type NotificationType =
  | 'VENTA'
  | 'STOCK_BAJO'
  | 'CLIENTE_NUEVO'
  | 'DEVOLUCION'
  | 'PRODUCTO_AGOTADO'

export interface Notificacion {
  id: string
  tipo: NotificationType
  titulo: string
  mensaje: string
  fecha: string
  leida: boolean
  link?: string
}

const STORAGE_KEY = 'kaita_notificaciones'

export const loadNotifications = (): Notificacion[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored) as Notificacion[]
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch (error) {
    console.error('Error cargando notificaciones:', error)
    return []
  }
}

export const saveNotifications = (notifications: Notificacion[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
  } catch (error) {
    console.error('Error guardando notificaciones:', error)
  }
}

const generateId = (prefix: string, docId: string) => `${prefix}_${docId}_${Date.now()}`

export const listenNotificationEvents = (
  onNewNotification: (notification: Notificacion) => void
) => {
  let initialVentas = true
  let initialClientes = true
  let initialProductos = true
  let initialDevoluciones = true

  const unsubscribeVentas = onSnapshot(
    query(collection(db, 'ventas'), orderBy('fecha', 'desc'), limit(1)),
    (snapshot) => {
      if (initialVentas) {
        initialVentas = false
        return
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const venta = change.doc.data() as any
          onNewNotification({
            id: generateId('VENTA', change.doc.id),
            tipo: 'VENTA',
            titulo: 'Nueva venta',
            mensaje: `Venta ${venta.numero ?? change.doc.id} por S/ ${Number(venta.total ?? 0).toFixed(2)}`,
            fecha: new Date().toISOString(),
            leida: false,
            link: `/ventas/${change.doc.id}`,
          })
        }
      })
    }
  )

  const unsubscribeClientes = onSnapshot(
    query(collection(db, 'clientes'), orderBy('fechaRegistro', 'desc'), limit(1)),
    (snapshot) => {
      if (initialClientes) {
        initialClientes = false
        return
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const cliente = change.doc.data() as any
          onNewNotification({
            id: generateId('CLIENTE_NUEVO', change.doc.id),
            tipo: 'CLIENTE_NUEVO',
            titulo: 'Nuevo cliente',
            mensaje: `${cliente.nombre ?? 'Cliente nuevo'} se ha registrado`,
            fecha: new Date().toISOString(),
            leida: false,
            link: '/clientes',
          })
        }
      })
    }
  )

  const unsubscribeProductos = onSnapshot(collection(db, 'productos'), (snapshot) => {
    if (initialProductos) {
      initialProductos = false
      return
    }

    snapshot.docChanges().forEach((change) => {
      if (change.type === 'modified') {
        const producto = change.doc.data() as any
        const stockActual = Number(producto.stockActual ?? 0)
        const stockMinimo = Number(producto.stockMinimo ?? 0)

        if (stockActual === 0) {
          onNewNotification({
            id: generateId('PRODUCTO_AGOTADO', change.doc.id),
            tipo: 'PRODUCTO_AGOTADO',
            titulo: 'Producto agotado',
            mensaje: `${producto.nombre ?? 'Producto'} se ha agotado`,
            fecha: new Date().toISOString(),
            leida: false,
            link: '/productos',
          })
        } else if (stockActual <= stockMinimo) {
          onNewNotification({
            id: generateId('STOCK_BAJO', change.doc.id),
            tipo: 'STOCK_BAJO',
            titulo: 'Stock bajo',
            mensaje: `${producto.nombre ?? 'Producto'} tiene solo ${stockActual} unidades`,
            fecha: new Date().toISOString(),
            leida: false,
            link: '/productos',
          })
        }
      }
    })
  })

  const unsubscribeDevoluciones = onSnapshot(
    query(collection(db, 'devoluciones'), where('estado', '==', 'PENDIENTE')),
    (snapshot) => {
      if (initialDevoluciones) {
        initialDevoluciones = false
        return
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const devolucion = change.doc.data() as any
          onNewNotification({
            id: generateId('DEVOLUCION', change.doc.id),
            tipo: 'DEVOLUCION',
            titulo: 'Devolución pendiente',
            mensaje: `Devolución ${devolucion.numero ?? change.doc.id} requiere aprobación`,
            fecha: new Date().toISOString(),
            leida: false,
            link: '/devoluciones',
          })
        }
      })
    }
  )

  return () => {
    unsubscribeVentas()
    unsubscribeClientes()
    unsubscribeProductos()
    unsubscribeDevoluciones()
  }
}
