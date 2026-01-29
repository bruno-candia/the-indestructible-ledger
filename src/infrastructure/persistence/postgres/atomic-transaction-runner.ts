import { Inject, Injectable } from '@nestjs/common';
import { Pool, PoolClient } from 'pg';
import { DATABASE_POOL } from './postgres.constants';

@Injectable()
export class AtomicTransactionRunner {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async run<T>(callback: (manager: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
