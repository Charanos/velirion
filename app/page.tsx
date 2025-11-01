import { PageShell } from "@/components/dashboard/page-shell";
import { QuickTradeCard } from "@/components/dashboard/quick-trade-card";
import { StatCardsRow } from "@/components/dashboard/stat-cards-row";
import { OverviewChartPlaceholder } from "@/components/dashboard/overview-chart-placeholder";
import { LatestTransactions } from "@/components/dashboard/latest-transactions";
import { WalletSummary } from "@/components/dashboard/wallet-summary";

export default function Home() {
  return (
    <PageShell title="Dashboard" subtitle="Velirion testing overview">
      <StatCardsRow />

      <WalletSummary />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <OverviewChartPlaceholder />
        <QuickTradeCard />
      </section>

      <LatestTransactions />
    </PageShell>
  );
}
