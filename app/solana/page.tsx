"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PageShell } from "@/components/dashboard/page-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSolanaActions } from "@/lib/hooks/useSolanaActions";

const SolanaBalanceCard = dynamic(
  () => import("@/components/solana/solana-balance-card"),
  {
    ssr: false,
    loading: () => (
      <Card className="border-none bg-zinc-950/60 text-white shadow-xl">
        <CardContent className="p-6">Loading Solana context…</CardContent>
      </Card>
    ),
  }
);

const transferSchema = z.object({
  recipient: z.string().min(32, "Enter recipient pubkey"),
  amount: z.string().min(1, "Enter amount"),
});

const airdropSchema = z.object({
  amount: z.string().min(1, "Enter SOL amount"),
});

type TransferFormValues = z.infer<typeof transferSchema>;
type AirdropFormValues = z.infer<typeof airdropSchema>;

export default function SolanaPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const {
    transferSpl,
    requestAirdrop,
    isProcessing,
    history,
    error,
    clearError,
  } = useSolanaActions({
    onSettled: () => setRefreshKey((prev) => prev + 1),
  });

  const transferForm = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: { recipient: "", amount: "" },
  });

  const airdropForm = useForm<AirdropFormValues>({
    resolver: zodResolver(airdropSchema),
    defaultValues: { amount: "1" },
  });

  const onTransfer = async (values: TransferFormValues) => {
    try {
      await transferSpl(values);
      toast.success("SPL transfer submitted");
      transferForm.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Transfer failed");
    }
  };

  const onAirdrop = async (values: AirdropFormValues) => {
    try {
      await requestAirdrop(values);
      toast.success("Airdrop requested");
      airdropForm.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Airdrop failed");
    }
  };

  return (
    <PageShell
      title="Solana testing"
      subtitle="Devnet adapter + SPL operations"
    >
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="border-none bg-gradient-to-br from-purple-950/60 via-indigo-950/60 to-zinc-1000/50 text-white shadow-xl shadow-purple-900/30">
          <CardHeader>
            <CardTitle className="text-lg">SPL token actions</CardTitle>
            <CardDescription className="text-xs text-white/60">
              Use Solana Wallet Adapter + SPL Token helpers to send the Devnet
              mint.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border border-white/10 bg-black/20 p-6 text-white">
                <p className="text-sm font-medium">Transfer SPL</p>
                <p className="text-xs text-white/60 mb-4">
                  Uses associated token accounts + createTransferInstruction
                  before confirming on Devnet.
                </p>
                <form
                  onSubmit={transferForm.handleSubmit(onTransfer)}
                  className="grid gap-3"
                >
                  <div className="grid gap-2">
                    <label className="text-xs uppercase tracking-wide text-white/50">
                      Recipient
                    </label>
                    <Input
                      placeholder="Recipient pubkey"
                      {...transferForm.register("recipient")}
                    />
                    {transferForm.formState.errors.recipient ? (
                      <p className="text-xs text-rose-400">
                        {transferForm.formState.errors.recipient.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs uppercase tracking-wide text-white/50">
                      Amount (SPL)
                    </label>
                    <Input
                      placeholder="0.50"
                      {...transferForm.register("amount")}
                    />
                    {transferForm.formState.errors.amount ? (
                      <p className="text-xs text-rose-400">
                        {transferForm.formState.errors.amount.message}
                      </p>
                    ) : null}
                  </div>
                  <Button
                    type="submit"
                    className="rounded-xl"
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing…" : "Send SPL"}
                  </Button>
                </form>
              </Card>

              <Card className="border border-white/10 bg-black/20 p-6 text-white">
                <p className="text-sm font-medium">Request airdrop</p>
                <p className="text-xs text-white/60 mb-4">
                  Uses connection.requestAirdrop for Devnet lamports.
                </p>
                <form
                  onSubmit={airdropForm.handleSubmit(onAirdrop)}
                  className="grid gap-3"
                >
                  <div className="grid gap-2">
                    <label className="text-xs uppercase tracking-wide text-white/50">
                      Amount (SOL)
                    </label>
                    <Input
                      placeholder="1"
                      {...airdropForm.register("amount")}
                    />
                    {airdropForm.formState.errors.amount ? (
                      <p className="text-xs text-rose-400">
                        {airdropForm.formState.errors.amount.message}
                      </p>
                    ) : null}
                  </div>
                  <Button
                    type="submit"
                    className="rounded-xl bg-white/10 text-white"
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Requesting…" : "Request"}
                  </Button>
                </form>
              </Card>
            </div>

            {error ? (
              <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-200">
                <div className="flex items-center justify-between">
                  <span>{error}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-auto px-2 py-0 text-rose-100"
                    onClick={clearError}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <SolanaBalanceCard refreshKey={refreshKey} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="border-none bg-zinc-950/60 text-white shadow-xl shadow-black/40">
          <CardHeader>
            <CardTitle className="text-lg">Transaction log</CardTitle>
            <CardDescription className="text-xs text-white/60">
              Captures recent airdrop + transfer signatures from the hook.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-white/60">
            {history.length === 0 ? (
              <p>No Solana activity yet.</p>
            ) : (
              <div className="space-y-2">
                {history.map((entry) => (
                  <div
                    key={entry.signature}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/5 p-3"
                  >
                    <div className="space-y-1">
                      <p className="text-white">
                        {entry.type === "transfer" ? "SPL transfer" : "Airdrop"}{" "}
                        · {entry.amount}
                      </p>
                      <p className="text-white/50">{entry.signatureShort}</p>
                    </div>
                    <span className="text-white/40">
                      {new Date(entry.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none bg-gradient-to-br from-indigo-950/40 to-purple-950/40 text-white shadow-xl shadow-purple-900/40">
          <CardHeader>
            <CardTitle className="text-lg">Solana checklist</CardTitle>
            <CardDescription className="text-xs text-white/60">
              Tasks from quick-start for Devnet validation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-white/60">
            <p>☑ Connect Phantom wallet</p>
            <p>☑ Display SPL balance (Devnet)</p>
            <p>☑ Execute transfer instruction</p>
            <p>☐ Verify anchor program logs</p>
          </CardContent>
        </Card>
      </section>
    </PageShell>
  );
}
