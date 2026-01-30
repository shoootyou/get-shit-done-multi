# Instructions for GSD

- Use the get-shit-done skill when the user asks for GSD or uses a `gsd-*` command.
- Treat `{{COMMAND_PREFIX}}...` or `gsd-...` as command invocations and load the matching file from `{{PLATFORM_ROOT}}/get-shit-done/commands/gsd/`.
- When a command says to spawn a subagent, prefer a matching custom agent from `{{PLATFORM_ROOT}}/agents`.
- Do not apply GSD workflows unless the user explicitly asks for them.