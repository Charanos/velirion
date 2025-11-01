import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const mockHistory = [
  {
    action: 'Transfer',
    to: '0x4A…92f1',
    amount: '1,200 VLR',
    hash: '0x8c9d…c7af',
    time: '2 mins ago',
  },
  {
    action: 'Burn',
    to: '--',
    amount: '250 VLR',
    hash: '0x6a1b…239d',
    time: '8 mins ago',
  },
  {
    action: 'Transfer',
    to: '0x1c…dEf0',
    amount: '540 VLR',
    hash: '0xfb45…9aa1',
    time: 'Yesterday',
  },
];

export function TransactionHistoryCard() {
  return (
    <Card className="border-none bg-zinc-950/60 text-white shadow-xl shadow-black/40">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">Recent activity</CardTitle>
          <p className="text-xs text-white/60">Hook up subgraphs or Etherscan API next</p>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">Test data</span>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockHistory.map((row) => (
          <div
            key={row.hash}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/5 p-4"
          >
            <div>
              <p className="text-sm font-semibold">{row.action}</p>
              <p className="text-xs text-white/60">To {row.to}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">{row.amount}</p>
              <p className="text-xs text-white/50">{row.time}</p>
            </div>
            <span className="text-xs text-white/40">{row.hash}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
