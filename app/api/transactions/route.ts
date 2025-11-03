import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Transaction from '@/lib/db/models/Transaction';

// GET - Fetch transactions for a wallet
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'walletAddress is required' },
        { status: 400 }
      );
    }

    const query: any = {
      walletAddress: walletAddress.toLowerCase(),
    };

    if (status) {
      query.status = status;
    }

    const transactions = await Transaction.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      transactions,
      count: transactions.length,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

// POST - Create a new transaction
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { hash, type, amount, to, from, walletAddress, timestamp, status, blockNumber, chainId } = body;

    if (!hash || !type || !amount || !walletAddress) {
      return NextResponse.json(
        { error: 'Missing required fields: hash, type, amount, walletAddress' },
        { status: 400 }
      );
    }

    // Check if transaction already exists
    const existing = await Transaction.findOne({ hash });
    if (existing) {
      return NextResponse.json(
        { success: true, transaction: existing, message: 'Transaction already exists' },
        { status: 200 }
      );
    }

    const transaction = await Transaction.create({
      hash,
      type,
      amount,
      to,
      from,
      walletAddress: walletAddress.toLowerCase(),
      timestamp: timestamp || Date.now(),
      status: status || 'pending',
      blockNumber,
      chainId: chainId || 11155111,
    });

    return NextResponse.json({
      success: true,
      transaction,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}

// PATCH - Update transaction status
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { hash, status, blockNumber } = body;

    if (!hash) {
      return NextResponse.json(
        { error: 'hash is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (blockNumber) updateData.blockNumber = blockNumber;

    const transaction = await Transaction.findOneAndUpdate(
      { hash },
      updateData,
      { new: true }
    );

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      transaction,
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}
