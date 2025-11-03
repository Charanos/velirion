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
    const value = parseEther(amount);
    const hash = await writePresale({
      address: PRESALE_CONFIG.address,
      abi: PRESALE_CONFIG.abi,
      functionName: 'buyWithETH',
      args: [getSafeAddress(referrer)],
      value,
      gas: 250000n, // Explicit gas limit
    });
    
    addTransaction({
      hash,
      type: 'presale',
      amount: amount,
      from: address,
    });
    
    await wait(hash);
    
    updateTransaction(hash, { status: 'confirmed' });
  }

  async function buyWithToken(
    amount: string,
    referrer: string | null | undefined,
    tokenConfig: typeof USDC_CONFIG | typeof USDT_CONFIG,
    functionName: 'buyWithUSDC' | 'buyWithUSDT',
  ) {
    if (!PRESALE_CONFIG.address) throw new Error('Presale contract address missing');
    if (!tokenConfig.address) throw new Error(`${tokenConfig.symbol} address missing`);
    const parsed = parseUnits(amount, tokenConfig.decimals);
    const approveHash = await writeToken({
      address: tokenConfig.address,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [PRESALE_CONFIG.address, parsed],
      gas: 100000n, // Explicit gas limit
    });
    await wait(approveHash);
    const buyHash = await writePresale({
      address: PRESALE_CONFIG.address,
      abi: PRESALE_CONFIG.abi,
      functionName,
      args: [parsed, getSafeAddress(referrer)],
      gas: 250000n, // Explicit gas limit
    });
    
    addTransaction({
      hash: buyHash,
      type: 'presale',
      amount: amount,
      from: address,
    });
    
    await wait(buyHash);
    
    updateTransaction(buyHash, { status: 'confirmed' });
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
    const hash = await writePresale({
      address: PRESALE_CONFIG.address,
      abi: PRESALE_CONFIG.abi,
      functionName: 'claimTokens',
    });
    await wait(hash);
  }

  return {
    buyWithETH,
    buyWithUSDC,
    buyWithUSDT,
    claim,
    isPending: presalePending || tokenPending,
  };
}
