'use client';

import { useMemo } from 'react';
import {
  useAccount,
  useConfig,
  useReadContract,
  useWriteContract,
} from 'wagmi';
import {
  formatUnits,
  isAddress,
  parseEther,
  parseUnits,
  zeroAddress,
  type Address,
} from 'viem';
import { waitForTransactionReceipt } from 'wagmi/actions';
import {
  PRESALE_CONFIG,
  REFERRAL_CONFIG,
  USDC_CONFIG,
  USDT_CONFIG,
} from '@/lib/config/contracts';
import { ERC20_ABI } from '@/lib/abi/erc20';
import { useTransactionStore } from '@/lib/stores/transactionStore';

const ZERO_ADDRESS: Address = zeroAddress;

function getSafeAddress(value?: string | null): Address {
  if (!value) return ZERO_ADDRESS;
  return isAddress(value) ? (value as Address) : ZERO_ADDRESS;
}

function safeFormat(value: bigint | undefined, decimals: number, fallback = '0') {
  if (value === undefined || value === null) return fallback;
  return formatUnits(value, decimals);
}

export function usePresaleInfo() {
  const { address } = useAccount();

  const currentPhase = useReadContract({
    address: PRESALE_CONFIG.address,
    abi: PRESALE_CONFIG.abi,
    functionName: 'getCurrentPhaseInfo',
    query: {
      enabled: Boolean(PRESALE_CONFIG.address),
    },
  });

  const totalSold = useReadContract({
    address: PRESALE_CONFIG.address,
    abi: PRESALE_CONFIG.abi,
    functionName: 'getTotalTokensSold',
    query: {
      enabled: Boolean(PRESALE_CONFIG.address),
    },
  });

  const claimable = useReadContract({
    address: PRESALE_CONFIG.address,
    abi: PRESALE_CONFIG.abi,
    functionName: 'getClaimableAmount',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address && PRESALE_CONFIG.address),
    },
  });

  const referralInfo = useReadContract({
    address: PRESALE_CONFIG.address,
    abi: PRESALE_CONFIG.abi,
    functionName: 'getReferralInfo',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address && PRESALE_CONFIG.address),
    },
  });

  const purchases = useReadContract({
    address: PRESALE_CONFIG.address,
    abi: PRESALE_CONFIG.abi,
    functionName: 'getUserPurchases',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address && PRESALE_CONFIG.address),
    },
  });

  const data = useMemo(() => {
    const phaseRaw = currentPhase.data as
      | readonly [bigint, bigint, bigint, bigint, bigint, boolean]
      | undefined;
    const totalSoldRaw = totalSold.data as bigint | undefined;
    const claimableRaw = claimable.data as bigint | undefined;
    const referralRaw = referralInfo.data as
      | readonly [Address, bigint, bigint, bigint]
      | undefined;
    const purchasesRaw = purchases.data as
      | readonly (readonly [bigint, bigint, bigint, Address, bigint])[]
      | undefined;

    return {
      phase: phaseRaw
        ? {
            startTime: Number(phaseRaw[0]) * 1000,
            endTime: Number(phaseRaw[1]) * 1000,
            price: safeFormat(phaseRaw[2], 18),
            maxTokens: safeFormat(phaseRaw[3], 18),
            soldTokens: safeFormat(phaseRaw[4], 18),
            isActive: phaseRaw[5],
          }
        : undefined,
      totals: {
        soldTokens: totalSoldRaw ? safeFormat(totalSoldRaw, 18) : undefined,
        claimable: claimableRaw ? safeFormat(claimableRaw, 18) : undefined,
      },
      referral: referralRaw
        ? {
            referrer: referralRaw[0],
            totalReferred: safeFormat(referralRaw[1], 18),
            totalEarned: safeFormat(referralRaw[2], 18),
            totalVolume: safeFormat(referralRaw[3], 18),
          }
        : undefined,
      purchases:
        purchasesRaw?.map((item) => ({
          phaseId: Number(item[0]),
          amount: safeFormat(item[1], 6),
          tokens: safeFormat(item[2], 18),
          paymentToken: item[3],
          timestamp: Number(item[4]) * 1000,
        })) ?? [],
      isLoading:
        currentPhase.isLoading ||
        totalSold.isLoading ||
        claimable.isLoading ||
        referralInfo.isLoading ||
        purchases.isLoading,
    };
  }, [currentPhase, totalSold, claimable, referralInfo, purchases]);

  return data;
}

export function usePresaleActions() {
  const config = useConfig();
  const { address } = useAccount();
  const { addTransaction, updateTransaction } = useTransactionStore();
  const {
    writeContractAsync: writePresale,
    isPending: presalePending,
  } = useWriteContract();
  const {
    writeContractAsync: writeToken,
    isPending: tokenPending,
  } = useWriteContract();

  async function wait(hash: `0x${string}`) {
    await waitForTransactionReceipt(config, { hash });
  }

  async function buyWithETH(amount: string, referrer?: string | null) {
    if (!PRESALE_CONFIG.address) throw new Error('Presale contract address missing');
    if (!address) throw new Error('Wallet not connected');
    
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      throw new Error('Invalid amount. Please enter a valid ETH amount.');
    }
    
    const value = parseEther(amount);
    console.log('Buying with ETH:', { amount, value: value.toString(), referrer });
    
    try {
      const hash = await writePresale({
        address: PRESALE_CONFIG.address,
        abi: PRESALE_CONFIG.abi,
        functionName: 'buyWithETH',
        args: [getSafeAddress(referrer)],
        value,
      });
      
      console.log('ETH purchase transaction sent:', hash);
      
      addTransaction({
        hash,
        type: 'presale',
        amount: amount,
        from: address,
        currency: 'ETH',
        details: `Presale purchase with ${amount} ETH`,
      });
      
      await wait(hash);
      
      updateTransaction(hash, { status: 'confirmed' });
      console.log('ETH purchase confirmed');
    } catch (error: any) {
      console.error('ETH purchase error:', error);
      if (error.message?.includes('insufficient funds')) {
        throw new Error('Insufficient ETH balance for purchase and gas fees.');
      }
      throw error;
    }
  }

  async function buyWithToken(
    amount: string,
    referrer: string | null | undefined,
    tokenConfig: typeof USDC_CONFIG | typeof USDT_CONFIG,
    functionName: 'buyWithUSDC' | 'buyWithUSDT',
  ) {
    if (!PRESALE_CONFIG.address) throw new Error('Presale contract address missing');
    if (!tokenConfig.address) throw new Error(`${tokenConfig.symbol} address missing`);
    if (!address) throw new Error('Wallet not connected');
    
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      throw new Error(`Invalid amount. Please enter a valid ${tokenConfig.symbol} amount.`);
    }
    
    const parsed = parseUnits(amount, tokenConfig.decimals);
    console.log(`Buying with ${tokenConfig.symbol}:`, {
      amount,
      parsed: parsed.toString(),
      referrer,
    });
    
    try {
      // Approve tokens
      console.log(`Approving ${tokenConfig.symbol}...`);
      const approveHash = await writeToken({
        address: tokenConfig.address,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [PRESALE_CONFIG.address, parsed],
      });
      await wait(approveHash);
      console.log('Approval confirmed:', approveHash);
      
      // Buy tokens
      console.log('Executing purchase...');
      const buyHash = await writePresale({
        address: PRESALE_CONFIG.address,
        abi: PRESALE_CONFIG.abi,
        functionName,
        args: [parsed, getSafeAddress(referrer)],
      });
      
      console.log(`${tokenConfig.symbol} purchase transaction sent:`, buyHash);
      
      addTransaction({
        hash: buyHash,
        type: 'presale',
        amount: amount,
        from: address,
        currency: tokenConfig.symbol,
        details: `Presale purchase with ${amount} ${tokenConfig.symbol}`,
      });
      
      await wait(buyHash);
      
      updateTransaction(buyHash, { status: 'confirmed' });
      console.log(`${tokenConfig.symbol} purchase confirmed`);
    } catch (error: any) {
      console.error(`${tokenConfig.symbol} purchase error:`, error);
      if (error.message?.includes('insufficient funds')) {
        throw new Error(`Insufficient ETH balance for gas fees or insufficient ${tokenConfig.symbol} balance.`);
      }
      throw error;
    }
  }

  async function buyWithUSDC(amount: string, referrer?: string | null) {
    return buyWithToken(amount, referrer, USDC_CONFIG, 'buyWithUSDC');
  }

  async function buyWithUSDT(amount: string, referrer?: string | null) {
    return buyWithToken(amount, referrer, USDT_CONFIG, 'buyWithUSDT');
  }

  async function claim() {
    if (!PRESALE_CONFIG.address) throw new Error('Presale contract address missing');
    if (!address) throw new Error('Wallet not connected');
    
    console.log('Claiming presale tokens...');
    
    try {
      const hash = await writePresale({
        address: PRESALE_CONFIG.address,
        abi: PRESALE_CONFIG.abi,
        functionName: 'claimTokens',
      });
      
      console.log('Claim transaction sent:', hash);
      await wait(hash);
      console.log('Claim confirmed');
    } catch (error: any) {
      console.error('Claim error:', error);
      throw error;
    }
  }

  return {
    buyWithETH,
    buyWithUSDC,
    buyWithUSDT,
    claim,
    isPending: presalePending || tokenPending,
  };
}
