'use client';

import dynamic from 'next/dynamic';

const DynamicWalletButton = dynamic(
  () =>
    import('@solana/wallet-adapter-react-ui').then(
      (module) => module.WalletMultiButton,
    ),
  { ssr: false },
);

export function SolanaWalletButton() {
  return (
    <DynamicWalletButton className="wallet-adapter-button bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 !rounded-xl !px-5 !py-2 text-sm font-semibold shadow-lg shadow-purple-900/40 hover:shadow-purple-700/50" />
  );
}
