#!/bin/sh

# Generate self-signed certificate if not exists
if [ ! -f "/etc/nginx/certs/cert.pem" ] || [ ! -f "/etc/nginx/certs/key.pem" ]; then
    echo "Generating self-signed SSL certificate..."
    
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/nginx/certs/key.pem \
        -out /etc/nginx/certs/cert.pem \
        -subj "/C=TH/ST=Nakhon Si Thammarat/L=Tha Sala/O=Walailak University/OU=Medical Center/CN=10.251.150.222"
    
    echo "SSL certificate generated successfully"
else
    echo "SSL certificate already exists"
fi
