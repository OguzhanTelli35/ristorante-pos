import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || '3001', 10),
  DATABASE_URL: process.env.DATABASE_URL || './dev.sqlite3',
  NODE_ENV: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
};
