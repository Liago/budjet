/**
 * Database configuration for Heroku PostgreSQL
 */

export interface DatabaseConfig {
  url: string;
  ssl: boolean | { rejectUnauthorized: boolean };
}

export const getDatabaseConfig = (): DatabaseConfig => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    url: process.env.DATABASE_URL as string,
    // In production (Heroku) we need to enable SSL but reject unauthorized is set to false
    // This is required for Heroku PostgreSQL
    ssl: isProduction ? { rejectUnauthorized: false } : false,
  };
};

export default getDatabaseConfig();
