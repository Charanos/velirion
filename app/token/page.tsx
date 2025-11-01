import { PageShell } from "@/components/dashboard/page-shell";
import { TokenSummaryCards } from "@/components/token/token-summary-cards";
import { TransferForm } from "@/components/token/transfer-form";
import { BurnForm } from "@/components/token/burn-form";
import { TransactionHistoryCard } from "@/components/token/transaction-history-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TokenPage() {
  return (
    <PageShell title="Token operations" subtitle="Manage VLR on Sepolia">
      <TokenSummaryCards />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="border-none bg-gradient-to-br from-zinc-1000/50 via-purple-950/50 to-indigo-950/50 text-white shadow-xl shadow-purple-900/40">
          <CardHeader>
            <CardTitle className="text-lg">Token actions</CardTitle>
            <p className="text-xs text-white/60">
              Transfer or burn VLR via the VelirionToken contract. Transactions route through wagmi + viem.
            </p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="transfer" className="space-y-4">
              <TabsList className="bg-white/10">
                <TabsTrigger value="transfer">Transfer</TabsTrigger>
                <TabsTrigger value="burn">Burn</TabsTrigger>
              </TabsList>
              <TabsContent value="transfer">
                <TransferForm />
              </TabsContent>
              <TabsContent value="burn">
                <BurnForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <TransactionHistoryCard />
      </section>
    </PageShell>
  );
}
