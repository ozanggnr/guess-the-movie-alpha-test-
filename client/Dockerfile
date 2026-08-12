# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --include=dev

COPY . .

# Build args (Railway injects these at build time)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ── Stage 2: Serve ────────────────────────────────────────────────────────────
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html

# Copy our nginx config template (uses __PORT__ as placeholder, not $PORT)
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# At runtime: replace __PORT__ with the real PORT Railway injects, then start nginx
CMD sh -c "sed s/__PORT__/${PORT:-80}/ /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"

