# GSD Skills Standardization (v1.9.1)

## What This Is

Migración de la estructura de comandos GSD del formato legacy (`./commands/gsd/*.md`) al nuevo formato de SKILLS estandarizado según especificación de Claude, creando specs reutilizables en `/specs/skills/` que funcionan para las 3 plataformas: GitHub Copilot CLI, Claude Code, y Codex CLI. Los 29 comandos existentes se transforman a estructura de carpetas con frontmatter, metadata, y nuevo prefijo "gsd-".

## Core Value

Los specs en `/specs/skills/` deben ser la fuente única de verdad para comandos GSD, permitiendo instalación consistente en las 3 plataformas sin duplicación de lógica.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Crear estructura `/specs/skills/` siguiendo formato de carpetas de Claude
- [ ] Migrar 29 comandos de `./commands/gsd/*.md` a specs con nuevo formato
- [ ] Cambiar prefijo de comandos de "gsd:" a "gsd-" en specs nuevos
- [ ] Agregar frontmatter según especificación de Claude a cada skill spec
- [ ] Agregar metadata block (platform, generated, versions) a cada spec
- [ ] Migrar skill principal (SKILL.md) a nuevo formato de carpeta
- [ ] Adaptar install.js para procesar `/specs/skills/` en las 3 plataformas
- [ ] Mantener compatibilidad con sistema existente en `./commands/gsd/` (no modificar)
- [ ] Actualizar lógica de instalación para Copilot, Claude, y Codex usando mismo spec
- [ ] Crear documentación de la nueva estructura en `/specs/skills/README.md`
- [ ] Actualizar CHANGELOG.md con cambios de v1.9.1
- [ ] Verificar que specs generados funcionan en las 3 plataformas

### Out of Scope

- Modificar comandos legacy en `./commands/gsd/` — se mantienen sin cambios
- Eliminar estructura antigua — coexisten legacy y nueva estructura
- Cambios a funcionalidad de comandos — solo cambio de estructura y formato
- Migración automática de usuarios — instalación manual con nuevo sistema

## Context

**Estado actual:**
- 29 comandos GSD en `./commands/gsd/*.md` con formato legacy
- Skill principal en `.github/skills/get-shit-done/SKILL.md` para Copilot
- Sistema de instalación en `bin/install.js` con adapters por plataforma
- Specs de agentes ya en `/specs/agents/*.md` con metadata y frontmatter
- Templates de agentes funcionando con sistema de generación

**Estructura objetivo:**
- `/specs/skills/` contendrá specs de comandos siguiendo formato Claude
- Cada skill en su propia carpeta: `/specs/skills/gsd-[command]/`
- Frontmatter con campos: name, description, tools (condicionales por plataforma)
- Metadata block con: platform, generated, templateVersion, projectVersion, projectName
- Nombres de comandos con prefijo "gsd-" en specs (legacy mantiene "gsd:")

**Referencias:**
- Especificación Claude: https://code.claude.com/docs/en/slash-commands
- Frontmatter reference: https://code.claude.com/docs/en/slash-commands#frontmatter-reference
- Ejemplo de metadata: formato usado en `/specs/agents/*.md`
- Sistema actual: `bin/install.js` con adapters (claude, copilot, codex)

## Constraints

- **Compatibilidad**: No romper sistema legacy en `./commands/gsd/` — debe seguir funcionando
- **Tech stack**: Node.js, sistema de templates existente en `bin/lib/template-system/`
- **Plataformas**: Specs deben funcionar en Copilot, Claude, y Codex con adaptación automática
- **Formato**: Seguir exactamente especificación de Claude para frontmatter y estructura
- **Versioning**: v1.9.1 para proyecto GSD (tag global 1.9.0 ya existe)
- **Instalación**: Copilot → `.github/skills/`, Claude → `~/.claude/skills/`, Codex → `.codex/`

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Crear specs en `/specs/skills/` sin tocar legacy | Permite transición gradual sin romper instalaciones existentes | — Pending |
| Usar mismo spec para 3 plataformas | Reduce duplicación, adaptación automática por install.js | — Pending |
| Prefijo "gsd-" en specs nuevos, "gsd:" en legacy | Diferencia clara entre sistemas, evita conflictos | — Pending |
| Estructura de carpeta por skill | Sigue estándar de Claude, permite expansión futura | — Pending |
| Metadata como en agents | Consistencia con sistema existente en `/specs/agents/` | — Pending |

---
*Last updated: 2026-01-22 after initialization*
