# Use the official Node.js image as the base image (e.g., Node.js version 18)
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory in the container
COPY package*.json ./

# Install the dependencies defined in package.json
RUN npm install

# Copy the entire source code into the container
COPY . .

# Build the TypeScript files (if applicable, modify the build script if necessary)
RUN npm run build

# Expose port 3000, which the application will listen on (adjust port if needed)
EXPOSE 3000

# Set the default command to run the application in development mode using ts-node-dev
CMD ["npm", "run", "dev"]
