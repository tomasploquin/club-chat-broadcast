# Use official Go image as base
FROM golang:1.24-alpine AS builder

# Install necessary packages for building including C compiler
RUN apk add --no-cache git ca-certificates curl build-base musl-dev

# Set working directory
WORKDIR /app

# Copy go module files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the Go application
RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o main .

# Final stage
FROM alpine:latest

# Install ca-certificates and curl for health checks
RUN apk --no-cache add ca-certificates curl sqlite

WORKDIR /app

# Copy the binary from builder stage
COPY --from=builder /app/main .

# Create store directory for WhatsApp session data
RUN mkdir -p /app/store

# Expose port
EXPOSE 8082

# Run the application
CMD ["./main"] 