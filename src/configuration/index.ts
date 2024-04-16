import { predictionABI, tokenABI, rawAggregatorABI, marketABI, diceABI, nftABI, faucetABI } from './abi';
import { predictionAddr, tokenAddr, marketAddr, diceAddr, nftAddr, faucetAddr } from './address';
import { betPosition, betStatus, collectionNames, LeaderBoard, Path, userType, walletType } from './constant';
import { ChainType } from './chain';

const CURRENT_NETWORK = ChainType.BASESEPOLIA;
const constant = {
    GAS: undefined,
    STORAGE_PATH: Path,
    FIREBASE: {
        NAME: 'FirestoreDataservices',
        COLLECTIONS: collectionNames,
        DOCUMENT: {
            PREFERENCE: {
                PREDICTION: 'predix',
                MARKET: 'market',
                DICE: 'dice',
                PREDIX_BOT: 'predixBot',
                DICE_BOT: 'dicesBot',
            },
            CHAINLINK: 'ChainLink',
        },
    },
    BET: {
        STATUS: betStatus,
        POS: betPosition,
    },
    REVENUE_SHARE: 5,
    REVENUE_SHARE_USER: 0,
    COMMISSIONS: 0,

    STORAGE: {
        ACTION: 'read' as 'read' | 'write' | 'delete' | 'resumable',
        EXPIRED_DATE: {
            DAY: 17,
            MONTH: 5,
            YEAR: 2030,
        },
        BUCKET: 'gs://c300amg-d8509.appspot.com',
    },
    ADDRESS: {
        PREDICTION: predictionAddr[CURRENT_NETWORK],
        TOKEN: tokenAddr[CURRENT_NETWORK],
        MARKET: marketAddr[CURRENT_NETWORK],
        DICE: diceAddr[CURRENT_NETWORK],
        NFT: nftAddr[CURRENT_NETWORK],
        FAUCET: faucetAddr[CURRENT_NETWORK],
        AGGREGATOR: '0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE',
    },
    ABI: {
        PREDICTION: predictionABI[CURRENT_NETWORK],
        TOKEN: tokenABI[CURRENT_NETWORK],
        MARKET: marketABI[CURRENT_NETWORK],
        DICE: diceABI[CURRENT_NETWORK],
        NFT: nftABI[CURRENT_NETWORK],
        FAUCET: faucetABI[CURRENT_NETWORK],
        AGGREGATOR: rawAggregatorABI,
    },

    BOT: {
        FAKEBOT: {
            MIN_ETH_BUDGET: 0.001,
            DEFAULT_ETH_BUDGET: 0.01,
            MIN_TOKEN_BUDGET: 200,
            DEFAULT_TOKEN_BUDGET: 6400,
        },
    },
    WALLET: {
        TYPE: walletType,
    },
    USER: {
        TYPE: userType,
    },
    LEADERBOARD: LeaderBoard,
};
export default constant;
