'use client';

import { useMemo } from 'react';
import { useAccount, useReadContract, useWriteContract, usePublicClient, useConfig } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { VLR_TOKEN_CONFIG } from '@/lib/config/token';
import { useTransactionStore } from '@/lib/stores/transactionStore';

export function useTokenActions() {
  const { address } = useAccount();
  const config = useConfig();
  const publicClient = usePublicClient();
  const decimals = VLR_TOKEN_CONFIG.decimals;
  const { addTransaction, updateTransaction } = useTransactionStore();

  const {
    data: balance,
    refetch: refetchBalance,
    status: balanceStatus,
  } = useReadContract({
    abi: VLR_TOKEN_CONFIG.abi,
    address: VLR_TOKEN_CONFIG.address,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address && VLR_TOKEN_CONFIG.address),
    },
  });

  const { writeContractAsync, isPending } = useWriteContract();

  const summary = useMemo(() => {
    const raw = balance ? BigInt(balance.toString()) : 0n;
    const numeric = Number(formatUnits(raw, decimals));
    return Number.isFinite(numeric) ? numeric : 0;
  }, [balance, decimals]);

  async function transfer(to: string, amount: string) {
    const parsedAmount = parseUnits(amount, decimals);
    
    const hash = await writeContractAsync({
      address: VLR_TOKEN_CONFIG.address,
      abi: VLR_TOKEN_CONFIG.abi,
      functionName: 'transfer',
      args: [to as `0x${string}`, parsedAmount],
      gas: 100000n, // Explicit gas limit to avoid estimation issues
    });

    // Track transaction
    addTransaction({
      hash,
      type: 'transfer',
      amount,
      to,
      from: address,
    });

    // Wait for confirmation and update balance
    if (publicClient) {
      publicClient.waitForTransactionReceipt({ hash, confirmations: 1 })
        .then((receipt) => {
          updateTransaction(hash, {
            status: receipt.status === 'success' ? 'confirmed' : 'failed',
            blockNumber: Number(receipt.blockNumber),
          });
          // Trigger balance refetch
          refetchBalance();
        })
        .catch((error) => {
          console.error('Transaction monitoring error:', error);
          updateTransaction(hash, { status: 'failed' });
        });
    }

    return hash;
  }

  async function burn(amount: string) {
    const parsedAmount = parseUnits(amount, decimals);
    
    const hash = await writeContractAsync({
      address: VLR_TOKEN_CONFIG.address,
      abi: VLR_TOKEN_CONFIG.abi,
      functionName: 'burn',
      args: [parsedAmount],
      gas: 100000n, // Explicit gas limit
    });

    // Track transaction
    addTransaction({
      hash,
      type: 'burn',
      amount,
      from: address,
    });

    // Wait for confirmation and update balance
    if (publicClient) {
      publicClient.waitForTransactionReceipt({ hash, confirmations: 1 })
        .then((receipt) => {
          updateTransaction(hash, {
            status: receipt.status === 'success' ? 'confirmed' : 'failed',
            blockNumber: Number(receipt.blockNumber),
          });
          // Trigger balance refetch
          refetchBalance();
        })
        .catch((error) => {
          console.error('Transaction monitoring error:', error);
          updateTransaction(hash, { status: 'failed' });
        });
    }

    return hash;
  }

  return {
    balance: summary,
    balanceStatus,
    isPending,
    symbol: VLR_TOKEN_CONFIG.symbol,
    refetchBalance,
    transfer,
    burn,
  };
}
