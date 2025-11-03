import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function OverviewChartPlaceholder() {
  return (
    <Card className="border-none bg-gradient-to-br from-zinc-900/70 via-indigo-950/70 to-purple-950/70 text-white shadow-sm backdrop-blur-lg">
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle className="text-lg font-heading">Monthly volume</CardTitle>
          <p className="text-xs text-white/60">Chart coming soon</p>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
          Sepolia
        </span>
      </CardHeader>
      <CardContent className="h-64">
        <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/5 text-sm text-white/50">
          Integrate @velirion charts
        </div>
      </CardContent>
    </Card>
  );
}
