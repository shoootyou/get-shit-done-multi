# Sandbox Directories

> **Note:** This guide applies to both Docker and Podman. For Podman-specific info, see [podman-usage.md](podman-usage.md).

## What Are They?

The `.sandbox-*` directories provide persistent storage for the container environment. They keep your data separate from your source code.

## Quick Start

Directories are created automatically:

**Docker:**
```bash
make net  # Automatically creates .sandbox-* dirs
```

**Podman:**
```bash
make podman-net  # Automatically creates .sandbox-* dirs
```

You don't need to manage these manually. The container uses them automatically.

## The Three Directories

### `.sandbox-home/`
**Maps to:** `/home/sandbox` in container  
**Stores:** User configs, shell history, SSH keys

Without this, every restart resets your history and configs.

---

### `.sandbox-cache/`
**Maps to:** `/home/sandbox/.cache` in container  
**Stores:** Package caches (pip, npm, etc.)

Dramatically speeds up package installs by caching downloads.

---

### `.sandbox-rw/`
**Maps to:** `/workspace-rw` in container  
**Stores:** Generated files and outputs

Keeps generated content separate from your source code.

## How to Use

### Automatic (Recommended)

Just use the commands - directories work transparently:

```bash
make net  # or: make podman-net

# Inside container:
pip install requests  # Cached in .sandbox-cache/
npm install express   # Cached in .sandbox-cache/
history              # Persists in .sandbox-home/
```

### Access from Host

If you need to inspect or access files:

```bash
# View cached packages
ls -lh .sandbox-cache/

# Check user configs
ls -la .sandbox-home/

# Access generated outputs
ls .sandbox-rw/
```

### Access from Container

```bash
make shell  # or: make podman-shell

# Your project code
cd /workspace

# Write outputs here
cd /workspace-rw
python3 generate.py > report.html

# User home (configs, history)
cd ~  # This is .sandbox-home/ on host

# Package cache
ls ~/.cache  # This is .sandbox-cache/ on host
```

## Examples

### Install with cache

```bash
# First time
make net
pip install pandas numpy
# Downloads packages

# Later (after make clean)
make net
pip install pandas numpy
# Uses cache - instant!
```

### Generate outputs

```bash
make shell

# Inside container:
cd /workspace-rw
python3 <<EOF
with open('report.html', 'w') as f:
    f.write('<h1>Report</h1>')
EOF
exit

# On host:
open .sandbox-rw/report.html
```

### Persistent history

```bash
make net
history
exit

# Later:
make net
history  # Previous commands still there!
```

## Cleanup

### Keep everything
```bash
make down  # Stops container, keeps .sandbox-* dirs
```

### Remove everything
```bash
make clean  # Removes container AND .sandbox-* dirs
```

## Further Reading

- **[container-quickref.md](container-quickref.md)** - Command reference
- **[containers-readme.md](containers-readme.md)** - Overview
- **[podman-usage.md](podman-usage.md)** - Podman guide
