---
created: 2026-01-27T18:10
title: Improve handleCheckUpdates to check all platforms sequentially with progress reporting
area: tooling
files:
  - bin/lib/updater/check-update.js:13-62
  - bin/lib/version/installation-finder.js:6-50
---

## Problem

El flujo actual de `handleCheckUpdates` funciona pero no aprovecha completamente las rutas centralizadas de `platform-paths.js` para mostrar el progreso de detección de forma clara:

**Flujo actual:**
- Si `--custom-path`: solo verifica esa ruta (✅ correcto)
- Si NO custom-path: verifica global/local pero no muestra cada plataforma individualmente

**Problema específico:**
- `findInstallations()` verifica todas las rutas en paralelo con `Promise.all`, pero el usuario no ve el progreso por plataforma
- No queda claro qué plataforma se está verificando en cada momento
- Las rutas están centralizadas en `platform-paths.js` pero no se usa su lista de plataformas explícitamente

**Comportamiento deseado:**
1. Si `--custom-path` está establecido: solo revisar esa ruta (ya funciona bien)
2. Si NO está establecido:
   - Primero revisar todas las rutas GLOBALES (claude, copilot, codex)
   - Informar cada una que encuentre con `logger.info()`
   - Luego revisar todas las rutas LOCALES (claude, copilot, codex)
   - Informar cada una que encuentre con `logger.info()`

## Solution

Refactorizar `handleCheckUpdates` para iterar explícitamente sobre las plataformas usando el módulo `platform-paths.js`:

```javascript
// Usar platformDirs de platform-paths.js
import { platformDirs, getManifestPath } from '../platforms/platform-paths.js';

// En handleCheckUpdates:
const platforms = Object.keys(platformDirs); // ['claude', 'copilot', 'codex']

// Para cada scope (global, local):
for (const platform of platforms) {
  const manifestPath = getManifestPath(platform, isGlobal);
  // Verificar si existe
  // Si existe, validar y reportar inmediatamente
}
```

**Ventajas:**
- Usa explícitamente la lista de plataformas de `platform-paths.js`
- Reporte secuencial por plataforma (mejor UX)
- Fácil de extender con nuevas plataformas
- Más claro ver qué se está verificando

**Consideraciones:**
- Cambiar de verificación paralela (`Promise.all`) a secuencial (por plataforma)
- Mantener el soporte de `--custom-path`
- Mantener output con `logger.simpleSubtitle()` entre global/local
- Tests en `/tmp` para verificar el flujo

## Testing

```bash
# Crear estructura de prueba en /tmp
mkdir -p /tmp/test-gsd/{.claude,.github,.codex}/get-shit-done

# Copiar manifests de prueba
# ...

# Probar el comando
npx . --check-updates --verbose
```
