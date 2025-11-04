"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { Wallet } from "lucide-react";
import { useTokenBalance } from "@/lib/hooks/useTokenBalance";
import { useSolanaTokenBalance } from "@/lib/hooks/useSolanaTokenBalance";
import { Card, CardContent } from "@/components/ui/card";

export function WalletSummary() {
  const [mounted, setMounted] = useState(false);
  const { address, chain } = useAccount();
  const ethBalance = useTokenBalance();
  const solBalance = useSolanaTokenBalance();

  useEffect(() => {
    setMounted(true);
  }, []);

  const networkLabel = useMemo(() => {
    if (!mounted || !chain) return "Disconnected";
    return chain.name ?? `Chain ${chain.id}`;
  }, [mounted, chain]);

  const formattedEth = useMemo(() => {
    if (!mounted) return "--";
    if (ethBalance.loading) return "Loading…";
    if (!ethBalance.balance) return "--";
    const num = Number(ethBalance.balance);
    if (isNaN(num) || !isFinite(num)) return "--";
    return `${num.toFixed(2)} ${ethBalance.symbol}`;
  }, [mounted, ethBalance.balance, ethBalance.loading, ethBalance.symbol]);

  const formattedSol = useMemo(() => {
    if (!mounted) return "--";
    if (solBalance.loading) return "Loading…";
    if (solBalance.balance === null) return "--";
    if (isNaN(solBalance.balance) || !isFinite(solBalance.balance)) return "--";
    return `${solBalance.balance.toFixed(2)} SPL`;
  }, [mounted, solBalance.balance, solBalance.loading]);

  return (
    <Card className="border border-white/10 bg-zinc-900/70 text-white shadow-sm backdrop-blur-lg">
      <CardContent className="flex items-center justify-between gap-6 p-6">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-purple-600/30">
            <Wallet className="size-6 text-purple-200" />
          </span>
          <div>
            <p className="text-sm text-white/70">Network</p>
            <p className="text-xl font-medium">{networkLabel}</p>
            <p className="text-xs text-white/50">
              {mounted && address
                ? `${address.slice(0, 6)}…${address.slice(-4)}`
                : "Connect to view account"}
            </p>
          </div>
        </div>
        <div className="grid gap-2 text-right text-sm">
          <div>
            <p className="text-white/60">VLR Balance</p>
            <p className="text-lg font-medium">{formattedEth}</p>
          </div>
          <div>
            <p className="text-white/60">SPL Balance</p>
            <p className="text-lg font-medium">{formattedSol}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
