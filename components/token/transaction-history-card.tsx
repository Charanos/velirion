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

export function TransactionHistoryCard() {
  const [mounted, setMounted] = useState(false);
  const { getRecentTransactions } = useTransactionStore();
  const recentActivity = getRecentTransactions(5);

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

  return (
    <Card className="border border-white/10 bg-zinc-900/70 text-white shadow-sm backdrop-blur-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-heading">Recent activity</CardTitle>
          <p className="text-xs text-white/60">
            Real-time transaction data
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!mounted ? (
          <p className="text-sm text-white/60 text-center py-4">Loading...</p>
        ) : recentActivity.length === 0 ? (
          <p className="text-sm text-white/60 text-center py-4">No recent activity</p>
        ) : (
          recentActivity.map((tx) => (
            <div
              key={tx.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/5 p-4 hover:bg-white/10 transition-colors"
            >
              <div className="flex-1">
                <p className="text-sm font-medium">{ACTION_LABELS[tx.type] || tx.type}</p>
                <p className="text-xs text-white/60">
                  {tx.to ? `To ${tx.to.slice(0, 6)}...${tx.to.slice(-4)}` : tx.from ? `From ${tx.from.slice(0, 6)}...${tx.from.slice(-4)}` : "--"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{tx.amount} VLR</p>
                <p className="text-xs text-white/50">{formatTime(tx.timestamp)}</p>
              </div>
              <a
                href={getExplorerUrl(tx.hash)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-fuchsia-400 hover:text-fuchsia-300 flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
