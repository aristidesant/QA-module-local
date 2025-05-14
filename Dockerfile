FROM node:20-alpine AS base
WORKDIR /app

# Generate a fresh package-lock.json
COPY package.json ./
RUN npm install --package-lock-only

# Install development dependencies
FROM node:20-alpine AS development-dependencies-env
WORKDIR /app
COPY --from=base /app/package.json ./
COPY --from=base /app/package-lock.json ./
COPY . .
RUN npm install

# Install production dependencies
FROM node:20-alpine AS production-dependencies-env
WORKDIR /app
COPY --from=base /app/package.json ./
COPY --from=base /app/package-lock.json ./
RUN npm install --omit=dev

# Build the app
FROM node:20-alpine AS build-env
WORKDIR /app
COPY --from=development-dependencies-env /app ./
RUN npm run build

# Final image
FROM node:20-alpine
WORKDIR /app
COPY --from=base /app/package.json ./
COPY --from=base /app/package-lock.json ./
COPY --from=production-dependencies-env /app/node_modules ./node_modules
COPY --from=build-env /app/build ./build
CMD ["npm", "run", "start"]