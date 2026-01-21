.PHONY: prep build net nonet up down exec shell run logs clean

prep:
	mkdir -p .sandbox-rw .sandbox-home .sandbox-cache

build: prep
	docker compose build

# Interactive run with network (install dependencies)
net: prep
	docker compose --profile net run --rm ia

# Interactive run without network (more isolated mode)
nonet: prep
	docker compose --profile nonet run --rm ia-nonet

# Short alias for interactive run
run: net

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