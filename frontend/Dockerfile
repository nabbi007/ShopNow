# syntax=docker/dockerfile:1

# ---- Build stage: compile the React (CRA) app into static files ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# API base URL baked into the build. Defaults to the relative "/api" path so the
ARG REACT_APP_API_URL=/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build

# ---- Runtime stage: serve the static build with nginx + proxy /api -> backend ----
FROM nginx:1.27-alpine AS runtime

# nginx's entrypoint renders templates with envsubst; the filter keeps it from
# clobbering nginx runtime vars like $uri / $host — only $BACKEND_HOST is replaced.
ENV BACKEND_HOST=backend:8000
ENV NGINX_ENVSUBST_FILTER=BACKEND_HOST

COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80
# Use nginx's default entrypoint/cmd (templating + start).
