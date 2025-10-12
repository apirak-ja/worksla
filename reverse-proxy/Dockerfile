FROM nginx:alpine

# Install openssl for certificate generation
RUN apk add --no-cache openssl

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create certs directory
RUN mkdir -p /etc/nginx/certs

# Copy certificate generation script
COPY generate-certs.sh /docker-entrypoint.d/00-generate-certs.sh
RUN chmod +x /docker-entrypoint.d/00-generate-certs.sh

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider https://localhost:443/health --no-check-certificate || exit 1

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
