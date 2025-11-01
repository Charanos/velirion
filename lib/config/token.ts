import VelirionToken from './abis/VelirionToken.json';

export const VLR_TOKEN_CONFIG = {
  address: process.env.NEXT_PUBLIC_TOKEN_ADDRESS as `0x${string}`,
  abi: VelirionToken.abi,
  decimals: 18,
  symbol: 'VLR',
} as const;
