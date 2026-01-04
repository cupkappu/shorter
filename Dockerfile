# Multi-stage build for Next.js app
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json ./
# Install all deps (dev needed for build)
RUN npm install

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Ensure data directory exists for volume
RUN mkdir -p /app/data

# Copy only what is needed to run
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

EXPOSE 3000
CMD ["npm", "run", "start"]
