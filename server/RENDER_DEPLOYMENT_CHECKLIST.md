# 🚀 Render Deployment - Quick Checklist

## ✅ Pre-Deployment Checklist

### 1. MongoDB Atlas Setup
- [ ] Create MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
- [ ] Create a free cluster (M0)
- [ ] Create database user with read/write permissions
- [ ] Go to "Network Access" → Add IP: `0.0.0.0/0` (allow all IPs)
- [ ] Copy your connection string (replace `<password>` with actual password)

**Connection string format:**
```
mongodb+srv://username:password@cluster.mongodb.net/?appName=citizen-assist
```

### 2. Generate JWT Secret
Run this command and save the output:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Push to GitHub
```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

---

## 🎯 Render Deployment Steps

### Step 1: Create Web Service
1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. **Connect your GitHub repo** (authorize if needed)
4. Select: `citizenAssist` repository

### Step 2: Configure Service
Fill in these settings:

| Setting | Value |
|---------|-------|
| **Name** | `citizen-assist-api` |
| **Region** | Singapore (or closest to you) |
| **Branch** | `main` |
| **Root Directory** | `server` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | Free |

### Step 3: Environment Variables
Click **"Advanced"** → **"Add Environment Variable"**

Add these **5 required variables**:

| Key | Value | Example |
|-----|-------|---------|
| `NODE_ENV` | `production` | production |
| `PORT` | `5000` | 5000 |
| `MONGODB_URI` | Your MongoDB connection string | mongodb+srv://user:pass@... |
| `JWT_SECRET` | Your generated secret | abc123def456... |
| `CLIENT_ORIGIN` | Your frontend URL | https://yourapp.vercel.app |

**For now, use this for CLIENT_ORIGIN:**
```
http://localhost:5173
```
(Update it after deploying frontend)

### Step 4: Deploy
1. Click **"Create Web Service"**
2. Wait for build to complete (2-3 minutes)
3. Check logs for: `✅ Citizen Assist API running on port 5000`

### Step 5: Test Your API
Your API URL will be: `https://citizen-assist-api.onrender.com`

Test it:
```bash
curl https://citizen-assist-api.onrender.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "Citizen Assist API",
  "time": "2024-01-01T00:00:00.000Z"
}
```

---

## 🎨 Frontend Deployment (Next Step)

### Option 1: Vercel (Recommended)
1. Push your code to GitHub
2. Go to https://vercel.com
3. Import your GitHub repo
4. Set **Root Directory** to `client`
5. Add environment variable:
   ```
   VITE_API_URL=https://citizen-assist-api.onrender.com
   ```
6. Deploy

### Option 2: Netlify
1. Push your code to GitHub
2. Go to https://netlify.com
3. Import your GitHub repo
4. Set **Base directory** to `client`
5. Set **Build command** to `npm run build`
6. Set **Publish directory** to `client/dist`
7. Add environment variable:
   ```
   VITE_API_URL=https://citizen-assist-api.onrender.com
   ```
8. Deploy

### After Frontend Deployment
Update `CLIENT_ORIGIN` in Render:
1. Go to Render dashboard → Your service
2. Click "Environment" tab
3. Edit `CLIENT_ORIGIN` → Set to your frontend URL
4. Save (will auto-redeploy)

---

## ⚠️ Important Notes

### Free Tier Behavior
- **Cold starts**: Server sleeps after 15 min inactivity
- **Wake up time**: First request takes 30-50 seconds
- **Solution**: Use a cron job to ping `/api/health` every 10 minutes

### File Uploads
- Current setup stores files on local disk
- Files will be **lost on restart**
- For production: Use cloud storage (Cloudinary, AWS S3)

### Database Limits
- MongoDB Atlas Free: 512MB storage
- Monitor usage in Atlas dashboard
- Upgrade if you exceed limits

---

## 🐛 Troubleshooting

### Build Fails
**Error**: Dependencies not found
- Check `package.json` has all dependencies
- Ensure `"type": "module"` is present

**Error**: Build timeout
- Free tier has 10-minute build limit
- Usually completes in 1-2 minutes

### Server Won't Start
**Error**: MongoDB connection failed
- ✅ Check MongoDB Atlas IP whitelist has `0.0.0.0/0`
- ✅ Verify connection string has correct password
- ✅ Ensure database user has read/write permissions

**Error**: Port already in use
- Render automatically sets PORT
- No action needed

### CORS Errors in Browser
**Error**: "CORS policy blocked"
- Update `CLIENT_ORIGIN` with exact frontend URL
- Include `https://` prefix
- No trailing slash

### Cold Start Issues
**Issue**: First request is very slow
- This is normal for free tier
- Use UptimeRobot or cron-job.org to keep it warm
- Ping URL: `https://your-api.onrender.com/api/health`

---

## 📊 Monitoring

### Render Dashboard
- View logs: Click "Logs" tab
- Check metrics: Click "Metrics" tab
- See events: Click "Events" tab

### MongoDB Atlas
- Go to Atlas dashboard
- Click "Metrics" to see database usage
- Set up alerts for storage limits

---

## 🔐 Security Checklist

Before going live:

- [ ] `.env` is in `.gitignore` (never committed)
- [ ] JWT secret is random and strong (32+ characters)
- [ ] MongoDB password is secure
- [ ] `CLIENT_ORIGIN` is set to actual frontend URL
- [ ] MongoDB IP whitelist is configured
- [ ] Test all API endpoints work
- [ ] Check CORS is working with frontend

---

## 📝 Quick Commands

### Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Test API Health
```bash
curl https://your-service.onrender.com/api/health
```

### View Logs (if you have Render CLI)
```bash
render logs -s citizen-assist-api
```

---

## 🆘 Need Help?

### Resources
- **Render Docs**: https://render.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **Node.js Deployment**: https://nodejs.org/en/docs/guides/

### Common Issues
1. **Server not responding**: Check Render logs for errors
2. **Database connection failed**: Verify MongoDB Atlas settings
3. **CORS errors**: Update `CLIENT_ORIGIN` environment variable
4. **Cold starts**: Normal behavior on free tier

---

## ✨ Success!

If you see this, you're done:
```
✅ Citizen Assist API running on port 5000
📊 Environment: production
🌐 Health check: https://your-api.onrender.com/api/health
```

**Next**: Deploy your frontend and update `CLIENT_ORIGIN`!

---

## 📞 Your Deployment URLs

**Backend API**: `https://citizen-assist-api.onrender.com`
**Frontend**: `https://your-frontend.vercel.app` (after deploying)
**MongoDB**: Managed by MongoDB Atlas

Save these URLs for reference!
