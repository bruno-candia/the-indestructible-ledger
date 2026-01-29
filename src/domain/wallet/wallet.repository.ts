import { Wallet } from './wallet.entity';

export abstract class WalletRepository {
  abstract save(wallet: Wallet): Promise<void>;
  abstract findById(id: string): Promise<Wallet | null>;
}
