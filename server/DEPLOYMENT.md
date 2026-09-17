# Citizen Assist Server - Render Deployment Guide

## Prerequisites

1. **MongoDB Atlas Account**
   - Sign up at https://www.mongodb.com/cloud/atlas
   - Create a free cluster
   - Get your connection string
   - Whitelist Render's IP addresses (or use 0.0.0.0/0 for all IPs)

2. **Render Account**
   - Sign up at https://render.com
   - Connect your GitHub repository

## Deployment Steps

### 1. Push Code to GitHub
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2. Create Web Service on Render

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the `citizenAssist` repository
5. Configure the service:
   - **Name**: `citizen-assist-api`
   - **Region**: Singapore (or closest to your users)
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

### 3. Set Environment Variables

In Render dashboard, go to "Environment" tab and add these variables:

**Required:**
- `NODE_ENV` = `production`
- `PORT` = `5000`
- `MONGODB_URI` = `your_mongodb_atlas_connection_string`
- `JWT_SECRET` = `your_random_32_character_secret`
- `CLIENT_ORIGIN` = `https://your-frontend-url.com` (update after deploying frontend)

**Optional (Google OAuth - not configured):**
- `GOOGLE_CLIENT_ID` = (leave empty for now)
- `GOOGLE_CLIENT_SECRET` = (leave empty for now)

### 4. Generate JWT Secret

Run this command to generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. MongoDB Atlas Setup

1. Go to MongoDB Atlas dashboard
2. Click "Network Access" → "Add IP Address"
3. Add `0.0.0.0/0` (allows access from anywhere)
4. Go to "Database Access" → Ensure user has read/write permissions
5. Copy connection string from "Connect" button
6. Replace `<password>` with your actual password
7. Paste in Render's `MONGODB_URI` environment variable

### 6. Deploy

1. Click "Create Web Service"
2. Render will automatically deploy your server
3. Wait for build to complete (usually 2-3 minutes)
4. Your API will be available at: `https://your-service-name.onrender.com`

### 7. Test Deployment

Test the health endpoint:
```bash
curl https://your-service-name.onrender.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "Citizen Assist API",
  "time": "2024-01-01T00:00:00.000Z"
}
```

### 8. Update Frontend

Update your frontend's API base URL to point to:
`https://your-service-name.onrender.com`

And update `CLIENT_ORIGIN` environment variable with your frontend URL.

## Important Notes

### Free Tier Limitations
- Service spins down after 15 minutes of inactivity
- First request after spin-down takes 30-50 seconds (cold start)
- 750 hours/month free (enough for 1 service running 24/7)

### File Uploads
- Current setup uses local disk storage
- Files will be lost on service restart
- For production, use cloud storage (AWS S3, Cloudinary, etc.)

### Database
- MongoDB Atlas free tier: 512MB storage
- Sufficient for development and small projects
- Monitor usage in Atlas dashboard

### Security Checklist
✅ Never commit `.env` file to git
✅ Use strong, random JWT secret
✅ Use secure MongoDB password
✅ Whitelist only necessary IPs in MongoDB Atlas
✅ Update `CLIENT_ORIGIN` to your actual frontend URL
✅ Enable CORS only for your frontend domain

## Troubleshooting

### Build Fails
- Check if all dependencies are in `package.json`
- Ensure Node version compatibility (Render uses Node 18+)
- Check build logs in Render dashboard

### Server Won't Start
- Verify all environment variables are set
- Check MongoDB connection string is correct
- Review server logs in Render dashboard

### Connection Errors
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check MongoDB user has correct permissions
- Test connection string locally first

### CORS Errors
- Update `CLIENT_ORIGIN` with correct frontend URL
- Ensure frontend URL matches exactly (with https://)
- Check browser console for specific CORS error

## Monitoring

1. **Render Dashboard**: View logs, metrics, and events
2. **MongoDB Atlas**: Monitor database usage and performance
3. **Health Check**: `/api/health` endpoint for uptime monitoring

## Updating Deployment

Push to GitHub to trigger automatic deployment:
```bash
git add .
git commit -m "Update server"
git push origin main
```

Render will automatically detect changes and redeploy.

## Support Resources

- Render Docs: https://render.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com
- Express.js Guide: https://expressjs.com/en/guide/routing.html

## Next Steps

1. Deploy frontend on Vercel/Netlify
2. Update `CLIENT_ORIGIN` with frontend URL
3. Set up custom domain (optional)
4. Configure cloud storage for file uploads
5. Set up monitoring and alerts
6. Implement rate limiting for production
