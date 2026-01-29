import { Inject, Injectable } from '@nestjs/common';
import { Pool, PoolClient } from 'pg';
import { WalletRepository } from 'src/domain/wallet/wallet.repository';
import { Wallet } from 'src/domain/wallet/wallet.entity';
import { DATABASE_POOL } from './postgres.constants';

interface WalletRow {
  id: string;
  balance: number;
  version: number;
}

@Injectable()
export class WalletPostgresRepository implements WalletRepository {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async save(wallet: Wallet, transactionManager?: PoolClient): Promise<void> {
    const client = transactionManager || this.pool;

    await client.query(
      `INSERT INTO wallets (id, balance, version) 
        VALUES ($1, $2, $3)
        ON CONFLICT(id) DO UPDATE 
        SET balance = $2, version = $3;`,
      [wallet.getId, wallet.getBalance, wallet.getVersion],
    );
  }

  async findById(
    id: string,
    transactionManager?: PoolClient,
  ): Promise<Wallet | null> {
    const client = transactionManager || this.pool;

    const result = await client.query(`SELECT * FROM wallets WHERE id = $1`, [
      id,
    ]);

    if (result.rows.length === 0) return null;

    const row = result.rows[0] as WalletRow;
    return Wallet.restore(row.id, row.balance, row.version);
  }
}
