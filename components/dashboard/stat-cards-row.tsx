import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  { label: "Token Balance", value: "32,450 VLR", change: "+4.2%" },
  { label: "Staked", value: "12,300 VLR", change: "+2.1%" },
  { label: "DAO Voting Power", value: "8,540 VP", change: "+1.4%" },
  { label: "Solana SPL Balance", value: "4,200 SPL", change: "+3.9%" },
];

export function StatCardsRow() {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="border-none bg-gradient-to-br from-violet-950/60 via-violet-900/60 to-fuchsia-900/40 text-white shadow-lg shadow-violet-500/30"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white/70">{stat.label}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-2xl font-semibold">{stat.value}</p>
            <p className="text-xs text-emerald-300">{stat.change} vs last 24h</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
