import Web3Modal from 'web3modal';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '../config/constants';
import { utils } from 'ethers';

declare global {
  interface Window {
    ethereum: any;
  }
}

export class WalletService {
  private provider: any;
  private signer: any;
  private tokenContract: any;
  private account: string | null = null;
  private web3Modal: Web3Modal;

  constructor() {
    this.web3Modal = new Web3Modal({
      cacheProvider: true,
      theme: "dark",
      providerOptions: {},
      network: "mainnet", // or your preferred network
      disableInjectedProvider: false,
      themeVariables: {
        '--w3m-font-family': 'Roboto, sans-serif',
        '--w3m-accent-color': '#e26b48',
        '--w3m-background-color': '#1e50f5',
        '--w3m-logo-image-url': 'https://your-logo-url.com/logo.png'
      }
    });
  }

  private async initializeToken() {
    const abi = ["function balanceOf(address) view returns (uint256)", "function mint(address,uint256)"];
    this.tokenContract = new ethers.Contract(CONTRACT_ADDRESSES.PIRGS_TOKEN, abi, this.provider);
  }

  async connect(): Promise<string> {
    try {
      const instance = await this.web3Modal.connect();
      this.provider = new ethers.providers.Web3Provider(instance);
      this.signer = this.provider.getSigner();
      this.account = await this.signer.getAddress();
      
      await this.initializeToken();

      if (this.account) {
        localStorage.setItem('walletAddress', this.account);
        return this.account;
      }
      throw new Error('Account is null');
    } catch (error) {
      console.error("Connection error:", error);
      throw new Error(`Failed to connect wallet: ${error.message}`);
    }
  }

  async getStoredWallet(): Promise<string | null> {
    return localStorage.getItem('walletAddress');
  }

  async mintTokens(amount: number): Promise<void> {
    if (!this.signer) return;
    const tokenWithSigner = this.tokenContract.connect(this.signer);
    await tokenWithSigner.mint(this.account, amount);
  }

  async getTokenBalance(): Promise<string> {
    if (!this.account) return '0';
    const balance = await this.tokenContract.balanceOf(this.account);
    return utils.formatUnits(balance, 18);
  }
}
