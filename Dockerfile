ARG UBUNTU_VERSION=24.04
FROM ubuntu:${UBUNTU_VERSION}

ENV DEBIAN_FRONTEND=noninteractive \
    LANG=C.UTF-8 \
    LC_ALL=C.UTF-8

# Base + sudo + common tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    bash ca-certificates curl git tini sudo wget gnupg \
    python3 python3-venv python3-pip \
    libsecret-1-0 \
  && rm -rf /var/lib/apt/lists/*

# Install Node.js 20 (required for Copilot CLI)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
  && apt-get install -y nodejs \
  && rm -rf /var/lib/apt/lists/*

# Install GitHub CLI
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
  && chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
  && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
  && apt-get update \
  && apt-get install -y gh \
  && rm -rf /var/lib/apt/lists/*

# Non-root user with passwordless sudo
ARG USERNAME=sandbox
ARG UID=9999
ARG GID=9999

# Create group/user robustly
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

# Install OpenAI Codex CLI (requires root for global npm install)
# Docs: https://developers.openai.com/codex/cli/
RUN npm i -g @openai/codex

# Switch to non-root user for remaining CLI installations
USER ${USERNAME}
WORKDIR /home/${USERNAME}

# Create local bin directory
RUN mkdir -p /home/${USERNAME}/.local/bin
ENV PATH="/home/${USERNAME}/.local/bin:${PATH}"

# Install Claude Code CLI
# Docs: https://code.claude.com/docs/en/setup
RUN curl -fsSL https://claude.ai/install.sh | sudo bash

# Install GitHub Copilot CLI
# Docs: https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli
RUN curl -fsSL https://gh.io/copilot-install | sudo bash

# Return to root to finish setup
USER root

# Set final working directory and user
WORKDIR /workspace
USER ${USERNAME}

ENTRYPOINT ["/usr/bin/tini","--"]
CMD ["bash"]