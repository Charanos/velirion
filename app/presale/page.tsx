"use client";

import { useMemo } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PageShell } from "@/components/dashboard/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePresaleActions, usePresaleInfo } from "@/lib/hooks/usePresale";

const amountSchema = z.object({
  amount: z.string().min(1, "Enter an amount"),
  referrer: z.string().optional(),
});

type FormValues = z.infer<typeof amountSchema>;

const paymentMethods = [
  {
    label: "ETH",
    detail: "Pay with ETH via buyWithETH (payable).",
    handlerKey: "eth" as const,
  },
  {
    label: "USDC",
    detail: "Approve ERC20 then call buyWithUSDC.",
    handlerKey: "usdc" as const,
  },
  {
    label: "USDT",
    detail: "Approve ERC20 then call buyWithUSDT.",
    handlerKey: "usdt" as const,
  },
];

export default function PresalePage() {
  const info = usePresaleInfo();
  const actions = usePresaleActions();

  const ethForm = useForm<FormValues>({
    resolver: zodResolver(amountSchema),
    defaultValues: { amount: "", referrer: undefined },
  });
  const usdcForm = useForm<FormValues>({
    resolver: zodResolver(amountSchema),
    defaultValues: { amount: "", referrer: undefined },
  });
  const usdtForm = useForm<FormValues>({
    resolver: zodResolver(amountSchema),
    defaultValues: { amount: "", referrer: undefined },
  });

  const forms = useMemo(
    () => ({
      eth: ethForm,
      usdc: usdcForm,
      usdt: usdtForm,
    }),
    [ethForm, usdcForm, usdtForm],
  );

  const handleSubmit = async (
    handlerKey: "eth" | "usdc" | "usdt",
    values: FormValues,
  ) => {
    try {
      const trimmedReferrer = values.referrer?.trim();
      const referrer = trimmedReferrer ? trimmedReferrer : undefined;
      if (handlerKey === "eth") {
        await actions.buyWithETH(values.amount, referrer);
      } else if (handlerKey === "usdc") {
        await actions.buyWithUSDC(values.amount, referrer);
      } else {
        await actions.buyWithUSDT(values.amount, referrer);
      }
      toast.success("Presale transaction submitted");
      forms[handlerKey].reset();
    } catch (error) {
      console.error(error);
      toast.error("Presale transaction failed");
    }
  };

  const totals = info.totals;
  const phase = info.phase;

  return (
    <PageShell title="Presale testing" subtitle="Simulate Velirion presale rounds">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="border-none bg-gradient-to-br from-purple-950/60 via-indigo-950/60 to-zinc-1000/50 text-white shadow-xl shadow-purple-900/30">
          <CardHeader>
            <CardTitle className="text-lg">Purchase tokens</CardTitle>
            <CardDescription className="text-xs text-white/60">
              Execute presale buys using the contract methods from the quick-start checklist. ERC20 flows auto-handle approvals.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="ETH" className="space-y-4">
              <TabsList className="bg-white/10">
                {paymentMethods.map((method) => (
                  <TabsTrigger key={method.label} value={method.label}>
                    {method.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {paymentMethods.map((method) => {
                const form = forms[method.handlerKey];
                const submit = form.handleSubmit((values: FormValues) => handleSubmit(method.handlerKey, values));

                return (
                  <TabsContent key={method.label} value={method.label}>
                    <Card className="border border-white/10 bg-black/20">
                      <CardContent className="space-y-4 p-6">
                        <p className="text-sm text-white/70">{method.detail}</p>
                        <form onSubmit={submit} className="space-y-4">
                          <div className="grid gap-2">
                            <label className="text-xs uppercase tracking-wide text-white/50">Amount</label>
                            <Input placeholder={method.label === "ETH" ? "0.25" : "500"} {...form.register("amount")} />
                            {form.formState.errors.amount ? (
                              <p className="text-xs text-rose-400">{form.formState.errors.amount.message}</p>
                            ) : null}
                          </div>
                          <div className="grid gap-2">
                            <label className="text-xs uppercase tracking-wide text-white/50">Referral (optional)</label>
                            <Input placeholder="0x referrer" {...form.register("referrer")} />
                          </div>
                          <Button type="submit" className="w-full rounded-xl" disabled={actions.isPending}>
                            {actions.isPending ? "Submitting…" : `Buy with ${method.label}`}
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
        </Card>

        <Card className="border-none bg-zinc-950/60 text-white shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg">Round status</CardTitle>
            <CardDescription className="text-xs text-white/60">
              Live data from PresaleContractV2.getCurrentPhaseInfo & metrics.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-white/70">
            <div className="flex items-center justify-between">
              <span>Active</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs">{phase?.isActive ? "Yes" : "No"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Price per VLR</span>
              <span>{phase ? `${phase.price} USD` : "--"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Sold / Allocation</span>
              <span>
                {phase ? `${phase.soldTokens} / ${phase.maxTokens}` : "--"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Global sold</span>
              <span>{totals.soldTokens ?? "--"}</span>
            </div>
            <p className="rounded-xl bg-white/5 p-4 text-xs text-white/60">
              Claimable amount: {totals.claimable ?? "--"} VLR
            </p>
            <Button onClick={actions.claim} disabled={actions.isPending} className="w-full rounded-xl bg-purple-600/40">
              {actions.isPending ? "Processing…" : "Claim vested tokens"}
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="border-none bg-zinc-950/60 text-white shadow-xl shadow-black/40">
          <CardHeader>
            <CardTitle className="text-lg">Referral metrics</CardTitle>
            <CardDescription className="text-xs text-white/60">
              Data from getReferralInfo & getUserPurchases.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-white/70">
            <div className="grid gap-2 text-xs text-white/60">
              <p>Referrer: {info.referral?.referrer ?? "--"}</p>
              <p>Total referred: {info.referral?.totalReferred ?? "--"}</p>
              <p>Total earned: {info.referral?.totalEarned ?? "--"}</p>
              <p>Total volume: {info.referral?.totalVolume ?? "--"}</p>
            </div>
            <div className="space-y-3 rounded-xl bg-white/5 p-4 text-xs text-white/60">
              <p className="font-semibold text-white">Purchase history</p>
              {info.purchases.length === 0 ? (
                <p>No purchases yet.</p>
              ) : (
                <div className="space-y-2">
                  {info.purchases.map((purchase) => (
                    <div key={`${purchase.phaseId}-${purchase.timestamp}`} className="flex items-center justify-between">
                      <span>
                        Phase {purchase.phaseId} · {purchase.amount}
                        {purchase.paymentToken ? ` (${purchase.paymentToken.slice(0, 6)}…)` : ""}
                      </span>
                      <span>{purchase.tokens} VLR</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-gradient-to-br from-indigo-950/40 to-purple-950/40 text-white shadow-xl shadow-purple-900/40">
          <CardHeader>
            <CardTitle className="text-lg">QA notes</CardTitle>
            <CardDescription className="text-xs text-white/60">
              Use this space to track presale testing outcomes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              disabled
              className="h-32 w-full rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/60"
              placeholder="Notes field coming with next iteration"
            />
          </CardContent>
        </Card>
      </section>
    </PageShell>
  );
}
