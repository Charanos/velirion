"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Dummy monthly volume data (simulating VLR token volume)
const monthlyVolumeData = [
  { month: "Jun", volume: 125000 },
  { month: "Jul", volume: 145000 },
  { month: "Aug", volume: 168000 },
  { month: "Sep", volume: 189000 },
  { month: "Oct", volume: 212000 },
  { month: "Nov", volume: 245000 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg bg-zinc-900/95 border border-white/20 p-3 shadow-xl backdrop-blur-lg">
        <p className="text-sm text-white/90 font-medium">{label} 2025</p>
        <p className="text-sm text-fuchsia-400">
          Volume: <span className="font-bold">{payload[0].value.toLocaleString()} VLR</span>
        </p>
      </div>
    );
  }
  return null;
};

export function MonthlyVolumeChart() {
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Small delay to ensure container dimensions are calculated
    const timer = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted || !ready) {
    return (
      <Card className="border-none bg-gradient-to-br from-zinc-900/70 via-indigo-950/70 to-purple-950/70 text-white shadow-sm backdrop-blur-lg">
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-heading">Monthly volume</CardTitle>
            <p className="text-xs text-white/60">Token trading volume</p>
          </div>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
            Sepolia
          </span>
        </CardHeader>
        <CardContent className="h-64 w-full">
          <div className="flex h-full w-full min-h-[200px] items-center justify-center">
            <div className="text-sm text-white/50">Loading chart...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none bg-gradient-to-br from-zinc-900/70 via-indigo-950/70 to-purple-950/70 text-white shadow-sm backdrop-blur-lg">
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle className="text-lg font-heading">Monthly volume</CardTitle>
          <p className="text-xs text-white/60">Token trading volume</p>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
          Sepolia
        </span>
      </CardHeader>
      <CardContent className="h-64 w-full">
        <div className="h-full w-full min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={200} aspect={undefined}>
            <LineChart
              data={monthlyVolumeData}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 5,
              }}
            >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.1)"
              strokeOpacity={0.3}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
              dx={-10}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="volume"
              stroke="#e879f9"
              strokeWidth={3}
              dot={{
                fill: "#e879f9",
                strokeWidth: 2,
                stroke: "#ffffff",
                r: 4
              }}
              activeDot={{
                r: 6,
                fill: "#f0abfc",
                stroke: "#ffffff",
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
