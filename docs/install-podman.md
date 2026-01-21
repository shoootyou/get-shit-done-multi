# Installing Podman

Step-by-step guide to install Podman and podman-compose.

## Quick Start

**What you need:**
1. Podman (container runtime)
2. podman-compose (to use docker-compose.yml)

## macOS

```bash
# Install Podman
brew install podman

# Install podman-compose
pip install podman-compose

# Initialize Podman machine
podman machine init
podman machine start

# Verify
podman --version
podman-compose --version
podman info
```

**Test it:**
```bash
cd /path/to/get-shit-done
make podman-build
make podman-net
```

## Linux (Ubuntu/Debian)

```bash
# Install Podman
sudo apt-get update
sudo apt-get install -y podman

# Install podman-compose
pip install podman-compose

# Verify
podman --version
podman-compose --version
```

**Test it:**
```bash
cd /path/to/get-shit-done
make podman-build
make podman-net
```

## Linux (Fedora/RHEL)

```bash
# Install Podman
sudo dnf install -y podman

# Install podman-compose
pip install podman-compose

# Verify
podman --version
podman-compose --version
```

## Linux (Arch)

```bash
# Install Podman
sudo pacman -S podman

# Install podman-compose (choose one)
pip install podman-compose
# OR from AUR:
yay -S podman-compose

# Verify
podman --version
podman-compose --version
```

## Windows (WSL2)

```bash
# Inside WSL2 terminal:

# Install Podman
sudo apt-get update
sudo apt-get install -y podman

# Install podman-compose
pip install podman-compose

# Verify
podman --version
podman-compose --version
```

## Troubleshooting

### podman-compose not found

**Solution:**
```bash
pip install podman-compose

# Add to PATH if needed
export PATH="$HOME/.local/bin:$PATH"  # Linux
export PATH="$HOME/Library/Python/3.x/bin:$PATH"  # macOS
```

### Podman machine won't start (macOS)

**Solution:**
```bash
podman machine stop
podman machine rm
podman machine init
podman machine start
```

### Permission denied (Linux)

**Solution:**
```bash
# Allow rootless Podman
echo "user.max_user_namespaces=28633" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## Next Steps

After installation:

```bash
# Build the image
make podman-build

# Start interactive shell
make podman-net

# Inside container:
pip install requests
npm install express
exit
```

## Why podman-compose?

This project uses `podman-compose` to reuse the same `docker-compose.yml` as Docker.

**Benefits:**
- No duplicate config files
- Same behavior as Docker
- Simple Makefile
- Easy to maintain

## Further Reading

- [podman-usage.md](podman-usage.md) - Complete usage guide
- [container-quickref.md](container-quickref.md) - Command reference
- [sandbox-directories.md](sandbox-directories.md) - Understanding storage
