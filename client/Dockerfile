# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install --include=dev

# Copy source
COPY . .

# Build args (Railway injects these at build time)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ── Stage 2: Serve ────────────────────────────────────────────────────────────
FROM nginx:alpine AS runner

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx config for SPA routing (React Router)
RUN rm /etc/nginx/conf.d/default.conf

CMD echo "server { \
  listen ${PORT:-80}; \
  root /usr/share/nginx/html; \
  index index.html; \
  location / { \
    try_files \$uri \$uri/ /index.html; \
  } \
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)\$ { \
    expires 1y; \
    add_header Cache-Control \"public, immutable\"; \
  } \
}" > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'
