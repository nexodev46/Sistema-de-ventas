import { clienteService } from './clienteService'
import { productoService } from './productoService'
import { ventaService } from './ventaService'
import { devolucionService } from './devolucionService'

export type SearchResultType = 'producto' | 'cliente' | 'venta' | 'devolucion'

export interface SearchResult {
  id: string
  type: SearchResultType
  title: string
  subtitle: string
  path: string
  extra?: string
}

const normalize = (value: string | undefined) => (value ?? '').toLowerCase()
const matches = (value: string | undefined, term: string) => normalize(value).includes(term)

export const searchService = {
  searchAll: async (termino: string): Promise<SearchResult[]> => {
    const term = termino.trim().toLowerCase()
    if (!term) return []

    const [productos, clientes, ventas, devoluciones] = await Promise.all([
      productoService.getAll(),
      clienteService.getAll(),
      ventaService.getAll(),
      devolucionService.getAll(),
    ])

    const results: SearchResult[] = []

    results.push(
      ...productos
        .filter((producto) =>
          matches(producto.nombre, term) ||
          matches(producto.codigo, term) ||
          matches(producto.descripcion, term) ||
          matches(producto.categoria, term) ||
          matches(producto.marca, term)
        )
        .map((producto) => ({
          id: producto.id,
          type: 'producto' as const,
          title: producto.nombre,
          subtitle: `Código: ${producto.codigo}`,
          extra: `Marca: ${producto.marca} · Categoría: ${producto.categoria}`,
          path: '/productos',
        }))
    )

    results.push(
      ...clientes
        .filter((cliente) =>
          matches(cliente.nombre, term) ||
          matches(cliente.email, term) ||
          matches(cliente.documento, term) ||
          matches(cliente.telefono, term)
        )
        .map((cliente) => ({
          id: cliente.id,
          type: 'cliente' as const,
          title: cliente.nombre,
          subtitle: `Email: ${cliente.email}`,
          extra: `Documento: ${cliente.documento} · Teléfono: ${cliente.telefono}`,
          path: '/clientes',
        }))
    )

    results.push(
      ...ventas
        .filter((venta) =>
          matches(venta.numero, term) ||
          matches(venta.cliente?.nombre, term) ||
          matches(venta.cliente?.documento, term) ||
          matches(venta.vendedor?.nombre, term) ||
          venta.productos.some((item) => matches(item.nombre, term) || matches(item.codigo, term))
        )
        .map((venta) => ({
          id: venta.id,
          type: 'venta' as const,
          title: `Venta ${venta.numero}`,
          subtitle: `Cliente: ${venta.cliente.nombre}`,
          extra: `Total: S/ ${venta.total.toFixed(2)}`,
          path: `/ventas/${venta.id}`,
        }))
    )

    results.push(
      ...devoluciones
        .filter((devolucion) =>
          matches(devolucion.numero, term) ||
          matches(devolucion.cliente?.nombre, term) ||
          matches(devolucion.ventaOriginal?.numero, term) ||
          matches(devolucion.motivoGeneral, term) ||
          devolucion.productos.some((item) => matches(item.nombre, term) || matches(item.codigo, term))
        )
        .map((devolucion) => ({
          id: devolucion.id,
          type: 'devolucion' as const,
          title: `Devolución ${devolucion.numero}`,
          subtitle: `Cliente: ${devolucion.cliente.nombre}`,
          extra: `Estado: ${devolucion.estado}`,
          path: '/devoluciones',
        }))
    )

    return results
  },
}
