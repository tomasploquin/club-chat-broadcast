# Club Chat Broadcast - Docker Setup

This project consists of 3 main services that work together:

1. **React Frontend** (Vite + TypeScript + shadcn/ui)
2. **Python Flask Backend** (API server)
3. **Go WhatsApp Bridge** (WhatsApp Web integration)

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- At least 4GB of available RAM
- Port 3000, 5001, 5173, and 8082 available on your machine

### Development Mode (with hot reload)

```bash
# Start all services in development mode
docker-compose --profile dev up --build

# Or start specific services
docker-compose up whatsapp-bridge backend frontend-dev --build
```

**Development URLs:**
- Frontend: http://localhost:5173 (React dev server with hot reload)
- Backend API: http://localhost:5001
- WhatsApp Bridge: http://localhost:8082

### Production Mode

```bash
# Start all services in production mode
docker-compose --profile prod up --build

# Or build and start without profiles (backend + whatsapp-bridge only)
docker-compose up --build
```

**Production URLs:**
- Frontend: http://localhost:3000 (Nginx-served optimized build)
- Backend API: http://localhost:5001
- WhatsApp Bridge: http://localhost:8082

## Service Details

### 1. WhatsApp Bridge Service (Go)
- **Port:** 8082
- **Purpose:** Handles WhatsApp Web connection and message sending
- **Health Check:** Available at `/status` endpoint
- **Data Persistence:** WhatsApp session data stored in Docker volume

### 2. Backend Service (Python Flask)
- **Port:** 5001
- **Purpose:** Main API server, file uploads, message queuing
- **Dependencies:** Requires WhatsApp Bridge to be healthy
- **Features:** 
  - Message broadcasting
  - File upload handling
  - WhatsApp status checking
  - Contact management

### 3. Frontend Service (React)
- **Development Port:** 5173 (Vite dev server)
- **Production Port:** 3000 (Nginx)
- **Purpose:** User interface for the chat broadcast system
- **API Integration:** Connects to backend at port 5001

## First Time Setup

1. **Clone and navigate to the project:**
   ```bash
   cd club-chat-broadcast
   ```

2. **Start the services:**
   ```bash
   # For development
   docker-compose --profile dev up --build
   
   # For production
   docker-compose --profile prod up --build
   ```

3. **Connect WhatsApp:**
   - Open the frontend (http://localhost:5173 or http://localhost:3000)
   - Go to WhatsApp connection section
   - Scan the QR code with your WhatsApp mobile app
   - Wait for connection confirmation

4. **Start broadcasting:**
   - Upload your contact list
   - Compose your message
   - Send to selected contacts

## Docker Commands

### Building Services
```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build whatsapp-bridge
docker-compose build backend
docker-compose build frontend
```

### Managing Services
```bash
# Start services
docker-compose up -d                    # Background mode
docker-compose --profile dev up -d      # Development mode
docker-compose --profile prod up -d     # Production mode

# Stop services
docker-compose down

# View logs
docker-compose logs -f                  # All services
docker-compose logs -f whatsapp-bridge  # Specific service

# Restart service
docker-compose restart backend
```

### Data Management
```bash
# Remove all containers and networks
docker-compose down

# Remove all data (including WhatsApp session)
docker-compose down -v

# View volume information
docker volume ls
docker volume inspect club-chat-broadcast_whatsapp_data
```

## Troubleshooting

### WhatsApp Connection Issues
1. Check if the bridge service is healthy:
   ```bash
   curl http://localhost:8082/status
   ```

2. View bridge logs:
   ```bash
   docker-compose logs -f whatsapp-bridge
   ```

3. Reset WhatsApp session:
   ```bash
   docker-compose down
   docker volume rm club-chat-broadcast_whatsapp_data
   docker-compose up --build
   ```

### Backend API Issues
1. Check backend logs:
   ```bash
   docker-compose logs -f backend
   ```

2. Verify backend health:
   ```bash
   curl http://localhost:5001/api/whatsapp/status
   ```

### Frontend Issues
1. For development mode, check if hot reload is working:
   ```bash
   docker-compose logs -f frontend-dev
   ```

2. For production mode, check Nginx logs:
   ```bash
   docker-compose logs -f frontend
   ```

### Port Conflicts
If you have port conflicts, you can modify the ports in `docker-compose.yml`:

```yaml
services:
  backend:
    ports:
      - "5002:5001"  # Change external port to 5002
```

## Environment Variables

You can customize the setup using environment variables:

```bash
# Create a .env file
cat > .env << EOF
# Backend Configuration
PORT=5001
FLASK_ENV=production
GO_BRIDGE_BASE_URL=http://whatsapp-bridge:8082

# Frontend Configuration  
VITE_API_URL=http://localhost:5001
EOF
```

## Performance Tips

1. **For Development:**
   - Use `--profile dev` for hot reload
   - Mount source code as volumes for instant changes

2. **For Production:**
   - Use `--profile prod` for optimized builds
   - Nginx serves static files efficiently
   - Multi-worker Gunicorn for backend

3. **Resource Allocation:**
   - WhatsApp Bridge: ~100MB RAM
   - Backend: ~200MB RAM  
   - Frontend: ~50MB RAM (production)
   - Frontend Dev: ~300MB RAM (with Node.js)

## Security Notes

- The setup includes proper service isolation
- Non-root users in containers where possible
- Health checks to ensure service availability
- Proper volume mounting for data persistence

## Next Steps

After successful setup:
1. Configure your contact lists
2. Test message sending with a small group
3. Set up monitoring (optional)
4. Configure backups for WhatsApp session data
5. Consider setting up SSL/TLS for production use 