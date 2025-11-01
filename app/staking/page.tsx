"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PageShell } from "@/components/dashboard/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  { id: 0, name: "Flexible", apr: "6% APR", lock: "30 day minimum" },
  { id: 1, name: "Medium", apr: "12-15% APR", lock: "60-120 days" },
  { id: 2, name: "Long", apr: "20-22% APR", lock: "180+ days" },
  { id: 3, name: "Elite", apr: "30-32% APR", lock: "360+ days" },
];

export default function StakingPage() {
  const { summary, stats, stakes, isLoading, refetchAll, stake, claim, unstake, isPending } = useStaking();

  const stakeForm = useForm<StakeFormValues>({
    resolver: zodResolver(stakeSchema),
    defaultValues: { amount: "", tier: "0", lockDays: "30" },
  });

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
      toast.success("Stake transaction submitted");
      stakeForm.reset();
      refetchAll();
    } catch (error) {
      console.error(error);
      toast.error("Failed to stake");
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
        <Card className="border-none bg-gradient-to-br from-indigo-950/60 via-purple-950/60 to-zinc-1000/50 text-white shadow-xl shadow-purple-900/30">
          <CardHeader>
            <CardTitle className="text-lg">Stake VLR</CardTitle>
            <CardDescription className="text-xs text-white/60">
              VelirionStaking.stake(amount, tier, lockSeconds) with automatic VLR approvals.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {tiers.map((tier) => (
                <Card key={tier.id} className="border border-white/10 bg-white/5 p-4 text-white">
                  <p className="text-sm font-semibold">{tier.name}</p>
                  <p className="text-xs text-white/60">{tier.apr}</p>
                  <p className="text-xs text-white/50">{tier.lock}</p>
                </Card>
              ))}
            </div>

            <form onSubmit={stakeForm.handleSubmit(handleStake)} className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-white/50">Amount (VLR)</label>
                <Input placeholder="500" {...stakeForm.register("amount")} />
                {stakeForm.formState.errors.amount ? (
                  <p className="text-xs text-rose-400">{stakeForm.formState.errors.amount.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-white/50">Tier</label>
                <select
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
                  {...stakeForm.register("tier")}
                >
                  {tiers.map((tier) => (
                    <option key={tier.id} value={tier.id} className="bg-zinc-900 text-white">
                      {tier.name}
                    </option>
                  ))}
                </select>
                {stakeForm.formState.errors.tier ? (
                  <p className="text-xs text-rose-400">{stakeForm.formState.errors.tier.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-white/50">Lock duration (days)</label>
                <Input type="number" min={30} {...stakeForm.register("lockDays")} />
                {stakeForm.formState.errors.lockDays ? (
                  <p className="text-xs text-rose-400">{stakeForm.formState.errors.lockDays.message}</p>
                ) : null}
              </div>
              <div className="md:col-span-3">
                <Button type="submit" disabled={isPending} className="w-full rounded-xl">
                  {isPending ? "Submitting…" : "Stake VLR"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border-none bg-zinc-950/60 text-white shadow-xl shadow-black/40">
          <CardHeader>
            <CardTitle className="text-lg">Rewards monitor</CardTitle>
            <CardDescription className="text-xs text-white/60">
              Live metrics from VelirionStaking.getUserStakingInfo & getContractStats.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-white/70">
            <div className="rounded-xl bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-white/50">You</p>
              <p className="text-lg font-semibold">
                {summary ? `${summary.totalStaked} VLR staked` : isLoading ? "Loading…" : "--"}
              </p>
              <p className="text-xs text-white/50">
                Rewards claimed: {summary ? `${summary.totalRewardsClaimed} VLR` : "--"}
              </p>
            </div>
            <div className="rounded-xl bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-white/50">Protocol totals</p>
              <p className="text-sm">Staked: {stats ? `${stats.totalStaked} VLR` : "--"}</p>
              <p className="text-sm">Stakers: {stats ? stats.totalStakers : "--"}</p>
              <p className="text-sm">Rewards paid: {stats ? `${stats.totalRewardsDistributed} VLR` : "--"}</p>
            </div>
            <form onSubmit={withdrawForm.handleSubmit(handleWithdraw)} className="space-y-3">
              <label className="text-xs uppercase tracking-wide text-white/50">Unstake position ID</label>
              <Input placeholder="Stake ID" {...withdrawForm.register("stakeId")} />
              <Button type="submit" className="w-full rounded-xl bg-white/10" disabled={isPending}>
                {isPending ? "Submitting…" : "Unstake"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="border-none bg-zinc-950/60 text-white shadow-xl shadow-black/40">
          <CardHeader>
            <CardTitle className="text-lg">Your stakes</CardTitle>
            <CardDescription className="text-xs text-white/60">
              Claim rewards or verify lock periods. Data from getStakeInfo + calculateRewards.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-white/70">
            {stakes.length === 0 ? (
              <p>{isLoading ? "Loading positions…" : "No stakes yet."}</p>
            ) : (
              <div className="space-y-3">
                {stakes.map((stakeItem) => (
                  <div
                    key={stakeItem.id.toString()}
                    className="rounded-xl bg-white/5 p-4 text-xs text-white/60"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-white">
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
                      className="mt-3 w-full rounded-xl bg-purple-600/40"
                    >
                      {isPending ? "Processing…" : `Claim rewards for #${stakeItem.id.toString()}`}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none bg-gradient-to-br from-purple-950/40 to-indigo-950/40 text-white shadow-xl shadow-purple-900/40">
          <CardHeader>
            <CardTitle className="text-lg">Tester checklist</CardTitle>
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
