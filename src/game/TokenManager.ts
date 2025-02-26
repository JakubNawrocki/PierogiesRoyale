import { WalletService } from '../services/WalletService';

export class TokenManager {
  private tokens: number = 0;
  private multiplier: number = 1;
  private walletService: WalletService;

  constructor() {
    this.walletService = new WalletService();
  }

  async addTokens(amount: number): Promise<void> {
    const actualAmount = amount * this.multiplier;
    this.tokens += actualAmount;
    
    if (this.tokens >= 100 && this.multiplier === 1) {
      this.multiplier = 2;
    }

    await this.walletService.mintTokens(actualAmount);
  }

  async getBalance(): Promise<number> {
    return Number(await this.walletService.getTokenBalance());
  }
}
