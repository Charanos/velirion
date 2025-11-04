/**
 * Contract Configuration Diagnostics
 * Run this to check if all contract addresses are properly loaded
 */

export function diagnoseContractConfig() {
  const contracts = {
    'Token': process.env.NEXT_PUBLIC_TOKEN_ADDRESS,
    'Presale': process.env.NEXT_PUBLIC_PRESALE_ADDRESS,
    'Referral': process.env.NEXT_PUBLIC_REFERRAL_ADDRESS,
    'Staking': process.env.NEXT_PUBLIC_STAKING_ADDRESS,
    'DAO': process.env.NEXT_PUBLIC_DAO_ADDRESS,
    'USDC': process.env.NEXT_PUBLIC_USDC_ADDRESS,
    'USDT': process.env.NEXT_PUBLIC_USDT_ADDRESS,
  };

  console.log('🔍 Contract Configuration Diagnostics');
  console.log('=====================================');
  
  let allValid = true;
  
  Object.entries(contracts).forEach(([name, address]) => {
    const isValid = address && address !== '0x0000000000000000000000000000000000000000';
    const status = isValid ? '✅' : '❌';
    console.log(`${status} ${name.padEnd(10)}: ${address || 'MISSING'}`);
    if (!isValid) allValid = false;
  });
  
  console.log('=====================================');
  
  if (allValid) {
    console.log('✅ All contract addresses configured correctly');
  } else {
    console.error('❌ Some contract addresses are missing or invalid');
    console.error('💡 Make sure:');
    console.error('   1. .env.local file exists in the client directory');
    console.error('   2. All NEXT_PUBLIC_* variables are set');
    console.error('   3. Development server was restarted after adding .env.local');
  }
  
  return allValid;
}

// Auto-run in development
if (process.env.NODE_ENV === 'development') {
  diagnoseContractConfig();
}
