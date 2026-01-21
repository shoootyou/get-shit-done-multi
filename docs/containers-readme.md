# Container Environment

This project supports Docker and Podman for isolated development with persistent caches.

**Pre-installed CLI tools:**
- GitHub Copilot CLI (ready to use)
- Claude CLI (manual install if needed)
- Codex CLI (manual install if needed)

All CLIs require authentication after container start.

## Quick Start

### Using Docker

```bash
make net           # Interactive shell with network
make nonet         # Isolated shell (no network)
```

### Using Podman

```bash
# First: install podman-compose
pip install podman-compose

# Then use it
make podman-net    # Interactive shell with network
make podman-nonet  # Isolated shell (no network)
```

## Why Containers?

**Isolation:** Your code runs in a clean environment separate from your host system.

**Pre-installed Tools:** GitHub Copilot CLI is pre-installed. Claude and Codex CLIs can be installed manually.

**Persistence:** The `.sandbox-*` directories keep your data:
- `.sandbox-home/` - Shell history, configs
- `.sandbox-cache/` - Package caches (pip, npm)
- `.sandbox-rw/` - Generated outputs

**Security:** Non-root user, dropped capabilities, resource limits.

## Key Concepts

### Persistent Storage

Both Docker and Podman use the same directories:

| Directory | Maps To | Purpose |
|-----------|---------|---------|
| `.sandbox-home/` | `/home/sandbox` | User configs |
| `.sandbox-cache/` | `/home/sandbox/.cache` | Package cache |
| `.sandbox-rw/` | `/workspace-rw` | Outputs |
| `.` (project) | `/workspace` | Source code |

### Network Modes

**With network** (`make net` or `make podman-net`):
- Full internet access
- Install packages
- Download dependencies

**Without network** (`make nonet` or `make podman-nonet`):
- No internet
- Uses cached packages only
- Safer for running untrusted code

## Docker Commands

| Command | Description |
|---------|-------------|
| `make build` | Build image |
| `make net` | Interactive shell (with network) |
| `make nonet` | Interactive shell (no network) |
| `make shell` | Start and attach |
| `make up` | Start in background |
| `make exec` | Connect to running container |
| `make down` | Stop and remove |
| `make clean` | Remove everything |

## Podman Commands

| Command | Description |
|---------|-------------|
| `make podman-build` | Build image |
| `make podman-net` | Interactive shell (with network) |
| `make podman-nonet` | Interactive shell (no network) |
| `make podman-shell` | Start and attach |
| `make podman-up` | Start in background |
| `make podman-exec` | Connect to running container |
| `make podman-down` | Stop and remove |
| `make podman-clean` | Remove everything |

## Choosing Docker vs Podman

**Use Docker if:**
- Already using Docker
- Want simplicity
- Team standardized on Docker

**Use Podman if:**
- Need rootless containers
- Prefer no daemon
- Want better security

Both use the same `docker-compose.yml` and `.sandbox-*` directories.

### Prerequisites

**Docker:**
- Docker Desktop (macOS/Windows) or Docker Engine (Linux)

**Podman:**
- Podman: `brew install podman` or `sudo apt-get install podman`
- podman-compose: `pip install podman-compose` ← **Required!**
- Podman machine (macOS only): `podman machine init && podman machine start`

## Troubleshooting

**podman-compose not found:**
```bash
pip install podman-compose
```

**Permission denied on .sandbox directories:**
```bash
make prep
chmod 755 .sandbox-*
```

**Container won't start:**
```bash
# Docker
make clean && make build

# Podman
make podman-clean && make podman-build
```

## Further Reading

- **[container-quickref.md](container-quickref.md)** - Quick command reference
- **[sandbox-directories.md](sandbox-directories.md)** - Understanding storage
- **[podman-usage.md](podman-usage.md)** - Complete Podman guide
- **[install-podman.md](install-podman.md)** - Installation steps

## Using Pre-installed CLIs

The container includes GitHub Copilot CLI pre-installed. Authenticate it:

**GitHub Copilot CLI:**
```bash
make shell
github-copilot-cli auth
```

**Claude CLI (manual install):**
```bash
make shell
# Follow instructions at: https://code.claude.com/docs/en/setup
```

**Codex CLI (manual install):**
```bash
make shell
# Follow instructions at: https://developers.openai.com/codex/cli/
```

Authentication is persisted in `.sandbox-home/` so you only need to do it once.
