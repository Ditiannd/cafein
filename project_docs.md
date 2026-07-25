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

### 3.1 Landing Page
- **Immersive Hero**: Dynamic, visually striking hero section.
- **Dynamic Content**: Best Sellers, Upcoming Events, Memory Gallery, and Customer Reviews are fetched securely from the database.
- **Promotions/Discounts**: A dedicated promotions section highlights active discounts visually, drawing customer attention to current offers. Discount data is joined with catalog items dynamically via the API.

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

## 4. UI/UX Principles
- **Luxury Dark Theme**: `#000000` to deep charcoal backgrounds.
- **Gold/Bronze Accents**: `var(--color-brand-accent)` used sparingly for interactive elements, badges, and important information.
- **Micro-Animations**: Extensive use of Framer Motion for hover states, modal pop-ins, and scroll reveals to ensure the UI feels alive and premium.

## 5. Future Roadmap
- Implementation of real image uploads (AWS S3, Cloudinary) replacing current URL-based inputs.
- Integration with real payment gateways (Midtrans, Stripe) for automated payment verification.
- Advanced analytics and reporting in the Admin Dashboard.
