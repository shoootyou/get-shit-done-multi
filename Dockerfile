ARG UBUNTU_VERSION=24.04
FROM ubuntu:${UBUNTU_VERSION}

ENV DEBIAN_FRONTEND=noninteractive \
    LANG=C.UTF-8 \
    LC_ALL=C.UTF-8

# Base + sudo + common tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    bash ca-certificates curl git tini sudo \
    python3 python3-venv python3-pip \
    nodejs npm \
  && rm -rf /var/lib/apt/lists/*

# Non-root user with passwordless sudo (for apt-get when needed)
ARG USERNAME=sandbox
ARG UID=1000
ARG GID=1000

# Create group/user robustly (base images may already have GID/UID in use)
RUN set -eux; \
  if ! getent group "${GID}" >/dev/null; then \
    groupadd -g "${GID}" "${USERNAME}"; \
  fi; \
  if ! id -u "${USERNAME}" >/dev/null 2>&1; then \
    useradd -m -u "${UID}" -g "${GID}" -s /bin/bash -o "${USERNAME}"; \
  fi; \
  echo "${USERNAME} ALL=(ALL) NOPASSWD:ALL" > "/etc/sudoers.d/${USERNAME}"; \
  chmod 0440 "/etc/sudoers.d/${USERNAME}"; \
  mkdir -p /workspace /workspace-rw; \
  chown -R "${USERNAME}:${GID}" /workspace-rw

WORKDIR /workspace
USER ${USERNAME}

ENTRYPOINT ["/usr/bin/tini","--"]
CMD ["bash"]