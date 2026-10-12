FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable || npm install -g pnpm

WORKDIR /app

COPY pnpm-workspace.yaml package.json turbo.json tsconfig.base.json ./
COPY packages/ packages/
COPY apps/web/ apps/web/

RUN pnpm install --frozen-lockfile=false

RUN pnpm --filter @hostel/shared build
RUN pnpm --filter @hostel/web build

EXPOSE 3000
CMD ["pnpm", "--filter", "@hostel/web", "start"]
