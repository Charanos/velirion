"use client";

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
  const { getRecentTransactions } = useTransactionStore();
  const recentTransactions = getRecentTransactions(3);

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

  return (
    <Card className="border border-white/10 bg-zinc-900/70 text-white shadow-sm backdrop-blur-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-heading">Latest transactions</CardTitle>
        <button className="text-sm font-heading text-fuchsia-300 hover:text-fuchsia-200 cursor-pointer">
          See all
        </button>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentTransactions.length === 0 ? (
          <p className="text-sm text-white/60 text-center py-4">No recent transactions</p>
        ) : (
          recentTransactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between rounded-xl bg-white/5 p-4 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div>
                <p className="text-sm font-heading font-semibold">VLR</p>
                <p className="text-xs text-white/60">{ACTION_LABELS[tx.type] || tx.type}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-heading font-semibold">{tx.amount} VLR</p>
              </div>
              <div className="flex items-center gap-2">
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
          ))
        )}
      </CardContent>
    </Card>
  );
}
