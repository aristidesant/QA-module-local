# Stage 1: Build the SPA
FROM public.ecr.aws/docker/library/node:22.22.1-alpine AS build
WORKDIR /app
ARG VITE_APP_API_URL
ARG VITE_APP_QA_API_URL
ARG VITE_APP_SIP_MONITOR_ORIGIN
ENV VITE_APP_API_URL=$VITE_APP_API_URL
ENV VITE_APP_QA_API_URL=$VITE_APP_QA_API_URL
ENV VITE_APP_SIP_MONITOR_ORIGIN=$VITE_APP_SIP_MONITOR_ORIGIN
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Stage 2: Serve with Nginx
FROM public.ecr.aws/nginx/nginx:1.30-alpine3.23
ARG VITE_APP_API_URL
ARG VITE_APP_QA_API_URL
ARG VITE_APP_SIP_MONITOR_ORIGIN
ENV PORT=80
# Both backend origins must be allowed by the CSP connect-src directive.
ENV CSP_CONNECT_SRC="$VITE_APP_API_URL $VITE_APP_QA_API_URL"
ENV CSP_FRAME_SRC=$VITE_APP_SIP_MONITOR_ORIGIN
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
