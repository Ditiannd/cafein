import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// For query purposes (connection pooling)
const queryClient = postgres(connectionString);
export const db = drizzle(queryClient, { schema });

// For migrations (single connection)
export function getMigrationClient() {
  if (!connectionString) throw new Error('DATABASE_URL is not set');
  return postgres(connectionString, { max: 1 });
}
