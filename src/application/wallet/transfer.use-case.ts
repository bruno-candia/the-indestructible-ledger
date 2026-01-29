import { Injectable } from '@nestjs/common';
import { WalletRepository } from 'src/domain/wallet/wallet.repository';
import { AtomicTransactionRunner } from 'src/infrastructure/persistence/postgres/atomic-transaction-runner';

@Injectable()
export class TransferUseCase {
  constructor(
    private readonly repo: WalletRepository,
    private readonly transaction: AtomicTransactionRunner,
  ) {}

  async execute(fromId: string, toId: string, amount: number) {
    await this.transaction.run(async (tx) => {
      const fromWallet = await this.repo.findById(fromId, tx);
      const toWallet = await this.repo.findById(toId, tx);

      if (!fromWallet || !toWallet) {
        throw new Error('Wallet not found');
      }

      fromWallet.withdraw(amount);
      toWallet.deposit(amount);

      await this.repo.save(fromWallet, tx);
      await this.repo.save(toWallet, tx);
    });
  }
}
