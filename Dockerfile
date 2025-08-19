# Stage 1: Build the SPA
FROM node:20-alpine AS build
WORKDIR /app
ARG VITE_APP_API_URL
ENV VITE_APP_API_URL=$VITE_APP_API_URL
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Stage 2: Serve with Nginx
FROM nginx:1.27-alpine
RUN printf '#!/bin/sh\nsed -i "s/listen 80;/listen ${PORT:-80};/" /etc/nginx/conf.d/default.conf\nexec nginx -g "daemon off;"\n' > /docker-entrypoint.sh && chmod +x /docker-entrypoint.sh
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
CMD ["/docker-entrypoint.sh"]