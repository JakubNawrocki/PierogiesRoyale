const PIEROGI_TOKEN_ABI = [
    // Standard ERC-20 functions
    {
        "constant": true,
        "inputs": [{"name": "owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "", "type": "uint256"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [{"name": "", "type": "string"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
];

// This would be the actual token contract address on mainnet or testnet
const PIEROGI_TOKEN_ADDRESS = '0x1234567890123456789012345678901234567890';

class WalletIntegration {
    constructor() {
        this.provider = null;
        this.accounts = [];
        this.tokenContract = null;
        this.currentAccount = null;
    }

    isWeb3Available() {
        return typeof window.ethereum !== 'undefined';
    }

    async connect() {
        if (!this.isWeb3Available()) {
            throw new Error('Web3 provider not found. Please install MetaMask or another wallet.');
        }

        try {
            // Initialize provider
            this.provider = window.ethereum;

            // Request account access
            this.accounts = await this.provider.request({ method: 'eth_requestAccounts' });
            
            if (!this.accounts || this.accounts.length === 0) {
                throw new Error('No accounts found');
            }

            this.currentAccount = this.accounts[0];
            
            // Initialize token contract
            if (window.Web3) {
                const web3 = new window.Web3(this.provider);
                this.tokenContract = new web3.eth.Contract(PIEROGI_TOKEN_ABI, PIEROGI_TOKEN_ADDRESS);
            }

            // Listen for account changes
            this.provider.on('accountsChanged', (accounts) => {
                this.accounts = accounts;
                this.currentAccount = accounts[0];
                // Trigger a custom event for account change
                const event = new CustomEvent('walletAccountChanged', { detail: { account: this.currentAccount } });
                window.dispatchEvent(event);
            });

            // Listen for chain changes
            this.provider.on('chainChanged', (chainId) => {
                // Reload the page when chain changes
                window.location.reload();
            });

            console.log('Wallet connected successfully:', this.currentAccount);
            return this.currentAccount;
        } catch (error) {
            console.error('Failed to connect wallet:', error);
            throw error;
        }
    }

    async getTokenBalance() {
        if (!this.currentAccount || !this.tokenContract) {
            return '0';
        }

        try {
            // Call the balanceOf function of the ERC-20 token
            const balance = await this.tokenContract.methods.balanceOf(this.currentAccount).call();
            
            // Convert from wei to token (assuming 18 decimals)
            const formatted = parseFloat(balance) / 10**18;
            return formatted.toFixed(2);
        } catch (error) {
            console.error('Failed to get token balance:', error);
            return '0';
        }
    }

    async sendTransaction(to, value, data = '') {
        if (!this.currentAccount) {
            throw new Error('No wallet connected');
        }

        try {
            const transactionParameters = {
                to,
                from: this.currentAccount,
                value: '0x' + parseInt(value).toString(16),
                data,
            };

            const txHash = await this.provider.request({
                method: 'eth_sendTransaction',
                params: [transactionParameters],
            });

            return txHash;
        } catch (error) {
            console.error('Transaction failed:', error);
            throw error;
        }
    }

    async signMessage(message) {
        if (!this.currentAccount) {
            throw new Error('No wallet connected');
        }

        try {
            // Convert message to hex
            const msgHex = '0x' + Buffer.from(message).toString('hex');
            
            // Request signature
            const signature = await this.provider.request({
                method: 'personal_sign',
                params: [msgHex, this.currentAccount],
            });

            return signature;
        } catch (error) {
            console.error('Message signing failed:', error);
            throw error;
        }
    }

    disconnect() {
        this.accounts = [];
        this.currentAccount = null;
        this.tokenContract = null;
        // Note: Most wallets don't support programmatic disconnection
        // User needs to disconnect manually from their wallet
    }
}

module.exports = new WalletIntegration();
