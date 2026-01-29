import { Global, Module } from '@nestjs/common';
import { Pool } from 'pg';
import { AtomicTransactionRunner } from './atomic-transaction-runner';
import { DATABASE_POOL } from './postgres.constants';

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
  providers: [dbProvider, AtomicTransactionRunner],
  exports: [DATABASE_POOL, AtomicTransactionRunner],
})
export class PostgresModule {}
