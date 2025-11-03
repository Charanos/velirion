"use client";

import dynamic from "next/dynamic";

const DynamicWalletButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (module) => module.WalletMultiButton
    ),
  { ssr: false }
);

export function SolanaWalletButton() {
  return (
    <div className="w-full sm:w-auto">
      <DynamicWalletButton />
    </div>
  );
}
