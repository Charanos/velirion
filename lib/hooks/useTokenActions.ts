'use client';

import { useMemo } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { VLR_TOKEN_CONFIG } from '@/lib/config/token';

export function useTokenActions() {
  const { address } = useAccount();
  const decimals = VLR_TOKEN_CONFIG.decimals;

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

  function transfer(to: string, amount: string) {
    return writeContractAsync({
      address: VLR_TOKEN_CONFIG.address,
      abi: VLR_TOKEN_CONFIG.abi,
      functionName: 'transfer',
      args: [to as `0x${string}`, parseUnits(amount, decimals)],
    });
  }

  function burn(amount: string) {
    return writeContractAsync({
      address: VLR_TOKEN_CONFIG.address,
      abi: VLR_TOKEN_CONFIG.abi,
      functionName: 'burn',
      args: [parseUnits(amount, decimals)],
    });
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
