'use client';

import { useMemo } from 'react';
import {
  useAccount,
  useConfig,
  useReadContract,
  useReadContracts,
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
import { STAKING_CONFIG } from '@/lib/config/contracts';
import { VLR_TOKEN_CONFIG } from '@/lib/config/token';
import { ERC20_ABI } from '@/lib/abi/erc20';

const SECONDS_PER_DAY = 86_400n;
const ZERO_ADDRESS: Address = zeroAddress;
const TIER_IDS = [0, 1, 2, 3] as const;

// Tier configurations per Phase 2 spec
const STAKING_TIERS = {
  0: { name: 'Flexible', minAmount: 100, minLockDays: 0, maxLockDays: 0, baseAPR: 6, renewedAPR: 6 },
  1: { name: 'Medium', minAmount: 1000, minLockDays: 90, maxLockDays: 180, baseAPR: 12, renewedAPR: 15 },
  2: { name: 'Long', minAmount: 5000, minLockDays: 365, maxLockDays: 365, baseAPR: 20, renewedAPR: 22 },
  3: { name: 'Elite', minAmount: 250000, minLockDays: 730, maxLockDays: 730, baseAPR: 30, renewedAPR: 32 },
} as const;

type StakeInfo = {
  id: bigint;
  amount: string;
  apr: number;
  tier: number;
  tierName: string;
  lockDurationSeconds: bigint;
  lockDurationDays: number;
  startTime: number;
  active: boolean;
  renewed: boolean;
  pendingRewards: string;
  isValidAPR: boolean; // New validation field
  expectedAPR: number; // Expected APR based on spec
};

type StakingSummary = {
  totalStaked: string;
  totalRewardsClaimed: string;
  activeStakes: number;
  stakingPower: string;
};

type StakingStats = {
  totalStaked: string;
  totalStakers: number;
  totalRewardsDistributed: string;
  contractBalance: string;
};

function safeAddress(value?: string | null): Address {
  if (!value) return ZERO_ADDRESS;
  return isAddress(value) ? (value as Address) : ZERO_ADDRESS;
}

export function useStakingData() {
  const { address } = useAccount();

  const userInfoQuery = useReadContract({
    address: STAKING_CONFIG.address,
    abi: STAKING_CONFIG.abi,
    functionName: 'getUserStakingInfo',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address && STAKING_CONFIG.address),
    },
  });

  const statsQuery = useReadContract({
    address: STAKING_CONFIG.address,
    abi: STAKING_CONFIG.abi,
    functionName: 'getContractStats',
    query: {
      enabled: Boolean(STAKING_CONFIG.address),
    },
  });

  const stakeIdsQuery = useReadContract({
    address: STAKING_CONFIG.address,
    abi: STAKING_CONFIG.abi,
    functionName: 'getUserStakes',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address && STAKING_CONFIG.address),
    },
  });

  const stakeIds = (stakeIdsQuery.data as readonly bigint[] | undefined) ?? [];

  const stakeInfoQuery = useReadContracts({
    contracts: stakeIds.map((id) => ({
      address: STAKING_CONFIG.address!,
      abi: STAKING_CONFIG.abi,
      functionName: 'getStakeInfo',
      args: [address ?? ZERO_ADDRESS, id],
    })),
    query: {
      enabled: Boolean(address && STAKING_CONFIG.address && stakeIds.length > 0),
    },
  });

  const rewardsQuery = useReadContracts({
    contracts: stakeIds.map((id) => ({
      address: STAKING_CONFIG.address!,
      abi: STAKING_CONFIG.abi,
      functionName: 'calculateRewards',
      args: [address ?? ZERO_ADDRESS, id],
    })),
    query: {
      enabled: Boolean(address && STAKING_CONFIG.address && stakeIds.length > 0),
    },
  });

  const summary: StakingSummary | undefined = useMemo(() => {
    const raw = userInfoQuery.data as
      | readonly [bigint, bigint, bigint, bigint]
      | undefined;
    if (!raw) return undefined;
    return {
      totalStaked: formatUnits(raw[0], VLR_TOKEN_CONFIG.decimals),
      totalRewardsClaimed: formatUnits(raw[1], VLR_TOKEN_CONFIG.decimals),
      activeStakes: Number(raw[2]),
      stakingPower: formatUnits(raw[3], 0),
    };
  }, [userInfoQuery.data]);

  const stats: StakingStats | undefined = useMemo(() => {
    const raw = statsQuery.data as
      | readonly [bigint, bigint, bigint, bigint]
      | undefined;
    if (!raw) return undefined;
    return {
      totalStaked: formatUnits(raw[0], VLR_TOKEN_CONFIG.decimals),
      totalStakers: Number(raw[1]),
      totalRewardsDistributed: formatUnits(raw[2], VLR_TOKEN_CONFIG.decimals),
      contractBalance: formatUnits(raw[3], VLR_TOKEN_CONFIG.decimals),
    };
  }, [statsQuery.data]);

  const stakes: StakeInfo[] = useMemo(() => {
    if (!stakeIds.length) return [];
    return stakeIds.map((id, index) => {
      const infoResult = stakeInfoQuery.data?.[index]?.result as
        | readonly [bigint, bigint, bigint, number, number, boolean, boolean]
        | undefined;
      const rewardsResult = rewardsQuery.data?.[index]?.result as bigint | undefined;

      if (!infoResult) {
        return {
          id,
          amount: '0',
          apr: 0,
          tier: 0,
          tierName: 'Unknown',
          lockDurationSeconds: 0n,
          lockDurationDays: 0,
          startTime: 0,
          active: false,
          renewed: false,
          pendingRewards: '0',
          isValidAPR: false,
          expectedAPR: 0,
        };
      }

      const lockSec = infoResult[2];
      const lockDays = Number(lockSec / SECONDS_PER_DAY);
      const tier = infoResult[3];
      const apr = infoResult[4];
      const renewed = infoResult[5];
      const tierConfig = STAKING_TIERS[tier as keyof typeof STAKING_TIERS];

      // Calculate expected APR per spec
      let expectedAPR: number;
      if (tier === 1) { // Medium tier: 12-15% based on lock days
        const minDays = tierConfig?.minLockDays || 90;
        const maxDays = tierConfig?.maxLockDays || 180;
        const base = tierConfig?.baseAPR || 12;
        const renewedRate = tierConfig?.renewedAPR || 15;
        if (lockDays >= minDays && lockDays <= maxDays) {
          const ratio = (lockDays - minDays) / (maxDays - minDays);
          expectedAPR = renewed ? renewedRate : base + (renewedRate - base) * ratio;
        } else {
          expectedAPR = renewed ? renewedRate : base;
        }
      } else {
        expectedAPR = renewed ? (tierConfig?.renewedAPR || 0) : (tierConfig?.baseAPR || 0);
      }

      // Validate APR (allow small tolerance for calculation differences)
      const isValidAPR = Math.abs(apr - expectedAPR) < 0.1;

      return {
        id,
        amount: formatUnits(infoResult[0], VLR_TOKEN_CONFIG.decimals),
        startTime: Number(infoResult[1]) * 1000,
        lockDurationSeconds: lockSec,
        lockDurationDays: lockDays,
        tier,
        tierName: tierConfig?.name || 'Unknown',
        apr,
        renewed,
        active: infoResult[6],
        pendingRewards: rewardsResult
          ? formatUnits(rewardsResult, VLR_TOKEN_CONFIG.decimals)
          : '0',
        isValidAPR,
        expectedAPR,
      };
    });
  }, [stakeIds, stakeInfoQuery.data, rewardsQuery.data]);

  const isLoading =
    userInfoQuery.isLoading ||
    statsQuery.isLoading ||
    stakeIdsQuery.isLoading ||
    stakeInfoQuery.isLoading ||
    rewardsQuery.isLoading;

  return {
    summary,
    stats,
    stakes,
    stakeIds,
    isLoading,
    refetchAll: () => {
      userInfoQuery.refetch?.();
      statsQuery.refetch?.();
      stakeIdsQuery.refetch?.();
      stakeInfoQuery.refetch?.();
      rewardsQuery.refetch?.();
    },
  };
}

export function useStakingActions() {
  const config = useConfig();
  const { address } = useAccount();
  const {
    writeContractAsync: writeToken,
    isPending: tokenPending,
  } = useWriteContract();
  const {
    writeContractAsync: writeStaking,
    isPending: stakingPending,
  } = useWriteContract();

  async function wait(hash: `0x${string}`) {
    await waitForTransactionReceipt(config, { hash });
  }

  async function stake(args: {
    amount: string;
    tier: number;
    lockDays: number;
    referrer?: string | null;
  }) {
    if (!address) throw new Error('Connect wallet to stake');
    if (!STAKING_CONFIG.address) throw new Error('Staking address missing');

    const parsedAmount = parseUnits(args.amount, VLR_TOKEN_CONFIG.decimals);
    const lockSeconds = BigInt(Math.max(Math.floor(args.lockDays * 86400), 0));

    const approveHash = await writeToken({
      address: VLR_TOKEN_CONFIG.address,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [STAKING_CONFIG.address, parsedAmount],
    });
    await wait(approveHash);

    const stakeHash = await writeStaking({
      address: STAKING_CONFIG.address,
      abi: STAKING_CONFIG.abi,
      functionName: 'stake',
      args: [parsedAmount, args.tier, lockSeconds],
    });
    await wait(stakeHash);
  }

  async function unstake(stakeId: number | string) {
    if (!STAKING_CONFIG.address) throw new Error('Staking address missing');
    const hash = await writeStaking({
      address: STAKING_CONFIG.address,
      abi: STAKING_CONFIG.abi,
      functionName: 'unstake',
      args: [BigInt(stakeId)],
    });
    await wait(hash);
  }

  async function claim(stakeId: number | string) {
    if (!STAKING_CONFIG.address) throw new Error('Staking address missing');
    const hash = await writeStaking({
      address: STAKING_CONFIG.address,
      abi: STAKING_CONFIG.abi,
      functionName: 'claimRewards',
      args: [BigInt(stakeId)],
    });
    await wait(hash);
  }

  return {
    stake,
    unstake,
    claim,
    isPending: tokenPending || stakingPending,
  };
}

export function useStaking() {
  const data = useStakingData();
  const actions = useStakingActions();

  return {
    ...data,
    ...actions,
  };
}
