---
created: 2026-01-30T15:42
completed: 2026-01-30T15:52
title: Fix migration backup directory creation timing
area: tooling
files:
  - bin/lib/migration/migration-orchestrator.js
  - bin/lib/migration/migration-manager.js
  - bin/lib/migration/backup-manager.js
status: done
---

## Problem

Durante la ejecución de `checkAndMigrateOldVersions` en `install.js`, se están creando múltiples directorios de backup cuando debería crearse solo uno por ejecución:

1. Cuando la migración detecta versiones antiguas, muestra "Old Versions Detected"
2. Muestra la tool antigua detectada
3. **ANTES** de que el usuario seleccione Yes/No en "Create backup and upgrade?", ya se crea un directorio de backup vacío
4. Cuando el usuario acepta, se crea OTRO directorio con el contenido del backup real
5. Si hay múltiples tools, el proceso se repite: crea directorio vacío → espera respuesta → crea otro directorio con contenido

**Comportamiento esperado:** Crear UN SOLO directorio de backup por ejecución y usarlo para todas las herramientas migradas, no un directorio por herramienta.

## Solution

✅ **Implementado:**
1. `migration-orchestrator.js`: Mantiene un `sharedBackupDir` que se crea en la primera migración y se reutiliza para todas las demás
2. `migration-manager.js`: Acepta `sharedBackupDir` en options, lo pasa a `createBackup()`, y retorna `backupDir` para compartir
3. `backup-manager.js`: `createBackup()` acepta `existingBackupDir` opcional y lo reutiliza si existe

**Resultado:** Ahora se crea UN SOLO directorio por ejecución, compartido por todas las tools migradas.
