"use client";

import { useState, useEffect } from "react";
import { PageShell } from "@/components/dashboard/page-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTransactionStore } from "@/lib/stores/transactionStore";
import { ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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

const TYPE_COLORS: Record<string, string> = {
  stake: "bg-blue-500/20 text-blue-300",
  unstake: "bg-orange-500/20 text-orange-300",
  claim: "bg-green-500/20 text-green-300",
  presale: "bg-purple-500/20 text-purple-300",
  dao_vote: "bg-indigo-500/20 text-indigo-300",
  dao_propose: "bg-violet-500/20 text-violet-300",
  transfer: "bg-cyan-500/20 text-cyan-300",
  burn: "bg-red-500/20 text-red-300",
};

export default function TransactionsPage() {
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<string>("all");
  const { getAllTransactions } = useTransactionStore();
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    setMounted(true);
  }, []);

  const allTransactions = getAllTransactions(200);

  // Filter transactions
  const filteredTransactions =
    filter === "all"
      ? allTransactions
      : allTransactions.filter((tx) => tx.type === filter);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getExplorerUrl = (hash: string) => {
    return `https://sepolia.etherscan.io/tx/${hash}`;
  };

  const getTransactionDisplay = (tx: any) => {
    const currency = tx.currency || "VLR";
    let displayAmount = tx.amount;

    // For unstake/claim, show stake ID instead of amount
    if (tx.type === "unstake" || tx.type === "claim") {
      displayAmount = tx.stakeId ? `#${tx.stakeId}` : "N/A";
    }

    return {
      currency,
      amount: displayAmount,
      label: ACTION_LABELS[tx.type] || tx.type,
      tier: tx.tier !== undefined ? ` (Tier ${tx.tier})` : "",
      lockDays: tx.lockDays ? ` - ${tx.lockDays} days` : "",
    };
  };

  const uniqueTypes = Array.from(new Set(allTransactions.map((tx) => tx.type)));

  return (
    <PageShell
      title="Transaction History"
      subtitle="Complete history of your VLR transactions"
    >
      <Card className="border border-white/10 bg-zinc-900/70 text-white shadow-sm backdrop-blur-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-heading">
                All Transactions
              </CardTitle>
              <CardDescription className="text-xs text-white/60">
                {filteredTransactions.length} transaction
                {filteredTransactions.length !== 1 ? "s" : ""} found
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setFilter("all");
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 text-xs rounded-full transition ${
                  filter === "all"
                    ? "bg-fuchsia-500 text-white"
                    : "bg-white/10 text-white/60 hover:bg-white/20"
                }`}
              >
                All
              </button>
              {uniqueTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setFilter(type);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 text-xs rounded-full transition ${
                    filter === type
                      ? "bg-fuchsia-500 text-white"
                      : "bg-white/10 text-white/60 hover:bg-white/20"
                  }`}
                >
                  {ACTION_LABELS[type] || type}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {!mounted ? (
            <p className="text-sm text-white/60 text-center py-8">Loading...</p>
          ) : filteredTransactions.length === 0 ? (
            <p className="text-sm text-white/60 text-center py-8">
              No transactions found
            </p>
          ) : (
            <>
              <div className="space-y-2">
                {paginatedTransactions.map((tx) => {
                  const display = getTransactionDisplay(tx);
                  return (
                    <div
                      key={tx.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl bg-white/5 p-4 hover:bg-white/10 transition-colors gap-3"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            TYPE_COLORS[tx.type] || "bg-gray-500/20 text-gray-300"
                          }`}
                        >
                          {display.label}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-heading font-semibold">
                              {display.currency}
                            </p>
                            <span
                              className={`px-2 py-0.5 text-xs rounded ${
                                tx.status === "confirmed"
                                  ? "bg-green-500/20 text-green-300"
                                  : tx.status === "failed"
                                  ? "bg-red-500/20 text-red-300"
                                  : "bg-yellow-500/20 text-yellow-300"
                              }`}
                            >
                              {tx.status}
                            </span>
                          </div>
                          {tx.details && (
                            <p className="text-xs text-white/60 mt-1 line-clamp-2">
                              {tx.details}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-white/40">
                              {formatTime(tx.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 sm:flex-row-reverse">
                        <a
                          href={getExplorerUrl(tx.hash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-fuchsia-400 hover:text-fuchsia-300 transition"
                          title="View on Etherscan"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <div className="text-right">
                          <p className="text-sm font-heading font-semibold whitespace-nowrap">
                            {display.amount}{" "}
                            {display.amount !== "N/A" &&
                            tx.type !== "unstake" &&
                            tx.type !== "claim"
                              ? display.currency
                              : ""}
                          </p>
                          {display.tier && (
                            <p className="text-xs text-white/50">
                              {display.tier.trim()}
                              {display.lockDays}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <p className="text-xs text-white/60">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(endIndex, filteredTransactions.length)} of{" "}
                    {filteredTransactions.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0 border-white/20"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-xs text-white/60">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="h-8 w-8 p-0 border-white/20"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}
