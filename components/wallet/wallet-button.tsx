"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ChevronDown, User } from "lucide-react";
import { SolanaWalletButton } from "@/components/wallet/solana-wallet-button";

export function WalletButton() {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-zinc-900/70 backdrop-blur-lg p-2 shadow-sm w-full sm:w-auto">
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
              <div className="h-10 w-36 animate-pulse rounded-xl bg-white/10" />
            );
          }

          if (!connected) {
            return (
              <button
                type="button"
                onClick={openConnectModal}
                className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-fuchsia-500 via-purple-500 to-pink-500 backdrop-blur-lg px-5 py-2.5 text-sm font-heading font-semibold text-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                Connect ETH Wallet
              </button>
            );
          }

          return (
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={openChainModal}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/70 backdrop-blur-lg px-4 py-2.5 text-sm font-heading text-white/80 transition hover:border-purple-400/40 hover:text-white cursor-pointer flex-1 sm:flex-initial"
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
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500 via-purple-500 to-pink-500 backdrop-blur-lg px-4 py-2.5 text-sm font-heading font-semibold text-white shadow-sm hover:shadow-md transition-shadow cursor-pointer flex-1 sm:flex-initial"
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
