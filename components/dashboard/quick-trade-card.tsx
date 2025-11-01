"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

export function QuickTradeCard() {
  const [amount, setAmount] = useState("234");
  const [price, setPrice] = useState("23,126.71");

  return (
    <Card className="border-none bg-gradient-to-br from-purple-950/90 to-indigo-900/80 text-white shadow-2xl shadow-indigo-900/40">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          Quick trade
          <span className="text-xs font-normal text-white/60">Sepolia</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <Tabs defaultValue="buy" className="space-y-4">
          <TabsList className="bg-white/10">
            <TabsTrigger value="buy">Buy</TabsTrigger>
            <TabsTrigger value="sell">Sell</TabsTrigger>
          </TabsList>
          <TabsContent value="buy" className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-white/60">
                Limit price
              </label>
              <Input
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                className="border-white/10 bg-white/10 text-white placeholder:text-white/40"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-white/60">
                Amount (VLR)
              </label>
              <Input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="border-white/10 bg-white/10 text-white placeholder:text-white/40"
              />
              <input
                type="range"
                min={0}
                max={1000}
                value={Number(amount)}
                onChange={(event) => setAmount(event.target.value)}
                className="w-full accent-fuchsia-400"
              />
            </div>
            <div className="rounded-xl bg-black/20 p-4">
              <div className="flex items-center justify-between text-sm text-white/70">
                <span>Total</span>
                <span className="text-base font-semibold text-white">$12,342.45</span>
              </div>
            </div>
            <Button className="w-full rounded-xl bg-fuchsia-500 text-white hover:bg-fuchsia-400">
              Buy now
            </Button>
          </TabsContent>
          <TabsContent value="sell" className="space-y-4">
            <p className="text-sm text-white/70">
              Selling will route through the Velirion escrow contract. Configure
              the form once buy flow is confirmed.
            </p>
            <Button
              variant="outline"
              className="w-full rounded-xl border-white/20 bg-transparent text-white hover:bg-white/10"
            >
              Prepare sell form
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
