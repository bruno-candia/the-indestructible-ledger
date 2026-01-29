import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from './postgres.module';
import { WalletRepository } from 'src/domain/wallet/wallet.repository';
import { Wallet } from 'src/domain/wallet/wallet.entity';

interface WalletRow {
  id: string;
  balance: number;
  version: number;
}

@Injectable()
export class WalletPostgresRepository implements WalletRepository {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async save(wallet: Wallet): Promise<void> {
    await this.pool.query(
      `INSERT INTO wallets (id, balance, version) 
        VALUES ($1, $2, $3)
        ON CONFLICT(id) DO UPDATE 
        SET balance = $2, version = $3;`,
      [wallet.getId, wallet.getBalance, wallet.getVersion],
    );
  }

  async findById(id: string): Promise<Wallet | null> {
    const result = await this.pool.query(
      `SELECT * FROM wallets WHERE id = $1`,
      [id],
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0] as WalletRow;
    return Wallet.restore(row.id, row.balance, row.version);
  }
}
