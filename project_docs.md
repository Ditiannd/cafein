# Cafein Today - Project Documentation

## 1. Overview
Cafein Today is a modern, single-tenant cafe web application designed with a luxury dark theme, minimalist thin-line iconography, and an immersive user experience. It serves two primary audiences:
1. **Customers**: Online menu browsing, booking/ordering, promotional visibility, and post-purchase review submissions.
2. **Staff/Admins**: Barista POS (Point of Sale) for in-store transactions, Kanban board for order preparation, and an Admin Dashboard for complete content management.

## 2. Architectural Decisions
- **Framework**: Next.js 14 with App Router (React)
- **Styling**: Tailwind CSS with custom CSS variables for branding (`var(--color-brand-accent)`, `var(--color-brand-dark)`)
- **Animation**: Framer Motion for scroll effects, page transitions, and micro-interactions
- **Icons**: Lucide React
- **Backend Architecture**: Production-ready setup for deployment on a VPS (e.g., Coolify).
  - **Database**: PostgreSQL
  - **ORM**: Drizzle ORM for type-safe database interactions
  - **API Layer**: Next.js App Router Route Handlers (`/api/...`)
  - **Authentication**: JWT-based session management using `jose` with `HttpOnly` cookies. Passwords hashed via `bcryptjs`.
  - **API Client**: A unified, strongly-typed API client wrapper (`src/lib/api.ts`).
  - **Data Fetching**: Custom React hooks (`useApiQuery`) for declarative data fetching with periodic polling and focus revalidation.

### 2.1 Backend Implementation Details & Security
- **Data Validation**: Client requests are validated server-side to prevent tampering (e.g., verifying item prices directly from the database rather than trusting client payloads during checkout).
- **Authentication & RBAC**: Next.js Middleware (`src/middleware.ts`) protects routes based on roles (e.g., `admin`, `barista`). 
- **Stateless Sessions**: JWT tokens are signed securely and stored in `HttpOnly` cookies, eliminating the need for `localStorage` persistence of sensitive user data.

## 3. Core Features

### 3.1 Landing Page v2 (9-Chapter Resort Storytelling)
- **Cinematic 9-Chapter Narrative**: Re-engineered into a continuous luxury storytelling experience:
  - *Chapter I — Hero Experience*: Slow background zoom, radial lighting, particle glow, and scroll title evolution.
  - *Chapter II — Brand Philosophy (`BrandStorySection`)*: Pinned sticky title with scrolling narrative cards and mask-reveal opacity transforms.
  - *Chapter III — The Craft & Ritual (`CoffeePhilosophySection`)*: Parallax image cards detailing volcanic micro-lot sourcing and 93°C extraction.
  - *Chapter IV — Spatial Sanctuary Experience (`ExperienceScrollSection`)*: Showcasing ergonomic acoustic nooks and canonical live floor management.
  - *Chapter V — Seasonal Privileges (`PromotionsSection`)*: Curated promotional privileges with real-time sync.
  - *Chapter VI — Resort Collections (`BestSellerSection`)*: Interactive category tab filtering for signature creations.
  - *Chapter VII — Community & Gatherings (`EventSection`)*: Acoustic evenings and masterclasses.
  - *Chapter VIII — Memory Vault (`MemoryGallery`)*: Interactive masonry / storytelling grid with hover rotation and lighting response.
  - *Chapter IX — Patron Testimonials (`ReviewsSection`)*: Verified patron badges, glowing rating stars, and card depth transitions.
- **Interactive Reserve Centerpiece (`FloatingDock`)**: Replaces the static bottom booking bar with a luxury floating dock that offers morphing orb collapse and quick action links. Clicking *Reserve Table* triggers an Apple Maps-inspired bottom-up slide drawer containing the canonical `InteractiveFloorPlanMock`.
- **GPU-Accelerated Motion**: Built with 60fps rendering (`will-change-transform`, `translateZ(0)`) to eliminate layout shifts during complex scroll storytelling.

### 3.2 Online Menu & Booking (`/menu`)
- Interactive online menu for customers.
- Category filtering and detailed item views.
- **Checkout & Payment**: Users review their cart, see bank transfer instructions, and submit orders directly to the API. Order totals are calculated securely on the backend.
- **Customer Review Flow**: Exclusively in the online flow—after a successful order, customers are prompted with a luxury modal to rate (1-5 stars) and review their experience.

### 3.3 Barista Workspace
- **POS (`/barista/pos`)**: High-efficiency interface for in-store order taking. Quick add-to-cart, modifier selections (Ice, Sugar, Milk). Submits orders to the central API.
- **Order Queue (`/barista`)**: A live Kanban board managing active orders. Features state transitions from `pending_payment` -> `preparing` -> `ready` -> `completed`. Includes a global store open/close toggle.

### 3.4 Admin Dashboard (`/admin`)
- **Catalog Management**: Full CRUD for menu items. Set items as "Best Sellers", assign "Badges", and manage percentage or fixed discounts.
- **Gallery Management**: Manage promotional or lifestyle images shown on the landing page.
- **Review Moderation**: View all customer reviews submitted from the online booking flow, toggle visibility, and delete inappropriate content.
- **Event Management**: Create and schedule community events (e.g., Latte Art Masterclass) that appear on the homepage.
- **Transaction History**: Comprehensive view of all past orders across the platform (POS and Online).
- **Canonical Floor Planner v2 (`/admin/floor-plan`)**: The central single-source-of-truth table management system. Features an infinite/flexible canvas, snap-to-grid editing, 7 table geometry shapes, 12 decorative architectural static objects, live property inspection, versioning (switch/duplicate/restore), and QR code generation/printing.

### 3.5 Barista Spatial Table Operations (`/barista/tables`) & POS Integration
- **Spatial Table Operations**: Real-time rendering of the canonical layout with live polling (4s). Baristas can view live order tickets attached to tables, seat reservation guests, and trigger lifecycle overrides (`Available` -> `Reserved` -> `Occupied` -> `Cleaning` -> `Out of Service`).
- **POS Dynamic Table Binding**: The POS table selector dynamically queries canonical tables from the database and automatically marks selected tables as occupied upon order creation.

### 3.6 Customer Interactive Booking (`/reservation`) & Menu Ordering
- **Interactive Floor Plan**: Customers select available tables directly from a responsive spatial layout on the homepage slide drawer or dedicated `/reservation` route.
- **QR Code Menu Ordering**: Scanning table QR cards automatically binds the customer's online order to the canonical table ID.

## 4. UI/UX Principles
- **Luxury Dark Theme**: `#000000` to deep charcoal backgrounds.
- **Gold/Bronze Accents**: `var(--color-brand-accent)` used sparingly for interactive elements, badges, and important information.
- **Micro-Animations**: Extensive use of Framer Motion for hover states, modal pop-ins, and scroll reveals to ensure the UI feels alive and premium.

## 5. Future Roadmap
- Implementation of real image uploads (AWS S3, Cloudinary) replacing current URL-based inputs.
- Integration with real payment gateways (Midtrans, Stripe) for automated payment verification.
- Advanced analytics and heatmaps for table occupancy in the Admin Dashboard.
