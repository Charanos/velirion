import mongoose, { Schema, Model } from 'mongoose';

export interface ITransaction {
  hash: string;
  type: 'transfer' | 'burn' | 'stake' | 'unstake' | 'claim' | 'presale' | 'dao_vote' | 'dao_propose';
  amount: string;
  to?: string;
  from?: string;
  walletAddress: string; // User's wallet address for querying
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  chainId?: number;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    hash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['transfer', 'burn', 'stake', 'unstake', 'claim', 'presale', 'dao_vote', 'dao_propose'],
      index: true,
    },
    amount: {
      type: String,
      required: true,
    },
    to: {
      type: String,
      default: null,
    },
    from: {
      type: String,
      default: null,
    },
    walletAddress: {
      type: String,
      required: true,
      index: true,
    },
    timestamp: {
      type: Number,
      required: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'confirmed', 'failed'],
      default: 'pending',
      index: true,
    },
    blockNumber: {
      type: Number,
      default: null,
    },
    chainId: {
      type: Number,
      default: 11155111, // Sepolia
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
TransactionSchema.index({ walletAddress: 1, timestamp: -1 });
TransactionSchema.index({ walletAddress: 1, status: 1, timestamp: -1 });

const Transaction: Model<ITransaction> =
  mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;
