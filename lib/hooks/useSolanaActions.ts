'use client';

import { useState, useMemo } from 'react';
import { Transaction, PublicKey, TransactionInstruction } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
} from '@solana/spl-token';

const TOKEN_DECIMALS = 9;
const LAMPORTS_PER_SOL = 1_000_000_000n;

type HistoryEntry = {
  signature: string;
  type: 'transfer' | 'airdrop';
  amount: string;
  timestamp: number;
};

type UseSolanaActionsOptions = {
  onSettled?: () => void;
};

type AtaEnsureResult = {
  address: PublicKey;
  instruction: TransactionInstruction | null;
};

function parseAmount(amount: string, decimals: number): bigint {
  const sanitized = amount.trim();
  if (!sanitized || Number.isNaN(Number(sanitized))) {
    throw new Error('Enter a valid amount');
  }
  if (Number(sanitized) <= 0) {
    throw new Error('Amount must be greater than zero');
  }

  const [integer, fraction = ''] = sanitized.split('.');
  const normalizedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);

  const base = 10n ** BigInt(decimals);
  const wholePart = BigInt(integer || '0') * base;
  const fractionalPart = BigInt(normalizedFraction || '0');

  return wholePart + fractionalPart;
}

function shorten(signature: string) {
  return `${signature.slice(0, 6)}…${signature.slice(-6)}`;
}

export function useSolanaActions(options?: UseSolanaActionsOptions) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const mintPublicKey = useMemo(() => {
    const mint = process.env.NEXT_PUBLIC_SOLANA_MINT;
    if (!mint) return null;
    try {
      return new PublicKey(mint);
    } catch (err) {
      console.error('Invalid Solana mint address', err);
      return null;
    }
  }, []);

  function pushHistory(entry: HistoryEntry) {
    setHistory((prev) => [entry, ...prev].slice(0, 8));
  }

  async function ensureAta(
    owner: PublicKey,
    mint: PublicKey,
    payer: PublicKey,
  ): Promise<AtaEnsureResult> {
    const ata = await getAssociatedTokenAddress(mint, owner);
    const accountInfo = await connection.getAccountInfo(ata);
    if (!accountInfo) {
      return {
        address: ata,
        instruction: createAssociatedTokenAccountInstruction(payer, ata, owner, mint),
      };
    }
    return { address: ata, instruction: null };
  }

  async function transferSpl({ recipient, amount }: { recipient: string; amount: string }) {
    if (!connected || !publicKey) throw new Error('Connect your Solana wallet first');
    if (!sendTransaction) throw new Error('Wallet adapter missing sendTransaction');
    if (!mintPublicKey) throw new Error('Solana mint address missing');

    let recipientKey: PublicKey;
    try {
      recipientKey = new PublicKey(recipient);
    } catch (err) {
      throw new Error('Recipient address is invalid');
    }

    const tokenAmount = parseAmount(amount, TOKEN_DECIMALS);

    setIsProcessing(true);
    setError(null);

    try {
      const payer = publicKey;
      const instructions = [];

      const senderAtaResult = await ensureAta(publicKey, mintPublicKey, payer);
      const recipientAtaResult = await ensureAta(recipientKey, mintPublicKey, payer);

      if (senderAtaResult.instruction) {
        instructions.push(senderAtaResult.instruction);
      }
      if (recipientAtaResult.instruction) {
        instructions.push(recipientAtaResult.instruction);
      }

      instructions.push(
        createTransferInstruction(
          senderAtaResult.address,
          recipientAtaResult.address,
          publicKey,
          tokenAmount,
        ),
      );

      const transaction = new Transaction().add(...instructions);
      transaction.feePayer = payer;

      const signature = await sendTransaction(transaction, connection, { skipPreflight: false });
      await connection.confirmTransaction(signature, 'confirmed');

      pushHistory({ signature, type: 'transfer', amount, timestamp: Date.now() });
      options?.onSettled?.();
      return signature;
    } catch (err) {
      const fallbackMessage = err instanceof Error ? err.message : 'Transfer failed';
      setError(fallbackMessage);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }

  async function requestAirdrop({ amount }: { amount: string }) {
    if (!connected || !publicKey) throw new Error('Connect your Solana wallet first');

    const lamports = parseAmount(amount, 9);
    if (lamports > BigInt(Number.MAX_SAFE_INTEGER)) {
      throw new Error('Requested airdrop amount is too large');
    }

    setIsProcessing(true);
    setError(null);

    try {
      const signature = await connection.requestAirdrop(publicKey, Number(lamports));
      await connection.confirmTransaction(signature, 'confirmed');
      pushHistory({ signature, type: 'airdrop', amount, timestamp: Date.now() });
      options?.onSettled?.();
      return signature;
    } catch (err) {
      const fallbackMessage = err instanceof Error ? err.message : 'Airdrop failed';
      setError(fallbackMessage);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }

  return {
    transferSpl,
    requestAirdrop,
    isProcessing,
    error,
    clearError: () => setError(null),
    history: history.map((entry) => ({
      ...entry,
      signatureShort: shorten(entry.signature),
    })),
  };
}
