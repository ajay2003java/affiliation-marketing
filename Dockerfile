# ==========================================
# 1. Build Stage
# ==========================================
FROM node:20-alpine AS build

WORKDIR /app

# Accept Vite environment variables at build time
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Copy dependency manifests
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Build production assets
RUN npm run build

# ==========================================
# 2. Production Stage (Lightweight Nginx)
# ==========================================
FROM nginx:alpine

# Copy custom Nginx configuration with SPA routing support
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
