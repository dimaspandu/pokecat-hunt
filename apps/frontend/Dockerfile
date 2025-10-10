# ---------- Stage 1: Build ----------
FROM node:18 AS builder

WORKDIR /app

# Copy only package files first for better caching
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# ---------- Stage 2: Serve ----------
FROM node:18-slim AS runner

WORKDIR /app

# Copy only built assets from builder stage
COPY --from=builder /app/dist ./dist
COPY package*.json ./

# Install only production dependencies (none needed for static serve)
RUN npm install -g serve

# Expose port for static server
EXPOSE 4173

# Serve built files
CMD ["serve", "-s", "dist", "-l", "4173"]
