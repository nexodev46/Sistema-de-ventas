# 📋 Guía de Facturación en PDF - Sistema de Ventas

## ✅ ¿Qué se Implementó?

Se ha **activado y configurado la funcionalidad completa de facturación en PDF** con estas características:

✅ **Descarga de PDFs en tiempo real** para cada venta  
✅ **Impresión directa** de facturas  
✅ **Configuración flexible** de facturas  
✅ **Vista previa** antes de descargar  
✅ **Sin daño a funciones existentes**  

---

## 🚀 Cómo Usar

### Paso 1: Configurar tu Empresa y Facturación

1. Ve a **Configuración → Facturación**
2. Rellena los datos de tu empresa:
   - Nombre de empresa
   - RUC
   - Dirección
   - Teléfono
   - Email

3. Configura los parámetros de factura:
   - **Serie**: F001 (o la que uses)
   - **Número Inicial**: 1 (o el número siguiente)
   - **IGV**: 18% (o el porcentaje que uses)
   - **Nombre Impuesto**: IGV (o cómo lo llames)
   - **Moneda**: Selecciona PEN, USD o EUR
   - **Plantilla**: Elige entre Clásica, Moderna o Corporativa
   - **Pie de Página**: Personaliza el mensaje final
   - **Términos y Condiciones**: Agrega tus términos

4. Haz clic en **"Guardar Cambios"**

### Paso 2: Probar la Configuración

1. En la misma página de **Configuración → Facturación**
2. Haz clic en **"Imprimir Prueba"** para ver cómo se verá impreso
3. Haz clic en **"PDF de Prueba"** para descargar una factura de prueba

---

### Paso 3: Descargar Factura de una Venta Real

#### Opción A: Desde la Tabla de Ventas

1. Ve a **Ventas → Listado de Ventas**
2. Busca la venta que quieres facturar
3. En la columna **"Acciones"**, verás 4 botones:
   - 👁️ Ver detalles
   - 📄 **Descargar PDF** ← AQUÍ
   - 🖨️ Imprimir
   - 🗑️ Eliminar

4. Haz clic en el botón **"Descargar PDF"** (el rojo/verde)
5. Se descargará automáticamente un archivo `Factura_F001-00000001.pdf`

#### Opción B: Desde Detalle de Venta

1. Ve a **Ventas → Listado de Ventas**
2. Haz clic en **👁️ Ver detalles** de la venta
3. Se abrirá un diálogo con toda la información
4. En la parte inferior verás 2 botones grandes:
   - **Descargar PDF** ← Descarga la factura
   - **Imprimir** ← Abre diálogo de impresión

---

## 📊 ¿Qué Incluye la Factura en PDF?

Cada factura PDF incluye automáticamente:

```
┌─────────────────────────────────────┐
│  NOMBRE DE TU EMPRESA               │
│  RUC: XXXXXXXXXXXXX                 │
│  Dirección | Teléfono | Email       │
├─────────────────────────────────────┤
│  FACTURA                            │
│  Número: F001-00000001              │
│  Fecha: 21/07/2026                  │
├─────────────────────────────────────┤
│ Cliente:                            │
│ - Nombre: Juan Pérez                │
│ - DNI: 12345678                     │
│ - Email: juan@example.com           │
│ - Teléfono: +51999999999            │
├─────────────────────────────────────┤
│ PRODUCTOS                           │
│ Producto  | Cant | Precio | Subtotal│
│ Widget    |  2   | S/ 100 | S/ 200  │
├─────────────────────────────────────┤
│                   Subtotal: S/ 200.00│
│                   IGV (18%): S/ 36.00│
│                   TOTAL:    S/ 236.00│
├─────────────────────────────────────┤
│  ¡Gracias por su compra!            │
│  Términos y condiciones aquí        │
│  Fecha generación: 21/07/26 15:30   │
└─────────────────────────────────────┘
```

---

## 🎯 Flujo Completo en Tiempo Real

```
1. Hacer Venta
   ↓
2. Venta se guarda en base de datos (Firestore)
   ↓
3. Aparece automáticamente en "Ventas" con el botón PDF
   ↓
4. Usuario clickea botón PDF
   ↓
5. Sistema trae:
   - Configuración de facturación (nombre empresa, IGV, etc)
   - Datos de la venta (cliente, productos, total)
   ↓
6. Genera PDF con formato profesional
   ↓
7. Se descarga automáticamente
```

---

## ⚙️ Características Técnicas

### ✅ Lo que Funciona

- ✅ **Descarga múltiple**: Puedes descargar PDFs de varias ventas
- ✅ **Nombres automáticos**: `Factura_F001-00000001.pdf`
- ✅ **Configurable**: Cambia serie, IGV, moneda sin límites
- ✅ **Tiempo real**: Si cambias configuración, próximas facturas lo reflejan
- ✅ **Responsive**: Funciona en desktop, tablet y móvil
- ✅ **Sin internet requerido**: Todo se genera localmente

### 📝 Datos Guardados en BD

**Importante**: El PDF se genera cada vez, no se guarda en la BD
- La venta sigue siendo un registro normal
- El PDF es generado on-demand
- Puedes regenerar el PDF de una venta vieja con la configuración actual

---

## 🔍 Troubleshooting

### P: El PDF se descarga pero está en blanco
**R**: Asegúrate de que la configuración de empresa esté completa en Configuración → Facturación

### P: El número de factura no incrementa
**R**: Los números se generan desde la configuración. Solo incrementa el número en tu configuración cuando lo hagas manualmente en Configuración → Facturación

### P: No aparece el botón de PDF
**R**: 
1. Asegúrate de estar en la página **Ventas → Listado**
2. Recarga la página (Ctrl+F5)
3. Verifica que la venta esté en estado "COMPLETADA"

### P: Error al descargar PDF
**R**:
1. Abre la consola (F12) y mira el error exacto
2. Verifica que tu configuración de empresa esté guardada
3. Intenta descargar una factura de prueba primero (Configuración → Facturación)

---

## 💡 Tips de Uso

1. **Configura primero**: Antes de descargar PDFs reales, prueba con "PDF de Prueba"
2. **Personaliza**: Agrega tu información completa en Configuración
3. **Respalda**: Descarga y guarda PDFs importantes
4. **Moneda**: Selecciona la moneda correcta antes de hacer ventas
5. **IGV**: Verifica el porcentaje de IGV (normalmente 18% en Perú)

---

## 📞 Características Futuras (No Incluidas)

Estas podrían agregarse después:
- Envío de PDF por email automático
- Códigos QR en facturas
- Firma digital
- Numeración automática de facturas
- Reportes consolidados de facturación
- Integración con SUNAT

---

## ✨ Resumen

Tu sistema ahora puede:

1. **Configurar facturación** completa y flexible
2. **Generar PDFs** profesionales en tiempo real
3. **Descargar facturas** de cada venta con un click
4. **Imprimir** directamente desde el navegador
5. **Todo sin dañar** ninguna funcionalidad existente

**¡Estás listo para facturar!** 🎉

---

*Guía actualizada: 21/07/2026*
*Sistema: Sistema de Ventas v1.0*
