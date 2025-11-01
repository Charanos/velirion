'use client';

import { useMemo } from 'react';
import {
  useAccount,
  useConfig,
  useReadContract,
  useWriteContract,
} from 'wagmi';
import {
  Address,
  formatUnits,
  isAddress,
  parseUnits,
  zeroAddress,
} from 'viem';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { REFERRAL_CONFIG } from '@/lib/config/contracts';

const ZERO_ADDRESS: Address = zeroAddress;

function safeAddress(value?: string | null): Address {
  if (!value) return ZERO_ADDRESS;
  return isAddress(value) ? (value as Address) : ZERO_ADDRESS;
}

export type ReferralTier = 'Tier1' | 'Tier2' | 'Tier3' | 'Tier4';

export type ReferrerData = {
  referrer: Address;
  level: ReferralTier;
  directReferrals: number;
  totalEarned: string;
  pendingRewards: string;
  isActive: boolean;
};

const TIER_MAPPING: Record<number, ReferralTier> = {
  0: 'Tier1',
  1: 'Tier2',
  2: 'Tier3',
  3: 'Tier4',
};

export function useReferralInfo(address?: string) {
  const userAddress = address || useAccount().address;

  const referrerInfo = useReadContract({
    address: REFERRAL_CONFIG.address,
    abi: REFERRAL_CONFIG.abi,
    functionName: 'getReferrerInfo',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: Boolean(userAddress && REFERRAL_CONFIG.address),
    },
  });

  const data = useMemo(() => {
    const raw = referrerInfo.data as
      | readonly [Address, number, bigint, bigint, bigint, boolean]
      | undefined;
    if (!raw) return undefined;

    return {
      referrer: raw[0],
      level: TIER_MAPPING[raw[1]] || 'Tier1',
      directReferrals: Number(raw[2]),
      totalEarned: formatUnits(raw[3], 18),
      pendingRewards: formatUnits(raw[4], 18),
      isActive: raw[5],
    } satisfies ReferrerData;
  }, [referrerInfo.data]);

  return {
    ...data,
    isLoading: referrerInfo.isLoading,
    refetch: referrerInfo.refetch,
  };
}

export function useReferralActions() {
  const config = useConfig();
  const { address } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();

  async function wait(hash: `0x${string}`) {
    await waitForTransactionReceipt(config, { hash });
  }

  async function register(referrer: string) {
    if (!REFERRAL_CONFIG.address) throw new Error('Referral contract address missing');
    if (!address) throw new Error('Wallet not connected');

    const hash = await writeContractAsync({
      address: REFERRAL_CONFIG.address,
      abi: REFERRAL_CONFIG.abi,
      functionName: 'register',
      args: [safeAddress(referrer)],
    });
    await wait(hash);
  }

  async function claimRewards() {
    if (!REFERRAL_CONFIG.address) throw new Error('Referral contract address missing');
    if (!address) throw new Error('Wallet not connected');

    const hash = await writeContractAsync({
      address: REFERRAL_CONFIG.address,
      abi: REFERRAL_CONFIG.abi,
      functionName: 'claimRewards',
    });
    await wait(hash);
  }

  return {
    register,
    claimRewards,
    isPending,
  };
}

export function useReferral() {
  const info = useReferralInfo();
  const actions = useReferralActions();

  return {
    ...info,
    ...actions,
  };
}
