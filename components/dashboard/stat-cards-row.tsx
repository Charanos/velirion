"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTokenBalance } from "@/lib/hooks/useTokenBalance";
import { useStaking } from "@/lib/hooks/useStaking";
import { useDao } from "@/lib/hooks/useDao";
import { useSolanaTokenBalance } from "@/lib/hooks/useSolanaTokenBalance";
import { safeFormatBalance } from "@/lib/utils/formatters";

export function StatCardsRow() {
  const [mounted, setMounted] = useState(false);
  const { balance: vlrBalance, loading: vlrLoading } = useTokenBalance();
  const { summary: stakingSummary, isLoading: stakingLoading } = useStaking();
  const { votingPower, isLoading: daoLoading } = useDao();
  const { balance: solBalance, loading: solLoading } = useSolanaTokenBalance();

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = [
    {
      label: "Token Balance",
      value: !mounted || vlrLoading 
        ? "Loading..." 
        : `${safeFormatBalance(vlrBalance)} VLR`,
      loading: vlrLoading,
    },
    {
      label: "Staked",
      value: !mounted
        ? "Loading..."
        : stakingLoading
        ? "Loading..."
        : stakingSummary
        ? `${safeFormatBalance(stakingSummary.totalStaked)} VLR`
        : "0 VLR",
      loading: stakingLoading,
    },
    {
      label: "DAO Voting Power",
      value: !mounted || daoLoading 
        ? "Loading..." 
        : `${safeFormatBalance(votingPower ?? "0")} VP`,
      loading: daoLoading,
    },
    {
      label: "Solana SPL Balance",
      value: !mounted || solLoading 
        ? "Loading..." 
        : `${safeFormatBalance(solBalance)} SPL`,
      loading: solLoading,
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="border-none bg-gradient-to-br from-violet-950/40 via-violet-900/40 to-fuchsia-900/40 text-white shadow-sm backdrop-blur-lg cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-heading text-white/70">
              {stat.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {!mounted || stat.loading ? (
              <div className="h-8 w-32 animate-pulse rounded bg-white/10" />
            ) : (
              <p className="text-2xl font-heading font-medium truncate">{stat.value}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
