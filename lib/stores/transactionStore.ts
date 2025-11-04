'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TransactionType = 'transfer' | 'burn' | 'stake' | 'unstake' | 'claim' | 'presale' | 'dao_vote' | 'dao_propose';

export type Transaction = {
  id: string;
  hash: string;
  type: TransactionType;
  amount: string;
  to?: string;
  from?: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
};

type TransactionStore = {
  transactions: Transaction[];
  walletAddress: string | null;
  isLoading: boolean;
  setWalletAddress: (address: string | null) => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'timestamp' | 'status'>) => Promise<void>;
  updateTransaction: (hash: string, updates: Partial<Transaction>) => Promise<void>;
  getRecentTransactions: (limit?: number) => Transaction[];
  fetchTransactions: (walletAddress: string) => Promise<void>;
  clearTransactions: () => void;
};

// API helper functions
async function saveTransactionToDB(tx: Transaction, walletAddress: string) {
  try {
    const response = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...tx, walletAddress }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to save transaction to DB:', error);
    } else {
      const result = await response.json();
      console.log('✅ Transaction saved to DB:', tx.hash.slice(0, 10));
    }
  } catch (error) {
    console.error('Error saving transaction to DB:', error);
  }
}

async function updateTransactionInDB(hash: string, updates: Partial<Transaction> & { walletAddress?: string | null }) {
  try {
    const response = await fetch('/api/transactions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hash, ...updates }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to update transaction in DB:', error);
    } else {
      const result = await response.json();
      console.log('✅ Transaction updated in DB:', hash.slice(0, 10), updates.status);
    }
  } catch (error) {
    console.error('Error updating transaction in DB:', error);
  }
}

async function fetchTransactionsFromDB(walletAddress: string): Promise<Transaction[]> {
  try {
    const response = await fetch(`/api/transactions?walletAddress=${walletAddress}&limit=100`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.transactions.map((tx: any) => ({
      id: tx._id,
      hash: tx.hash,
      type: tx.type,
      amount: tx.amount,
      to: tx.to,
      from: tx.from,
      timestamp: tx.timestamp,
      status: tx.status,
      blockNumber: tx.blockNumber,
    }));
  } catch (error) {
    console.error('Error fetching transactions from DB:', error);
    return [];
  }
}

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set, get) => ({
      transactions: [],
      walletAddress: null,
      isLoading: false,

      setWalletAddress: (address) => {
        set({ walletAddress: address });
        if (address) {
          get().fetchTransactions(address);
        }
      },

      addTransaction: async (tx) => {
        const newTx: Transaction = {
          ...tx,
          id: `${tx.hash}-${Date.now()}`,
          timestamp: Date.now(),
          status: 'pending',
        };

        // Update local state immediately
        set((state) => ({
          transactions: [newTx, ...state.transactions].slice(0, 100),
        }));

        // Sync to MongoDB in background
        const walletAddress = get().walletAddress;
        if (walletAddress) {
          await saveTransactionToDB(newTx, walletAddress);
        }
      },

      updateTransaction: async (hash, updates) => {
        // Get the full transaction for upsert support
        const existingTx = get().transactions.find(tx => tx.hash === hash);
        
        // Update local state immediately
        set((state) => ({
          transactions: state.transactions.map((tx) =>
            tx.hash === hash ? { ...tx, ...updates } : tx
          ),
        }));

        // Sync to MongoDB in background with full transaction data for upsert
        if (existingTx) {
          const fullUpdate = {
            ...updates,
            type: existingTx.type,
            amount: existingTx.amount,
            to: existingTx.to,
            from: existingTx.from,
            walletAddress: get().walletAddress,
            timestamp: existingTx.timestamp,
          };
          await updateTransactionInDB(hash, fullUpdate);
        } else {
          await updateTransactionInDB(hash, updates);
        }
      },

      fetchTransactions: async (walletAddress) => {
        set({ isLoading: true });
        try {
          const transactions = await fetchTransactionsFromDB(walletAddress);
          set({ transactions, isLoading: false });
        } catch (error) {
          console.error('Failed to fetch transactions:', error);
          set({ isLoading: false });
        }
      },

      getRecentTransactions: (limit = 10) => {
        return get()
          .transactions.filter((tx) => tx.status === 'confirmed')
          .slice(0, limit);
      },

      clearTransactions: () => {
        set({ transactions: [] });
      },
    }),
    {
      name: 'velirion-transactions',
      partialize: (state) => ({
        transactions: state.transactions.filter(
          (tx) => Date.now() - tx.timestamp < 7 * 24 * 60 * 60 * 1000
        ),
        walletAddress: state.walletAddress,
      }),
    }
  )
);
