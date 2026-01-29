---
created: 2026-01-29T16:26
title: Audit unused functions in /bin directory
area: tooling
files:
  - bin/**/*.js
  - scripts/
---

## Problem

Necesidad de identificar y documentar funciones no utilizadas o infrautilizadas en el directorio /bin para optimizar el código base.

Se requiere:
1. Detectar funciones que no se invocan en ningún lado (existen pero nadie las llama)
2. Identificar funciones llamadas pocas veces (≤5 veces) - candidatas para revisión
3. Detectar funciones llamadas solo 1 vez (candidatas para inline)
4. Generar documento completo con análisis y recomendaciones
5. Proponer workflow por fases con pruebas exhaustivas

## Solution

### Fase 1: Crear script de análisis
- Script ubicado en `$(pwd)/scripts/audit-functions.js` o similar
- Debe escanear todos los archivos bajo `/bin` y subdirectorios
- Analizar:
  - Declaraciones de funciones (function, arrow functions, export function, etc.)
  - Llamadas a funciones en toda la base de código
  - Contar ocurrencias de cada función

### Fase 2: Generar documento `audit-functions.md`
Estructura del documento:
- **Funciones no utilizadas** (0 llamadas)
- **Funciones llamadas pocas veces** (1-5 llamadas) con columna de count
- **Funciones potenciales para inline** (1 sola llamada)
- **Propuesta de trabajo por fases**
- **Plan de acción con confirmaciones del usuario**

### Fase 3: Testing exhaustivo
- Crear directorio de prueba bajo `/tmp` por cada test
- Ejecutar `install.js` con todas las combinaciones de parámetros existentes
- Validar que ninguna función "eliminada" rompa la funcionalidad

### Requisitos especiales:
- **Todos los commits** deben usar prefijo `xxx(audit):`
- **Usar AskUserQuestion tool** para toda confirmación del usuario
- **Workflow conversacional** hasta completar todo el análisis
- Usuario debe autorizar cada fase antes de ejecutarse

### Herramientas a considerar:
- AST parsing (babel/parser, @babel/traverse)
- grep/regex para detección rápida
- Scripts Node.js personalizados

## Notes

- Este es un análisis exhaustivo que requiere múltiples fases
- Debe ser interactivo con confirmaciones del usuario en cada paso
- El documento final debe ser completo y accionable
- Las pruebas deben cubrir todos los escenarios de uso de install.js
