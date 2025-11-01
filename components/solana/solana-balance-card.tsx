'use client';

import { useEffect, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { useSolanaTokenBalance } from '@/lib/hooks/useSolanaTokenBalance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function shorten(address: string) {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

type SolanaBalanceCardProps = {
  refreshKey?: number;
};

export default function SolanaBalanceCard({ refreshKey }: SolanaBalanceCardProps) {
  const { connected, publicKey } = useWallet();
  const { balance, loading, error, refetch } = useSolanaTokenBalance();

  const readableAddress = useMemo(() => {
    if (!publicKey) return 'Not connected';
    return shorten(publicKey.toBase58());
  }, [publicKey]);

  useEffect(() => {
    if (refreshKey !== undefined) {
      refetch();
    }
  }, [refreshKey, refetch]);

  return (
    <Card className="border-none bg-zinc-950/60 text-white shadow-xl shadow-black/40">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Wallet overview</CardTitle>
            <CardDescription className="text-xs text-white/60">
              Phantom connection · SPL mint {process.env.NEXT_PUBLIC_SOLANA_MINT ?? 'unset'}
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-white/20 text-xs text-white"
            onClick={refetch}
            disabled={loading}
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-white/70">
        <div className="flex items-center justify-between">
          <span>Status</span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs">
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Phantom address</span>
          <span>{readableAddress}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>SPL balance</span>
          <span>{loading ? 'Loading…' : balance !== null ? `${balance.toFixed(4)} SPL` : '--'}</span>
        </div>
        {error ? <p className="text-xs text-rose-400">{error}</p> : null}
        <p className="rounded-xl bg-white/5 p-4 text-xs text-white/60">
          Anchored to Devnet (Anchor 0.30.1). Refresh to sync after transfers/airdrops.
        </p>
      </CardContent>
    </Card>
  );
}
