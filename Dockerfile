# Use official Node image
FROM node:20-alpine AS builder
WORKDIR /app

# build deps for native modules (only during build)
RUN apk add --no-cache python3 make g++ git

COPY package*.json ./
RUN npm ci

COPY . .

# build if the project has a build script (no-op otherwise)
RUN if npm run | grep -q ' build'; then npm run build; fi

FROM node:20-alpine
WORKDIR /app

# create non-root user
RUN addgroup -S app && adduser -S app -G app

# copy production deps and built output
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/index.js ./index.js

ENV NODE_ENV=production
USER app

EXPOSE 3000

# Prefer built output (dist); fallback to index.js
CMD ["sh", "-lc", "node ./dist/index.js || node ./index.js"]