FROM mcr.microsoft.com/vscode/devcontainers/base:ubuntu-22.04

# Install tools: build essentials, Ruby, Node, and utilities
ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get update \
    && apt-get -y install --no-install-recommends \
       build-essential \
       curl \
       git \
       ca-certificates \
       libssl-dev \
       libreadline-dev \
       zlib1g-dev \
       locales \
       nodejs \
       npm \
    && rm -rf /var/lib/apt/lists/*

# Set locale
RUN locale-gen en_US.UTF-8
ENV LANG=en_US.UTF-8 LANGUAGE=en_US:en LC_ALL=en_US.UTF-8

# Install Ruby via apt (sufficient for most Jekyll sites). For pinned versions use rbenv.
RUN apt-get update \
    && apt-get -y install --no-install-recommends ruby-full \
    && rm -rf /var/lib/apt/lists/*

# Install Bundler and Jekyll globally
RUN gem install bundler:2.4.13 jekyll webrick --no-document

# Create a non-root user (same UID/GID as Codespaces defaults) and set workspace
ARG USER=vscode
ARG UID=1000
ARG GID=1000
RUN groupadd --gid $GID $USER || true \
    && useradd -s /bin/bash --uid $UID --gid $GID -m $USER || true

USER $USER
WORKDIR /workspace

CMD ["/bin/bash"]
