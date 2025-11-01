'use client';

import { useEffect, useMemo, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

type SolanaBalanceState = {
  balance: number | null;
  loading: boolean;
  error?: string;
  refetch: () => void;
};

const MINT_ADDRESS = process.env.NEXT_PUBLIC_SOLANA_MINT;
const DECIMALS = 9;

export function useSolanaTokenBalance(): SolanaBalanceState {
  const { publicKey } = useWallet();
  const { connection } = useConnection();

  const mintPublicKey = useMemo(() => {
    if (!MINT_ADDRESS) return undefined;
    try {
      return new PublicKey(MINT_ADDRESS);
    } catch (error) {
      console.warn('Invalid Solana mint address', error);
      return undefined;
    }
  }, []);

  const [state, setState] = useState<Omit<SolanaBalanceState, 'refetch'>>({
    balance: null,
    loading: false,
  });

  const loadBalance = useMemo(() => {
    let cancelled = false;

    const fetchBalance = async () => {
      if (!publicKey || !mintPublicKey) {
        if (!cancelled) {
          setState({ balance: null, loading: false });
        }
        return;
      }

      setState((prev) => ({ ...prev, loading: true, error: undefined }));

      try {
        const response = await connection.getParsedTokenAccountsByOwner(publicKey, {
          mint: mintPublicKey,
        });

        const amount = response?.value?.[0]?.account?.data?.parsed?.info?.tokenAmount;
        const raw = amount?.amount ? Number(amount.amount) : 0;
        const divisor = 10 ** (amount?.decimals ?? DECIMALS);
        const readable = raw / divisor;

        if (!cancelled) {
          setState({ balance: readable, loading: false });
        }
      } catch (error) {
        console.error('Failed to fetch Solana token balance', error);
        if (!cancelled) {
          setState({ balance: null, loading: false, error: 'Unable to load balance' });
        }
      }
    };

    return {
      run: () => {
        cancelled = false;
        void fetchBalance();
      },
      cancel: () => {
        cancelled = true;
      },
    };
  }, [publicKey, mintPublicKey, connection]);

  useEffect(() => {
    loadBalance.run();
    const interval = setInterval(() => loadBalance.run(), 30_000);
    return () => {
      loadBalance.cancel();
      clearInterval(interval);
    };
  }, [loadBalance]);

  return {
    ...state,
    refetch: loadBalance.run,
  };
}
