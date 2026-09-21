# Production-Ready Authentication Implementation Guide

## Overview
This guide upgrades the current Citizen Assist authentication to production-grade standards with:


## Backend Changes

### 1. Environment Variables (Already Updated)

**server/.env:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://...
JWT_SECRET=citizenAssist@1717
JWT_REFRESH_SECRET=citizenAssist@1717@refresh@token
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
CLIENT_URL=http://localhost:5173,https://citizen-assist-teal.vercel.app
COOKIE_DOMAIN=
```

### 2. User Model (Already Updated)

Added refresh token fields:
```javascript
refreshToken: { type: String, select: false },
refreshTokenVersion: { type: Number, default: 0, select: false },
```

### 3. Auth Controller Updates

**Key changes needed in `server/controllers/auth.controller.js`:**

#### Update `signIn` function:
```javascript
export const signIn = async (req, res, next) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const pin = String(req.body.pin ?? "");
    const role = req.body.role;

    // ... existing validation ...

    const user = await User.findOne({ phone }).select("+pinHash +refreshTokenVersion");

    // ... existing PIN verification ...

    // Create tokens
    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    // Save refresh token hash (for invalidation)
    user.refreshToken = await bcrypt.hash(refreshToken, 5);
    await user.save();

    // Set HTTP-only cookies
    setAuthCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      status: "success",
      message: "Signed in successfully.",
      data: {
        user: getSafeUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
};
```

#### Update `signUp` function similarly:
```javascript
// After creating user, set cookies instead of returning token
const accessToken = createAccessToken(user);
const refreshToken = createRefreshToken(user);

user.refreshToken = await bcrypt.hash(refreshToken, 5);
await user.save();

setAuthCookies(res, accessToken, refreshToken);

return res.status(201).json({
  status: "success",
  message: "Account created successfully.",
  data: {
    user: getSafeUser(user),
  },
});
```

#### Add refresh endpoint:
```javascript
/**
 * POST /api/auth/refresh
 * Rotate refresh token and issue new access token
 */
export const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({
        status: "error",
        message: "Refresh token required.",
        code: "REFRESH_TOKEN_MISSING",
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Find user with token version
    const user = await User.findById(decoded.sub).select("+refreshTokenVersion +refreshToken");

    if (!user) {
      clearAuthCookies(res);
      return res.status(401).json({
        status: "error",
        message: "User not found.",
      });
    }

    // Check token version (for rotation/invalidation)
    if (decoded.version !== user.refreshTokenVersion) {
      clearAuthCookies(res);
      return res.status(401).json({
        status: "error",
        message: "Refresh token has been rotated. Please sign in again.",
        code: "TOKEN_ROTATED",
      });
    }

    // Verify stored refresh token hash
    const isValid = await bcrypt.compare(refreshToken, user.refreshToken || "");
    if (!isValid) {
      clearAuthCookies(res);
      return res.status(401).json({
        status: "error",
        message: "Invalid refresh token.",
      });
    }

    // Create new tokens
    const newAccessToken = createAccessToken(user);
    const newRefreshToken = createRefreshToken(user);

    // Update stored refresh token
    user.refreshToken = await bcrypt.hash(newRefreshToken, 5);
    await user.save();

    // Set new cookies
    setAuthCookies(res, newAccessToken, newRefreshToken);

    return res.status(200).json({
      status: "success",
      message: "Tokens refreshed.",
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      clearAuthCookies(res);
      return res.status(401).json({
        status: "error",
        message: "Refresh token expired. Please sign in again.",
        code: "REFRESH_TOKEN_EXPIRED",
      });
    }

    if (error.name === "JsonWebTokenError") {
      clearAuthCookies(res);
      return res.status(401).json({
        status: "error",
        message: "Invalid refresh token.",
      });
    }

    next(error);
  }
};
```

#### Add logout endpoint:
```javascript
/**
 * POST /api/auth/logout
 * Clear cookies and invalidate refresh token
 */
export const logout = async (req, res, next) => {
  try {
    // If user is authenticated, invalidate their refresh token
    if (req.user) {
      const user = await User.findById(req.user._id).select("+refreshTokenVersion");
      if (user) {
        user.refreshTokenVersion += 1; // Invalidate all existing refresh tokens
        user.refreshToken = null;
        await user.save();
      }
    }

    clearAuthCookies(res);

    return res.status(200).json({
      status: "success",
      message: "Logged out successfully.",
    });
  } catch (error) {
    next(error);
  }
};
```

#### Update Google OAuth function:
```javascript
export const googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        status: "error",
        message: "Google credential is required.",
      });
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email?.toLowerCase().trim();
    const name = payload.name;

    if (!payload.email_verified) {
      return res.status(400).json({
        status: "error",
        message: "Google email not verified.",
      });
    }

    // Find or create user
    let user = await User.findOne({
      $or: [{ googleId }, { email }],
    }).select("+refreshTokenVersion");

    if (user) {
      // Link Google if not already linked
      if (!user.googleId) {
        user.googleId = googleId;
        if (!user.name) user.name = name;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        googleId,
        email,
        name,
        role: "citizen",
        status: "active",
        refreshTokenVersion: 0,
      });
    }

    // Create tokens
    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    // Save refresh token
    user.refreshToken = await bcrypt.hash(refreshToken, 5);
    await user.save();

    // Set cookies
    setAuthCookies(res, accessToken, refreshToken);

    return res.status(user ? 200 : 201).json({
      status: "success",
      message: user ? "Signed in with Google." : "Account created with Google.",
      data: {
        user: getSafeUser(user),
        needsPhone: !user.phone, // Flag if mobile linking needed
      },
    });
  } catch (error) {
    console.error("❌ [GOOGLE-AUTH] Failed:", error);
    next(error);
  }
};
```

### 4. Add Routes

**server/routes/auth.route.js:**
```javascript
import express from "express";
import {
  startAuth,
  signUp,
  signIn,
  googleAuth,
  linkMobile,
  linkGoogle,
  refreshAccessToken,
  logout,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.midleware.js";

const router = express.Router();

router.post("/start", startAuth);
router.post("/sign-up", signUp);
router.post("/sign-in", signIn);
router.post("/google", googleAuth);
router.post("/link-mobile", protect, linkMobile);
router.post("/link-google", protect, linkGoogle);
router.post("/refresh", refreshAccessToken); // NEW
router.post("/logout", protect, logout); // NEW

export default router;
```

### 5. Update getMe endpoint

**server/controllers/auth.controller.js:**
```javascript
/**
 * GET /api/auth/profile
 * Get current user profile (requires authentication)
 */
export const getMe = async (req, res, next) => {
  try {
    // req.user is set by protect middleware
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found.",
      });
    }

    return res.status(200).json({
      status: "success",
      data: {
        user: getSafeUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
};
```


## Frontend Changes

### 1. Update Axios Configuration

**client/src/api/axios.js** (create if doesn't exist):
```javascript
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // CRITICAL: Send cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If access token expired, try to refresh
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === "TOKEN_EXPIRED" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh tokens
        await api.post("/auth/refresh");
        
        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

### 2. Update Auth API Calls

**client/src/features/auth/authApi.js:**
```javascript
import api from "../../api/axios";

export const signUp = async (phone, pin) => {
  const response = await api.post("/auth/sign-up", { phone, pin });
  return response.data;
};

export const signIn = async (phone, pin, role) => {
  const response = await api.post("/auth/sign-in", { phone, pin, role });
  return response.data;
};

export const googleLogin = async (credential) => {
  const response = await api.post("/auth/google", { credential });
  return response.data;
};

export const getMe = async () => {
  const response = await api.get("/auth/profile");
  return response.data;
};

export const logout = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

export const refreshTokens = async () => {
  const response = await api.post("/auth/refresh");
  return response.data;
};
```

### 3. Update AuthContext

**client/src/context/AuthContext.jsx:**
```javascript
import { useEffect, useState } from "react";
import { getMe, logout as logoutApi } from "../features/auth/authApi";
import AuthContext from "./authContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await getMe();
        setUser(response.data.user);
        console.info("[auth debug] session restored", {
          role: response.data.user.role,
        });
      } catch (error) {
        if (error.response?.status === 401) {
          console.info("[auth debug] session expired or not found");
        } else {
          console.info(
            "[auth debug] session restore failed",
            error.response?.status
          );
        }
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = (loggedInUser) => {
    setUser(loggedInUser);
    console.info("[auth debug] session stored", { role: loggedInUser.role });
  };

  const logout = async () => {
    try {
      await logoutApi();
      setUser(null);
      console.info("[auth debug] session cleared");
    } catch (error) {
      console.error("[auth debug] logout failed", error);
      // Clear local state even if API call fails
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 4. Remove localStorage Token Management

**Delete or update `client/src/utils/storage.js`:**

### 5. Update Login Forms

**client/src/features/auth/components/LoginForm/LoginForm.jsx:**

Remove token handling, just call login with user data:

```javascript
const onSignIn = async () => {
  try {
    setIsBusy(true);
    setError("");

    const response = await signIn(phone, pin, role.id);
    
    // No token to store - cookies are set automatically
    login(response.data.user);
    
    navigate(HOME_BY_ROLE[response.data.user.role]);
  } catch (err) {
    setError(getApiErrorMessage(err));
  } finally {
    setIsBusy(false);
  }
};

const handleGoogleSuccess = async (credentialResponse) => {
  try {
    setIsBusy(true);
    const response = await googleLogin(credentialResponse.credential);
    
    login(response.data.user);
    
    navigate(HOME_BY_ROLE[response.data.user.role]);
  } catch (err) {
    setError(getApiErrorMessage(err));
  } finally {
    setIsBusy(false);
  }
};
```


## Deployment Configuration

### Backend (Render)

**Environment Variables:**
```
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=citizenAssist@1717
JWT_REFRESH_SECRET=citizenAssist@1717@refresh@token
GOOGLE_CLIENT_ID=214641340065-r8ohdaaalk4e347qucfip6crcicjma6s.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
CLIENT_URL=https://citizen-assist-teal.vercel.app
COOKIE_DOMAIN=
```

### Frontend (Vercel)

**Environment Variables:**
```
VITE_API_URL=https://citizenassist.onrender.com/api
VITE_GOOGLE_CLIENT_ID=214641340065-r8ohdaaalk4e347qucfip6crcicjma6s.apps.googleusercontent.com
```


## Testing Checklist

### Local Testing:

### Production Testing:


## Security Benefits

✅ **HTTP-only cookies** - Cannot be accessed by JavaScript (XSS protection)  
✅ **Short-lived access tokens** - 15 minutes (reduced impact if stolen)  
✅ **Refresh token rotation** - One-time use tokens  
✅ **Token version tracking** - Instant invalidation of all sessions  
✅ **Secure flag in production** - HTTPS-only cookies  
✅ **SameSite protection** - CSRF mitigation  
✅ **No tokens in localStorage** - Safer than current implementation


## Migration Path

### Option 1: Gradual (Recommended)
1. Keep existing Bearer token system working
2. Add cookie support in parallel
3. Update frontend to use cookies
4. Remove localStorage after testing
5. Remove Bearer token support

### Option 2: Direct
1. Implement all backend changes
2. Update all frontend code
3. Deploy both simultaneously
4. Test thoroughly


## Common Issues & Solutions

### Issue: Cookies not being set
**Solution:** Verify `withCredentials: true` in Axios and `credentials: true` in CORS

### Issue: CORS error in production
**Solution:** Check CLIENT_URL exactly matches Vercel URL (no trailing slash)

### Issue: Google OAuth fails
**Solution:** Add production URLs to Google Console Authorized Origins

### Issue: Session lost on refresh
**Solution:** Check cookies are being sent (Network tab → Request Headers → Cookie)

### Issue: Token refresh loop
**Solution:** Check refresh endpoint doesn't require valid access token


## Next Steps

1. Implement refresh token endpoint (highest priority)
2. Update signIn/signUp to use cookies
3. Update frontend to remove localStorage
4. Add logout endpoint
5. Test locally
6. Deploy and test production
7. Monitor for issues

This implementation follows industry best practices and will work reliably in production! 🚀
