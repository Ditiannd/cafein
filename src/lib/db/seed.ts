import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { hashPassword } from '../auth';
import * as schema from './schema';

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is required. Create a .env file from .env.example');
    process.exit(1);
  }

  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client, { schema });

  console.log('🌱 Seeding database...');

  // --- Users ---
  const adminHash = await hashPassword('admin123');
  const baristaHash = await hashPassword('barista123');

  await db.insert(schema.users).values([
    { name: 'Admin', email: 'admin@cafeintoday.com', passwordHash: adminHash, role: 'admin' },
    { name: 'Barista', email: 'barista@cafeintoday.com', passwordHash: baristaHash, role: 'barista' },
  ]).onConflictDoNothing();

  console.log('✅ Users seeded');

  // --- Store Settings ---
  await db.insert(schema.storeSettings).values([
    { isOpen: true, announcementBanner: null },
  ]).onConflictDoNothing();

  console.log('✅ Store settings seeded');

  // --- Categories ---
  const categoryData = [
    { name: 'Signature', sortOrder: 1 },
    { name: 'Classic Coffee', sortOrder: 2 },
    { name: 'Non-Coffee', sortOrder: 3 },
    { name: 'Pastries', sortOrder: 4 },
  ];

  await db.insert(schema.categories).values(categoryData).onConflictDoNothing();
  console.log('✅ Categories seeded');

  // Fetch category IDs
  const cats = await db.select().from(schema.categories);
  const catMap = Object.fromEntries(cats.map(c => [c.name, c.id]));

  // --- Catalog Items ---
  const catalogData = [
    { name: 'Oat Milk Latte', price: 45000, categoryId: catMap['Signature'], badge: 'Best Seller', image: 'https://images.unsplash.com/photo-1481833722971-ce9c105404bb?w=500&auto=format&fit=crop&q=60', isBestSeller: true },
    { name: 'Truffle Croissant', price: 38000, categoryId: catMap['Pastries'], badge: 'New', image: 'https://images.unsplash.com/photo-1549903072-7e6e0d65612d?w=500&auto=format&fit=crop&q=60', isBestSeller: false },
    { name: 'Classic Cappuccino', price: 35000, categoryId: catMap['Classic Coffee'], badge: null, image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=500&auto=format&fit=crop&q=60', isBestSeller: false },
    { name: 'Kyoto Matcha Blend', price: 42000, categoryId: catMap['Non-Coffee'], badge: 'Limited', image: 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?w=500&auto=format&fit=crop&q=60', isBestSeller: true },
  ];

  await db.insert(schema.catalogItems).values(catalogData).onConflictDoNothing();
  console.log('✅ Catalog items seeded');

  // Fetch catalog item IDs for promotions
  const items = await db.select().from(schema.catalogItems);
  const itemMap = Object.fromEntries(items.map(i => [i.name, i.id]));

  // --- Promotions ---
  if (itemMap['Oat Milk Latte'] && itemMap['Truffle Croissant']) {
    await db.insert(schema.promotions).values([
      { catalogItemId: itemMap['Oat Milk Latte'], discountType: 'fixed', discountValue: 7000 },
      { catalogItemId: itemMap['Truffle Croissant'], discountType: 'percentage', discountValue: 20 },
    ]).onConflictDoNothing();
    console.log('✅ Promotions seeded');
  }

  // --- Gallery ---
  await db.insert(schema.galleryItems).values([
    { url: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800&auto=format&fit=crop' },
    { url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop' },
    { url: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop' },
    { url: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?q=80&w=800&auto=format&fit=crop' },
    { url: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=800&auto=format&fit=crop' },
    { url: 'https://images.unsplash.com/photo-1481833761820-0509d3217039?q=80&w=800&auto=format&fit=crop' },
  ]).onConflictDoNothing();
  console.log('✅ Gallery seeded');

  // --- Reviews ---
  await db.insert(schema.reviews).values([
    { author: 'Sarah Jenkins', rating: 5, comment: 'The oat milk latte is absolutely divine. A perfect spot to read and relax.', isVisible: true },
    { author: 'Michael Chen', rating: 5, comment: 'Love the dual-state vibe. When the sun sets, the whole atmosphere shifts. Brilliant concept.', isVisible: true },
    { author: 'Elena Rodriguez', rating: 4, comment: 'Truffle croissant is a must-try. Booking a table in advance was super easy.', isVisible: true },
  ]).onConflictDoNothing();
  console.log('✅ Reviews seeded');

  // --- Events ---
  await db.insert(schema.events).values([
    { title: 'Jazz & Pour Night', date: 'Every Friday, 7 PM', description: 'Live acoustic jazz paired with our signature manual brews. A perfect way to unwind your week.', image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&auto=format&fit=crop&q=60', isVisible: true },
    { title: 'Latte Art Masterclass', date: 'Saturday, 10 AM', description: 'Learn the secrets of perfect microfoam and basic latte art patterns from our head barista.', image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&auto=format&fit=crop&q=60', isVisible: true },
  ]).onConflictDoNothing();
  console.log('✅ Events seeded');

  console.log('🎉 Database seeding complete!');
  await client.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
