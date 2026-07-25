# Cafein Today - Backend Specifications

This document outlines the requirements and API specifications for implementing the actual backend of the Cafein Today application.

## 1. Tech Stack Recommendations
- **Runtime Environment**: Node.js
- **Framework**: Express.js or Next.js API Routes / Server Actions
- **Database**: PostgreSQL (Relational) or MongoDB (NoSQL). Given the relational nature of Orders, Order Items, and Catalog, PostgreSQL (via Prisma ORM) is highly recommended.
- **Authentication**: JWT (JSON Web Tokens) or NextAuth.js
- **Storage**: AWS S3 or Cloudinary for image uploads (Gallery, Menu Images, Payment Receipts)

## 2. Database Entities & Relationships

### `User` (Admin/Staff)
- `id` (UUID, PK)
- `username` (String, Unique)
- `passwordHash` (String)
- `role` (Enum: ADMIN, BARISTA)
- `createdAt` (Timestamp)

### `CatalogItem`
- `id` (UUID, PK)
- `name` (String)
- `price` (Decimal)
- `category` (String)
- `image` (String - URL)
- `badge` (String - Optional)
- `isBestSeller` (Boolean)
- `discountType` (Enum: NONE, PERCENTAGE, FIXED)
- `discountValue` (Decimal)
- `isVisible` (Boolean)

### `Order`
- `id` (UUID, PK)
- `orderNumber` (String, Unique)
- `source` (Enum: ONLINE, POS)
- `status` (Enum: PENDING_PAYMENT, VERIFYING, PREPARING, COMPLETED, CANCELLED)
- `totalAmount` (Decimal)
- `paymentMethod` (Enum: BANK_TRANSFER, CASH, QRIS)
- `paymentProofUrl` (String - Optional, for online orders)
- `subtotal` (Decimal)
- `tax` (Decimal)
- `discountTotal` (Decimal)
- `changeGiven` (Decimal - Optional, for cash POS)
- `tableNumber` (String - Optional)
- `createdAt` (Timestamp)

### `OrderItem`
- `id` (UUID, PK)
- `orderId` (UUID, FK -> Order)
- `catalogItemId` (UUID, FK -> CatalogItem)
- `quantity` (Int)
- `priceAtPurchase` (Decimal)
- `iceLevel` (String)
- `sugarLevel` (String)
- `milkType` (String)

### `Review`
- `id` (UUID, PK)
- `author` (String)
- `rating` (Int 1-5)
- `comment` (Text)
- `isVisible` (Boolean)
- `createdAt` (Timestamp)
- `orderId` (UUID, FK -> Order, Optional)

### `GalleryItem`
- `id` (UUID, PK)
- `url` (String)
- `title` (String)
- `createdAt` (Timestamp)

### `Event`
- `id` (UUID, PK)
- `title` (String)
- `date` (String/Date)
- `description` (Text)
- `image` (String)
- `isVisible` (Boolean)

## 3. API Endpoints

### 3.1 Authentication
- `POST /api/auth/login`
  - **Req**: `{ username, password }`
  - **Res**: `{ token, user: { id, role } }`
- `POST /api/auth/logout`

### 3.2 Catalog (Menu & Promotions)
- `GET /api/catalog` (Public) - Fetch active catalog.
- `POST /api/admin/catalog` (Admin) - Create item.
- `PUT /api/admin/catalog/:id` (Admin) - Update item (including discounts, best-seller status).
- `DELETE /api/admin/catalog/:id` (Admin) - Delete item.

### 3.3 Orders & Checkout
- `POST /api/orders` (Public/POS) 
  - **Req**: `{ source, items: [...], paymentMethod, paymentProofUrl (if online) }`
  - **Res**: `{ orderId, orderNumber, status }`
- `GET /api/orders` (Admin/POS) 
  - Query Params: `?date=today`, `?source=POS`
- `GET /api/orders/:id` (Admin/POS) - Get full receipt details.
- `PATCH /api/admin/orders/:id/status` (Admin) - Update order status (e.g. Verify payment).

### 3.4 Reviews
- `GET /api/reviews` (Public) - Fetch visible reviews.
- `POST /api/reviews` (Public) - Submit a review post-checkout.
- `GET /api/admin/reviews` (Admin) - Fetch ALL reviews.
- `PATCH /api/admin/reviews/:id/visibility` (Admin) - Toggle visibility.
- `DELETE /api/admin/reviews/:id` (Admin) - Delete review.

### 3.5 Gallery
- `GET /api/gallery` (Public) - Fetch gallery items.
- `POST /api/admin/gallery` (Admin) - Add image (multipart/form-data for file upload).
- `DELETE /api/admin/gallery/:id` (Admin) - Delete image.

### 3.6 Events
- `GET /api/events` (Public) - Fetch visible events.
- `POST /api/admin/events` (Admin) - Create event.
- `PUT /api/admin/events/:id` (Admin) - Update event.
- `DELETE /api/admin/events/:id` (Admin) - Delete event.

## 4. Validation & Security Rules
1. **JWT Authorization**: All `/api/admin/*` routes must be protected by middleware verifying a valid Admin JWT.
2. **File Uploads**: Restrict payment receipt and gallery uploads to `image/jpeg`, `image/png`, `image/webp`. Max size: 5MB.
3. **Data Integrity**: An order's `totalAmount` MUST be calculated securely on the backend based on `OrderItem` definitions and current catalog discounts, not trusted from the frontend payload.
4. **Rate Limiting**: Implement strict rate limiting on `/api/orders` (checkout) and `/api/reviews` to prevent spam.

## 5. Implementation Roadmap
1. Setup Node.js/Express repository.
2. Initialize Database and ORM schemas.
3. Implement Authentication.
4. Implement Catalog & Content APIs (Gallery, Events, Reviews).
5. Implement Order processing logic and receipt generation.
6. Replace `mockDb.ts` frontend calls with `fetch` or `axios` to the actual API endpoints.
