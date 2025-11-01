'use client';

import { useAccount, useBalance } from 'wagmi';

const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS as `0x${string}` | undefined;

export function useTokenBalance() {
  const { address, chain } = useAccount();

  const result = useBalance({
    address,
    token: TOKEN_ADDRESS,
    query: {
      enabled: Boolean(address && TOKEN_ADDRESS && chain?.id),
      refetchInterval: 30_000,
    },
  });

  return {
    balance: result.data?.formatted,
    symbol: result.data?.symbol ?? 'VLR',
    loading: result.isLoading,
    error: result.error,
  };
}
