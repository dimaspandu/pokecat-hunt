# Use the official Node.js image as the base image (e.g., Node.js 18)
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml (if it exists) to the container
COPY package*.json pnpm-lock.yaml ./

# Install project dependencies using pnpm
RUN pnpm install

# Copy the entire source code into the container
COPY . .

# Expose the necessary ports (adjust based on your backend/frontend ports)
EXPOSE 3000 5173

# Command to run the application using concurrently (backend and frontend)
CMD ["pnpm", "dev"]
