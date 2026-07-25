import { pgTable, text, serial, integer, boolean, timestamp, uuid, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- Enums ---

export const userRoleEnum = pgEnum('user_role', ['admin', 'barista']);
export const discountTypeEnum = pgEnum('discount_type', ['percentage', 'fixed']);
export const orderSourceEnum = pgEnum('order_source', ['online', 'pos']);
export const orderStatusEnum = pgEnum('order_status', [
  'pending_payment', 'verifying', 'preparing', 'ready', 'completed', 'cancelled'
]);
export const orderTypeEnum = pgEnum('order_type', ['dine_in', 'takeaway']);
export const paymentMethodEnum = pgEnum('payment_method', ['cash', 'qris', 'card', 'bank_transfer']);

// --- Tables ---

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: userRoleEnum('role').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const storeSettings = pgTable('store_settings', {
  id: serial('id').primaryKey(),
  isOpen: boolean('is_open').default(true).notNull(),
  announcementBanner: text('announcement_banner'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  sortOrder: integer('sort_order').default(0).notNull(),
});

export const catalogItems = pgTable('catalog_items', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  price: integer('price').notNull(),
  categoryId: integer('category_id').references(() => categories.id, { onDelete: 'set null' }),
  image: text('image').notNull(),
  badge: text('badge'),
  isBestSeller: boolean('is_best_seller').default(false).notNull(),
  isAvailable: boolean('is_available').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const promotions = pgTable('promotions', {
  id: serial('id').primaryKey(),
  catalogItemId: integer('catalog_item_id').references(() => catalogItems.id, { onDelete: 'cascade' }).notNull().unique(),
  discountType: discountTypeEnum('discount_type').notNull(),
  discountValue: integer('discount_value').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderNumber: text('order_number').notNull().unique(),
  source: orderSourceEnum('source').notNull(),
  status: orderStatusEnum('status').default('pending_payment').notNull(),
  customerName: text('customer_name'),
  orderType: orderTypeEnum('order_type').default('dine_in').notNull(),
  tableNumber: text('table_number'),
  subtotal: integer('subtotal').notNull(),
  discountTotal: integer('discount_total').default(0).notNull(),
  tax: integer('tax').notNull(),
  totalAmount: integer('total_amount').notNull(),
  paymentMethod: paymentMethodEnum('payment_method'),
  amountPaid: integer('amount_paid'),
  changeGiven: integer('change_given'),
  paymentProofUrl: text('payment_proof_url'),
  createdById: uuid('created_by_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  catalogItemId: integer('catalog_item_id').references(() => catalogItems.id, { onDelete: 'set null' }),
  quantity: integer('quantity').notNull(),
  unitPrice: integer('unit_price').notNull(),
  iceLevel: text('ice_level'),
  sugarLevel: text('sugar_level'),
  milkType: text('milk_type'),
});

export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  author: text('author').notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment').notNull(),
  isVisible: boolean('is_visible').default(true).notNull(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const galleryItems = pgTable('gallery_items', {
  id: serial('id').primaryKey(),
  url: text('url').notNull(),
  caption: text('caption'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  date: text('date').notNull(),
  description: text('description').notNull(),
  image: text('image').notNull(),
  isVisible: boolean('is_visible').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const inventoryItems = pgTable('inventory_items', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  quantity: integer('quantity').notNull().default(0),
  unit: text('unit').notNull(),
  minThreshold: integer('min_threshold').notNull().default(10),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const expenses = pgTable('expenses', {
  id: serial('id').primaryKey(),
  description: text('description').notNull(),
  amount: integer('amount').notNull(),
  date: timestamp('date').defaultNow().notNull(),
  category: text('category'),
  recordedById: uuid('recorded_by_id').references(() => users.id, { onDelete: 'set null' }),
});

// --- Relations ---

export const categoriesRelations = relations(categories, ({ many }) => ({
  catalogItems: many(catalogItems),
}));

export const catalogItemsRelations = relations(catalogItems, ({ one, many }) => ({
  category: one(categories, {
    fields: [catalogItems.categoryId],
    references: [categories.id],
  }),
  promotion: one(promotions, {
    fields: [catalogItems.id],
    references: [promotions.catalogItemId],
  }),
  orderItems: many(orderItems),
}));

export const promotionsRelations = relations(promotions, ({ one }) => ({
  catalogItem: one(catalogItems, {
    fields: [promotions.catalogItemId],
    references: [catalogItems.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [orders.createdById],
    references: [users.id],
  }),
  items: many(orderItems),
  review: one(reviews, {
    fields: [orders.id],
    references: [reviews.orderId],
  }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  catalogItem: one(catalogItems, {
    fields: [orderItems.catalogItemId],
    references: [catalogItems.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  order: one(orders, {
    fields: [reviews.orderId],
    references: [orders.id],
  }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  recordedBy: one(users, {
    fields: [expenses.recordedById],
    references: [users.id],
  }),
}));
