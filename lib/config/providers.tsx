'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { config } from './wagmi';
import { SolanaProviders } from './solana-providers';
import { toast } from 'sonner';
import { useEffect } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (error) => {
        handleWalletError(error as Error);
      },
    },
  },
});

/**
 * Handles wallet connection errors with user-friendly messages
 */
function handleWalletError(error: Error) {
  const errorMessage = error.message.toLowerCase();
  
  if (errorMessage.includes('extension not found') || errorMessage.includes('not installed')) {
    toast.error('Wallet Extension Not Found', {
      description: 'Please install MetaMask or another Web3 wallet extension.',
    });
  } else if (errorMessage.includes('user rejected') || errorMessage.includes('user denied')) {
    toast.info('Connection Cancelled', {
      description: 'You cancelled the wallet connection request.',
    });
  } else if (errorMessage.includes('chain') || errorMessage.includes('network')) {
    toast.warning('Wrong Network', {
      description: 'Please switch to Sepolia testnet in your wallet.',
    });
  } else if (errorMessage.includes('timeout')) {
    toast.error('Connection Timeout', {
      description: 'Wallet connection timed out. Please try again.',
    });
  } else {
    console.error('Wallet error:', error);
    toast.error('Wallet Connection Failed', {
      description: 'Please try again or check your wallet extension.',
    });
  }
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Add global error handler for uncaught wallet errors
    const handleError = (event: ErrorEvent) => {
      if (event.error && event.error.message) {
        const msg = event.error.message.toLowerCase();
        if (msg.includes('metamask') || msg.includes('wallet') || msg.includes('web3')) {
          event.preventDefault();
          handleWalletError(event.error);
        }
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <SolanaProviders>{children}</SolanaProviders>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
