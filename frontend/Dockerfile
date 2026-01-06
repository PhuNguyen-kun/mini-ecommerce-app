# Frontend Dockerfile - Chỉ serve static files
# Build được thực hiện trên GitHub Actions, dist/ được upload lên EC2
FROM nginx:alpine

# Copy build files (sẽ được upload từ GitHub Actions)
COPY dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

