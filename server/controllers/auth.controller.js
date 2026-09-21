import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

import User, { normalizePhone } from "../model/user.js";

// Token expiration times
const ACCESS_TOKEN_EXPIRES_IN = "15m"; // Short-lived access token
const REFRESH_TOKEN_EXPIRES_IN = "7d"; // Longer-lived refresh token
const BCRYPT_ROUNDS = 12;

// Cookie options
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // HTTPS only in production
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Cross-site for production
  domain: process.env.COOKIE_DOMAIN || undefined, // Undefined for localhost
  path: "/",
};

const ACCESS_COOKIE_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: 15 * 60 * 1000, // 15 minutes
};

const REFRESH_COOKIE_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Initialize Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Create access token with user info
 */
const createAccessToken = (user) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      status: user.status,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    }
  );
};

/**
 * Create refresh token with version for rotation
 */
const createRefreshToken = (user) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      version: user.refreshTokenVersion || 0,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    }
  );
};

/**
 * Set auth cookies with access and refresh tokens
 */
const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS);
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
};

/**
 * Clear auth cookies
 */
const clearAuthCookies = (res) => {
  res.clearCookie("accessToken", COOKIE_OPTIONS);
  res.clearCookie("refreshToken", COOKIE_OPTIONS);
};

/**
 * Create safe user object (never include password/tokens)
 */
const getSafeUser = (user) => {
  return {
    id: user._id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    googleId: user.googleId,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const isWeakPin = (pin) => {
  const weakPins = [
    "0000",
    "1111",
    "2222",
    "3333",
    "4444",
    "5555",
    "6666",
    "7777",
    "8888",
    "9999",
    "1234",
    "4321",
  ];

  return weakPins.includes(pin);
};

const isValidPin = (pin) => {
  return typeof pin === "string" && /^\d{4}$/.test(pin);
};

/*
  POST /api/auth/start

  Checks the phone number and tells the client
  whether it should show the sign-in or sign-up flow.
*/
export const startAuth = async (req, res, next) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const role = req.body.role;

    if (!phone || !/^\+91[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        status: "error",
        message: "Enter a valid Indian mobile number.",
      });
    }

    const user = await User.findOne({ phone }).select("+pinHash");

    if (user && role && user.role !== role) {
      return res.status(403).json({
        status: "error",
        message: `This mobile number is not registered as a ${role}.`,
      });
    }

    return res.json({
      status: "success",
      data: {
        exists: Boolean(user),
        hasPin: Boolean(user?.pinHash),
      },
    });
  } catch (error) {
    next(error);
  }
};

/*
  POST /api/auth/sign-up

  Creates a new citizen account or allows an existing
  citizen without a PIN to set one.
*/
export const signUp = async (req, res, next) => {
  try {
    console.log('🔐 [AUTH] Sign-up attempt:', { phone: req.body.phone });

    const phone = normalizePhone(req.body.phone);
    const pin = String(req.body.pin ?? "");

    if (!phone || !/^\+91[6-9]\d{9}$/.test(phone)) {
      console.log('❌ [ERROR] Invalid phone:', phone);
      return res.status(400).json({
        status: "error",
        message: "Enter a valid Indian mobile number.",
      });
    }

    if (!isValidPin(pin)) {
      console.log('❌ [ERROR] Invalid PIN format');
      return res.status(400).json({
        status: "error",
        message: "PIN must contain exactly 4 digits.",
      });
    }

    if (isWeakPin(pin)) {
      console.log('❌ [ERROR] Weak PIN detected');
      return res.status(400).json({
        status: "error",
        message: "Choose a stronger PIN.",
      });
    }

    const existingUser = await User.findOne({ phone }).select("+pinHash");

    if (existingUser) {
      console.log('ℹ️  [INFO] User already exists:', existingUser._id);

      /*
        An agent/admin must never be able to claim their
        account through the citizen signup flow.
      */
      if (existingUser.role !== "citizen") {
        console.log('❌ [ERROR] Non-citizen trying to sign up');
        return res.status(403).json({
          status: "error",
          message: "This account cannot be created through citizen sign-up.",
        });
      }

      /*
        Existing citizen without a PIN can complete
        the initial PIN setup.
      */
      if (!existingUser.pinHash) {
        console.log('✅ [SUCCESS] Setting PIN for existing user');
        existingUser.pinHash = await bcrypt.hash(pin, BCRYPT_ROUNDS);
        existingUser.status = "active";
        existingUser.failedPinAttempts = 0;
        existingUser.lastFailedAttempt = null;
        existingUser.lockedUntil = null;

        await existingUser.save();

        const token = createToken(existingUser);
        console.log('🎫 [TOKEN] Generated for user:', existingUser._id);

        return res.status(200).json({
          status: "success",
          message: "PIN created successfully.",
          data: {
            token,
            user: {
              id: existingUser._id,
              name: existingUser.name ?? "",
              phone: existingUser.phone,
              role: existingUser.role,
              status: existingUser.status,
            },
          },
        });
      }

      console.log('❌ [ERROR] User already has PIN');
      return res.status(409).json({
        status: "error",
        message: "An account already exists. Please sign in.",
      });
    }

    console.log('✅ [SUCCESS] Creating new citizen account');
    const pinHash = await bcrypt.hash(pin, BCRYPT_ROUNDS);

    const user = await User.create({
      phone,
      pinHash,
      role: "citizen",
      status: "active",
    });

    const token = createToken(user);
    console.log('🎫 [TOKEN] Generated for new user:', user._id);

    return res.status(201).json({
      status: "success",
      message: "Citizen account created successfully.",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name ?? "",
          phone: user.phone,
          role: user.role,
          status: user.status,
        },
      },
    });
  } catch (error) {
    console.error('❌ [ERROR] Sign-up failed:', error);
    next(error);
  }
};

/*
  POST /api/auth/sign-in

  Verifies phone + PIN and creates a JWT session.
*/
export const signIn = async (req, res, next) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const pin = String(req.body.pin ?? "");
    const role = req.body.role;

    if (!phone || !/^\+91[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid sign-in details.",
      });
    }

    if (!isValidPin(pin)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid sign-in details.",
      });
    }

    const user = await User.findOne({ phone }).select("+pinHash");

    /*
      Do not reveal whether the phone number exists.
    */
    if (!user || !user.pinHash) {
      return res.status(401).json({
        status: "error",
        message: "Invalid sign-in details.",
      });
    }

    if (role && user.role !== role) {
      return res.status(403).json({
        status: "error",
        message: `This mobile number is not registered as a ${role}.`,
      });
    }

    /*
      Check account status before comparing the PIN.
    */
    if (user.status !== "active") {
      return res.status(403).json({
        status: "error",
        message: "This account is currently unavailable.",
      });
    }

    /*
      Check temporary lock before attempting bcrypt comparison.
    */
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return res.status(429).json({
        status: "error",
        message: "Too many failed attempts. Please try again later.",
      });
    }

    /*
      If an old lock has expired, reset the counter.
    */
    if (user.lockedUntil && user.lockedUntil <= new Date()) {
      user.lockedUntil = null;
      user.failedPinAttempts = 0;
      user.lastFailedAttempt = null;
    }

    const pinMatches = await bcrypt.compare(pin, user.pinHash);

    if (!pinMatches) {
      user.failedPinAttempts += 1;
      user.lastFailedAttempt = new Date();

      /*
        Five consecutive failures → temporary lock.
      */
      if (user.failedPinAttempts >= 5) {
        user.lockedUntil = new Date(Date.now() + 5 * 60 * 1000);
      }

      await user.save();

      return res.status(401).json({
        status: "error",
        message: "Invalid sign-in details.",
      });
    }

    /*
      Successful login resets failed attempts.
    */
    user.failedPinAttempts = 0;
    user.lastFailedAttempt = null;
    user.lockedUntil = null;

    await user.save();

    const token = createToken(user);

    return res.json({
      status: "success",
      message: "Signed in successfully.",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name ?? "",
          phone: user.phone,
          role: user.role,
          status: user.status,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPin = async (req, res, next) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const pin = String(req.body.pin ?? "");
    const role = req.body.role;

    console.log('🔁 [AUTH] Forgot PIN attempt:', { phone, role });

    if (!phone || !/^\+91[6-9]\d{9}$/.test(phone)) {
      console.log('❌ [AUTH] Forgot PIN invalid phone:', phone);
      return res.status(400).json({
        status: "error",
        message: "Enter a valid Indian mobile number.",
      });
    }

    if (!isValidPin(pin)) {
      console.log('❌ [AUTH] Forgot PIN invalid format');
      return res.status(400).json({
        status: "error",
        message: "PIN must contain exactly 4 digits.",
      });
    }

    if (isWeakPin(pin)) {
      console.log('❌ [AUTH] Forgot PIN weak PIN rejected');
      return res.status(400).json({
        status: "error",
        message: "Choose a stronger PIN.",
      });
    }

    const user = await User.findOne({ phone }).select("+pinHash");

    if (!user || !user.pinHash) {
      console.log('❌ [AUTH] Forgot PIN no existing user found for phone:', phone);
      return res.status(404).json({
        status: "error",
        message: "No account found for this mobile number.",
      });
    }

    if (role && user.role !== role) {
      console.log('❌ [AUTH] Forgot PIN wrong role for phone:', { phone, userRole: user.role, requestedRole: role });
      return res.status(403).json({
        status: "error",
        message: `This mobile number is not registered as a ${role}.`,
      });
    }

    if (user.status !== "active") {
      console.log('❌ [AUTH] Forgot PIN blocked because account is not active:', { phone, status: user.status });
      return res.status(403).json({
        status: "error",
        message: "This account is currently unavailable.",
      });
    }

    user.pinHash = await bcrypt.hash(pin, BCRYPT_ROUNDS);
    user.failedPinAttempts = 0;
    user.lastFailedAttempt = null;
    user.lockedUntil = null;

    await user.save();

    const token = createToken(user);
    console.log('✅ [AUTH] PIN reset successful for user:', {
      userId: user._id,
      phone,
      role: user.role,
    });

    return res.status(200).json({
      status: "success",
      message: "PIN reset successfully.",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name ?? "",
          phone: user.phone,
          role: user.role,
          status: user.status,
        },
      },
    });
  } catch (error) {
    console.error('❌ [AUTH] Forgot PIN failed:', error);
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found.",
      });
    }

    console.log('👤 [AUTH] Profile fetched for user:', { userId: user._id, role: user.role });

    return res.json({
      status: "success",
      data: {
        profile: {
          id: user._id,
          name: user.name ?? "",
          phone: user.phone,
          email: user.email ?? "",
          role: user.role,
          status: user.status,
        },
      },
    });
  } catch (error) {
    console.error('❌ [AUTH] Get profile failed:', error);
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const trimmedName = typeof name === "string" ? name.trim() : "";
    const trimmedEmail = typeof email === "string" ? email.trim() : "";

    if (!trimmedName) {
      return res.status(400).json({
        status: "error",
        message: "Name is required.",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found.",
      });
    }

    user.name = trimmedName;
    if (trimmedEmail) {
      user.email = trimmedEmail.toLowerCase();
    }

    await user.save();

    console.log('✅ [AUTH] Profile updated for user:', {
      userId: user._id,
      role: user.role,
      name: user.name,
      email: user.email,
    });

    return res.json({
      status: "success",
      message: "Profile updated successfully.",
      data: {
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email ?? "",
          role: user.role,
          status: user.status,
        },
      },
    });
  } catch (error) {
    console.error('❌ [AUTH] Update profile failed:', error);
    next(error);
  }
};

export const getMe = async (req, res, next) => {
try{
return res.json({
  status:"success",
  data : {
    user : {
      id: req.user._id ,
      name:req.user.name ?? "",
      phone:req.user.phone,
      email:req.user.email ?? "",
      googleId:req.user.googleId ?? "",
      role:req.user.role,
      status:req.user.status,

    }
  }
})
} catch(error){
next(error);
}
}

/**
 * POST /api/auth/google
 * Handle Google OAuth login/signup
 */
export const googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        status: "error",
        message: "Google credential is required.",
      });
    }

    console.log('🔐 [GOOGLE-AUTH] Verifying Google token...');

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    console.log('✅ [GOOGLE-AUTH] Token verified:', { email, name, googleId });

    // Check if user exists with this Google ID
    let user = await User.findOne({ googleId });

    if (user) {
      console.log('👤 [GOOGLE-AUTH] Existing user found:', user._id);

      // User exists, log them in
      const token = createToken(user);

      return res.json({
        status: "success",
        message: "Signed in successfully with Google.",
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            phone: user.phone,
            email: user.email,
            googleId: user.googleId,
            role: user.role,
            status: user.status,
          },
        },
      });
    }

    // Check if user exists with this email
    user = await User.findOne({ email });

    if (user) {
      console.log('📧 [GOOGLE-AUTH] User with email exists, linking Google account:', user._id);

      // Link Google account to existing user
      user.googleId = googleId;
      if (!user.name) user.name = name;
      await user.save();

      const token = createToken(user);

      return res.json({
        status: "success",
        message: "Google account linked successfully.",
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            phone: user.phone,
            email: user.email,
            googleId: user.googleId,
            role: user.role,
            status: user.status,
          },
        },
      });
    }

    // New user, create account with Google
    console.log('🆕 [GOOGLE-AUTH] Creating new user with Google:', email);

    user = await User.create({
      googleId,
      email,
      name,
      // Don't set phone for Google-only accounts, will be added when they link mobile
      role: "citizen",
      status: "active",
    });

    const token = createToken(user);

    return res.status(201).json({
      status: "success",
      message: "Account created successfully with Google.",
      data: {
        token,
        needsPhone: true, // Flag to indicate user needs to add mobile number
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          googleId: user.googleId,
          role: user.role,
          status: user.status,
        },
      },
    });
  } catch (error) {
    console.error('❌ [GOOGLE-AUTH] Failed:', error);
    next(error);
  }
};

/**
 * POST /api/auth/link-mobile
 * Link mobile number and PIN to Google account
 */
export const linkMobile = async (req, res, next) => {
  try {
    const { phone: rawPhone, pin } = req.body;
    const phone = normalizePhone(rawPhone);

    console.log('📱 [LINK-MOBILE] Request:', { userId: req.user._id, phone });

    if (!phone || !/^\+91[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        status: "error",
        message: "Enter a valid Indian mobile number.",
      });
    }

    if (!isValidPin(pin)) {
      return res.status(400).json({
        status: "error",
        message: "PIN must contain exactly 4 digits.",
      });
    }

    if (isWeakPin(pin)) {
      return res.status(400).json({
        status: "error",
        message: "Choose a stronger PIN.",
      });
    }

    // Check if phone is already used by another user
    const existingUser = await User.findOne({ phone, _id: { $ne: req.user._id } });

    if (existingUser) {
      return res.status(409).json({
        status: "error",
        message: "This mobile number is already registered to another account.",
      });
    }

    // Update current user
    const user = await User.findById(req.user._id);
    user.phone = phone;
    user.pinHash = await bcrypt.hash(pin, BCRYPT_ROUNDS);
    await user.save();

    console.log('✅ [LINK-MOBILE] Mobile number linked successfully:', user._id);

    return res.json({
      status: "success",
      message: "Mobile number and PIN added successfully.",
      data: {
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          googleId: user.googleId,
          role: user.role,
          status: user.status,
        },
      },
    });
  } catch (error) {
    console.error('❌ [LINK-MOBILE] Failed:', error);
    next(error);
  }
};

/**
 * POST /api/auth/link-google
 * Link Google account to mobile-based account
 */
export const linkGoogle = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        status: "error",
        message: "Google credential is required.",
      });
    }

    console.log('🔗 [LINK-GOOGLE] Verifying token for user:', req.user._id);

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    // Check if Google ID is already used by another user
    const existingUser = await User.findOne({ googleId, _id: { $ne: req.user._id } });

    if (existingUser) {
      return res.status(409).json({
        status: "error",
        message: "This Google account is already linked to another user.",
      });
    }

    // Update current user
    const user = await User.findById(req.user._id);
    user.googleId = googleId;
    if (!user.email) user.email = email;
    if (!user.name) user.name = name;
    await user.save();

    console.log('✅ [LINK-GOOGLE] Google account linked successfully:', user._id);

    return res.json({
      status: "success",
      message: "Google account linked successfully.",
      data: {
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          googleId: user.googleId,
          role: user.role,
          status: user.status,
        },
      },
    });
  } catch (error) {
    console.error('❌ [LINK-GOOGLE] Failed:', error);
    next(error);
  }
};