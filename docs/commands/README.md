# Guía de Comandos GSD

Esta guía detalla todos los comandos disponibles en Get Shit Done, organizados por categoría.

## Índice

- [Comandos del Flujo Principal](#comandos-del-flujo-principal)
- [Gestión de Fases](#gestión-de-fases)
- [Gestión de Milestones](#gestión-de-milestones)
- [Navegación y Progreso](#navegación-y-progreso)
- [Sesión de Trabajo](#sesión-de-trabajo)
- [Utilidades](#utilidades)
- [Sistema](#sistema)

---

## Comandos del Flujo Principal

Estos son los comandos que usarás en el flujo típico de desarrollo:

### `/gsd-new-project`
**Inicializa un nuevo proyecto**

Comienza el flujo completo de inicialización:
1. Hace preguntas para entender tu idea
2. Investiga el dominio (opcional pero recomendado)
3. Extrae requisitos
4. Crea roadmap con fases

**Crea:** `PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md`, `STATE.md`, `.planning/research/`

**Cuándo usar:** Al comenzar un proyecto nuevo desde cero.

---

### `/gsd-discuss-phase [N]`
**Captura decisiones de implementación**

Analiza la fase y identifica áreas grises donde necesitas decidir cómo quieres que funcione. Para cada área, hace preguntas hasta que estés satisfecho.

**Crea:** `{phase}-CONTEXT.md`

**Cuándo usar:** Antes de planificar una fase, cuando quieres dar tu visión específica sobre cómo debe implementarse.

---

### `/gsd-plan-phase [N]`
**Investiga y planifica una fase**

El sistema:
1. Investiga cómo implementar la fase
2. Crea planes de tareas atómicas (2-3 tareas por plan)
3. Verifica planes contra requisitos

**Crea:** `{phase}-RESEARCH.md`, `{phase}-{N}-PLAN.md`

**Cuándo usar:** Después de discuss-phase, antes de ejecutar.

---

### `/gsd-execute-phase <N>`
**Ejecuta todos los planes de una fase**

Ejecuta los planes en oleadas:
- Paralelo cuando es posible
- Secuencial cuando hay dependencias
- Contexto fresco por plan (200k tokens)
- Commit atómico por tarea

**Crea:** `{phase}-{N}-SUMMARY.md`, `{phase}-VERIFICATION.md`

**Cuándo usar:** Después de planificar, cuando estés listo para construir.

---

### `/gsd-verify-work [N]`
**Pruebas de aceptación de usuario**

Extrae entregables testeables y te guía uno por uno. Si algo falla:
- Diagnostica automáticamente
- Crea planes de corrección verificados

**Crea:** `{phase}-UAT.md`, planes de corrección si hay problemas

**Cuándo usar:** Después de ejecutar, para confirmar que funciona como esperabas.

---

## Gestión de Fases

### `/gsd-add-phase`
**Agrega una fase al final del roadmap**

Permite añadir una nueva fase después de las existentes.

**Cuándo usar:** Cuando necesitas extender el alcance del milestone actual.

---

### `/gsd-insert-phase [N]`
**Inserta una fase urgente**

Inserta una fase entre las existentes y renumera automáticamente.

**Cuándo usar:** Trabajo urgente que no puede esperar a las fases actuales.

---

### `/gsd-remove-phase [N]`
**Elimina una fase futura**

Remueve una fase que aún no se ha ejecutado y renumera.

**Cuándo usar:** Cuando decides que una fase ya no es necesaria.

---

### `/gsd-research-phase [N]`
**Investiga una fase sin planificar**

Solo ejecuta la fase de investigación sin crear planes.

**Cuándo usar:** Cuando quieres investigar antes de comprometerte a planificar.

---

### `/gsd-list-phase-assumptions`
**Lista las suposiciones de todas las fases**

Extrae y muestra las suposiciones clave de cada fase.

**Cuándo usar:** Para revisar qué está asumiendo el sistema sobre cada fase.

---

## Gestión de Milestones

### `/gsd-complete-milestone`
**Completa el milestone actual**

Archiva el milestone y crea un tag de release.

**Cuándo usar:** Cuando todas las fases están completas y verificadas.

---

### `/gsd-new-milestone [name]`
**Inicia un nuevo milestone**

Mismo flujo que new-project pero para codebase existente:
1. Preguntas sobre qué construir
2. Investigación del dominio
3. Requisitos
4. Roadmap fresco

**Cuándo usar:** Después de complete-milestone, para la siguiente versión.

---

### `/gsd-archive-milestone`
**Archiva un milestone manualmente**

Mueve archivos de planificación a `.planning/archive/{milestone}/`.

**Cuándo usar:** Limpieza manual o reorganización.

---

### `/gsd-restore-milestone`
**Restaura un milestone archivado**

Trae de vuelta un milestone archivado al workspace activo.

**Cuándo usar:** Necesitas volver a trabajar en un milestone antiguo.

---

### `/gsd-list-milestones`
**Lista todos los milestones**

Muestra milestones activos y archivados con su estado.

**Cuándo usar:** Para ver el histórico del proyecto.

---

### `/gsd-audit-milestone`
**Audita la completitud del milestone**

Verifica que todas las fases estén completas y los archivos existan.

**Cuándo usar:** Antes de complete-milestone para asegurar que todo está listo.

---

### `/gsd-plan-milestone-gaps`
**Identifica gaps en el milestone**

Analiza el roadmap y sugiere fases faltantes o áreas no cubiertas.

**Cuándo usar:** Durante la planificación para asegurar cobertura completa.

---

## Navegación y Progreso

### `/gsd-progress`
**¿Dónde estoy? ¿Qué sigue?**

Muestra estado actual del proyecto:
- Milestone activo
- Fase actual
- Próximos pasos recomendados

**Cuándo usar:** Al comenzar una sesión o cuando necesitas orientación.

---

### `/gsd-help`
**Muestra todos los comandos**

Lista completa de comandos con breves descripciones.

**Cuándo usar:** Cuando necesitas recordar un comando o ver qué está disponible.

---

## Sesión de Trabajo

### `/gsd-pause-work`
**Pausa el trabajo actual**

Crea un handoff document cuando necesitas detener el trabajo a mitad de fase.

**Crea:** `HANDOFF.md`

**Cuándo usar:** Al final de tu sesión de trabajo, para retomar después.

---

### `/gsd-resume-work`
**Reanuda desde la última sesión**

Restaura el contexto de donde lo dejaste usando HANDOFF.md.

**Cuándo usar:** Al comenzar una nueva sesión después de pause-work.

---

## Utilidades

### `/gsd-add-todo [desc]`
**Captura una idea para después**

Guarda una idea o tarea en `.planning/todos/`.

**Cuándo usar:** Cuando tienes una idea pero no es el momento de trabajar en ella.

---

### `/gsd-check-todos`
**Lista todos los TODOs pendientes**

Muestra todas las ideas capturadas.

**Cuándo usar:** Al planificar una nueva fase o milestone.

---

### `/gsd-debug [desc]`
**Debugging sistemático**

Usa el método científico para debugging con estado persistente.

**Cuándo usar:** Cuando tienes un bug que no se resuelve fácilmente.

---

### `/gsd-map-codebase`
**Analiza codebase existente**

Spawns parallel agents to analyze:
- Tech stack
- Architecture
- Conventions
- Concerns

**Crea:** Documentos en `.planning/codebase-map/`

**Cuándo usar:** ANTES de new-project en un codebase existente (brownfield).

---

## Sistema

### `/gsd-verify-installation`
**Verifica que GSD esté instalado correctamente**

Chequea que todos los archivos necesarios existan.

**Cuándo usar:** Después de instalar o si los comandos no funcionan.

---

### `/gsd-whats-new`
**Muestra las novedades**

Compara tu versión instalada con la última disponible.

**Cuándo usar:** Periódicamente para ver nuevas características.

---

### `/gsd-update`
**Actualiza GSD**

Reinstala con la última versión.

**Cuándo usar:** Cuando whats-new muestra actualizaciones disponibles.

---

### `/gsd-invoke-agent`
**Invoca un agente GSD manualmente**

Para uso avanzado: invoca agentes específicos directamente.

**Cuándo usar:** Debugging o workflows personalizados.

---

## Flujo Típico

```
1. /gsd-new-project              # Inicializar
2. /gsd-discuss-phase 1          # Tu visión
3. /gsd-plan-phase 1             # Investigar + planificar
4. /gsd-execute-phase 1          # Construir
5. /gsd-verify-work 1            # Probar
6. Repetir pasos 2-5 para cada fase
7. /gsd-complete-milestone       # Archivar
8. /gsd-new-milestone            # Siguiente versión
```

---

## Soporte Multi-CLI

GSD funciona en **tres CLIs diferentes**:

- **Claude Code** - `/gsd-*` comandos nativos
- **GitHub Copilot CLI** - Usa skills `$get-shit-done`
- **Codex CLI** - Usa skills en `.codex/skills/`

Ver [docs/cli-comparison.md](../cli-comparison.md) para detalles de compatibilidad.

---

## Próximos Pasos

- Lee la Guía de Instalación para tu CLI: [Claude Code](../setup-claude-code.md), [Copilot](../setup-copilot-cli.md), [Codex](../setup-codex-cli.md)
- Revisa [Comparación de CLIs](../cli-comparison.md) para entender las diferencias
- Consulta [Troubleshooting](../troubleshooting.md) si tienes problemas

