import { JsonRpcProvider, ethers } from 'ethers';
import { ChainType } from './chain';

// 2. Define network configurations
export const providerRPC = {
  [ChainType.BSCTESTNET]: {
    name: 'bscTestnet',
    rpc: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    chainId: 97,
  },
  [ChainType.BSC]: {
    name: 'bscMainnet',
    rpc: 'https://bsc-dataseed.binance.org/',
    chainId: 56,
  },
  [ChainType.BASETESTNET]: {
    name: 'baseTestnet',
    rpc: 'https://goerli.base.org',
    chainId: 84531,
  },
  [ChainType.SEPOLIA]: {
    name: 'Sepolia',
    rpc: 'https://rpc.sepolia.org',
    chainId: 11155111,
  },
};

const provider = (env: ChainType): JsonRpcProvider => {
  return new ethers.JsonRpcProvider(
    providerRPC[env].rpc,
    {
      chainId: providerRPC[env].chainId,
      name: providerRPC[env].name,
    },
    { polling: true },
  );
};
export default provider;
