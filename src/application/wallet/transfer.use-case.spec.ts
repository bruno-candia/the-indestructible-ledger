import { TransferUseCase } from './transfer.use-case';
import { Test, TestingModule } from '@nestjs/testing';
import { Wallet } from 'src/domain/wallet/wallet.entity';
import { WalletRepository } from 'src/domain/wallet/wallet.repository';
import { AtomicTransactionRunner } from 'src/infrastructure/persistence/postgres/atomic-transaction-runner';

describe('TransferUseCase', () => {
  let useCase: TransferUseCase;
  let repo: WalletRepository;

  const mockRepo = {
    findById: jest.fn(),
    save: jest.fn(),
  };

  const mockRunner = {
    run: jest.fn(
      async (callback: (arg0: object) => Promise<void>) => await callback({}),
    ),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransferUseCase,
        { provide: WalletRepository, useValue: mockRepo },
        { provide: AtomicTransactionRunner, useValue: mockRunner },
      ],
    }).compile();

    useCase = module.get<TransferUseCase>(TransferUseCase);
    repo = module.get<WalletRepository>(WalletRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(repo).toBeDefined();
  });

  it('should transfer amount between wallets successfully', async () => {
    const fromWallet = Wallet.restore('source-id', 100, 1);
    const toWallet = Wallet.restore('dest-id', 0, 1);

    mockRepo.findById
      .mockResolvedValueOnce(fromWallet)
      .mockResolvedValueOnce(toWallet);

    await useCase.execute('source-id', 'dest-id', 50);

    expect(fromWallet.getBalance).toBe(50);
    expect(toWallet.getBalance).toBe(50);
    expect(mockRepo.save).toHaveBeenCalledTimes(2);
  });

  it('should throw error if insufficient funds', async () => {
    const fromWallet = Wallet.restore('source-id', 10, 1);
    const toWallet = Wallet.restore('dest-id', 0, 1);

    mockRepo.findById
      .mockResolvedValueOnce(fromWallet)
      .mockResolvedValueOnce(toWallet);

    await expect(useCase.execute('source-id', 'dest-id', 50)).rejects.toThrow(
      'Insufficient founds',
    );
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('should throw error if wallet not found', async () => {
    mockRepo.findById
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(Wallet.restore('dest-id', 0, 1));
    await expect(useCase.execute('source-id', 'dest-id', 50)).rejects.toThrow(
      'Wallet not found',
    );
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('should throw error if amount is bigger than balance', async () => {
    const fromWallet = Wallet.restore('source-id', 100, 1);
    const toWallet = Wallet.restore('dest-id', 0, 1);

    mockRepo.findById
      .mockResolvedValueOnce(fromWallet)
      .mockResolvedValueOnce(toWallet);

    await expect(useCase.execute('source-id', 'dest-id', -100)).rejects.toThrow(
      'Invalid amount',
    );

    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('should transfer amount to the same wallet and not change the balance', async () => {
    const fromWallet = Wallet.restore('wallet-a', 100, 1);
    const toWallet = Wallet.restore('wallet-a', 100, 1);

    mockRepo.findById
      .mockResolvedValueOnce(fromWallet)
      .mockResolvedValueOnce(toWallet);

    await useCase.execute('wallet-a', 'wallet-a', 50);

    expect(fromWallet.getBalance).toBe(100);
    expect(toWallet.getBalance).toBe(100);
    expect(mockRepo.save).not.toHaveBeenCalled();
  });
});
