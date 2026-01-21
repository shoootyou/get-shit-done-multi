# Podman Usage Guide

Complete guide for using Podman instead of Docker.

## What is Podman?

Podman is a daemonless, rootless container runtime compatible with Docker. This project uses `podman-compose` to reuse the same `docker-compose.yml` configuration.

**Benefits:**
- No background daemon needed
- Rootless by default (better security)
- Same commands as Docker (via podman-compose)
- Uses docker-compose.yml (no duplicate config)

## Installation

See [install-podman.md](install-podman.md) for detailed installation instructions.

**Quick install:**
```bash
# macOS
brew install podman podman-compose
podman machine init && podman machine start

# Linux
sudo apt-get install podman
pip install podman-compose
```

## Basic Usage

All commands are prefixed with `podman-`:

```bash
make podman-build  # Build image
make podman-net    # Interactive shell (with network)
make podman-nonet  # Interactive shell (no network)
make podman-shell  # Start and attach
make podman-clean  # Remove everything
```

## Common Workflows

### Install packages

```bash
make podman-net

# Inside container:
pip install pandas numpy
npm install express
# Cached in .sandbox-cache/
exit
```

### Run without network

```bash
# First: install with network
make podman-net
pip install requests
exit

# Then: run isolated
make podman-nonet
python3 -c "import requests; print('Works!')"
```

### Persistent session

```bash
make podman-up      # Start in background
make podman-exec    # Connect

# Work, disconnect, reconnect
make podman-exec    # Still running

# Stop when done
make podman-down
```

## Podman vs Docker

| Feature | Podman | Docker |
|---------|--------|--------|
| Daemon | No | Yes |
| Root required | No (rootless) | Usually yes |
| File ownership | Your user | Often root |
| Commands | `make podman-*` | `make *` |
| Config file | docker-compose.yml | docker-compose.yml |

**Both use the same config!** Just different command prefixes.

## Troubleshooting

**podman-compose not found:**
```bash
pip install podman-compose
podman-compose --version
```

**Permission denied:**
```bash
make prep
chmod 755 .sandbox-*
```

**Container won't start:**
```bash
make podman-clean
make podman-build
```

**Podman machine issues (macOS):**
```bash
podman machine stop
podman machine rm
podman machine init
podman machine start
```

## Further Reading

- **[install-podman.md](install-podman.md)** - Installation steps
- **[container-quickref.md](container-quickref.md)** - Command reference
- **[sandbox-directories.md](sandbox-directories.md)** - Storage explained
- **[containers-readme.md](containers-readme.md)** - Overview
