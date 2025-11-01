'use client';

import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import { Wallet } from 'lucide-react';
import { useTokenBalance } from '@/lib/hooks/useTokenBalance';
import { useSolanaTokenBalance } from '@/lib/hooks/useSolanaTokenBalance';
import { Card, CardContent } from '@/components/ui/card';

export function WalletSummary() {
  const { address, chain } = useAccount();
  const ethBalance = useTokenBalance();
  const solBalance = useSolanaTokenBalance();

  const networkLabel = useMemo(() => {
    if (!chain) return 'Disconnected';
    return chain.name ?? `Chain ${chain.id}`;
  }, [chain]);

  const formattedEth = ethBalance.balance
    ? `${Number(ethBalance.balance).toFixed(2)} ${ethBalance.symbol}`
    : '--';

  const formattedSol =
    solBalance.balance !== null ? `${solBalance.balance.toFixed(2)} SPL` : '--';

  return (
    <Card className="border-none bg-zinc-900/60 text-white shadow-lg">
      <CardContent className="flex items-center justify-between gap-6 p-6">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-purple-600/30">
            <Wallet className="size-6 text-purple-200" />
          </span>
          <div>
            <p className="text-sm text-white/70">Network</p>
            <p className="text-xl font-semibold">{networkLabel}</p>
            <p className="text-xs text-white/50">
              {address ? `${address.slice(0, 6)}…${address.slice(-4)}` : 'Connect to view account'}
            </p>
          </div>
        </div>
        <div className="grid gap-2 text-right text-sm">
          <div>
            <p className="text-white/60">VLR Balance</p>
            <p className="text-lg font-semibold">
              {ethBalance.loading ? 'Loading…' : formattedEth}
            </p>
          </div>
          <div>
            <p className="text-white/60">SPL Balance</p>
            <p className="text-lg font-semibold">
              {solBalance.loading ? 'Loading…' : formattedSol}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
