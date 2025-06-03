# 🚀 Club Chat Broadcast - Deployment Guide

Your WhatsApp club chat broadcast application is ready for deployment! Here are the best options:

## 🌟 Option 1: Railway (Recommended - Easiest)

Railway provides simple, one-click deployment for full-stack applications.

### Steps:

1. **Sign up** at [railway.app](https://railway.app)
2. **Connect your GitHub repo** or push to GitHub first
3. **Deploy**:
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway will automatically detect and build your app
4. **Set Environment Variables** in Railway dashboard:
   ```
   GO_BRIDGE_BASE_URL=your-go-bridge-url (if using external WhatsApp bridge)
   ```
5. **Your app will be live** at: `https://your-app-name.up.railway.app`

**Pros**: Zero configuration, supports both frontend and backend, free tier available
**Cost**: Free for hobby projects, $5/month for production

---

## 🔧 Option 2: Vercel (Frontend) + Railway (Backend)

Split deployment for better performance.

### Frontend (Vercel):
1. Sign up at [vercel.com](https://vercel.com)
2. Connect GitHub repo
3. Set build settings:
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Backend (Railway):
1. Create new Railway project
2. Set start command: `gunicorn app:app`
3. Add environment variables

---

## 🐳 Option 3: DigitalOcean App Platform

1. Sign up at [digitalocean.com](https://digitalocean.com)
2. Create new App
3. Connect GitHub repo
4. Configure build settings (auto-detected)

**Cost**: $5/month minimum

---

## 📦 Option 4: Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Deploy: `git push heroku main`

**Note**: Heroku is no longer free, starts at $7/month

---

## 🏠 Option 5: Self-Hosted (VPS)

For maximum control, deploy on your own server:

### Requirements:
- Ubuntu/CentOS VPS
- Domain name
- SSL certificate

### Steps:
1. **Prepare server**:
   ```bash
   sudo apt update
   sudo apt install nginx python3 python3-pip nodejs npm
   ```

2. **Clone and build**:
   ```bash
   git clone your-repo
   cd club-chat-broadcast
   ./build.sh
   ```

3. **Setup systemd service**:
   ```bash
   sudo nano /etc/systemd/system/club-chat.service
   ```
   
   Content:
   ```ini
   [Unit]
   Description=Club Chat Broadcast
   After=network.target

   [Service]
   User=www-data
   WorkingDirectory=/path/to/club-chat-broadcast
   ExecStart=/usr/bin/gunicorn -w 4 -b 0.0.0.0:5000 app:app
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

4. **Configure Nginx**:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://127.0.0.1:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

---

## 🔐 Environment Variables

Set these in your deployment platform:

| Variable | Description | Example |
|----------|-------------|---------|
| `GO_BRIDGE_BASE_URL` | WhatsApp bridge URL | `http://localhost:8082` |
| `PORT` | Application port | `5000` (auto-set by most platforms) |

---

## 🧪 Testing Your Deployment

1. **Visit your app URL**
2. **Check API endpoints**:
   - `GET /api/whatsapp/status` - Should return bridge status
   - `GET /api/whatsapp/qr` - Should return QR code for WhatsApp login

3. **Test WhatsApp features**:
   - Scan QR code to connect WhatsApp
   - Send test broadcast message

---

## 🔧 Troubleshooting

### Common Issues:

1. **Build fails**: Check Node.js version (use Node 18+)
2. **WhatsApp not connecting**: Ensure GO_BRIDGE_BASE_URL is correct
3. **Static files not loading**: Verify dist folder is created during build

### Logs:
- **Railway**: Check logs in dashboard
- **Vercel**: View function logs in dashboard
- **Self-hosted**: `journalctl -u club-chat.service -f`

---

## 📱 Mobile Optimization

Your app is already mobile-friendly thanks to Tailwind CSS and responsive design!

---

## 🎯 Next Steps

1. **Choose deployment option** (Railway recommended)
2. **Set up domain** (optional)
3. **Configure SSL** (usually automatic)
4. **Test with real users**
5. **Monitor usage** and scale as needed

---

**Need help?** Check the logs and ensure all environment variables are set correctly! 