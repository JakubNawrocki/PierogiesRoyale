import React, { useEffect, useState } from 'react';
import { WalletService } from '../services/WalletService';
import { COLORS } from '../styles/colors';

export const WalletConnect: React.FC = () => {
  const [address, setAddress] = useState<string | null>(null);
  const walletService = new WalletService();

  useEffect(() => {
    const checkWallet = async () => {
      const stored = await walletService.getStoredWallet();
      if (stored) setAddress(stored);
    };
    checkWallet();
  }, []);

  const connectWallet = async () => {
    try {
      const address = await walletService.connect();
      setAddress(address);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  return (
    <div style={{ backgroundColor: COLORS.SOFT_PINK }}>
      {address ? (
        <div>Connected: {address.slice(0, 6)}...{address.slice(-4)}</div>
      ) : (
        <button 
          style={{ backgroundColor: COLORS.PRIMARY_BLUE, color: 'white' }}
          onClick={connectWallet}
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
};
