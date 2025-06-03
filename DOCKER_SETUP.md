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

### 1. Clone and Setup
```bash
git clone <repository-url>
cd club-chat-broadcast
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
# Backend Configuration
FLASK_PORT=5001
FLASK_ENV=production
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# WhatsApp Bridge Configuration
WHATSAPP_BRIDGE_PORT=8082
BRIDGE_URL=http://whatsapp-bridge:8082

# Frontend Configuration
VITE_API_URL=http://localhost:5001
VITE_BRIDGE_URL=http://localhost:8082

# Production URLs (when using nginx)
VITE_API_URL_PROD=http://localhost:8080/api
VITE_BRIDGE_URL_PROD=http://localhost:8080/bridge
```

### 3. Run with Docker Compose

#### Development Mode (with hot reload):
```bash
docker-compose --profile dev up --build
```

#### Production Mode (optimized builds):
```bash
docker-compose --profile prod up --build
```

#### Run specific services:
```bash
# Backend only
docker-compose up backend

# Frontend only (dev)
docker-compose --profile dev up frontend-dev

# WhatsApp Bridge only
docker-compose up whatsapp-bridge

# All services in detached mode
docker-compose --profile prod up -d
```

## Service Details

### 1. Frontend Service
- **Development**: Runs on port 5173 with hot reload
- **Production**: Built and served via Nginx on port 3000
- **Framework**: React + Vite + TypeScript + shadcn/ui
- **Features**: Modern UI components, responsive design

### 2. Backend Service
- **Port**: 5001
- **Framework**: Python Flask
- **Workers**: 4 Gunicorn workers for production
- **Features**: REST API, contact management, message broadcasting

### 3. WhatsApp Bridge Service
- **Port**: 8082
- **Language**: Go
- **Features**: WhatsApp Web integration, QR code authentication
- **Data**: Session stored in volumes for persistence

### 4. Nginx (Production only)
- **Port**: 8080
- **Purpose**: Reverse proxy and static file serving
- **Routes**:
  - `/` → Frontend (React app)
  - `/api/*` → Backend (Flask API)
  - `/bridge/*` → WhatsApp Bridge

## URLs and Access Points

### Development Mode
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5001
- **WhatsApp Bridge**: http://localhost:8082
- **WhatsApp QR Code**: http://localhost:8082/qr

### Production Mode
- **All services**: http://localhost:8080
- **Frontend**: http://localhost:8080/
- **Backend API**: http://localhost:8080/api/
- **WhatsApp Bridge**: http://localhost:8080/bridge/
- **WhatsApp QR Code**: http://localhost:8080/bridge/qr

## Docker Commands Reference

### Building and Running
```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build frontend

# Run in background
docker-compose --profile prod up -d

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
```

### Managing Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Restart specific service
docker-compose restart backend

# Scale services (if supported)
docker-compose --profile prod up --scale backend=2
```

### Development Workflow
```bash
# Start development environment
docker-compose --profile dev up

# Rebuild after dependency changes
docker-compose --profile dev up --build

# Reset everything (clean start)
docker-compose down -v && docker-compose --profile dev up --build
```

## Volume Management

### Persistent Data
- **WhatsApp Session**: `whatsapp_session:/app/session`
- **Backend Uploads**: `backend_uploads:/app/uploads`
- **Nginx Logs**: `nginx_logs:/var/log/nginx`

### Development Volumes
- **Frontend Source**: `./src:/app/src` (hot reload)
- **Backend Source**: `./:/app` (for debugging)

### Backup Important Data
```bash
# Backup WhatsApp session
docker run --rm -v whatsapp_session:/data -v $(pwd):/backup alpine tar czf /backup/whatsapp_session.tar.gz -C /data .

# Restore WhatsApp session
docker run --rm -v whatsapp_session:/data -v $(pwd):/backup alpine tar xzf /backup/whatsapp_session.tar.gz -C /data
```

## Troubleshooting

### Common Issues

#### 1. Port Conflicts
```bash
# Check what's using ports
netstat -tulpn | grep -E ':(3000|5001|5173|8080|8082)'

# Kill processes on specific ports
sudo fuser -k 3000/tcp
```

#### 2. WhatsApp Authentication
- Navigate to http://localhost:8082/qr (dev) or http://localhost:8080/bridge/qr (prod)
- Scan QR code with WhatsApp mobile app
- Wait for "Connected" status
- Session persists in Docker volume

#### 3. CORS Issues
- Ensure CORS_ORIGINS in .env includes your frontend URL
- Check browser console for detailed CORS errors
- Verify API calls use correct backend URL

#### 4. Build Failures
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache

# Remove all containers and volumes
docker-compose down -v
docker system prune -a
```

#### 5. Performance Issues
```bash
# Check resource usage
docker stats

# Increase Docker resources in Docker Desktop settings
# Recommended: 4GB RAM, 2 CPU cores
```

### Health Checks
All services include health checks:
```bash
# Check service health
docker-compose ps

# View health check logs
docker inspect <container_name> | grep -A 10 -B 10 Health
```

### Logs and Debugging
```bash
# All logs
docker-compose logs

# Specific service logs
docker-compose logs backend
docker-compose logs frontend-dev
docker-compose logs whatsapp-bridge

# Follow logs in real-time
docker-compose logs -f backend

# Debug container directly
docker-compose exec backend bash
docker-compose exec whatsapp-bridge sh
```

## Development Tips

### Hot Reload Setup
- Frontend: Source code mounted as volume, changes reflect immediately
- Backend: Restart service after Python file changes
- WhatsApp Bridge: Rebuild required for Go changes

### Database/Storage
- Backend uploads stored in Docker volume
- WhatsApp session data persisted across restarts
- Environment variables in .env file

### API Testing
```bash
# Test backend health
curl http://localhost:5001/health

# Test WhatsApp bridge
curl http://localhost:8082/status

# Test with authentication
curl -H "Authorization: Bearer <token>" http://localhost:5001/api/contacts
```

## Production Deployment

### Environment Variables for Production
```env
FLASK_ENV=production
CORS_ORIGINS=https://yourdomain.com
VITE_API_URL_PROD=https://yourdomain.com/api
VITE_BRIDGE_URL_PROD=https://yourdomain.com/bridge
```

### SSL/TLS Setup
For production with HTTPS, modify nginx configuration:
1. Add SSL certificates to nginx volume
2. Update nginx.conf with SSL settings
3. Redirect HTTP to HTTPS

### Monitoring
Consider adding:
- Health check endpoints
- Log aggregation (ELK stack)
- Metrics collection (Prometheus + Grafana)
- Error tracking (Sentry)

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