# Container Quick Reference

Simple command reference for Docker and Podman workflows.

## Docker Commands

```bash
make prep          # Create .sandbox-* directories
make build         # Build image
make net           # Interactive shell (with network)
make nonet         # Interactive shell (no network)
make shell         # Start and attach
make up            # Start in background
make exec          # Connect to running container
make down          # Stop and remove
make logs          # View logs
make clean         # Remove everything
```

## Podman Commands

> **Prerequisites:** `podman` and `podman-compose` must be installed. See [install-podman.md](install-podman.md).

```bash
make podman-build  # Build image
make podman-net    # Interactive shell (with network)
make podman-nonet  # Interactive shell (no network)
make podman-shell  # Start and attach
make podman-up     # Start in background
make podman-exec   # Connect to running container
make podman-down   # Stop and remove
make podman-logs   # View logs
make podman-clean  # Remove everything
```

## Common Workflows

### Authenticate GitHub Copilot CLI (first time)

```bash
make shell

# Inside container:
github-copilot-cli auth

# Auth is persisted in .sandbox-home/
```

### Install packages (cached for speed)

```bash
make net  # or: make podman-net

# Inside container:
pip install pandas numpy
npm install express

# Packages cached in .sandbox-cache/
# Next install will be instant
```

### Run isolated (without network)

```bash
# First: install with network
make net
pip install requests
exit

# Then: run without network
make nonet
python3 -c "import requests; print('Works!')"
```

### Persistent development session

```bash
make up            # or: make podman-up
make exec          # or: make podman-exec

# Work, disconnect, reconnect later
make exec          # Still running

# When done:
make down          # or: make podman-down
```

### Generate outputs

```bash
make shell

# Inside container:
cd /workspace-rw
python3 script.py > output.txt
exit

# On host:
cat .sandbox-rw/output.txt
```

## Directory Mapping

| Host | Container | Purpose |
|------|-----------|---------|
| `.` | `/workspace` | Source code |
| `.sandbox-rw/` | `/workspace-rw` | Outputs |
| `.sandbox-home/` | `/home/sandbox` | User configs |
| `.sandbox-cache/` | `/home/sandbox/.cache` | Package cache |

## Choosing Docker vs Podman

**Use Docker if:**
- Already using Docker
- Want simplicity
- Team standardized on Docker

**Use Podman if:**
- Need rootless containers
- Want better security
- Prefer no daemon

Both use the same `docker-compose.yml` configuration.

## Further Reading

- **[containers-readme.md](containers-readme.md)** - Complete overview
- **[podman-usage.md](podman-usage.md)** - Podman guide
- **[sandbox-directories.md](sandbox-directories.md)** - Storage explained
- **[install-podman.md](install-podman.md)** - Installation steps
