FROM node:20-alpine

WORKDIR /app

# Copy package configuration files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all core files into the container
COPY . .

# Expose the API server port
EXPOSE 8080
