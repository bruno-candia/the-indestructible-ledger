import { Module } from '@nestjs/common';
import { PostgresModule } from './infrastructure/persistence/postgres/postgres.module';
import { CreateWalletUseCase } from './application/wallet/create-wallet.use-case';
import { WalletPostgresRepository } from './infrastructure/persistence/postgres/wallet-postgres.repository';
import { WalletRepository } from './domain/wallet/wallet.repository';
import { WalletController } from './infrastructure/http/wallet.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PostgresModule],
  controllers: [WalletController],
  providers: [
    CreateWalletUseCase,
    WalletPostgresRepository,
    {
      provide: WalletRepository,
      useExisting: WalletPostgresRepository,
    },
  ],
})
export class AppModule {}
