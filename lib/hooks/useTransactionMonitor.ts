'use client';

import { useEffect, useCallback } from 'react';
import { usePublicClient, useAccount } from 'wagmi';
import { type Hash } from 'viem';

type TransactionCallback = () => void;

/**
 * Hook to monitor transaction confirmations and trigger callbacks
 */
export function useTransactionMonitor() {
  const publicClient = usePublicClient();
  const { address } = useAccount();

  const waitForTransaction = useCallback(
    async (hash: Hash, onConfirmed?: TransactionCallback) => {
      if (!publicClient) {
        console.warn('Public client not available');
        return;
      }

      try {
        const receipt = await publicClient.waitForTransactionReceipt({
          hash,
          confirmations: 1,
        });

        if (receipt.status === 'success') {
          console.log('Transaction confirmed:', hash);
          onConfirmed?.();
        } else {
          console.error('Transaction failed:', hash);
        }

        return receipt;
      } catch (error) {
        console.error('Error waiting for transaction:', error);
        throw error;
      }
    },
    [publicClient]
  );

  return {
    waitForTransaction,
  };
}
