# Container runtime selection (docker or podman)
CONTAINER_RUNTIME ?= docker
IMAGE_NAME = ubuntu-ia-env
CONTAINER_NAME = ubuntu-ia-env

.PHONY: prep build net nonet up down exec shell run logs clean run-rebuild
.PHONY: podman-build podman-net podman-nonet podman-shell podman-up podman-down podman-exec podman-logs podman-clean podman-run podman-run-rebuild

prep:
	mkdir -p .sandbox-rw .sandbox-home .sandbox-cache

# ============================================================================
# Docker Commands (using docker compose)
# ============================================================================

build: prep
	docker compose build ia

rebuild: prep
	docker compose build ia --no-cache

# Interactive run with network (install dependencies)
net: prep
	docker compose --profile net run --rm ia

# Interactive run without network (more isolated mode)
nonet: prep
	docker compose --profile nonet run --rm ia-nonet

# Short alias for interactive run
run: net

# Run with forced rebuild
run-rebuild: prep rebuild net

# Start service and connect automatically
shell: prep
	@docker compose --profile net up -d ia
	@docker exec -it ubuntu-ia-env bash

# Leave service running (with network) and then enter with exec
up: prep
	docker compose --profile net up -d ia

down:
	docker compose down

exec:
	docker exec -it ubuntu-ia-env bash

logs:
	docker compose logs -f

clean:
	docker compose down -v --remove-orphans
	rm -rf .sandbox-rw .sandbox-home .sandbox-cache

# ============================================================================
# Podman Commands (using podman-compose)
# ============================================================================

podman-build: prep
	podman-compose build ia

podman-rebuild: prep
	podman-compose build ia --no-cache

# Interactive run with network (install dependencies)
podman-net: prep
	podman-compose --profile net run --rm ia

# Interactive run without network (more isolated mode)
podman-nonet: prep
	podman-compose --profile nonet run --rm ia-nonet

# Short alias for interactive run
podman-run: podman-net

# Run with forced rebuild
podman-run-rebuild: prep podman-rebuild podman-net

# Start service and connect automatically
podman-shell: prep
	@podman-compose --profile net up -d ia
	@podman exec -it $(CONTAINER_NAME) bash

# Leave service running (with network) and then enter with exec
podman-up: prep
	podman-compose --profile net up -d ia

podman-down:
	podman-compose down

podman-exec:
	podman exec -it $(CONTAINER_NAME) bash

podman-logs:
	podman-compose logs -f

podman-clean:
	podman-compose down -v
	rm -rf .sandbox-rw .sandbox-home .sandbox-cache