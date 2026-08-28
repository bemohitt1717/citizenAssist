# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React + JavaScript + Tailwind CSS (client), Node.js + Express (server), MongoDB. Frontend and backend live as independently organized folders: `client/` and `server/`. Confirmed by the user's brief and the existing scaffold.

## Users

Primary user is an Indian citizen who needs a government certificate or document and finds the official procedure confusing. They are often first-time applicants, unsure which documents they need, unsure what the process costs, and without a trustworthy local contact. They arrive on a phone or a shared computer, frequently under time pressure, sometimes after already losing a day to a failed office visit.

Two further roles exist in the product but are out of current frontend scope: **service agents** (local professionals who do the legwork) and **admin** (verifies agents, manages services and disputes).

## Product Purpose

Citizen Assist makes government documentation approachable. A citizen can understand what a service involves, see the requirements, charges, and timeline up front, request assistance, and track the request until it is complete. Success is a citizen who understood the process before they committed to it, and who never had to guess what happened to their request.

## Positioning

Citizen Assist is not a government authority and does not issue certificates. It is the layer between a citizen and an opaque procedure: verified human agents, published charges, and a tracked request. The mechanism a neighboring product cannot truthfully copy is the combination of **admin-verified agents** and **transparent, stated assistance charges before the request is placed**.

## Operating Context

Six services at launch: Income Certificate, Caste Certificate, Domicile Certificate, Birth Certificate, PAN Services, Aadhaar Services. Each carries a description, assistance charge, estimated processing time, required documents, and eligibility notes.

Citizen flow: Home → explore services → service detail → get assistance → login/register → submit request → agent assigned → agent processes → status updates → completed.

Request statuses: Pending → Agent Assigned → Documents Under Review → Processing → Completed. Rejected, Cancelled, and Action Required may be added later.

Agent lifecycle: registers → admin reviews → admin verifies → active → receives and accepts requests → updates progress → completes.

## Capabilities and Constraints

Current scope is the citizen-facing frontend only: Home / landing, Services and service detail, Login. Agent and admin interfaces are explicitly deferred. The backend stays a minimal runnable Express foundation for now.

Hard constraint: the product must never claim to issue government certificates or to hold government affiliation. Every surface must be readable as an assistance service whose official output comes from the authorized authority. Charges must be stated, not implied.

The product must stay focused. No expansion into a general SaaS platform, no new major features without discussion.

## Brand Commitments

Name: **Citizen Assist**. Voice: plain, calm, non-bureaucratic; explains rather than markets; never uses fear or urgency.

Binding visual constraints the user pinned for the landing page: a warm, light palette; a single heavy grotesque type family; a capsule/pill-shaped photograph set inline inside the display headline; pill-shaped controls; short page length; and modern-website section types rather than the generic "How It Works / Why Choose Us" pair.

## Evidence on Hand

No real citizens, testimonials, request volumes, agent counts, or partner relationships exist yet. Nothing of that kind may be presented as real. Government and public-service ecosystem references may only be shown as the ecosystem a citizen is navigating, never as endorsement or affiliation. Photography is licensed stock; illustrative service data is authored and must be labeled where a visitor could mistake it for a live figure.

## Product Principles

1. **Explain before asking.** A citizen sees requirements, charges, and timeline before they commit to anything.
2. **State the limit.** The platform's boundary (assistance, not issuance) is disclosed plainly wherever a visitor could misread it, not buried in a footer.
3. **A human is accountable.** Every request has a named, verified agent behind it.
4. **No procedural surprises.** Status is always visible; charges never move after the request is placed.
5. **Stay small.** Six services, three roles, one purpose.

## Accessibility & Inclusion

Users include first-time internet users, older applicants, and people reading on low-end phones over slow connections. The surface must stay legible at small sizes and low contrast conditions, work on mobile first, and never depend on colour alone to convey status. English at launch; copy should avoid idiom so it translates cleanly to Hindi and regional languages later.
