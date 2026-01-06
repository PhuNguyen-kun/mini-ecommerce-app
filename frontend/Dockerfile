# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Cấu hình npm để tăng timeout và retry
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000

# Copy package files
COPY package*.json ./

# Install dependencies với retry logic
RUN npm ci --prefer-offline --no-audit || \
    (sleep 5 && npm ci --prefer-offline --no-audit) || \
    (sleep 10 && npm ci --prefer-offline --no-audit)

# Copy source code
COPY . .

# Build với environment variable
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 2: Serve với Nginx
FROM nginx:alpine

# Copy build files từ stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

