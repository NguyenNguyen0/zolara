#!/bin/sh

# Replace env vars in env-config.js
envsubst < /usr/share/nginx/html/env-config.template.js > /usr/share/nginx/html/env-config.js

# Start nginx
exec nginx -g 'daemon off;'
