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
    if (fromId === toId) return;

    if (amount <= 0) {
      throw new Error('Invalid amount');
    }

    const [firstId, secondId] = [fromId, toId].sort();

    await this.transaction.run(async (tx) => {
      const firstWallet = await this.repo.findById(firstId, tx);
      const secondWallet = await this.repo.findById(secondId, tx);

      if (!firstWallet || !secondWallet) {
        throw new Error('Wallet not found');
      }

      firstWallet.withdraw(amount);
      secondWallet.deposit(amount);

      await this.repo.save(firstWallet, tx);
      await this.repo.save(secondWallet, tx);
    });
  }
}
