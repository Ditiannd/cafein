import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';

config({ path: '.env.local' });
config({ path: '.env' });

async function cleanDuplicates() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is required.');
    process.exit(1);
  }

  const client = postgres(connectionString, { max: 1 });
  
  console.log('🧹 Cleaning duplicate data...');

  try {
    await client`
      DELETE FROM catalog_items
      WHERE id NOT IN (
        SELECT MIN(id)
        FROM catalog_items
        GROUP BY name
      );
    `;
    console.log('✅ Cleaned duplicate catalog_items');

    await client`
      DELETE FROM gallery_items
      WHERE id NOT IN (
        SELECT MIN(id)
        FROM gallery_items
        GROUP BY url
      );
    `;
    console.log('✅ Cleaned duplicate gallery_items');

    await client`
      DELETE FROM reviews
      WHERE id NOT IN (
        SELECT MIN(id)
        FROM reviews
        GROUP BY author, comment
      );
    `;
    console.log('✅ Cleaned duplicate reviews');

    await client`
      DELETE FROM events
      WHERE id NOT IN (
        SELECT MIN(id)
        FROM events
        GROUP BY title
      );
    `;
    console.log('✅ Cleaned duplicate events');

    console.log('🎉 Duplicates cleaned successfully!');
  } catch (error) {
    console.error('❌ Error cleaning duplicates:', error);
  } finally {
    await client.end();
  }
}

cleanDuplicates();
