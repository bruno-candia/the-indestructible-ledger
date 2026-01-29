import { Body, Controller, Post } from '@nestjs/common';
import { CreateWalletUseCase } from 'src/application/wallet/create-wallet.use-case';

@Controller('wallets')
export class WalletController {
  constructor(private readonly createWalletUseCase: CreateWalletUseCase) {}

  @Post()
  async create(@Body() body: { id: string }) {
    return this.createWalletUseCase.execute(body.id);
  }
}
