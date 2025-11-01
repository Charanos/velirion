import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const transactions = [
  { asset: "VEL", type: "Transfer", amount: "2,000", time: "10:12 AM", change: "+0.8%" },
  { asset: "VEL", type: "Stake", amount: "1,200", time: "09:40 AM", change: "+1.2%" },
  { asset: "ETH", type: "Presale", amount: "0.45", time: "08:55 AM", change: "-0.2%" },
];

export function LatestTransactions() {
  return (
    <Card className="border-none bg-zinc-950/60 text-white shadow-2xl shadow-black/40">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Latest transactions</CardTitle>
        <button className="text-sm text-fuchsia-300 hover:text-fuchsia-200">
          See all
        </button>
      </CardHeader>
      <CardContent className="space-y-4">
        {transactions.map((tx, index) => (
          <div
            key={tx.time}
            className="flex items-center justify-between rounded-xl bg-white/5 p-4"
          >
            <div>
              <p className="text-sm font-semibold">{tx.asset}</p>
              <p className="text-xs text-white/60">{tx.type}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">{tx.amount}</p>
              <p className={"text-xs text-emerald-300"}>{tx.change}</p>
            </div>
            <span className="text-xs text-white/60">{tx.time}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
