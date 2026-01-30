import { Test, TestingModule } from '@nestjs/testing';
import { Pool } from 'pg';
import { Wallet } from 'src/domain/wallet/wallet.entity';
import { WalletPostgresRepository } from './wallet-postgres.repository';
import { ConfigModule } from '@nestjs/config';
import { PostgresModule } from './postgres.module';
import { DATABASE_POOL } from './postgres.constants';

describe('WalletRepository', () => {
  let repo: WalletPostgresRepository;
  let pool: Pool;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), PostgresModule],
      providers: [WalletPostgresRepository],
    }).compile();
    pool = module.get<Pool>(DATABASE_POOL);
    repo = module.get<WalletPostgresRepository>(WalletPostgresRepository);
  });

  beforeEach(async () => {
    await pool.query(`TRUNCATE TABLE wallets`);
  });

  afterAll(async () => {
    await pool.end();
  });

  it('should be defined', () => {
    expect(pool).toBeDefined();
    expect(repo).toBeDefined();
  });

  it('should be find a Wallet that was saved', async () => {
    const currentWallet = Wallet.createWallet('wallet-a');

    await repo.save(currentWallet);

    const savedWallet = await pool.query(
      `SELECT * FROM wallets WHERE id = 'wallet-a'`,
    );

    expect(currentWallet).toEqual(savedWallet.rows[0]);
  });

  it('should return a Wallet when it exists', async () => {
    await pool.query(
      `INSERT INTO wallets (id, balance, version) VALUES ('wallet-b', 200, 1)`,
    );

    const wallet = await repo.findById('wallet-b');

    expect(wallet).not.toBeNull();
    expect(wallet!.getId).toBe('wallet-b');
    expect(wallet!.getBalance).toBe(200);
  });

  it('should return null when wallet does not exist', async () => {
    const wallet = await repo.findById('ghost-wallet');
    expect(wallet).toBeNull();
  });
});
