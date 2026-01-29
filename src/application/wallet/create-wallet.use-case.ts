import { Injectable } from '@nestjs/common';
import { Wallet } from 'src/domain/wallet/wallet.entity';
import { WalletRepository } from 'src/domain/wallet/wallet.repository';

@Injectable()
export class CreateWalletUseCase {
  constructor(private readonly repo: WalletRepository) {}

  async execute(id: string): Promise<Wallet> {
    if (await this.repo.findById(id)) {
      throw Error('This wallet already exists.');
    }

    const wallet = Wallet.createWallet(id);

    await this.repo.save(wallet);

    return wallet;
  }
}
