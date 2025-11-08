"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
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
import { useStaking } from "@/lib/hooks/useStaking";

const stakeSchema = z.object({
  amount: z.string().min(1, "Enter amount"),
  tier: z.string().min(1, "Select tier"),
  lockDays: z.string().min(1, "Lock duration required"),
});

type StakeFormValues = z.infer<typeof stakeSchema>;

const tiers = [
  {
    id: 0,
    name: "Flexible",
    apr: "6% APR",
    lock: "30 days",
    minDays: 30,
    minAmount: 100,
  },
  {
    id: 1,
    name: "Medium",
    apr: "12-15% APR",
    lock: "60-120 days",
    minDays: 60,
    minAmount: 1000,
  },
  { 
    id: 2, 
    name: "Long", 
    apr: "20-22% APR", 
    lock: "180-365 days", 
    minDays: 180,
    minAmount: 5000,
  },
  { 
    id: 3, 
    name: "Elite", 
    apr: "30-32% APR", 
    lock: "360-730 days", 
    minDays: 360,
    minAmount: 250000,
  },
];

export default function StakingPage() {
  const {
    summary,
    stats,
    stakes,
    isLoading,
    refetchAll,
    stake,
    claim,
    unstake,
    isPending,
  } = useStaking();

  const stakeForm = useForm<StakeFormValues>({
    resolver: zodResolver(stakeSchema),
    defaultValues: { amount: "", tier: "0", lockDays: "30" },
  });

  // Watch for tier changes and update lock duration
  const selectedTier = stakeForm.watch("tier");
  const currentTierData = tiers.find((t) => t.id === Number(selectedTier));

  // Update lock duration when tier changes
  React.useEffect(() => {
    if (currentTierData) {
      stakeForm.setValue("lockDays", String(currentTierData.minDays));
    }
  }, [selectedTier, currentTierData, stakeForm]);

  const withdrawForm = useForm<{ stakeId: string }>({
    defaultValues: { stakeId: "" },
  });

  const handleStake = async (values: StakeFormValues) => {
    try {
      await stake({
        amount: values.amount,
        tier: Number(values.tier),
        lockDays: Number(values.lockDays),
      });
      toast.success("Stake transaction submitted successfully!");
      stakeForm.reset();
      // Refetch after a short delay to ensure blockchain state is updated
      setTimeout(() => {
        refetchAll();
      }, 2000);
    } catch (error: any) {
      console.error("Stake error:", error);
      toast.error(error?.message || "Failed to stake. Check console for details.");
    }
  };

  const handleWithdraw = async (data: { stakeId: string }) => {
    try {
      await unstake(data.stakeId);
      toast.success("Unstake submitted");
      withdrawForm.reset();
      refetchAll();
    } catch (error) {
      console.error(error);
      toast.error("Failed to unstake");
    }
  };

  const handleClaim = async (stakeId: bigint) => {
    try {
      await claim(stakeId.toString());
      toast.success("Claim submitted");
      refetchAll();
    } catch (error) {
      console.error(error);
      toast.error("Failed to claim rewards");
    }
  };

  return (
    <PageShell title="Staking dashboard" subtitle="Test Velirion staking flows">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="border-none bg-gradient-to-br from-indigo-950/70 via-purple-950/70 to-zinc-950/70 text-white shadow-sm backdrop-blur-lg flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg font-heading">Stake VLR</CardTitle>
            <CardDescription className="text-xs text-white/60">
              VelirionStaking.stake(amount, tier, lockSeconds) with automatic
              VLR approvals.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-auto flex-1 flex flex-col justify-between">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {tiers.map((tier) => (
                <Card
                  key={tier.id}
                  className="border border-white/10 bg-white/5 p-4 text-white"
                >
                  <p className="text-sm font-medium">{tier.name}</p>
                  <p className="text-xs text-white/60">{tier.apr}</p>
                  <p className="text-xs text-white/50">{tier.lock}</p>
                  <p className="text-xs text-white/40 mt-1">
                    Min: {tier.minAmount.toLocaleString()} VLR
                  </p>
                </Card>
              ))}
            </div>

            <form
              onSubmit={stakeForm.handleSubmit(handleStake)}
              className="grid gap-4 w-full mt-6 md:mt-1"
            >
              <div className="space-y-2">
                <label className="text-xs font-heading uppercase tracking-wide text-white/50">
                  Amount (VLR)
                </label>
                <Input
                  placeholder="500"
                  {...stakeForm.register("amount")}
                  className="bg-zinc-900"
                />
                {currentTierData && (
                  <p className="text-xs text-white/50">
                    Minimum for {currentTierData.name}: {currentTierData.minAmount.toLocaleString()} VLR
                  </p>
                )}
                {stakeForm.formState.errors.amount ? (
                  <p className="text-xs text-rose-400">
                    {stakeForm.formState.errors.amount.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2 md:space-y-4">
                <label className="text-xs font-heading uppercase tracking-wide text-white/50">
                  Tier
                </label>
                <select
                  className="flex h-9 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  {...stakeForm.register("tier")}
                >
                  {tiers.map((tier) => (
                    <option
                      key={tier.id}
                      value={tier.id}
                      className="bg-zinc-900 text-white"
                    >
                      {tier.name}
                    </option>
                  ))}
                </select>
                {stakeForm.formState.errors.tier ? (
                  <p className="text-xs text-rose-400">
                    {stakeForm.formState.errors.tier.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-heading uppercase tracking-wide text-white/50">
                  Lock duration (days)
                </label>
                <Input
                  type="number"
                  min={currentTierData?.minDays || 30}
                  {...stakeForm.register("lockDays")}
                  className="bg-zinc-900"
                />
                <p className="text-xs text-white/50">
                  Minimum: {currentTierData?.minDays || 30} days for{" "}
                  {currentTierData?.name || "selected"} tier
                </p>
                {stakeForm.formState.errors.lockDays ? (
                  <p className="text-xs text-rose-400">
                    {stakeForm.formState.errors.lockDays.message}
                  </p>
                ) : null}
              </div>
              <div className="md:col-span-3">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full rounded-xl cursor-pointer font-heading mt-5 md:mt-10"
                >
                  {isPending ? "Submitting…" : "Stake VLR"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border border-white/10 bg-zinc-900/70 text-white shadow-sm backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-lg font-heading">
              Rewards monitor
            </CardTitle>
            <CardDescription className="text-xs text-white/60">
              Live metrics from VelirionStaking.getUserStakingInfo &
              getContractStats.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 text-sm text-white/70">
            <div className="rounded-xl bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-white/50">
                You
              </p>
              <p className="text-lg font-medium">
                {summary
                  ? `${summary.totalStaked} VLR staked`
                  : isLoading
                  ? "Loading…"
                  : "--"}
              </p>
              <p className="text-xs text-white/50">
                Rewards claimed:{" "}
                {summary ? `${summary.totalRewardsClaimed} VLR` : "--"}
              </p>
            </div>
            <div className="rounded-xl bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-white/50">
                Protocol totals
              </p>
              <p className="text-sm">
                Staked: {stats ? `${stats.totalStaked} VLR` : "--"}
              </p>
              <p className="text-sm">
                Stakers: {stats ? stats.totalStakers : "--"}
              </p>
              <p className="text-sm">
                Rewards paid:{" "}
                {stats ? `${stats.totalRewardsDistributed} VLR` : "--"}
              </p>
            </div>
            <form
              onSubmit={withdrawForm.handleSubmit(handleWithdraw)}
              className="space-y-3"
            >
              <label className="text-xs uppercase tracking-wide text-white/50">
                Unstake position ID
              </label>
              <Input
                className="my-3"
                placeholder="Stake ID"
                {...withdrawForm.register("stakeId")}
              />
              <Button
                type="submit"
                className="w-full rounded-xl bg-white/10 cursor-pointer font-heading"
                disabled={isPending}
              >
                {isPending ? "Submitting…" : "Unstake"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="border border-white/10 bg-zinc-900/70 text-white shadow-sm backdrop-blur-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-heading">Your stakes</CardTitle>
                <CardDescription className="text-xs text-white/60">
                  Claim rewards or verify lock periods. Data from getStakeInfo +
                  calculateRewards.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  refetchAll();
                  toast.info("Refreshing stakes...");
                }}
                disabled={isLoading}
                className="border-white/20 h-8"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-white/70">
            {isLoading ? (
              <p className="text-center py-4">Loading positions…</p>
            ) : stakes.length === 0 ? (
              <p className="text-center py-4">No stakes yet. Create your first stake above!</p>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-white/50 mb-2">Total stakes: {stakes.length}</p>
                {stakes.map((stakeItem) => (
                  <div
                    key={stakeItem.id.toString()}
                    className="rounded-xl bg-white/5 p-4 text-xs text-white/60"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-white">
                        ID #{stakeItem.id.toString()} · Tier {stakeItem.tier}
                      </p>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-white/70">
                        {stakeItem.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      <p>Amount: {stakeItem.amount} VLR</p>
                      <p>APR: {stakeItem.apr / 100}%</p>
                      <p>Lock: {stakeItem.lockDurationDays} days</p>
                      <p>Pending rewards: {stakeItem.pendingRewards} VLR</p>
                    </div>
                    <Button
                      onClick={() => handleClaim(stakeItem.id)}
                      disabled={isPending}
                      className="mt-3 w-full rounded-xl bg-purple-600/40 cursor-pointer font-heading"
                    >
                      {isPending
                        ? "Processing…"
                        : `Claim rewards for #${stakeItem.id.toString()}`}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none bg-gradient-to-br from-purple-950/70 to-indigo-950/70 text-white shadow-sm backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-lg font-heading">
              Tester checklist
            </CardTitle>
            <CardDescription className="text-xs text-white/60">
              Track staking QA tasks highlighted in the quick-start.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-white/60">
            <p>☐ Deposit in each tier</p>
            <p>☐ Validate reward accrual</p>
            <p>☐ Test early withdrawal penalties</p>
            <p>☐ Confirm claim events update history</p>
          </CardContent>
        </Card>
      </section>
    </PageShell>
  );
}
