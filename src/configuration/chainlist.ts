import { ChainType } from './chain';

// 2. Define network configurations
export const Chainlist = {
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
        rpc: 'https://base-goerli.publicnode.com',
        chainId: 84531,
    },

    [ChainType.BASESEPOLIA]: {
        name: 'baseSepolia',
        rpc: 'https://base-sepolia-rpc.publicnode.com',
        chainId: 84532,
    },
};
