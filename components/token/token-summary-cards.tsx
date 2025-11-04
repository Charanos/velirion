"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Activity, Gauge } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTokenBalance } from "@/lib/hooks/useTokenBalance";
import { useTokenActions } from "@/lib/hooks/useTokenActions";
import { safeToFixed } from "@/lib/utils/formatters";

export function TokenSummaryCards() {
  const [mounted, setMounted] = useState(false);
  const { address } = useAccount();
  const balance = useTokenBalance();
  const actions = useTokenActions();

  useEffect(() => {
    setMounted(true);
  }, []);

  const formattedBalance = !mounted || balance.loading
    ? "Loading…"
    : balance.balance
    ? `${safeToFixed(Number(balance.balance), 3)} ${balance.symbol}`
    : "--";
  const wagmiBalance = !mounted || actions.balanceStatus === "pending"
    ? "Loading…"
    : Number.isFinite(actions.balance)
    ? `${safeToFixed(actions.balance, 3)} VLR`
    : "--";

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="border-none bg-gradient-to-br from-purple-950/60 via-indigo-900/60 to-zinc-950/60 text-white shadow-xl shadow-purple-900/40">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm text-white/70">
            Wallet balance
          </CardTitle>
          <Activity className="size-4 text-purple-200" />
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-3xl font-medium">{formattedBalance}</p>
          <p className="text-xs text-white/60">
            {balance.loading
              ? "Fetching balance…"
              : address
              ? "Balance fetched via wagmi useBalance"
              : "Connect a wallet to view your on-chain balance"}
          </p>
        </CardContent>
      </Card>

      <Card className="border-none bg-zinc-950/60 text-white shadow-xl shadow-black/40">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm text-white/70">VLR tracker</CardTitle>
          <Gauge className="size-4 text-purple-200" />
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-3xl font-medium">{wagmiBalance}</p>
          <p className="text-xs text-white/60">
            {actions.balanceStatus === "pending"
              ? "Refreshing contract state…"
              : address
              ? "Pulled via VelirionToken.balanceOf"
              : "Connect a wallet to query balanceOf"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
