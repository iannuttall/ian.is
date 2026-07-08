FROM node:24-bookworm-slim AS build

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/newsletter/package.json ./apps/newsletter/package.json
COPY apps/newsletter/turbo.json apps/newsletter/tsconfig.base.json apps/newsletter/biome.json ./apps/newsletter/
COPY apps/newsletter/packages ./apps/newsletter/packages
COPY apps/newsletter/migrations ./apps/newsletter/migrations
COPY apps/newsletter/emails ./apps/newsletter/emails
COPY apps/newsletter/scripts ./apps/newsletter/scripts

RUN pnpm install --frozen-lockfile
RUN pnpm --filter email build
RUN pnpm --filter @email/cli deploy --legacy --prod /app/runtime
RUN pnpm --filter @email/web deploy --legacy --prod /app/web-runtime

FROM node:24-bookworm-slim AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/runtime ./
COPY --from=build /app/web-runtime ./web
COPY --from=build /app/apps/newsletter/migrations ./migrations

EXPOSE 3000
CMD ["node", "dist/index.js", "api", "serve"]
