import { Global, Module } from '@nestjs/common';
import { Pool } from 'pg';

export const DATABASE_POOL = 'DATABASE_POOL';

const dbProvider = {
  provide: DATABASE_POOL,
  useFactory: () => {
    return new Pool({
      user: process.env.POSTGRES_USER,
      host: 'localhost',
      database: process.env.POSTGRES_DB,
      password: process.env.POSTGRES_PASSWORD,
      port: 5432,
    });
  },
};

@Global()
@Module({
  providers: [dbProvider],
  exports: [DATABASE_POOL],
})
export class PostgresModule {}
