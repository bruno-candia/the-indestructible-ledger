import { Wallet } from './wallet.entity';

export abstract class WalletRepository {
  abstract save(wallet: Wallet, transactionManager?: unknown): Promise<void>;
  abstract findById(
    id: string,
    transactionManager?: unknown,
  ): Promise<Wallet | null>;
}
