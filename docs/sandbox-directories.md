# Docker Sandbox Directories

## Purpose

The `.sandbox-*` directories provide isolated, persistent storage for the Docker development environment. They keep container state separate from your project files, improving security and maintainability.

## Quick Start

The directories are **automatically created** when you run:
```bash
make prep
# or any make command that depends on prep (net, build, shell, etc.)
```

You don't need to manually interact with these directories - Docker manages them automatically. However, understanding them helps troubleshoot and optimize your workflow.

## Directories

### `.sandbox-home/`
**Mount Point:** `/home/sandbox` inside the container  
**Purpose:** Persistent home directory for the sandbox user

This directory preserves:
- Shell configuration files (`.bashrc`, `.bash_history`, etc.)
- User preferences and settings
- SSH keys and credentials (if needed)
- Any user-level configuration that should survive container restarts

**Why it matters:** Without this, every container restart would reset user preferences, command history, and configurations.

---

### `.sandbox-cache/`
**Mount Point:** `/home/sandbox/.cache` inside the container  
**Purpose:** Persistent cache directory for package managers and build tools

This directory stores:
- `pip` cache (Python packages)
- `npm` / `yarn` cache (Node.js packages)
- Build tool caches (compilation artifacts, etc.)
- Any application-level caches

**Why it matters:** Dramatically speeds up package installations and builds by reusing downloaded packages. Without this, every `pip install` or `npm install` would re-download everything.

---

### `.sandbox-rw/`
**Mount Point:** `/workspace-rw` inside the container  
**Purpose:** Safe write area for outputs and generated files

This directory is for:
- Test outputs and reports
- Generated files that shouldn't mix with source code
- Temporary artifacts
- Logs and diagnostic outputs

**Why it matters:** Keeps generated content separate from your codebase, making it easier to clean up and preventing accidental commits of build artifacts.

---

## Security Benefits

1. **Isolation:** Container writes don't scatter throughout your filesystem
2. **Clean separation:** Generated files stay out of version control
3. **Easy cleanup:** Delete these directories to reset the environment completely
4. **Reproducibility:** Fresh environment by removing `.sandbox-*` folders

## Management

### Creating directories
```bash
make prep
# or manually:
mkdir -p .sandbox-rw .sandbox-home .sandbox-cache
```

### Cleaning up
```bash
make clean
# This removes containers AND .sandbox-* directories
```

### Adding to .gitignore
These directories should be ignored by git (add to `.gitignore`):
```
.sandbox-home/
.sandbox-cache/
.sandbox-rw/
```

---

## How to Use

### Automatic Usage (Recommended)
The directories work transparently - just use the Makefile commands:

```bash
# 1. Start interactive shell with network
make net

# Inside container:
pip install requests  # Cached in .sandbox-cache/
npm install express   # Cached in .sandbox-cache/
cd ~/.bashrc          # Persists in .sandbox-home/
```

### Manual Access (if needed)

#### Accessing from Host
```bash
# View cached packages
ls -lh .sandbox-cache/

# Check user home persistence
ls -la .sandbox-home/

# Access generated outputs
ls .sandbox-rw/
```

#### Accessing from Container
```bash
make shell

# Inside container:
# Your project code
cd /workspace

# Write outputs here
cd /workspace-rw
python3 generate_report.py > report.html

# User home (configs, history)
cd ~  # This is /home/sandbox → .sandbox-home/ on host

# Package cache
ls ~/.cache  # This is .sandbox-cache/ on host
```

---

## Workflow Examples

### Example 1: Installing Dependencies
```bash
# First time (downloads packages)
make net
pip install pandas numpy matplotlib
# Packages cached in .sandbox-cache/

# Later (uses cache - much faster)
make clean  # Removes container but keeps .sandbox-cache/
make net
pip install pandas numpy matplotlib
# Uses cached packages - instant!
```

### Example 2: Generating Reports
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
open .sandbox-rw/report.html  # File is accessible!
```

### Example 3: Persistent Shell History
```bash
make net
history
export MY_VAR="important"
exit

# Later:
make net
history  # Your previous commands are still there!
# But MY_VAR is gone (use .bashrc for persistent exports)
```

### Example 4: Network Isolation
```bash
# Install with network
make net
pip install requests
exit

# Run without network (secure)
make nonet
python3 -c "import requests; print('Requests available!')"
# Works! Package is cached locally
```
