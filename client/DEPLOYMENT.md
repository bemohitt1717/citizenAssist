# Citizen Assist Frontend - Deployment Guide

## Prerequisites

1. Backend deployed on Render (see `server/DEPLOYMENT.md`)
2. Backend URL (e.g., `https://citizen-assist-api.onrender.com`)

## Option 1: Deploy on Vercel (Recommended)

### Step 1: Prepare for Deployment

1. Ensure your backend is deployed and working
2. Test backend health: `https://your-api.onrender.com/api/health`

### Step 2: Deploy to Vercel

1. **Push to GitHub** (if not already)

   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Go to Vercel**
   - Visit https://vercel.com
   - Click "Add New..." → "Project"
   - Import your GitHub repository

3. **Configure Project**
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Add Environment Variable**
   - Click "Environment Variables"
   - Add:
     ```
     Name: VITE_API_URL
     Value: https://your-api.onrender.com/api
     ```
   - Click "Add"

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Your app will be live at: `https://your-project.vercel.app`

### Step 3: Update Backend CORS

1. Go to Render dashboard → Your API service
2. Click "Environment" tab
3. Edit `CLIENT_URL` variable (or add if it doesn't exist)
4. Set value to: `https://your-project.vercel.app`
5. **Important**: Remove any obsolete CORS environment variables
6. Save (will trigger auto-redeploy)

---

## Option 2: Deploy on Netlify

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Ready for Netlify deployment"
git push origin main
```

### Step 2: Deploy to Netlify

1. **Go to Netlify**
   - Visit https://netlify.com
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub and select your repository

2. **Configure Build Settings**
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist`

3. **Add Environment Variable**
   - Go to "Site settings" → "Environment variables"
   - Click "Add a variable"
   - Add:
     ```
     Key: VITE_API_URL
     Value: https://your-api.onrender.com/api
     ```

4. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete
   - Your app will be live at: `https://random-name.netlify.app`

### Step 3: Update Backend CORS

1. Go to Render dashboard → Your API service
2. Click "Environment" tab
3. Edit `CLIENT_URL` variable (or add if it doesn't exist)
4. Set value to: `https://your-site.netlify.app`
5. **Important**: Remove any obsolete CORS environment variables
6. Save

---

## Testing Deployment

### 1. Test Frontend

Visit your deployed URL and check:

- [ ] Homepage loads correctly
- [ ] Services section displays
- [ ] Navigation works

### 2. Test Backend Connection

Try to sign up or log in:

- [ ] Sign up creates account
- [ ] Login works correctly
- [ ] Dashboard loads after login
- [ ] No CORS errors in browser console

### 3. Test Full Flow

- [ ] Browse services
- [ ] Select a service and request it
- [ ] Track request page works
- [ ] Agent/Admin dashboards work (if applicable)

---

## Troubleshooting

### Issue: "Network Error" or "Failed to Fetch"

**Cause**: Frontend can't reach backend

**Solutions**:

1. Check `VITE_API_URL` is set correctly in deployment platform
2. Verify backend is running: `curl https://your-api.onrender.com/api/health`
3. Check backend logs in Render dashboard
4. Ensure backend URL includes `/api` at the end

### Issue: CORS Error

**Symptom**: Browser console shows CORS policy error

**Solutions**:

1. Update `CLIENT_URL` in Render to match your frontend URL exactly
2. Ensure no trailing slash in URLs
3. Check both URLs use `https://` (not `http://`)
4. **Important**: Make sure you're using `CLIENT_URL`
5. Wait 1-2 minutes after updating environment variables

### Issue: Build Fails

**Common causes**:

1. **Missing dependencies**: Run `npm install` locally to verify
2. **Build command incorrect**: Should be `npm run build`
3. **Environment variable not set**: Add `VITE_API_URL`
4. **Node version mismatch**: Vercel/Netlify use Node 18+

**Solutions**:

- Check build logs for specific error
- Verify `package.json` has all dependencies
- Test build locally: `npm run build`

### Issue: Page Shows but Features Don't Work

**Cause**: Frontend is not connecting to backend properly

**Solutions**:

1. Open browser console (F12) and check for errors
2. Look for network errors or failed API calls
3. Verify `VITE_API_URL` environment variable is set
4. Check if backend is sleeping (free tier Render sleeps after 15 min)
5. Test backend directly: `https://your-api.onrender.com/api/health`

---

## Custom Domain (Optional)

### Vercel

1. Go to project settings → "Domains"
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `CLIENT_URL` in backend to the new domain

### Netlify

1. Go to "Domain settings" → "Add custom domain"
2. Follow DNS configuration instructions
3. Update `CLIENT_URL` in backend to new domain

---

## Continuous Deployment

Both Vercel and Netlify support automatic deployments:

- **Push to GitHub** → Automatic deployment
- **Branch**: Usually `main` or `master`
- **Preview deployments**: Available for pull requests

To deploy updates:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Your site will auto-deploy in 2-3 minutes.

---

## Environment Variables Summary

| Platform             | Variable       | Value                               |
| -------------------- | -------------- | ----------------------------------- |
| **Vercel/Netlify**   | `VITE_API_URL` | `https://your-api.onrender.com/api` |
| **Render (Backend)** | `CLIENT_URL`   | `https://your-frontend.vercel.app`  |

**Important**: Update both when you change URLs!
**Note**: The backend variable is `CLIENT_URL`

---

## Performance Optimization

### Enable Compression

Both platforms automatically enable gzip/brotli compression.

### Caching

Static assets are cached automatically.

### CDN

Both platforms use global CDN for fast content delivery.

---

## Monitoring

### Vercel

- Analytics: Built-in web analytics
- Logs: Available in deployment details
- Performance: Core Web Vitals tracked

### Netlify

- Analytics: Available in paid plans
- Logs: Deployment logs in dashboard
- Performance: Build and deploy times tracked

---

## Security Checklist

- [ ] Environment variables set correctly
- [ ] No sensitive data in client-side code
- [ ] HTTPS enabled (automatic on both platforms)
- [ ] Backend CORS configured properly
- [ ] No API keys exposed in frontend

---

## Quick Reference

### Your URLs

- **Frontend**: `https://your-project.vercel.app`
- **Backend API**: `https://your-api.onrender.com`
- **Health Check**: `https://your-api.onrender.com/api/health`

### Update Commands

```bash
# Update and deploy
git add .
git commit -m "Your update message"
git push origin main
```

### Environment Variables

```env
VITE_API_URL=https://your-api.onrender.com/api
```

---

## Next Steps

1. ✅ Test all features thoroughly
2. ✅ Update README with deployment URLs
3. ✅ Set up custom domain (optional)
4. ✅ Monitor logs for errors
5. ✅ Share with users!

---

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **Vite Docs**: https://vitejs.dev/guide/

Deployment complete! 🚀
