# Builder stage
FROM node:20-alpine AS build-stage

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Copy prisma directory before npm install (needed for postinstall prisma generate)
COPY prisma ./prisma/

# Install ALL dependencies (including dev dependencies)
RUN npm install

# Explicitly generate Prisma client
RUN npx prisma generate

# Copy source code and build application
COPY . .
RUN npm run build && ls -la dist

# Production stage
FROM node:20-alpine AS production

# Install PostgreSQL client, cron, and build dependencies
RUN apk add --no-cache postgresql-client python3 make g++ cronie

WORKDIR /app

# Copy package files and install ONLY production dependencies
COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts && \
    npm install -g ts-node typescript && \
    npm rebuild bcrypt --build-from-source

# Copy Prisma files
COPY prisma ./prisma/
RUN npx prisma generate

# Copy built application from builder
COPY --from=build-stage /app/dist ./dist
COPY --from=build-stage /app/node_modules/.prisma ./node_modules/.prisma

# Copy necessary TypeScript type definitions
COPY --from=build-stage /app/node_modules/@types ./node_modules/@types

# Copy additional required dependencies
COPY --from=build-stage /app/node_modules/@nestjs ./node_modules/@nestjs
COPY --from=build-stage /app/node_modules/keyv ./node_modules/keyv
COPY --from=build-stage /app/node_modules/json-buffer ./node_modules/json-buffer
COPY --from=build-stage /app/node_modules/cache-manager ./node_modules/cache-manager

# Create a custom package.json for production
RUN echo '{"name":"zolara","version":"0.0.1","scripts":{"start":"node dist/src/main.js","start:prod":"node dist/src/main.js","db:migrate":"prisma migrate deploy","db:seed":"prisma db seed","db:setup":"npm run db:migrate"},"prisma":{"seed":"ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"}}' > package.json

# Copy seed data and TypeScript config
COPY --from=build-stage /app/prisma/seed.ts ./prisma/
COPY --from=build-stage /app/tsconfig.json ./

# Expose port
EXPOSE 3000

# Start application with database setup and seeding
CMD npm run db:setup && npm run db:seed && npm start