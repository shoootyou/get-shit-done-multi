---
created: 2026-01-30T15:42
title: Fix migration backup directory creation timing
area: tooling
files:
  - bin/install.js
  - bin/lib/migration/migration-orchestrator.js
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

Investigar el flujo en `migration-orchestrator.js` y/o `install.js` para:
1. Identificar dónde se crea el directorio de backup prematuramente
2. Retrasar la creación del directorio hasta que el usuario confirme
3. Reutilizar el mismo directorio de backup para todas las tools en una misma ejecución
4. Asegurar que solo se cree un directorio de backup por sesión/ejecución de migración
