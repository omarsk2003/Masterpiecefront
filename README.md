# LIFT frontend preview

LIFT is a browser-based fitness and nutrition prototype built with HTML, CSS, and JavaScript. It has four workspaces: Client, Coach, Nutrition Specialist, and Admin. The public site explains the Free, AI Plan, and Premium tiers; account registration and plan selection happen after entering the client flow.

This repository is a **frontend preview**, not a production service. AI replies and plans are sample content, authentication and role checks are simulated in the browser, and payments, email delivery, and video meetings are not connected to live services.

## Run locally

1. Install Node.js if it is not already available.
2. From the repository root, run `node Scripts/preview.cjs`.
3. Open <http://127.0.0.1:5173/> for the landing page, or <http://127.0.0.1:5173/index.html> for the development page directory.

There is no package install or build step. Opening `index.html` directly also works for most pages, but the local server gives all pages the same origin so browser-stored preview data is shared. It also avoids browser restrictions on local files used by the landing animation and certificate previews.

The demo login accounts and password are documented in [Shared/Login/README.md](Shared/Login/README.md). New client accounts can be created through [Client Registration](Client/Registration/registration.html); they start on Free Plan. The first AI Assistant visit asks for a separate lifestyle profile before personalized AI features are shown. See [Client/Registration/README.md](Client/Registration/README.md).

## Main flows

- **Public:** [Landing page](Public/LandingPage/landing-page.html), [About](Public/AboutUs/about-us.html), [Contact](Public/ContactUs/contact-us.html), and [Login](Shared/Login/login.html). The landing hero uses a locally stored, five-second Adobe Firefly animation made from the original runner image; asset details are in [VIDEO-SOURCE.md](Public/LandingPage/assets/VIDEO-SOURCE.md).
- **Client:** registration, plan selection, dashboard, AI Assistant, workout, nutrition, progress, messages, coach meetings, support, subscription, and profile. The profile manages the photo, name, and password for registered accounts; the sign-in email is read-only. Coach meetings are part of the Premium experience.
- **Coach:** registration and certificate review flow, dashboard, assigned clients, exercise coaching, messages, meetings, and profile. A client's **Review plan** action opens the workout editor in a popup from My Clients.
- **Nutrition Specialist:** registration and certificate review flow, dashboard, assigned clients, nutrition guidance, messages, and profile. A client's **Review plan** action opens the nutrition editor in a popup from My Clients.
- **Admin:** dashboards for client and specialist management, subscriptions, site appearance and public copy, messages, and support conversations.

Use [index.html](index.html) to jump directly to every implemented page, including pages that are normally reached from another flow or popup.

## Project layout

| Directory | Purpose |
| --- | --- |
| `Public/` | Landing, About, Contact, and visual preview pages |
| `Client/` | Client onboarding and member experience |
| `Coach/` | Training coach workspace |
| `Nutrition/` | Nutrition specialist workspace |
| `Admin/` | Administrative tools |
| `Shared/` | Login, reusable UI components, styles, and browser-side data helpers |
| `Scripts/` | Local preview server |

Each feature generally keeps its HTML, CSS, and JavaScript in its own directory. Shared navbars, sidebars, and footers live under `Shared/Components/`.

## Preview data and limitations

Several flows save demo state in `localStorage`, `sessionStorage`, or IndexedDB, including accounts, profile photos, plan reviews, messages, meeting requests, theme and site appearance, specialist applications, and coach-uploaded exercise videos. These records stay in the current browser and origin; they are not synchronized between devices or uploaded to GitHub. The client, coach, and nutrition experiences may show different data if opened under `file://` versus the local server.

Registered account passwords are stored as salted digests for this preview, but browser storage and client-side role checks are **not secure authentication**. Do not use real passwords or personal health information. The AI Assistant uses sample responses rather than a live model. Professional review, billing, support, and meetings are UI simulations until a backend is connected.

## Plan behavior shown in the UI

- **Free:** activity, workout and food logging, progress tracking, and general guidance.
- **AI Plan:** Free features plus a personalized workout and nutrition experience based on a lifestyle profile supplied when the AI Assistant is first used.
- **Premium:** AI Plan plus coach and nutrition specialist review, separate conversations, and coach meeting requests.

Plan descriptions on the landing page are explanatory; the visitor does not choose a plan there. Client plan selection is in the registration and subscription flows.
