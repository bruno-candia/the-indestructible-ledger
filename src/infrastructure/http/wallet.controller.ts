import { Body, Controller, Post } from '@nestjs/common';
import { CreateWalletUseCase } from 'src/application/wallet/create-wallet.use-case';
import { TransferUseCase } from 'src/application/wallet/transfer.use-case';

@Controller('wallets')
export class WalletController {
  constructor(
    private readonly createWalletUseCase: CreateWalletUseCase,
    private readonly transferUseCase: TransferUseCase,
  ) {}

  @Post()
  async create(@Body() body: { id: string }) {
    return this.createWalletUseCase.execute(body.id);
  }

  @Post('transfer')
  async transfer(
    @Body() body: { fromId: string; toId: string; amount: number },
  ) {
    return this.transferUseCase.execute(body.fromId, body.toId, body.amount);
  }
}
