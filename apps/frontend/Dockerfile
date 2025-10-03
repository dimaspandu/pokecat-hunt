# Use official Node.js image as the base image (e.g., Node.js 18)
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if exists) to the container
COPY package*.json ./

# Install project dependencies (including devDependencies for building the frontend)
RUN npm install

# Copy the entire frontend source code into the container
COPY . .

# Expose port 5173 for Vite development server (adjust if using a different port)
EXPOSE 5173

# Command to run the application in development mode with Vite
CMD ["npm", "run", "dev"]
