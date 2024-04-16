import { Generic } from './generic.entity';

export class Wallet extends Generic {
    address: string;

    privateKey: string;

    eth_refund_request: boolean;

    token_refund_request: boolean;

    approve_request: boolean;

    token_balance: number;

    eth_balance: number;

    total_gas_used: number;

    type: WalletType;
}

export type WalletType = 'Bot' | 'God';
