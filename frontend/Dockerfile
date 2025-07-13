# Stage 1: Build the React app
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy all source files
COPY . .

# Build the app for production
RUN npm run build

# Stage 2: Serve app with Nginx
FROM nginx:stable-alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx server
CMD ["nginx", "-g", "daemon off;"]
