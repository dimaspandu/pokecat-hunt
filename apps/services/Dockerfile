# Stage 1: Build the Go binary
FROM golang:1.22-alpine AS builder
WORKDIR /app

# Install git for fetching dependencies
RUN apk add --no-cache git

# Copy Go module files and download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the source code
COPY . .

# Build the service binary from the services folder
RUN go build -o cats-service ./services

# Stage 2: Create a lightweight runtime image
FROM alpine:3.20
WORKDIR /app

# Copy the compiled binary from the builder stage
COPY --from=builder /app/cats-service .

# Expose the application port
EXPOSE 5000

# Start the service
CMD ["./cats-service"]
