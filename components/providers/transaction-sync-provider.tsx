'use client';

import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useTransactionStore } from '@/lib/stores/transactionStore';

/**
 * Provider component that syncs wallet address with transaction store
 * and fetches transactions from MongoDB when wallet connects
 */
export function TransactionSyncProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount();
  const { setWalletAddress } = useTransactionStore();

  useEffect(() => {
    if (isConnected && address) {
      setWalletAddress(address);
    } else {
      setWalletAddress(null);
    }
  }, [address, isConnected, setWalletAddress]);

  return <>{children}</>;
}
