# Citizen Assist

A full-stack web platform that helps **citizens get assistance with government certificates and ID documents** — through verified agents, clear document checklists, published charge ranges, and live request tracking from submission to completion.

**[Live Demo →](https://your-frontend-url.vercel.app)** *(add your deployed URL)*

---

## What It Does

- **Browse government-style services** — Income, Caste, Domicile, Birth certificates, PAN & Aadhaar assistance  
- **See exact document requirements** — What to upload, which page to photograph, accepted formats  
- **Submit requests in-app** — 4-step flow: requirements → details → uploads → review  
- **Track every request** — Status timeline with notes (pending → assigned → processing → completed)  
- **Sign in your way** — Indian mobile + 4-digit PIN, or Google OAuth  
- **Become an agent** — Citizens can apply; admins verify before they take work  
- **Role-based dashboards** — Separate experiences for Citizen, Agent, and Admin  
- **File uploads** — PDF, JPG, PNG (up to 10 MB) stored on the server  
- **Raise complaints** — Citizens can report issues; admins resolve with a written outcome  
- **Legal & cookies** — Terms, privacy, cookie policy pages + consent banner  
- **Responsive UI** — Works on mobile, tablet, and desktop  

> **Important:** Citizen Assist is **not** a government body. Certificates are issued only by the competent authority. Shown charges are for **assistance**, separate from statutory government fees.

---

## How It Works

1. **Explore** — Open the landing page and pick one of six services  
2. **Understand** — Read summaries, issuing office, validity, and document schematics on the service detail page  
3. **Sign in** — Choose Citizen / Agent / Admin at login, then PIN or Google  
4. **Start request** — Confirm requirements, fill applicant details, attach documents, review  
5. **Admin assigns** — An administrator assigns a verified agent to your request  
6. **Agent works** — Agent accepts, updates status, adds notes, uploads the finished document  
7. **Track & finish** — Citizen follows the timeline on `/track` until the request is completed  

---

## Built With

### Frontend
- **React 19** — UI with React Compiler (Babel plugin)  
- **Vite 8** — Dev server and production builds  
- **Tailwind CSS v4** — Styling with PostCSS  
- **React Router v7** — Routing, lazy-loaded pages, protected & role routes  
- **Axios** — API client (`withCredentials` for cookies)  
- **@react-oauth/google** — Google sign-in button  
- **Lottie** — Loading / intro animations  

### Backend
- **Node.js + Express 5** — REST API  
- **MongoDB + Mongoose** — Database and schemas  
- **JWT** — Access tokens (Bearer) + refresh tokens (httpOnly cookies)  
- **Bcrypt** — PIN hashing  
- **Google Auth Library** — Verify Google ID tokens  
- **Multer** — Multipart uploads to `server/uploads/`  
- **CORS + cookie-parser** — Cross-origin setup for Vercel ↔ Render  

---

## Project Structure

```
citizenAssist/
│
├── client/                              # Frontend (React + Vite)
│   ├── public/
│   │   └── logos/                       # Portal logos (optional)
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/                  # Navbar, Footer, Logo, CookieConsent, …
│   │   │   └── ui/                      # Buttons, DataKit, ConfirmDialog, loaders
│   │   ├── config/
│   │   │   └── api.js                   # Axios base URL + credentials
│   │   ├── constants/                   # Services, documents, statuses, legal copy
│   │   ├── context/                     # AuthContext
│   │   ├── features/
│   │   │   ├── admin/                   # Admin shell, dashboard, agents, complaints…
│   │   │   ├── agent/                   # Agent apply form, requests, earnings
│   │   │   ├── auth/                    # Login, role chooser, PIN, legal consent
│   │   │   ├── citizen/                 # Citizen dashboard & profile
│   │   │   ├── home/                    # Hero, services grid, how-it-works, about
│   │   │   ├── request/                 # 4-step request modal + provider
│   │   │   ├── serviceDetail/           # Single-viewport service page
│   │   │   ├── services/                # servicesApi
│   │   │   └── track/                   # Request tracking panel
│   │   ├── hooks/                       # useReveal, usePointerGlow, useAutoHeight
│   │   ├── pages/                       # Home, Login, dashboards, LegalPage, …
│   │   ├── routes/                      # ProtectedRoute, RoleRoute, ScrollToHash
│   │   └── utils/                       # storage, apiError, cookieConsent
│   ├── vercel.json                      # SPA rewrite, cache, security headers
│   └── package.json
│
├── server/                              # Backend API
│   ├── config/
│   │   └── db.js                        # MongoDB connection
│   ├── controllers/                     # auth, request, agent, admin, service, complaint, upload
│   ├── middleware/
│   │   ├── auth.midleware.js            # protect + authorize(roles)
│   │   └── documentUpload.middleware.js
│   ├── model/                           # User, Agent, Service, ServiceRequest, Complaint, Document
│   ├── routes/                          # Mounted under /api
│   ├── scripts/
│   │   └── createAdmin.js               # Seed first admin user
│   ├── uploads/                         # Uploaded files (created at runtime)
│   ├── app.js                           # Express app, CORS, error handler
│   ├── server.js                        # Entry + connectDB
│   ├── render.yaml                      # Render deploy blueprint
│   └── package.json
│
└── README.md
```

Agent and admin areas are **separate feature folders** (own shells and APIs), not one dashboard with `if (role)` everywhere.

---

## Getting Started

### Prerequisites
- **Node.js** 20 or higher  
- **npm**  
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))  
- **Google OAuth credentials** (optional but needed for “Continue with Google”)  

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/yourusername/citizenAssist.git
cd citizenAssist
```

**2. Setup backend**
```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env` (see [Environment variables](#-environment-variables-reference) below), then:
```bash
npm run dev
```
Backend runs at **`http://localhost:5000`**  
Health check: **`GET http://localhost:5000/api/health`**

**Create admin (first time):**
```bash
node scripts/createAdmin.js
```
Default phone/PIN are in that script — change them before any real deployment.

**3. Setup frontend**
```bash
cd client
npm install
cp .env.example .env
```

Edit `client/.env`, then:
```bash
npm run dev
```
Frontend runs at **`http://localhost:5173`**

**4. Try the app**
- Open `/login` → pick **Citizen**, **Agent**, or **Admin**  
- New citizen: enter mobile → sign up with a 4-digit PIN (weak PINs like `1234` are rejected on signup)  
- Admin: use the account from `createAdmin.js`  
- Agent: apply at `/become-an-agent` (citizen role), then admin verifies in `/admin/agents`  

---

## Key Features

### Four-step request flow
The main citizen journey lives in a modal (survives route changes via `RequestFlowHost`):

- **Step 1** — Confirm you have the listed documents  
- **Step 2** — Applicant name, phone, email, district, address  
- **Step 3** — Upload required files (validated type & size)  
- **Step 4** — Review and submit → creates `ServiceRequest` with reference (e.g. `CA-4821`)  

If a guest clicks “Start request”, a login prompt appears instead.

### Authentication
- **`POST /auth/start`** — Checks if phone exists and matches selected role  
- **Sign-up / sign-in** — 4-digit PIN, bcrypt-hashed, lockout after failed attempts  
- **Google OAuth** — Creates or logs in users; link mobile/PIN later if needed  
- **JWT access token** — Stored client-side for `Authorization: Bearer`  
- **Refresh cookies** — httpOnly cookies for session refresh in production  
- **Protected routes** — `ProtectedRoute` + `RoleRoute` on the frontend; `protect` + `authorize` on the API  

### Citizen experience
- Landing page with services, process animation, and disclaimers  
- Full-screen **service detail** with document schematics (not real certificate photos)  
- **`/track`** and **`/citizen/track`** — List requests and expandable timelines  
- **Profile** — Update details via API  
- **Complaints** — Submit subject + description (optionally tied to a request)  

### Agent workspace (`/agent/:section`)
| Section | Purpose |
| --- | --- |
| `dashboard` | Today’s decisions, quick stats |
| `requests` | Assigned work — accept/decline, status, notes, upload completed doc |
| `earnings` | Settled vs pending per request |
| `profile` | Agent details and verification status |

### Admin panel (`/admin/:section`)
| Section | Purpose |
| --- | --- |
| `dashboard` | Verification queue + platform overview |
| `requests` | All requests — assign or reassign agents |
| `agents` | Verify, reject, or suspend applicants |
| `services` | Edit charges, timelines, summaries |
| `complaints` | Resolve with mandatory admin response |
| `profile` | Admin account settings |

---

## Frontend routes

| Path | Access | Description |
| --- | --- | --- |
| `/` | Public | Landing page |
| `/services/:serviceId` | Public | Service detail + start request |
| `/login` | Public | Role chooser + auth |
| `/become-an-agent` | Public (apply needs login) | Agent application |
| `/track` | Citizen | Track requests |
| `/citizen/:section?` | Citizen | `dashboard`, `track`, `profile` |
| `/agent/:section?` | Agent | Agent workspace |
| `/admin/:section?` | Admin | Admin panel |
| `/terms-and-conditions` | Public | Legal |
| `/privacy-policy` | Public | Legal |
| `/cookie-policy` | Public | Legal |

---

## API endpoints

Base URL: **`/api`** (e.g. `http://localhost:5000/api`)

### Auth (`/api/auth`)

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| POST | `/auth/start` | Check phone + role for sign-in vs sign-up | No |
| POST | `/auth/sign-up` | Create citizen account with PIN | No |
| POST | `/auth/sign-in` | Login with phone, PIN, role | No |
| POST | `/auth/forgot-pin` | Reset PIN flow | No |
| POST | `/auth/google` | Google ID token login | No |
| POST | `/auth/link-mobile` | Attach phone + PIN to Google account | Yes |
| POST | `/auth/link-google` | Attach Google to mobile account | Yes |
| GET | `/auth/me` | Current user | Yes |
| GET | `/auth/profile` | Profile details | Yes |
| PATCH | `/auth/profile` | Update profile | Yes |

### Services (`/api/services`)

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| GET | `/services` | List active services | No |
| GET | `/services/:id` | Service by Mongo `_id` or logic in controller | No |
| POST | `/services` | Create service | Admin |

### Requests — citizen (`/api`)

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| POST | `/requests` | Create service request | Citizen |
| GET | `/citizen/requests` | My requests | Citizen |
| PATCH | `/citizen/requests/:id` | Update own request | Citizen |
| POST | `/citizen/requests/:id/documents` | Upload document | Citizen |
| GET | `/request-documents/:filename` | Download document | Yes |

### Agent (`/api`)

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| POST | `/agents/apply` | Apply to become agent | Citizen |
| GET | `/agent/profile` | Agent profile | Agent |
| PATCH | `/agent/profile` | Update profile | Agent |
| GET | `/agent/dashboard` | Dashboard stats | Agent |
| GET | `/agent/earnings` | Earnings breakdown | Agent |
| GET | `/agent/requests` | Assigned requests | Agent |
| PATCH | `/agent/requests/:id/decision` | Accept or decline | Agent |
| PATCH | `/agent/requests/:id/status` | Update status | Agent |
| POST | `/agent/requests/:id/notes` | Add timeline note | Agent |
| POST | `/agent/requests/:id/document` | Upload completed file | Agent |

### Admin (`/api/admin/*`)

All routes require **Admin** role.

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/admin/dashboard` | Overview |
| GET/PATCH | `/admin/profile` | Admin profile |
| GET | `/admin/agents` | List agents |
| PATCH | `/admin/agents/:id` | Verify / reject / suspend |
| GET | `/admin/requests` | All requests |
| PATCH | `/admin/requests/:id/assign` | Assign agent |
| POST | `/admin/requests/:id/document` | Upload on behalf of request |
| GET | `/admin/complaints` | List complaints |
| PATCH | `/admin/complaints/:id` | Resolve complaint |
| GET | `/admin/services` | Services for admin UI |
| PATCH | `/admin/services/:id` | Update service metadata |

### Complaints

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| POST | `/complaints` | Create complaint | Citizen |

### Health

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/health` | API status + timestamp |

---

## Database models

### User
```javascript
{
  name: String,
  phone: String (unique, +91 format, sparse for Google-only),
  pinHash: String (select: false),
  email: String,
  googleId: String,
  role: 'citizen' | 'agent' | 'admin',
  status: 'pending' | 'active' | 'rejected' | 'suspended',
  failedPinAttempts: Number,
  lockedUntil: Date,
  refreshTokenVersion: Number,
  createdAt, updatedAt
}
```

### Agent
```javascript
{
  user: ObjectId → User,
  verificationStatus: 'pending' | 'active' | 'rejected' | 'suspended',
  name, phone, email, district, experience: String,
  services: [String],              // service IDs agent can handle
  appliedAt, verifiedOn: Date,
  totalRequests, completedRequests: Number,
  rating: Number (0–5),
  isAvailable: Boolean
}
```

### ServiceRequest
```javascript
{
  reference: String (unique, e.g. CA-4821),
  citizen: ObjectId → User,
  serviceId, serviceName: String,
  agent: ObjectId → Agent,
  agentName: String,
  status: 'pending' | 'assigned' | 'review' | 'processing' |
          'completed' | 'action' | 'rejected' | 'cancelled',
  charge: String,
  applicantDetails: { fullName, phone, email, district, address },
  timeline: [{ status, at, note }],
  documents: [String],
  completedDocument: String,
  completedAt: Date
}
```

### Service (DB catalog)
```javascript
{
  serviceId: String (unique, matches frontend ids),
  name, description, summary, charge, timeline: String,
  requiredDocuments: [String],
  isActive: Boolean
}
```

### Complaint
```javascript
{
  citizen: ObjectId → User,
  request: ObjectId → ServiceRequest (optional),
  against: String,
  subject, description: String,
  status: 'open' | 'under-review' | 'resolved' | 'closed',
  adminResponse: String
}
```

### Document
```javascript
{
  request: ObjectId → ServiceRequest,
  name, fileUrl: String,
  status: 'uploaded' | 'verified' | 'rejected',
  rejectionReason: String
}
```

---

## Deployment guide

### Frontend (Vercel)
1. Push code to GitHub  
2. Import project on [Vercel](https://vercel.com)  
3. Set **Root Directory** to `client`  
4. Environment variables:
   ```
   VITE_API_URL=https://your-api.onrender.com/api
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```
5. Build: `npm run build` · Output: `dist`  
6. `vercel.json` already configures SPA rewrites and security headers  

### Backend (Render)
1. Create a **Web Service** from the repo (or use `render.yaml`)  
2. Root directory: `server`  
3. Build: `npm install` · Start: `npm start`  
4. Set all variables from `server/.env.example` in the Render dashboard  
5. Health check path: `/api/health`  

### CORS
Set **`CLIENT_URL`** on the server to your Vercel URL(s), comma-separated for preview + production:

```env
CLIENT_URL=http://localhost:5173,https://your-app.vercel.app
```

In development, localhost origins are allowed automatically when `NODE_ENV !== production`.

---

## Environment variables reference

### Backend (`server/.env`)
```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb+srv://...

JWT_SECRET=long_random_string
JWT_REFRESH_SECRET=another_long_random_string

GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx

CLIENT_URL=http://localhost:5173,https://your-app.vercel.app
COOKIE_DOMAIN=                          # optional; e.g. .yourdomain.com in prod
```

### Frontend (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
```

If `VITE_API_URL` is missing in production builds, the client falls back to `https://citizenassist.onrender.com/api` — update that in `client/src/config/api.js` if your API URL differs.

---

## Design & UX

- **Warm paper + indigo/clay palette** — Readable, non-generic govtech feel  
- **Status never relies on color alone** — Labels on pills; checkboxes use shape + fill  
- **Document schematics** — Abstract layout diagrams instead of fake certificate scans  
- **Reduced motion** — Animations respect `prefers-reduced-motion`  
- **Lazy routes + intro gate** — Faster first paint on the home page  
- **Cookie consent + legal pages** — Terms, privacy, and cookie policy linked from footer and signup  

---

## Scope & limitations (college project)

This repo was built as a **learning / academic full-stack project** — real MERN patterns, three roles, and uploads — not a licensed govtech product.

| Not included (by design) | Notes |
| --- | --- |
| SMS OTP | Phone auth uses a **PIN**, not SMS verification |
| Payment gateway | Charges are indicative; no online payment |
| Government APIs | No live integration with official portals |
| Push / email notifications | Status is in-app only |
| Cloud file CDN | Files live in `server/uploads/` (use S3/Cloudinary for scale) |

Assistance prices on the UI are **ranges for demo**; an agent confirms the final amount before work proceeds.

---

## NPM scripts

| Location | Command | Purpose |
| --- | --- | --- |
| `client/` | `npm run dev` | Vite dev server |
| `client/` | `npm run build` | Production build |
| `client/` | `npm run lint` | ESLint |
| `client/` | `npm run preview` | Preview production build |
| `server/` | `npm run dev` | Nodemon |
| `server/` | `npm start` | Production server |

---

## Contributing

Contributions welcome for learning and portfolio use:

1. Fork the repository  
2. Create a branch (`git checkout -b feature/my-change`)  
3. Commit with a clear message  
4. Push and open a Pull Request  

---

## License

MIT License — use and modify freely; add your own license file if you publish formally.

---

## Author

**Your Name**  
- GitHub: [@yourusername](https://github.com/yourusername)  
- Live app: *(add Vercel URL)*  

---

## Acknowledgments

- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) — Cloud database  
- [Vercel](https://vercel.com) — Frontend hosting  
- [Render](https://render.com) — Backend hosting  
- [Google Cloud Console](https://console.cloud.google.com) — OAuth credentials  
- React, Vite, and Express communities for docs and examples  

---

**Built as a student full-stack project — helping citizens understand paperwork before they stand in queue.**
