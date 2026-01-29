interface WalletProps {
  id: string;
  balance: number;
  version: number;
}

export class Wallet {
  private id: string;
  private balance: number;
  private version: number;

  private constructor(self: WalletProps) {
    this.id = self.id;
    this.balance = self.balance;
    this.version = self.version;
  }

  static createWallet(id: string): Wallet {
    return new Wallet({
      id,
      balance: 0,
      version: 1,
    });
  }

  static restore(id: string, balance: number, version: number): Wallet {
    return new Wallet({
      id,
      balance,
      version,
    });
  }

  get getId(): string {
    return this.id;
  }

  get getBalance(): number {
    return this.balance;
  }

  get getVersion(): number {
    return this.version;
  }
}
