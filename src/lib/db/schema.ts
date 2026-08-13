import { pgTable, text, serial, integer, boolean, timestamp, uuid, pgEnum, real, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export type ModifierOption = { name: string; upcharge: number };
export type ModifierOptions = {
  iceLevels?: ModifierOption[];
  sugarLevels?: ModifierOption[];
  milkTypes?: ModifierOption[];
};

// --- Enums ---

export const userRoleEnum = pgEnum('user_role', ['admin', 'barista']);
export const discountTypeEnum = pgEnum('discount_type', ['percentage', 'fixed']);
export const orderSourceEnum = pgEnum('order_source', ['online', 'pos']);
export const orderStatusEnum = pgEnum('order_status', [
  'pending_payment', 'verifying', 'preparing', 'ready', 'completed', 'cancelled'
]);
export const orderTypeEnum = pgEnum('order_type', ['dine_in', 'takeaway']);
export const paymentMethodEnum = pgEnum('payment_method', ['cash', 'qris', 'card', 'bank_transfer']);
export const tableShapeEnum = pgEnum('table_shape', [
  'square', 'rectangle', 'round', 'oval', 'bar_seat', 'sofa', 'private_room'
]);
export const tableStatusEnum = pgEnum('table_status', [
  'available', 'reserved', 'occupied', 'cleaning', 'out_of_service'
]);
export const staticObjectTypeEnum = pgEnum('static_object_type', [
  'wall', 'counter', 'cashier', 'kitchen', 'plant', 'window', 'door', 'decoration', 'waiting_area', 'restroom', 'divider', 'custom'
]);
export const reservationStatusEnum = pgEnum('reservation_status', [
  'confirmed', 'seated', 'completed', 'cancelled', 'expired'
]);

// --- Tables ---

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: userRoleEnum('role').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type PaymentRules = {
  bankName?: string;
  accountNumber?: string;
  qrisUrl?: string;
};

export const storeSettings = pgTable('store_settings', {
  id: serial('id').primaryKey(),
  isOpen: boolean('is_open').default(true).notNull(),
  announcementBanner: text('announcement_banner'),
  paymentRules: jsonb('payment_rules').$type<PaymentRules>(),
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
  modifierOptions: jsonb('modifier_options').$type<ModifierOptions>(),
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
  tableId: uuid('table_id'),
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

export const layoutVersions = pgTable('layout_versions', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  isActive: boolean('is_active').default(false).notNull(),
  canvasSettings: text('canvas_settings'),
  defaultViewportX: real('default_viewport_x'),
  defaultViewportY: real('default_viewport_y'),
  defaultViewportZoom: real('default_viewport_zoom'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const tables = pgTable('tables', {
  id: uuid('id').defaultRandom().primaryKey(),
  layoutVersionId: uuid('layout_version_id').references(() => layoutVersions.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  capacity: integer('capacity').notNull().default(2),
  shape: tableShapeEnum('shape').notNull().default('round'),
  x: real('x').notNull().default(500),
  y: real('y').notNull().default(500),
  width: real('width').notNull().default(100),
  height: real('height').notNull().default(100),
  rotation: real('rotation').notNull().default(0),
  scale: real('scale').notNull().default(1),
  zIndex: integer('z_index').notNull().default(1),
  status: tableStatusEnum('status').notNull().default('available'),
  qrCode: text('qr_code').unique(),
  notes: text('notes'),
  isLocked: boolean('is_locked').default(false).notNull(),
  isHidden: boolean('is_hidden').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const layoutObjects = pgTable('layout_objects', {
  id: uuid('id').defaultRandom().primaryKey(),
  layoutVersionId: uuid('layout_version_id').references(() => layoutVersions.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: staticObjectTypeEnum('type').notNull().default('decoration'),
  x: real('x').notNull().default(500),
  y: real('y').notNull().default(500),
  width: real('width').notNull().default(100),
  height: real('height').notNull().default(100),
  rotation: real('rotation').notNull().default(0),
  scale: real('scale').notNull().default(1),
  zIndex: integer('z_index').notNull().default(1),
  isLocked: boolean('is_locked').default(false).notNull(),
  isHidden: boolean('is_hidden').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const reservations = pgTable('reservations', {
  id: uuid('id').defaultRandom().primaryKey(),
  tableId: uuid('table_id').references(() => tables.id, { onDelete: 'cascade' }).notNull(),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone'),
  customerEmail: text('customer_email'),
  reservationTime: timestamp('reservation_time').notNull(),
  durationMinutes: integer('duration_minutes').notNull().default(90),
  guestCount: integer('guest_count').notNull().default(2),
  status: reservationStatusEnum('status').notNull().default('confirmed'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
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
  table: one(tables, {
    fields: [orders.tableId],
    references: [tables.id],
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

export const layoutVersionsRelations = relations(layoutVersions, ({ many }) => ({
  tables: many(tables),
  layoutObjects: many(layoutObjects),
}));

export const tablesRelations = relations(tables, ({ one, many }) => ({
  layoutVersion: one(layoutVersions, {
    fields: [tables.layoutVersionId],
    references: [layoutVersions.id],
  }),
  reservations: many(reservations),
  orders: many(orders),
}));

export const layoutObjectsRelations = relations(layoutObjects, ({ one }) => ({
  layoutVersion: one(layoutVersions, {
    fields: [layoutObjects.layoutVersionId],
    references: [layoutVersions.id],
  }),
}));

export const reservationsRelations = relations(reservations, ({ one }) => ({
  table: one(tables, {
    fields: [reservations.tableId],
    references: [tables.id],
  }),
}));

