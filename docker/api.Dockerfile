FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable || npm install -g pnpm

WORKDIR /app

COPY pnpm-workspace.yaml package.json turbo.json tsconfig.base.json ./
COPY packages/ packages/
COPY apps/api/ apps/api/

RUN pnpm install --frozen-lockfile=false

RUN pnpm --filter @hostel/shared build
RUN pnpm --filter @hostel/engine build
RUN pnpm --filter @hostel/api build

EXPOSE 5000
CMD ["pnpm", "--filter", "@hostel/api", "start"]
