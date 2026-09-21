# Production Setup Guide - Citizen Assist

## Current Status
- ✅ Backend deployed on Render: https://citizenassist.onrender.com
- ⏳ Frontend needs deployment on Vercel
- ✅ GitHub repo: https://github.com/bemohitt1717/citizenAssist.git

---

## Step 1: Deploy Frontend to Vercel

### 1.1: Push Latest Code to GitHub
```bash
cd c:\Users\HP\OneDrive\Desktop\citizenAssist
git add .
git commit -m "Production ready with Google OAuth"
git push origin main
```

### 1.2: Deploy on Vercel
1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository: `bemohitt1717/citizenAssist`
4. Configure project settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 1.3: Add Environment Variables on Vercel
Go to **Project Settings** → **Environment Variables** and add:

```
VITE_API_URL=https://citizenassist.onrender.com/api
VITE_GOOGLE_CLIENT_ID=214641340065-r8ohdaaalk4e347qucfip6crcicjma6s.apps.googleusercontent.com
```

**Important**: Add these for **Production**, **Preview**, and **Development** environments.

### 1.4: Deploy
Click **"Deploy"** and wait for build to complete.

After deployment, Vercel will give you a URL like:
- `https://citizenassist.vercel.app` (or similar)

**COPY THIS URL** - you'll need it for the next steps!

---

## Step 2: Update Backend CORS (Render)

### 2.1: Get Your Vercel URL
After Vercel deployment completes, copy your frontend URL (e.g., `https://citizenassist.vercel.app`)

### 2.2: Update Render Environment Variables
1. Go to https://dashboard.render.com
2. Select your backend service
3. Go to **Environment** tab
4. Update `CLIENT_ORIGIN` to your Vercel URL:
   ```
   CLIENT_ORIGIN=https://your-vercel-url.vercel.app
   ```
5. Click **"Save Changes"**
6. Backend will automatically redeploy

---

## Step 3: Update Google OAuth Console

### 3.1: Add Production URLs
1. Go to https://console.cloud.google.com/apis/credentials
2. Select your OAuth 2.0 Client ID: `214641340065-r8ohdaaalk4e347qucfip6crcicjma6s`
3. Under **Authorized JavaScript origins**, add:
   ```
   https://citizenassist.onrender.com
   https://your-vercel-url.vercel.app
   ```
4. Under **Authorized redirect URIs**, add:
   ```
   https://your-vercel-url.vercel.app
   https://your-vercel-url.vercel.app/*
   ```
5. Click **"Save"**

---

## Step 4: Test Production Deployment

### 4.1: Test Backend Health
Open in browser:
```
https://citizenassist.onrender.com/api/health
```
Should return:
```json
{
  "status": "ok",
  "service": "Citizen Assist API",
  "time": "2026-08-26T..."
}
```

### 4.2: Test Frontend
1. Open your Vercel URL: `https://your-vercel-url.vercel.app`
2. Check browser console for errors
3. Try loading services on homepage
4. Test Google login
5. Test mobile login
6. Check if forms auto-fill

### 4.3: Common Issues & Solutions

**Issue 1: CORS Error**
```
Access to XMLHttpRequest at 'https://citizenassist.onrender.com/api/...' 
from origin 'https://your-vercel-url.vercel.app' has been blocked by CORS
```
**Solution**: 
- Check `CLIENT_URL` in Render matches your Vercel URL exactly (not `CLIENT_ORIGIN`)
- No trailing slash: ✅ `https://app.vercel.app` ❌ `https://app.vercel.app/`
- Make sure you're using `CLIENT_URL` variable name, not the old `CLIENT_ORIGIN`
- Redeploy backend after changing

**Issue 2: Google OAuth Error**
```
Access blocked: Authorization Error
Error 400: invalid_request
```
**Solution**:
- Add Vercel URL to Google Cloud Console Authorized Origins
- Clear browser cache and try again

**Issue 3: Environment Variables Not Working**
```
API calls going to undefined or wrong URL
```
**Solution**:
- Check env vars in Vercel dashboard
- Redeploy after adding env vars
- Verify variable names start with `VITE_`

**Issue 4: Build Fails on Vercel**
```
Error: Cannot find module...
```
**Solution**:
- Check `client/package.json` has all dependencies
- Root directory is set to `client` in Vercel settings
- Build command is `npm run build`

---

## Step 5: Post-Deployment Checklist

### Backend (Render)
- [ ] Service is running (green status)
- [ ] `/api/health` endpoint responds
- [ ] Environment variables set:
  - [ ] `PORT=5000`
  - [ ] `NODE_ENV=production`
  - [ ] `MONGODB_URI` (your connection string)
  - [ ] `JWT_SECRET` (your secret)
  - [ ] `GOOGLE_CLIENT_ID`
  - [ ] `GOOGLE_CLIENT_SECRET`
  - [ ] `CLIENT_URL` (your Vercel URL, comma-separated for multiple origins)

### Frontend (Vercel)
- [ ] Build completed successfully
- [ ] Site loads on Vercel URL
- [ ] Environment variables set:
  - [ ] `VITE_API_URL=https://citizenassist.onrender.com/api`
  - [ ] `VITE_GOOGLE_CLIENT_ID`

### Google OAuth
- [ ] Authorized JavaScript origins include both URLs
- [ ] Authorized redirect URIs include Vercel URL

### Testing
- [ ] Homepage loads
- [ ] Services display correctly
- [ ] Google login works
- [ ] Mobile login works
- [ ] Forms submit successfully
- [ ] Account linking works
- [ ] Dashboard accessible
- [ ] No console errors

---

## Monitoring & Maintenance

### Check Backend Logs (Render)
1. Go to Render Dashboard
2. Select your service
3. Click **"Logs"** tab
4. Monitor for errors

### Check Frontend Logs (Vercel)
1. Go to Vercel Dashboard
2. Select your project
3. Click **"Deployments"**
4. Click on latest deployment
5. View **"Runtime Logs"**

### Update Environment Variables
**Vercel**: Settings → Environment Variables → Edit → Save → Redeploy
**Render**: Environment tab → Edit → Save (auto-redeploys)

---

## Custom Domain (Optional)

### For Frontend (Vercel)
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `CLIENT_URL` in Render with new domain

### For Backend (Render)
1. Not needed unless you have a custom backend domain
2. If using custom domain, update `VITE_API_URL` in Vercel

---

## Rollback Plan

### If Production Has Issues:

**Rollback Frontend (Vercel)**:
1. Go to Deployments
2. Find previous working deployment
3. Click **"Promote to Production"**

**Rollback Backend (Render)**:
1. Go to your service
2. Click **"Manual Deploy"**
3. Select previous commit from dropdown
4. Deploy

**Emergency**: Point `VITE_API_URL` to localhost temporarily:
```
VITE_API_URL=http://localhost:5000/api
```

---

## Support & Debugging

### Useful Commands

**Test API from terminal**:
```bash
# Health check
curl https://citizenassist.onrender.com/api/health

# Test CORS
curl -H "Origin: https://your-vercel-url.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://citizenassist.onrender.com/api/auth/google
```

**Check build locally before deploying**:
```bash
cd client
npm run build
npm run preview
# Open http://localhost:4173
```

### Contact Info
- Render Support: https://render.com/docs/support
- Vercel Support: https://vercel.com/help
- Google OAuth: https://console.cloud.google.com/support

---

## Security Notes
- ✅ `.env` files are in `.gitignore` - never committed
- ✅ All secrets stored in platform dashboards only
- ✅ CORS configured for specific origins only
- ✅ HTTPS enforced on both platforms
- ✅ JWT tokens expire after set time
- ✅ PINs hashed with bcrypt

---

**Ready to deploy!** Follow steps 1-4 in order. 🚀
