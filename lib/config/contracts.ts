import type { Abi } from 'viem';
import { PresaleContractV2ABI, VelirionReferralABI, VelirionStakingABI, VelirionDAOABI } from './abis';

// Development fallback address (zero address)
const DEV_FALLBACK_ADDRESS = '0x0000000000000000000000000000000000000000' as `0x${string}`;

/**
 * Safely retrieves contract address from environment variables
 * Provides fallback for development and logs warnings instead of throwing errors
 */
function getContractAddress(envVar: string, fallback = DEV_FALLBACK_ADDRESS): `0x${string}` {
  const address = process.env[envVar];
  if (!address) {
    console.warn(`⚠️ Missing ${envVar}, using fallback address. Please configure environment variables.`);
    return fallback;
  }
  return address as `0x${string}`;
}

export const PRESALE_CONFIG = {
  address: getContractAddress('NEXT_PUBLIC_PRESALE_ADDRESS'),
  abi: PresaleContractV2ABI.abi as Abi,
} as const;

export const REFERRAL_CONFIG = {
  address: getContractAddress('NEXT_PUBLIC_REFERRAL_ADDRESS'),
  abi: VelirionReferralABI.abi as Abi,
} as const;

export const STAKING_CONFIG = {
  address: getContractAddress('NEXT_PUBLIC_STAKING_ADDRESS'),
  abi: VelirionStakingABI.abi as Abi,
} as const;

export const DAO_CONFIG = {
  address: getContractAddress('NEXT_PUBLIC_DAO_ADDRESS'),
  abi: VelirionDAOABI.abi as Abi,
} as const;

export const USDC_CONFIG = {
  address: getContractAddress('NEXT_PUBLIC_USDC_ADDRESS'),
  abi: [{ "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "approve", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "balance", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transfer", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" }], "name": "allowance", "outputs": [{ "name": "remaining", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }] as Abi,
  decimals: 6,
  symbol: 'USDC',
} as const;

export const USDT_CONFIG = {
  address: getContractAddress('NEXT_PUBLIC_USDT_ADDRESS'),
  abi: [{ "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "approve", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "balance", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transfer", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" }], "name": "allowance", "outputs": [{ "name": "remaining", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }] as Abi,
  decimals: 6,
  symbol: 'USDT',
} as const;
