# ------------- Builder -------------
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS builder

# Optimize build and avoid re-downloading Python
ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_DOWNLOADS=0

WORKDIR /app

# Install dependencies only (lock + pyproject)
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --locked --no-install-project --no-dev

# Copy full project and install
COPY . /app
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --no-dev

# ------------- Runtime --------------
FROM python:3.12-slim-bookworm AS base

COPY --from=builder /usr/local/bin/uv /usr/local/bin/uv

# Create non-root user
RUN groupadd --system --gid 999 nonroot \
    && useradd --system --gid 999 --uid 999 --create-home nonroot

WORKDIR /app

# Copy environment from builder
COPY --from=builder --chown=nonroot:nonroot /app /app

# Add venv binaries to PATH
ENV PATH="/app/.venv/bin:$PATH"

# Common environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

USER nonroot

# ------------ MIGRATIONS ------------
FROM base AS migrations
CMD ["uv", "run", "alembic", "upgrade", "head"]

# --------------- API ----------------
FROM base AS api
CMD ["uv", "run", "-m", "src.api"]

# -------------- TG BOT --------------
FROM base AS bot
CMD ["uv", "run", "-m", "src.modules.bot"]

# FROntend
FROM nginx:alpine AS frontend

COPY static/ /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/default.conf
COPY ssl/ /etc/nginx/ssl/

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
