FROM oven/bun:latest

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json bun.lock ./
COPY db/prisma/schema.prisma db/prisma/schema.prisma
COPY db/prisma.config.ts db/prisma.config.ts
COPY db/src/seed.ts db/src/seed.ts

RUN bun install

COPY . .

RUN bunx --bun prisma generate --config db/prisma.config.ts

EXPOSE 5000

CMD ["sh", "-c", "bunx --bun prisma migrate deploy --config db/prisma.config.ts && bun run db/src/seed.ts && bun run src/index.ts"]
