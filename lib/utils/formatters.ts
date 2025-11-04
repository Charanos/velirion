/**
 * Safe formatting utilities to prevent hydration errors
 * All functions handle null, undefined, NaN, and Infinity cases
 */

export function safeFormatBalance(
  balance: string | number | null | undefined,
  decimals: number = 2
): string {
  if (balance === null || balance === undefined || balance === "") {
    return "0";
  }
  
  const num = typeof balance === "string" ? parseFloat(balance) : balance;
  
  if (isNaN(num) || !isFinite(num)) {
    return "0";
  }
  
  return num.toLocaleString(undefined, { 
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0
  });
}

export function safeFormatNumber(
  value: bigint | number | string | null | undefined,
  decimals: number = 2
): string {
  if (value === null || value === undefined) {
    return "0";
  }
  
  let num: number;
  
  if (typeof value === "bigint") {
    num = Number(value);
  } else if (typeof value === "string") {
    num = parseFloat(value);
  } else {
    num = value;
  }
  
  if (isNaN(num) || !isFinite(num)) {
    return "0";
  }
  
  return num.toLocaleString(undefined, { 
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0
  });
}

export function safeToFixed(
  value: number | null | undefined,
  decimals: number = 2
): string {
  if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
    return "0.00";
  }
  
  return value.toFixed(decimals);
}

export function safeParseFloat(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = parseFloat(value);
  return isNaN(parsed) || !isFinite(parsed) ? 0 : parsed;
}
