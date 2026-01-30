import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { Pool } from 'pg';
import { DATABASE_POOL } from './../src/infrastructure/persistence/postgres/postgres.constants';

describe('Concurrency (E2E)', () => {
  let app: INestApplication;
  let pool: Pool;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    pool = app.get(DATABASE_POOL);
  });

  beforeEach(async () => {
    await pool.query('TRUNCATE TABLE wallets');
    await pool.query(
      `INSERT INTO wallets (id, balance, version) VALUES ('wallet-a', 1000, 1), ('wallet-b', 0, 1)`,
    );
  });

  afterAll(async () => {
    await pool.end();
    await app.close();
  });

  it('should process 10 concurrent transfers correctly', async () => {
    const requests = Array.from({ length: 10 }).map(() =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      request(app.getHttpServer())
        .post('/wallets/transfer')
        .send({ fromId: 'wallet-a', toId: 'wallet-b', amount: 100 }),
    );

    await Promise.all(requests);

    interface WalletResult {
      balance: number;
    }

    const resultA = await pool.query<WalletResult>(
      `SELECT balance FROM wallets WHERE id = 'wallet-a'`,
    );

    const resultB = await pool.query<WalletResult>(
      `SELECT balance FROM wallets WHERE id = 'wallet-b'`,
    );

    console.log('Saldo Final A:', resultA.rows[0].balance);
    console.log('Saldo Final B:', resultB.rows[0].balance);

    expect(resultA.rows[0].balance).toBe(0);
    expect(resultB.rows[0].balance).toBe(1000);
  });
});
