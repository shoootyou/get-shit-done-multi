# GSD Skills Standardization

## What This Is

GSD (Get Shit Done) is a multi-platform AI assistant framework providing 28 specialized commands for project management, planning, execution, and debugging. Completed v1.9.1 milestone successfully migrated all commands from legacy format to unified spec-based architecture.

**v1.9.1 Achievement:** Transformed 29 legacy commands into spec-driven skills in `/specs/skills/` that generate platform-specific outputs for GitHub Copilot CLI, Claude Code, and Codex CLI. Single source of truth with frontmatter-based metadata, conditional rendering, and folder-per-skill structure.

## Core Value

Specs in `/specs/skills/` serve as the single source of truth for GSD commands, enabling consistent installation across 3 platforms without code duplication. Template-based generation ensures maintainability and multi-platform compatibility.

## Current Focus

Milestone v1.10.0: Installation CLI Optimization. Redesign CLI from implicit platform assumptions to explicit platform selection with multi-platform support and interactive menu. **BREAKING CHANGE**: Hard removal of old flags.

**Active milestone:** v1.10.0 - Installation CLI Optimization (3-4 week timeline)  
**Status:** Roadmap created (8 phases, 31 P0 requirements), awaiting user approval to begin phase planning

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
