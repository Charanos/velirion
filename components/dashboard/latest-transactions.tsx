"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactionStore } from "@/lib/stores/transactionStore";
import { ExternalLink } from "lucide-react";

const ACTION_LABELS: Record<string, string> = {
  transfer: "Transfer",
  burn: "Burn",
  stake: "Stake",
  unstake: "Unstake",
  claim: "Claim Rewards",
  presale: "Presale Purchase",
  dao_vote: "DAO Vote",
  dao_propose: "DAO Proposal",
};

export function LatestTransactions() {
  const [mounted, setMounted] = useState(false);
  const { getRecentTransactions } = useTransactionStore();
  const recentTransactions = getRecentTransactions(5);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const getExplorerUrl = (hash: string) => {
    return `https://sepolia.etherscan.io/tx/${hash}`;
  };

  const getTransactionDisplay = (tx: any) => {
    const currency = tx.currency || 'VLR';
    let displayAmount = tx.amount;
    
    // For unstake/claim, show stake ID instead of amount
    if (tx.type === 'unstake' || tx.type === 'claim') {
      displayAmount = tx.stakeId ? `#${tx.stakeId}` : 'N/A';
    }
    
    return {
      currency,
      amount: displayAmount,
      label: ACTION_LABELS[tx.type] || tx.type,
      tier: tx.tier !== undefined ? ` (Tier ${tx.tier})` : '',
    };
  };

  return (
    <Card className="border border-white/10 bg-zinc-900/70 text-white shadow-sm backdrop-blur-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-heading">Latest transactions</CardTitle>
        <a 
          href="/transactions" 
          className="text-sm font-heading text-fuchsia-300 hover:text-fuchsia-200 cursor-pointer"
        >
          See all
        </a>
      </CardHeader>
      <CardContent className="space-y-4">
        {!mounted ? (
          <p className="text-sm text-white/60 text-center py-4">Loading...</p>
        ) : recentTransactions.length === 0 ? (
          <p className="text-sm text-white/60 text-center py-4">No recent transactions</p>
        ) : (
          recentTransactions.map((tx) => {
            const display = getTransactionDisplay(tx);
            return (
              <div
                key={tx.id}
                className="flex items-start justify-between rounded-xl bg-white/5 p-4 hover:bg-white/10 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-sm font-heading font-semibold">{display.currency}</p>
                  <p className="text-xs text-white/60">
                    {display.label}
                    {display.tier}
                  </p>
                  {tx.details && (
                    <p className="text-xs text-white/40 mt-1 line-clamp-1">{tx.details}</p>
                  )}
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-heading font-semibold">
                    {display.amount} {display.amount !== 'N/A' && tx.type !== 'unstake' && tx.type !== 'claim' ? display.currency : ''}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-white/60">{formatTime(tx.timestamp)}</span>
                    <a
                      href={getExplorerUrl(tx.hash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-fuchsia-400 hover:text-fuchsia-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
