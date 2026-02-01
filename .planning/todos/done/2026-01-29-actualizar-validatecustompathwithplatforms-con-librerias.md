---
created: 2026-01-29T11:39
title: Actualizar validateCustomPathWithPlatforms con librerias
area: general
files:
  - TBD
---

## Problem

La función validateCustomPathWithPlatforms no está usando los nombres de plataforma ni los directorios actuales. Ya existe una librería para eso (platform-names.js y platform-paths.js) y hay que actualizar el comportamiento para que los use.

## Solution

Actualizar validateCustomPathWithPlatforms para consumir las utilidades de platform-names.js y platform-paths.js en vez de lógica propia. Revisar usos actuales y alinear validaciones con los directorios/nombres reales.
