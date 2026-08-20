# Guía de Diagnóstico y Próximos Pasos — VGV App v1.2

## Estado Actual (20 de Agosto, 2026)

### ✅ Frontend (App en navegador)
- **Versión**: v1.2 (mostrada en login)
- **Service Worker**: caché actualizado a `vgv-cache-v1.2`
- **Deployment Apps Script**: `AKfycbxUKAxxXeIRuBu9FDEBy5CgtCg4vJoPz7QVWfiUIuHQrsbb9pIgbbpIJOKsm1KYmjaXCA`
- **Payload de envío**: Incluye `moduloOrigen` ("Entregas" o "Proveedores / Compras")
- **Pruebas simuladas**: ✅ Completo (login, foto, envío, pantalla de éxito)

### ⚠️ Backend (Apps Script)
- **Estado actual**: Devuelve página HTML de error en lugar de JSON
- **Causa probable**: El `Code.gs` no está compilando correctamente o tiene un error en las constantes globales
- **Necesario**: Reemplazar `Code.gs` en el editor de Apps Script con el archivo validado

---

## Pasos para Activar el Flujo Completo

### 1. En Apps Script Editor

**a) Vaciar y reemplazar Code.gs:**
- Abre el editor de Apps Script del proyecto "Vgv App 1.2"
- Selecciona todo el contenido actual en `Code.gs` (Ctrl+A)
- Bórralo completamente
- Copia el contenido completo de `/workspaces/App-Vgv-2.1.2/Code.gs.v1.2_FINAL_VALIDADO.js`
- Pégalo en el editor
- Presiona **Guardar**

**b) Verificar sintaxis:**
- Si aparece una marca roja o error, revisa que todas las comillas sean `"` (no `"` de Word)
- Verifica que no haya tabulaciones vacías al final de líneas

**c) Desplegar:**
- Click en **Implementar** (arriba a la derecha)
- Selecciona **Administrar implementaciones**
- En la versión existente, click en el ícono de lápiz (editar)
- Selecciona **Nueva versión** del dropdown
- Click en **Desplegar**
- Espera a que diga "Deployment successfully updated"

---

### 2. Verificar que funciona

**Desde terminal del workspace:**

```bash
# Prueba GET simple (debe devolver JSON con error de acción no válida)
curl -sS 'https://script.google.com/macros/s/AKfycbxUKAxxXeIRuBu9FDEBy5CgtCg4vJoPz7QVWfiUIuHQrsbb9pIgbbpIJOKsm1KYmjaXCA/exec'

# Prueba POST con login inválido (debe devolver JSON)
curl -sS -X POST 'https://script.google.com/macros/s/AKfycbxUKAxxXeIRuBu9FDEBy5CgtCg4vJoPz7QVWfiUIuHQrsbb9pIgbbpIJOKsm1KYmjaXCA/exec' \
  --data-urlencode 'data={"accion":"login","usuario":"__test__","password":"__bad__"}'
```

**Respuesta esperada:**
```json
{"ok":false,"error":"Usuario o contraseña incorrectos"}
```

Si sigue devolviendo HTML, la compilación aún falla. Revisar:
- ¿Están bien las comillas? (debe ser `"` no `"`)
- ¿Están las constantes al inicio? (sin sangría)
- ¿Hay caracteres especiales o acentos raros?

---

### 3. Prueba de flujo completo desde la app

Una vez que el backend devuelva JSON:

1. Abre `http://127.0.0.1:4173/` en el navegador
2. Ingresa las credenciales reales de un chofer desde la hoja "Usuarios"
3. Click en **Entregas**
4. Selecciona **Factura**
5. Ingresa número (ej: `FAC-TEST-001`)
6. Selecciona estado
7. Toma/sube foto
8. Click **Registrar entrega**

**Resultado esperado:**
- Se abre pantalla de éxito
- En Google Sheets (hoja "Entregas"), fila nueva con:
  - Columna A: Fecha
  - Columna B: Hora
  - ...
  - **Columna J: "Entregas"** ← Aquí va el origen del módulo

---

## Archivos Cambiados en el Frontend

| Archivo | Cambios |
|---------|---------|
| `script_v2.js` | Agregados `APPS_SCRIPT_URL` constante + `nombreModulo` en config + `moduloOrigen` al payload |
| `index.html` | Versión actualizada a v1.2 |
| `service-worker-v4.js` | Cache actualizado a v1.2 |

---

## Referencia Rápida: Estructura de Payload

Cuando el chofer envía desde **Entregas**:
```json
{
  "accion": "registrarEntrega",
  "numero": "FAC-E2E-001",
  "tipoDocumento": "factura",
  "estado": "conforme",
  "modulo": "entregas",
  "moduloOrigen": "Entregas",
  "usuario": "Chofer Prueba",
  "rol": "Chofer",
  "patente": "KT-XX-45",
  "fecha": "20/08/2026",
  "hora": "10:09 a. m.",
  "fotoBase64": "data:image/jpeg;base64,..."
}
```

El backend recibe esto y guarda en hoja "Entregas" columna J el valor `moduloOrigen`.

---

## Contacto de Soporte

Si el Apps Script sigue sin funcionar después de reemplazar Code.gs:
- Verifica los IDs de sheets en las constantes (`SPREADSHEET_ID`, `SHEET_LOGIN_ID`)
- Abre la pestaña "Execution log" en Apps Script para ver errores de runtime
- Verifica que el usuario de Google (mauro.olea@vgv.cl) tenga acceso a las hojas mencionadas
