"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PageShell } from "@/components/dashboard/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useDao } from "@/lib/hooks/useDao";

const proposalSchema = z.object({
  title: z.string().min(3, "Title required"),
  description: z.string().min(10, "Description required"),
  target: z.string().optional(),
  functionName: z.string().optional(),
  value: z.string().optional(),
});

type ProposalFormValues = z.infer<typeof proposalSchema>;

export default function DaoPage() {
  const { proposals, quorumVotes, proposalThreshold, votingPower, receipts, refetchAll, propose, castVote, queue, execute, cancel, encodeCalldata, SUPPORT, isPending } = useDao();

  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      title: "Treasury allocation",
      description: "Transfer funds to staking rewards contract.",
      target: "",
      functionName: "",
      value: "0",
    },
  });

  const handleSubmit = async (values: ProposalFormValues) => {
    try {
      const targets = values.target && values.target.length > 0 ? [values.target] : [];
      const valuesWei = targets.length ? [values.value || "0"] : [];
      const calldatas =
        targets.length && values.functionName
          ? [encodeCalldata({ functionName: values.functionName, args: [] })]
          : [];
      await propose(targets, valuesWei, calldatas, `${values.title}\n${values.description}`);
      toast.success("Proposal submitted");
      form.reset();
      refetchAll();
    } catch (error) {
      console.error(error);
      toast.error("Proposal failed");
    }
  };

  const handleVote = async (proposalId: bigint, support: number) => {
    try {
      // For burn-to-vote, use a default amount; UI enhancement needed for user input
      const voteAmount = "100"; // Default 100 VLR to burn
      await castVote(proposalId, support, voteAmount);
      toast.success("Vote submitted");
      refetchAll();
    } catch (error) {
      console.error(error);
      toast.error("Vote failed");
    }
  };

  const actionHandler = async (
    action: (proposalId: bigint) => Promise<void>,
    proposalId: bigint,
    success: string,
    failure: string,
  ) => {
    try {
      await action(proposalId);
      toast.success(success);
      refetchAll();
    } catch (error) {
      console.error(error);
      toast.error(failure);
    }
  };

  return (
    <PageShell title="DAO governance" subtitle="Coordinate Velirion proposals">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="border-none bg-gradient-to-br from-purple-950/60 via-indigo-950/60 to-zinc-1000/40 text-white shadow-xl shadow-purple-900/30">
          <CardHeader>
            <CardTitle className="text-lg">Create proposal</CardTitle>
            <CardDescription className="text-xs text-white/60">
              Draft governance action and call VelirionDAO.propose.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid gap-2">
                <label className="text-xs uppercase tracking-wide text-white/50">Title</label>
                <Input placeholder="Treasury proposal" {...form.register("title")} />
                {form.formState.errors.title ? (
                  <p className="text-xs text-rose-400">{form.formState.errors.title.message}</p>
                ) : null}
              </div>
              <div className="grid gap-2">
                <label className="text-xs uppercase tracking-wide text-white/50">Description</label>
                <Textarea rows={4} placeholder="Proposal rationale" {...form.register("description")} />
                {form.formState.errors.description ? (
                  <p className="text-xs text-rose-400">{form.formState.errors.description.message}</p>
                ) : null}
              </div>
              <div className="grid gap-2">
                <label className="text-xs uppercase tracking-wide text-white/50">Target contract (optional)</label>
                <Input placeholder="0x..." {...form.register("target")} />
              </div>
              <div className="grid gap-2">
                <label className="text-xs uppercase tracking-wide text-white/50">Function name (optional)</label>
                <Input placeholder="stake(uint256)" {...form.register("functionName")} />
              </div>
              <div className="grid gap-2">
                <label className="text-xs uppercase tracking-wide text-white/50">ETH value (wei)</label>
                <Input placeholder="0" {...form.register("value")} />
              </div>
              <Button type="submit" className="w-full rounded-xl" disabled={isPending}>
                {isPending ? "Submitting…" : "Submit proposal"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-none bg-zinc-950/60 text-white shadow-xl shadow-black/40">
          <CardHeader>
            <CardTitle className="text-lg">DAO metrics</CardTitle>
            <CardDescription className="text-xs text-white/60">
              Quorum + thresholds from on-chain getters.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-white/70">
            <div className="flex items-center justify-between">
              <span>Quorum votes</span>
              <span>{quorumVotes ?? "--"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Proposal threshold</span>
              <span>{proposalThreshold ?? "--"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Your voting power</span>
              <span>{votingPower ?? "--"}</span>
            </div>
            <p className="rounded-xl bg-white/5 p-4 text-xs text-white/60">
              Proposals count: {proposals.length}
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="border-none bg-zinc-950/60 text-white shadow-xl shadow-black/40">
          <CardHeader>
            <CardTitle className="text-lg">Proposals</CardTitle>
            <CardDescription className="text-xs text-white/60">
              Vote, queue, or execute using VelirionDAO hooks.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-white/70">
            {proposals.length === 0 ? (
              <p>No proposals yet.</p>
            ) : (
              <div className="space-y-3">
                {proposals.map((proposal, index) => (
                  <div key={proposal.id.toString()} className="rounded-xl bg-white/5 p-4 text-xs text-white/60">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-white">
                        #{proposal.id.toString()} · {proposal.state}
                      </p>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-white/80">
                        For: {proposal.forVotes}
                      </span>
                    </div>
                    <p className="mt-2 text-white/80">{proposal.description}</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      <Button
                        variant="outline"
                        className="rounded-xl border-white/20 text-white"
                        onClick={() => handleVote(proposal.id, SUPPORT.FOR)}
                        disabled={isPending}
                      >
                        {isPending ? "Voting…" : "Vote For"}
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-xl border-white/20 text-white"
                        onClick={() => handleVote(proposal.id, SUPPORT.AGAINST)}
                        disabled={isPending}
                      >
                        {isPending ? "Voting…" : "Vote Against"}
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-xl border-white/20 text-white"
                        onClick={() => handleVote(proposal.id, SUPPORT.ABSTAIN)}
                        disabled={isPending}
                      >
                        {isPending ? "Voting…" : "Abstain"}
                      </Button>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      <Button
                        className="rounded-xl bg-white/10"
                        onClick={() => actionHandler(queue, proposal.id, "Queued proposal", "Queue failed")}
                        disabled={isPending}
                      >
                        Queue
                      </Button>
                      <Button
                        className="rounded-xl bg-white/10"
                        onClick={() => actionHandler(execute, proposal.id, "Executed proposal", "Execute failed")}
                        disabled={isPending}
                      >
                        Execute
                      </Button>
                      <Button
                        className="rounded-xl bg-rose-500/20 text-rose-200"
                        onClick={() => actionHandler(cancel, proposal.id, "Canceled proposal", "Cancel failed")}
                        disabled={isPending}
                      >
                        Cancel
                      </Button>
                    </div>
                    {receipts[index]?.hasVoted ? (
                      <p className="mt-2 text-xs text-emerald-300">
                        You voted ({receipts[index].votes} votes)
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none bg-gradient-to-br from-indigo-950/40 to-purple-950/40 text-white shadow-xl shadow-purple-900/40">
          <CardHeader>
            <CardTitle className="text-lg">Governance checklist</CardTitle>
            <CardDescription className="text-xs text-white/60">
              Track Day 3 testing tasks from quick-start.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-white/60">
            <p>☐ Create proposal with VelirionDAO</p>
            <p>☐ Cast vote (For/Against/Abstain)</p>
            <p>☐ Queue proposal after passing</p>
            <p>☐ Execute and verify state changes</p>
          </CardContent>
        </Card>
      </section>
    </PageShell>
  );
}
