"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ChevronDown, User } from "lucide-react";
import { SolanaWalletButton } from "@/components/wallet/solana-wallet-button";

export function WalletButton() {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-zinc-900/70 p-2 shadow-xl shadow-purple-900/40 backdrop-blur">
      <ConnectButton.Custom>
        {({
          account,
          chain,
          mounted,
          openAccountModal,
          openChainModal,
          openConnectModal,
        }) => {
          const ready = mounted;
          const connected = ready && account && chain;

          if (!ready) {
            return (
              <div className="h-10 w-36 animate-pulse rounded-xl bg-zinc-800/60" />
            );
          }

          if (!connected) {
            return (
              <button
                type="button"
                onClick={openConnectModal}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-900/50 transition hover:shadow-purple-700/60 focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                Connect Wallet
              </button>
            );
          }

          return (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={openChainModal}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-purple-400/40 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                {chain?.hasIcon && chain?.iconUrl && (
                  <span
                    className="flex size-4 items-center justify-center overflow-hidden rounded-full"
                    style={{ background: chain.iconBackground }}
                  >
                    <img
                      alt={chain.name ?? "Chain icon"}
                      src={chain.iconUrl}
                      className="size-full"
                    />
                  </span>
                )}
                {chain?.name ?? "Network"}
                <ChevronDown className="size-4 text-purple-200" />
              </button>
              <button
                type="button"
                onClick={openAccountModal}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-fuchsia-900/40 transition hover:shadow-fuchsia-700/60 focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
              >
                <User className="size-4" />
                {account?.displayName}
              </button>
            </div>
          );
        }}
      </ConnectButton.Custom>
      <SolanaWalletButton />
    </div>
  );
}
