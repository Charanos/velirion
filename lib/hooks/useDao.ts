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
  encodeFunctionData,
  formatUnits,
  isAddress,
  parseUnits,
  zeroAddress,
} from 'viem';
import type { Abi } from 'viem';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { DAO_CONFIG, STAKING_CONFIG } from '@/lib/config/contracts';

const SUPPORT = {
  AGAINST: 0,
  FOR: 1,
  ABSTAIN: 2,
} as const;

type ProposalStateLabel =
  | 'Pending'
  | 'Active'
  | 'Canceled'
  | 'Defeated'
  | 'Succeeded'
  | 'Queued'
  | 'Expired'
  | 'Executed';

const STATE_MAP: Record<number, ProposalStateLabel> = {
  0: 'Pending',
  1: 'Active',
  2: 'Canceled',
  3: 'Defeated',
  4: 'Succeeded',
  5: 'Queued',
  6: 'Expired',
  7: 'Executed',
};

export type Proposal = {
  id: bigint;
  proposer: Address;
  description: string;
  targets: Address[];
  values: string[];
  calldatas: string[];
  startBlock: bigint;
  endBlock: bigint;
  forVotes: string;
  againstVotes: string;
  abstainVotes: string;
  executed: boolean;
  canceled: boolean;
  state: ProposalStateLabel;
  eta?: bigint;
};

export type Receipt = {
  hasVoted: boolean;
  support: number;
  votes: string;
};

const ZERO_ADDRESS = zeroAddress as Address;

function safeAddress(value: string | undefined): Address | undefined {
  if (!value) return undefined;
  return isAddress(value) ? (value as Address) : undefined;
}

export function useDaoData() {
  const { address } = useAccount();

  const daoAbi = DAO_CONFIG.abi as Abi;

  const proposalCount = useReadContract({
    address: DAO_CONFIG.address,
    abi: daoAbi,
    functionName: 'proposalCount',
    query: {
      enabled: Boolean(DAO_CONFIG.address),
    },
  });

  const proposalCountValue = (proposalCount.data as bigint | undefined) ?? 0n;
  const proposalIds = useMemo(
    () => Array.from({ length: Number(proposalCountValue) }, (_, i) => BigInt(i) + 1n),
    [proposalCountValue],
  );

  const quorumVotes = useReadContract({
    address: DAO_CONFIG.address,
    abi: daoAbi,
    functionName: 'QUORUM_VOTES',
    query: {
      enabled: Boolean(DAO_CONFIG.address),
    },
  });

  const proposalThreshold = useReadContract({
    address: DAO_CONFIG.address,
    abi: daoAbi,
    functionName: 'PROPOSAL_THRESHOLD',
    query: {
      enabled: Boolean(DAO_CONFIG.address),
    },
  });

  const proposals = useReadContracts({
    contracts: proposalIds.map((id) => ({
      address: DAO_CONFIG.address!,
      abi: daoAbi,
      functionName: 'getProposal' as const,
      args: [id] as const,
    })),
    query: {
      enabled: Boolean(DAO_CONFIG.address && proposalIds.length > 0),
    },
  });

  const proposalStates = useReadContracts({
    contracts: proposalIds.map((id) => ({
      address: DAO_CONFIG.address!,
      abi: DAO_CONFIG.abi as Abi,
      functionName: 'state' as const,
      args: [id] as const,
    })),
    query: {
      enabled: Boolean(DAO_CONFIG.address && proposalIds.length > 0),
    },
  });

  const proposalEta = useReadContracts({
    contracts: proposalIds.map((id) => ({
      address: DAO_CONFIG.address!,
      abi: daoAbi,
      functionName: 'proposalEta' as const,
      args: [id] as const,
    })),
    query: {
      enabled: Boolean(DAO_CONFIG.address && proposalIds.length > 0),
    },
  });

  const receipts = useReadContracts({
    contracts: proposalIds.map((id) => ({
      address: DAO_CONFIG.address!,
      abi: DAO_CONFIG.abi as Abi,
      functionName: 'getReceipt' as const,
      args: [id, address ?? ZERO_ADDRESS] as const,
    })),
    query: {
      enabled: Boolean(DAO_CONFIG.address && address && proposalIds.length > 0),
    },
  });

  const votingPower = useReadContract({
    address: DAO_CONFIG.address,
    abi: DAO_CONFIG.abi,
    functionName: 'getVotingPower',
    args: address ? [address, proposalCountValue] : undefined,
    query: {
      enabled: Boolean(address && DAO_CONFIG.address),
    },
  });

  const data = useMemo(() => {
    const proposalsRaw = proposals.data ?? [];
    const statesRaw = proposalStates.data ?? [];
    const etaRaw = proposalEta.data ?? [];
    const receiptsRaw = receipts.data ?? [];

    const formatted: Proposal[] = proposalsRaw.map((entry, index) => {
      const proposalResult = entry?.result as
        | readonly [
            bigint,
            Address,
            string,
            Address[],
            readonly bigint[],
            readonly `0x${string}`[],
            bigint,
            bigint,
            bigint,
            bigint,
            bigint,
            boolean,
            boolean
          ]
        | undefined;

      const stateResult = statesRaw[index]?.result as number | undefined;
      const etaResult = etaRaw[index]?.result as bigint | undefined;

      if (!proposalResult) {
        return {
          id: BigInt(index + 1),
          proposer: '0x0000000000000000000000000000000000000000',
          description: 'Unknown',
          targets: [],
          values: [],
          calldatas: [],
          startBlock: 0n,
          endBlock: 0n,
          forVotes: '0',
          againstVotes: '0',
          abstainVotes: '0',
          executed: false,
          canceled: false,
          state: 'Pending',
        } satisfies Proposal;
      }

      return {
        id: proposalResult[0],
        proposer: proposalResult[1],
        description: proposalResult[2],
        targets: [...proposalResult[3]] as Address[],
        values: proposalResult[4].map((value) => formatUnits(value, 18)),
        calldatas: [...proposalResult[5]],
        startBlock: proposalResult[6],
        endBlock: proposalResult[7],
        forVotes: formatUnits(proposalResult[8], 18),
        againstVotes: formatUnits(proposalResult[9], 18),
        abstainVotes: formatUnits(proposalResult[10], 18),
        executed: proposalResult[11],
        canceled: proposalResult[12],
        state: STATE_MAP[stateResult ?? 0] ?? 'Pending',
        eta: etaResult,
      } satisfies Proposal;
    });

    const userReceipt: Receipt[] = receiptsRaw.map((entry) => {
      const receipt = entry?.result as readonly [boolean, number, bigint, bigint] | undefined;
      if (!receipt) {
        return { hasVoted: false, support: 0, votes: '0' } satisfies Receipt;
      }
      return {
        hasVoted: receipt[0],
        support: receipt[1],
        votes: formatUnits(receipt[2], 18),
      } satisfies Receipt;
    });

    return {
      proposals: formatted,
      receipts: userReceipt,
      quorumVotes: quorumVotes.data ? formatUnits(quorumVotes.data as bigint, 18) : undefined,
      proposalThreshold: proposalThreshold.data
        ? formatUnits(proposalThreshold.data as bigint, 18)
        : undefined,
      votingPower: votingPower.data
        ? formatUnits(votingPower.data as bigint, 18)
        : undefined,
      isLoading:
        proposalCount.isLoading ||
        quorumVotes.isLoading ||
        proposalThreshold.isLoading ||
        proposals.isLoading ||
        proposalStates.isLoading,
    };
  }, [
    proposals.data,
    proposalStates.data,
    proposalEta.data,
    receipts.data,
    quorumVotes.data,
    proposalThreshold.data,
    votingPower.data,
    proposalCount.isLoading,
    quorumVotes.isLoading,
    proposalThreshold.isLoading,
    proposals.isLoading,
    proposalStates.isLoading,
  ]);

  return {
    ...data,
    refetchAll: () => {
      proposalCount.refetch?.();
      quorumVotes.refetch?.();
      proposalThreshold.refetch?.();
      proposals.refetch?.();
      proposalStates.refetch?.();
      proposalEta.refetch?.();
      receipts.refetch?.();
      votingPower.refetch?.();
    },
  };
}

export function useDaoActions() {
  const config = useConfig();
  const { address } = useAccount();
  const {
    writeContractAsync: writeDao,
    isPending,
  } = useWriteContract();

  async function wait(hash: `0x${string}`) {
    await waitForTransactionReceipt(config, { hash });
  }

  async function propose(
    targets: string[],
    values: string[],
    calldatas: `0x${string}`[],
    description: string,
  ) {
    if (!DAO_CONFIG.address) throw new Error('DAO address missing');
    if (!address) throw new Error('Connect wallet to propose');
    const parsedValues = values.map((value) => parseUnits(value || '0', 18));
    const hash = await writeDao({
      address: DAO_CONFIG.address,
      abi: DAO_CONFIG.abi,
      functionName: 'propose',
      args: [targets, parsedValues, calldatas, description],
    });
    await wait(hash);
  }

  async function castVote(proposalId: bigint, support: number, voteAmount: string, reason?: string) {
    if (!DAO_CONFIG.address) throw new Error('DAO address missing');
    const parsedAmount = parseUnits(voteAmount || '0', 18); // VLR is 18 decimals
    const hash = await writeDao({
      address: DAO_CONFIG.address,
      abi: DAO_CONFIG.abi,
      functionName: 'castVote',
      args: [proposalId, support, parsedAmount, reason ?? ''],
    });
    await wait(hash);
  }

  async function queue(proposalId: bigint) {
    if (!DAO_CONFIG.address) throw new Error('DAO address missing');
    const hash = await writeDao({
      address: DAO_CONFIG.address,
      abi: DAO_CONFIG.abi,
      functionName: 'queue',
      args: [proposalId],
    });
    await wait(hash);
  }

  async function execute(proposalId: bigint) {
    if (!DAO_CONFIG.address) throw new Error('DAO address missing');
    const hash = await writeDao({
      address: DAO_CONFIG.address,
      abi: DAO_CONFIG.abi,
      functionName: 'execute',
      args: [proposalId],
    });
    await wait(hash);
  }

  async function cancel(proposalId: bigint) {
    if (!DAO_CONFIG.address) throw new Error('DAO address missing');
    const hash = await writeDao({
      address: DAO_CONFIG.address,
      abi: DAO_CONFIG.abi,
      functionName: 'cancel',
      args: [proposalId],
    });
    await wait(hash);
  }

  function encodeCalldata({
    functionName,
    args,
  }: {
    functionName: string;
    args: readonly unknown[];
  }) {
    return encodeFunctionData({
      abi: STAKING_CONFIG.abi,
      functionName,
      args,
    });
  }

  return {
    propose,
    castVote,
    queue,
    execute,
    cancel,
    encodeCalldata,
    isPending,
    SUPPORT,
  };
}

export function useDao() {
  const data = useDaoData();
  const actions = useDaoActions();
  return {
    ...data,
    ...actions,
  };
}
