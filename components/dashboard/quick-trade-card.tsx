"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { usePresaleInfo } from "@/lib/hooks/usePresale";

export function QuickTradeCard() {
  const { phase } = usePresaleInfo();
  const [amount, setAmount] = useState("234");
  const price = phase?.price || "0.00";

  return (
    <Card className="border-none bg-gradient-to-br from-purple-950/70 to-indigo-900/70 text-white shadow-sm backdrop-blur-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg font-heading">
          Quick trade
          <span className="text-xs font-normal text-white/60">Sepolia</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <Tabs defaultValue="buy" className="space-y-4">
          <TabsList className="bg-white/10">
            <TabsTrigger value="buy" className="cursor-pointer">
              Buy
            </TabsTrigger>
            <TabsTrigger value="sell" className="cursor-pointer">
              Sell
            </TabsTrigger>
          </TabsList>
          <TabsContent value="buy" className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-heading uppercase tracking-wide text-white/60">
                VLR Price (USD)
              </label>
              <Input
                value={price}
                readOnly
                className="border-white/10 bg-white/10 text-white placeholder:text-white/40 cursor-not-allowed"
              />
              <p className="text-xs text-white/50">Current presale phase price</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-heading uppercase tracking-wide text-white/60">
                Amount (VLR)
              </label>
              <Input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="border-white/10 bg-white/10 text-white placeholder:text-white/40"
                placeholder="Enter VLR amount"
              />
              <input
                type="range"
                min={0}
                max={1000}
                value={Number(amount) || 0}
                onChange={(event) => setAmount(event.target.value)}
                className="w-full accent-fuchsia-400 cursor-pointer"
              />
            </div>
            <div className="rounded-xl bg-black/20 p-4">
              <div className="flex items-center justify-between text-sm text-white/70">
                <span>Total Cost</span>
                <span className="text-base font-heading font-semibold text-white">
                  ${((Number(amount) || 0) * (Number(price) || 0)).toFixed(2)}
                </span>
              </div>
            </div>
            <Button className="w-full rounded-xl bg-fuchsia-500 text-white hover:bg-fuchsia-400 cursor-pointer">
              Buy now
            </Button>
          </TabsContent>
          <TabsContent value="sell" className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-heading uppercase tracking-wide text-white/60">
                VLR Price (USD)
              </label>
              <Input
                value={price}
                readOnly
                className="border-white/10 bg-white/10 text-white placeholder:text-white/40 cursor-not-allowed"
              />
              <p className="text-xs text-white/50">Current presale phase price</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-heading uppercase tracking-wide text-white/60">
                Amount (VLR)
              </label>
              <Input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="border-white/10 bg-white/10 text-white placeholder:text-white/40"
                placeholder="Enter VLR amount to sell"
              />
              <input
                type="range"
                min={0}
                max={1000}
                value={Number(amount) || 0}
                onChange={(event) => setAmount(event.target.value)}
                className="w-full accent-fuchsia-400 cursor-pointer"
              />
            </div>
            <div className="rounded-xl bg-black/20 p-4">
              <div className="flex items-center justify-between text-sm text-white/70">
                <span>You'll Receive</span>
                <span className="text-base font-heading font-semibold text-white">
                  ${((Number(amount) || 0) * (Number(price) || 0)).toFixed(2)}
                </span>
              </div>
            </div>
            <Button className="w-full rounded-xl bg-rose-500 text-white hover:bg-rose-400 cursor-pointer">
              Sell VLR
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
