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
    if (!address) throw new Error('Wallet not connected');
    if (!to || to === '') throw new Error('Recipient address is required');
    
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      throw new Error('Invalid amount. Please enter a valid VLR amount.');
    }
    
    // Check if user has sufficient balance
    if (summary < amountNum) {
      throw new Error(`Insufficient balance. You have ${summary.toFixed(2)} VLR but trying to send ${amountNum} VLR.`);
    }
    
    const parsedAmount = parseUnits(amount, decimals);
    console.log('Transferring:', { to, amount, parsed: parsedAmount.toString() });
    
    try {
      const hash = await writeContractAsync({
        address: VLR_TOKEN_CONFIG.address,
        abi: VLR_TOKEN_CONFIG.abi,
        functionName: 'transfer',
        args: [to as `0x${string}`, parsedAmount],
      });

      console.log('Transfer transaction sent:', hash);

      // Track transaction
      addTransaction({
        hash,
        type: 'transfer',
        amount,
        to,
        from: address,
        currency: 'VLR',
        details: `Transfer ${amount} VLR to ${to.slice(0, 6)}...${to.slice(-4)}`,
      });

      // Wait for confirmation and update balance
      if (publicClient) {
        publicClient.waitForTransactionReceipt({ hash, confirmations: 1 })
          .then((receipt) => {
            updateTransaction(hash, {
              status: receipt.status === 'success' ? 'confirmed' : 'failed',
              blockNumber: Number(receipt.blockNumber),
            });
            console.log('Transfer confirmed');
            // Trigger balance refetch
            refetchBalance();
          })
          .catch((error) => {
            console.error('Transaction monitoring error:', error);
            updateTransaction(hash, { status: 'failed' });
          });
      }

      return hash;
    } catch (error: any) {
      console.error('Transfer error:', error);
      if (error.message?.includes('insufficient funds')) {
        throw new Error('Insufficient ETH balance for gas fees.');
      }
      throw error;
    }
  }

  async function burn(amount: string) {
    if (!address) throw new Error('Wallet not connected');
    
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      throw new Error('Invalid amount. Please enter a valid VLR amount to burn.');
    }
    
    // Check if user has sufficient balance
    if (summary < amountNum) {
      throw new Error(`Insufficient balance. You have ${summary.toFixed(2)} VLR but trying to burn ${amountNum} VLR.`);
    }
    
    const parsedAmount = parseUnits(amount, decimals);
    console.log('Burning:', { amount, parsed: parsedAmount.toString() });
    
    try {
      const hash = await writeContractAsync({
        address: VLR_TOKEN_CONFIG.address,
        abi: VLR_TOKEN_CONFIG.abi,
        functionName: 'burn',
        args: [parsedAmount],
      });

      console.log('Burn transaction sent:', hash);

      // Track transaction
      addTransaction({
        hash,
        type: 'burn',
        amount,
        from: address,
        currency: 'VLR',
        details: `Burned ${amount} VLR`,
      });

      // Wait for confirmation and update balance
      if (publicClient) {
        publicClient.waitForTransactionReceipt({ hash, confirmations: 1 })
          .then((receipt) => {
            updateTransaction(hash, {
              status: receipt.status === 'success' ? 'confirmed' : 'failed',
              blockNumber: Number(receipt.blockNumber),
            });
            console.log('Burn confirmed');
            // Trigger balance refetch
            refetchBalance();
          })
          .catch((error) => {
            console.error('Transaction monitoring error:', error);
            updateTransaction(hash, { status: 'failed' });
          });
      }

      return hash;
    } catch (error: any) {
      console.error('Burn error:', error);
      if (error.message?.includes('insufficient funds')) {
        throw new Error('Insufficient ETH balance for gas fees.');
      }
      throw error;
    }
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
