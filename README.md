<div align="center">

# Citizen Assist

**Government paperwork, handled with you.**

A citizen-facing platform for getting help with government certificates and ID
documents — through agents an administrator has verified, at charges published
before you commit.

<br />

![React](https://img.shields.io/badge/React-19-16170F?style=flat-square)
![Vite](https://img.shields.io/badge/Vite-8-16170F?style=flat-square)
![Tailwind](https://img.shields.io/badge/Tailwind-4-16170F?style=flat-square)
![Express](https://img.shields.io/badge/Express-5-16170F?style=flat-square)
![MongoDB](https://img.shields.io/badge/MongoDB-planned-9E4E12?style=flat-square)

</div>

---

> [!IMPORTANT]
> **Citizen Assist is not a government body.** It is an independent assistance
> service, not affiliated with, endorsed by, or acting on behalf of any government
> department or portal. Certificates and official documents are issued solely by
> the competent authority. Charges shown are for assistance and are separate from
> any statutory government fee.
>
> This repository is a **college project prototype**. All data on screen is
> invented, no backend is connected, and nothing submitted through it reaches a
> real office.

---

## The problem

Getting a certificate in India is rarely about the certificate. It is about not
knowing which documents are needed, finding out a page is missing *after* queueing
for a morning, not knowing what help will cost until you are too far in to walk
away, and having no idea where your file is once it is submitted.

Citizen Assist answers those four things directly:

| What goes wrong | What the platform does |
| --- | --- |
| The requirement list changes and nobody says which version is current | The agent checks your file against the list the office is actually using |
| A missing page surfaces only after you have queued | Every document is named on the service page, and checked before submission |
| Nobody quotes the cost until you are committed | The charge is published as a range, then confirmed before any work starts |
| Once submitted, the file disappears | The request carries a status you can open at any time |

---

## Roles

| Role | Can do |
| --- | --- |
| **Citizen** | Browse six services, read the requirements, start a request, track it |
| **Service agent** | Accept or decline assigned requests, move them along, add notes, see earnings |
| **Administrator** | Verify agents, assign and oversee requests, manage services, resolve complaints |

All three sign in the same two ways — a one-time code to a mobile number, or a
Google account. Role is a field on the user, not a separate system.

---

## Services at launch

Income Certificate · Caste Certificate · Domicile Certificate · Birth Certificate
· PAN Services · Aadhaar Services

Each carries a description, an assistance charge, an estimated timeline, and the
documents required — including **what part of each document to photograph**, which
is the detail that actually stops a submission bouncing back.

---

## Screens

<details open>
<summary><b>Citizen</b></summary>

| Route | What it is |
| --- | --- |
| `/` | Landing page — hero, the six services, an animated walk-through of the process, and what the platform does and does not do |
| `/services/:serviceId` | Single-viewport detail surface. Pick a document to see its layout, capture guidance and accepted file formats |
| `/track` | Requests with their status timeline |
| `/become-an-agent` | Three-step agent application |
| `/login` | Role picker, then a one-time code or Google |

Starting a request opens a four-step dialog in place: confirm what is needed →
your details → attach documents → review and submit.

</details>

<details>
<summary><b>Service agent</b> — <code>/agent/:section</code></summary>

| Section | What it is |
| --- | --- |
| `dashboard` | What needs a decision today, plus earnings at a glance |
| `requests` | Everything assigned, filtered by status. Expand a row to update status, send a note, or attach the finished document |
| `earnings` | Settled and unsettled, per request |
| `profile` | Editable details and verification standing |

</details>

<details>
<summary><b>Administrator</b> — <code>/admin/:section</code></summary>

| Section | What it is |
| --- | --- |
| `dashboard` | Verification queue first, then platform figures and service demand |
| `requests` | Every request; assign or reassign an agent |
| `agents` | Verify, reject or suspend |
| `services` | Charges, timelines and the citizen-facing summary |
| `complaints` | Resolve, with a required written outcome |
| `profile` | The administrator account |

</details>

---

## Running it

**Requirements:** Node 20 or newer.

```bash
git clone <your-repo-url>
cd citizenAssist
```

<table>
<tr><th align="left">Frontend</th><th align="left">Backend</th></tr>
<tr valign="top">
<td>

```bash
cd client
npm install
npm run dev
```

→ `http://localhost:5173`

</td>
<td>

```bash
cd server
npm install
npm run dev
```

→ `http://localhost:5000`

</td>
</tr>
</table>

The frontend runs entirely standalone. The backend is currently a minimal Express
foundation and is not required to view any screen.

### Signing in

There is no server to verify against yet, so **any** well-formed mobile number and
six-digit code gets through. Pick a role at `/login`, enter a 10-digit number
starting 6–9, then any six digits.

| Role | Lands on |
| --- | --- |
| Citizen | `/track` |
| Service agent | `/agent/dashboard` |
| Administrator | `/admin/dashboard` |

> [!WARNING]
> **Sign-in is not a login.** While `IS_DEMO_AUTH` is true in
> `client/src/constants/demoAuth.js` it guards nothing, and there are no route
> guards either — `/agent/…` and `/admin/…` open by typing the URL whether you sign
> in or not.
>
> That is fine for a prototype whose data is invented. It stops being fine the
> moment anything real sits behind it. Delete that file when the API lands and add
> the route guards at the same time; the flag is the single switch every use sits
> behind, so removing it turns each one into a build error rather than a silent
> hole.

---

## Project layout

```
citizenAssist/
├── client/                     React + Vite frontend
│   ├── public/
│   │   └── logos/              Portal logos go here (falls back to text)
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         Navbar, Footer, Logo, UserMenu, PageShell
│   │   │   └── ui/             Icon, DataKit, ConfirmDialog, DocumentSchematic
│   │   ├── constants/          Services, documents, roles, request statuses
│   │   ├── features/
│   │   │   ├── admin/          Admin dashboard — own shell, sections, data
│   │   │   ├── agent/          Agent application + dashboard
│   │   │   ├── auth/           Sign-in form, role picker, showcase
│   │   │   ├── home/           Landing page sections
│   │   │   ├── request/        The four-step request dialog
│   │   │   ├── serviceDetail/  Service detail surface
│   │   │   └── track/          Request tracking
│   │   ├── hooks/              useReveal, usePointerGlow, useAutoHeight
│   │   └── pages/              One file per route
│   └── vercel.json
└── server/                     Express foundation
```

The agent and admin dashboards are **deliberately separate features** — their own
shells, sections and data files, with nothing branching on a role. Only
design-system atoms are shared.

---

## Deploying the frontend

Vercel, with **Root Directory set to `client`**. `client/vercel.json` supplies the
build command, the SPA rewrite (without it, refreshing `/agent/dashboard` returns
404), long-lived caching for hashed assets, and a small set of security headers.

```
Root Directory     client
Framework          Vite        (detected)
Build Command      npm run build
Output Directory   dist
```

---

## Conventions worth knowing

A few decisions are load-bearing and easy to undo by accident:

- **Colour never carries meaning alone.** Every status pill has a label, cleared
  checkboxes are filled *and* ticked while open ones are outlined and empty. This
  survives greyscale and colour-blind vision.
- **Contrast is verified, not eyeballed.** Every text-on-surface pairing sits above
  4.5:1, and the ratio is written in a comment next to the colour.
- **Two primaries only** — indigo `#232A5C` and clay `#9E4E12` — on a warm paper
  ground. The one exception is the sign-in showcase, whose four-hue illustration
  palette is scoped to that panel so it cannot leak into UI chrome.
- **Motion is optional.** Everything animates from an already-visible state, and
  `prefers-reduced-motion: reduce` is honoured throughout.
- **Shared CSS goes in the design system.** A component stylesheet only loads once
  that component mounts, so a class used by two features must not live inside one
  of them.
- **Document schematics, not photographs.** Required documents are shown as
  abstract layout diagrams. Real scans carry real people's data, and convincing
  reproductions of certificates would invite exactly the confusion this product
  exists to prevent.

---

## Not built, on purpose

No payment gateway, no government API integration, no live chat, no notifications,
no file previews, no analytics platform, no AI features. Scope is a one-month
project, and the product has one job.

---

## Status

| Area | State |
| --- | --- |
| Citizen screens | Complete |
| Agent dashboard | Complete, demo data |
| Admin dashboard | Complete, demo data |
| Authentication | Demo only — flag-gated |
| Backend API | Not started |
| Database | Not started |

Every place an API call belongs is marked `TODO(api)` with the route and body
already written next to it. Collection shapes are documented at the top of each
constants file — three collections, no joins.
