# 🎯 GUÍA RÁPIDA DE FACTURACIÓN PDF

## 📍 DÓNDE ESTÁN LOS BOTONES

### 1. TABLA DE VENTAS (Ventas → Listado)
```
┌─────────────────────────────────────────────────────────────┐
│ N° Venta │ Fecha    │ Cliente    │ Método  │ Total │ Acciones│
├─────────────────────────────────────────────────────────────┤
│ V-0001   │21/07/26  │Juan Pérez  │ Efectivo│ 250   │ ➊ ➋ ➌ ➍ │
│ V-0002   │21/07/26  │María López │ Tarjeta │ 500   │ ➊ ➋ ➌ ➍ │
└─────────────────────────────────────────────────────────────┘
                          Acciones:
                          ➊ 👁️ Ver detalles
                          ➋ 📄 DESCARGAR PDF ← AQUÍ
                          ➌ 🖨️ Imprimir
                          ➍ 🗑️ Eliminar
```

**PASO**: Clickea ➋ (botón PDF rojo/verde)  
**RESULTADO**: Se descarga `Factura_F001-00000001.pdf` automáticamente

---

### 2. DETALLE DE VENTA (Clickea Ver Detalles)
```
┌──────────────────────────────────────────┐
│ DETALLE DE VENTA                         │
├──────────────────────────────────────────┤
│                                          │
│ N° Venta: V-0001                        │
│ Cliente: Juan Pérez (DNI: 12345678)     │
│ Fecha: 21/07/26 · 14:30                 │
│ Método: Efectivo                        │
│                                          │
│ PRODUCTOS:                               │
│ ┌──────────────────────────────────────┐│
│ │ Laptop      │ 1 │ 2000 │ 2000        ││
│ │ Mouse       │ 2 │  50  │  100        ││
│ └──────────────────────────────────────┘│
│                                          │
│ Subtotal: S/ 2100.00                    │
│ IGV (18%): S/  378.00                   │
│ TOTAL: S/ 2478.00                       │
│                                          │
├──────────────────────────────────────────┤
│  ┌────────────────┐  ┌────────────────┐ │
│  │ 📄 DESCARGAR   │  │ 🖨️ IMPRIMIR   │ │
│  │  PDF           │  │                │ │
│  └────────────────┘  └────────────────┘ │
│  ┌────────────────┐  ┌────────────────┐ │
│  │ Cerrar         │  │ Aceptar        │ │
│  └────────────────┘  └────────────────┘ │
└──────────────────────────────────────────┘
```

**PASO**: Clickea "📄 DESCARGAR PDF" o "🖨️ IMPRIMIR"  
**RESULTADO**: Descarga PDF o abre diálogo de impresión

---

### 3. CONFIGURACIÓN DE FACTURACIÓN (Configuración → Facturación)
```
┌────────────────────────────────────────────────────┐
│ FACTURACIÓN                                        │
├─ CONFIGURACIÓN (izquierda) ─── VISTA PREVIA (der)─┤
│                                                    │
│ Razón Social         │  PREVIEW                   │
│ [Mi Empresa SAS    ] │  ┌──────────────────────┐  │
│                      │  │ Mi Empresa SAS       │  │
│ RUC                 │  │ RUC: 12345678901     │  │
│ [12345678901      ] │  │ F001-00000001        │  │
│                      │  │ Total: S/ 0.00       │  │
│ Dirección           │  │                      │  │
│ [Av. Principal 123 ]│  │ ┌──────────────────┐ │  │
│                      │  │ │ Imprimir Prueba │ │  │
│ Serie: [F001]       │  │ │ PDF de Prueba   │ │  │
│ Número Inicial: [1] │  │ └──────────────────┘ │  │
│ Siguiente: F001-01  │  │                      │  │
│                      │  └──────────────────────┘  │
│ IGV: [18] %         │                             │
│ Moneda: [PEN ▼]     │  [Guardar Cambios]          │
│                      │                             │
│ ☑ Incluir IGV      │                             │
│ ☑ Mostrar QR       │                             │
│                      │                             │
│ Pie de página:      │                             │
│ [¡Gracias por su    │                             │
│  compra!          ] │                             │
│                      │                             │
└────────────────────────────────────────────────────┘
```

**PASOS PARA PROBAR**:
1. Completa datos de empresa
2. Clickea "Imprimir Prueba" (ves vista previa)
3. Clickea "PDF de Prueba" (descarga ejemplo)
4. Clickea "Guardar Cambios" (guarda configuración)

---

## 🎬 ESCENARIOS DE USO

### Escenario 1: Primera Venta
```
1. Punto de Venta → Registrar venta
2. Venta se guarda automáticamente
3. Ventas → Listado → Se ve la venta
4. Clickea 📄 (botón PDF)
5. Se descarga Factura_F001-00000001.pdf ✅
6. Listo para enviar al cliente
```

### Escenario 2: Venta Urgente
```
1. Punto de Venta → Registrar venta
2. Cliente pide factura AHORA
3. Ventas → Listado → Busca venta
4. Clickea 🖨️ (imprimir) 
5. Imprime directamente ✅
6. Cliente recibe factura en físico
```

### Escenario 3: Cambiar Configuración
```
1. Configuración → Facturación
2. Cambias nombre empresa, IGV, etc
3. Clickea "Guardar Cambios"
4. TODAS LAS PRÓXIMAS FACTURAS usarán nueva config
5. Facturas antiguas NO se afectan ✅
```

---

## ✅ VERIFICACIÓN RÁPIDA

### ¿Funciona? Verifica esto:

```
☐ Puedo ver la tabla de Ventas
☐ Las ventas tienen botón 📄 (PDF) en acciones
☐ Clickeo botón PDF y se descarga archivo
☐ El PDF contiene: Número, Cliente, Productos, Total
☐ En Configuración → Facturación veo mis datos
☐ Puedo clickear "PDF de Prueba"
☐ Se descarga un PDF de prueba
☐ El PDF de prueba se abre correctamente
☐ Puedo imprimir desde Ventas
☐ La factura imprime correctamente
```

**Si todos están ✅** → ¡Tu sistema de facturación funciona perfecto!

---

## 📱 QUÉ INFORMACIÓN LLEVA LA FACTURA PDF

```
ENCABEZADO
✓ Nombre de empresa
✓ RUC
✓ Dirección
✓ Teléfono
✓ Email

NÚMERO Y FECHA
✓ Número de factura (ej: F001-00000001)
✓ Fecha de emisión

CLIENTE
✓ Nombre
✓ DNI/RUC
✓ Email
✓ Teléfono

PRODUCTOS
✓ Nombre producto
✓ Cantidad
✓ Precio unitario
✓ Subtotal

TOTALES
✓ Subtotal
✓ IGV (impuesto)
✓ TOTAL

PIE DE PÁGINA
✓ Mensaje personalizado
✓ Términos y condiciones
✓ Fecha/hora de generación
```

---

## 💡 TIPS PRO

**Tip 1**: Prueba primero con "PDF de Prueba" antes de confiar en PDFs reales

**Tip 2**: Si cambias la serie (F001 → F002), solo afecta NUEVAS facturas

**Tip 3**: Puedes descargar el mismo PDF varias veces - siempre da el mismo resultado

**Tip 4**: Los PDFs se generan localmente - sin conexión internet NO funcionan

**Tip 5**: Personaliza el "Pie de página" con tu mensaje especial (ej: "Garantía 1 año")

---

## 🚨 ERRORES COMUNES

### Error: Botón PDF deshabilitado/gris
```
❌ Venta está en estado "ANULADA" o "PENDIENTE"
✅ Solo funciona con estado "COMPLETADA"
```

### Error: PDF llega en blanco
```
❌ Configuración de empresa está vacía
✅ Completa datos en Configuración → Facturación → Guardar
```

### Error: Se descarga, pero no se abre
```
❌ Navegador bloqueó el PDF
✅ Revisa bandeja de descargas o configura permisos
```

### Error: Número de factura no incrementa
```
❌ Los números no se auto-incrementan automáticamente
✅ Cambia "Siguiente Número" manualmente en Configuración
```

---

## 🔗 ACCESO RÁPIDO

| Sección | Ruta | Acción |
|---------|------|--------|
| Ver Ventas | Menú → Ventas → Listado | Ver todas ventas + botón PDF |
| Detalle | Tabla → 👁️ Ver detalles | Más opciones, PDF, Imprimir |
| Configurar | Menú → Configuración → Facturación | Datos empresa, serie, IGV |
| Probar | Facturación → PDF de Prueba | Descargar ejemplo |

---

## 📞 SOPORTE EN 30 SEGUNDOS

**Pregunta**: ¿Cómo descargo una factura?  
**Respuesta**: Ventas → Tabla → Click en 📄 PDF

**Pregunta**: ¿La factura tiene datos de mi empresa?  
**Respuesta**: Sí, viene de Configuración → Facturación

**Pregunta**: ¿Se cambian las facturas antiguas?  
**Respuesta**: No, cada PDF se genera con datos actuales

**Pregunta**: ¿Puedo cambiar el formato?  
**Respuesta**: Sí, en Configuración → Facturación hay 3 plantillas

**Pregunta**: ¿Funciona sin internet?  
**Respuesta**: No, necesita conexión para cargar datos de Firebase

---

## 🎉 ¡LISTO!

Ya sabes dónde están todos los botones y cómo usarlos.

**Próximo paso**: Ve a Configuración → Facturación y completa tus datos de empresa.

Luego descargar tu primer PDF de una venta real. 🚀

---

*Última actualización: 21/07/2026*  
*Versión: 1.0*
