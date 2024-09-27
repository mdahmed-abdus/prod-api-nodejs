# Using lightweight docker image for node
FROM node:20-alpine AS base

# Setting up working directory
WORKDIR /usr/src/backend-app

# Copying package files
COPY package*.json ./

# Installing dependencies
RUN npm ci

# Copying files
COPY . .

# Exposing port
EXPOSE 3000

# Start application
CMD ["npm", "run", "dev"]
