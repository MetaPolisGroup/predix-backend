import { predictionABI, tokenABI, rawAggregatorABI, marketABI } from './abi';
import { predictionAddr, tokenAddr, marketAddr } from './address';
import { betPosition, betStatus, collectionNames, LeaderBoard, Path, userType } from './constant';
import { ChainType } from './chain';
import provider from './provider';

const CURRENT_NETWORK = ChainType.BSCTESTNET;
const constant = {
  STORAGE_PATH: Path,
  FIREBASE: {
    NAME: 'FirestoreDataservices',
    COLLECTIONS: collectionNames,
    DOCUMENT: {
      PREFERENCE: {
        PREDICTION: 'A3KoWYY5TAIkcb8E6gZF',
        MARKET: 'market',
      },
      CHAINLINK: 'yxyBQpwTC7EyziO7NDia',
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
    AGGREGATOR: '0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE',
  },
  ABI: {
    PREDICTION: predictionABI[CURRENT_NETWORK],
    TOKEN: tokenABI[CURRENT_NETWORK],
    MARKET: marketABI[CURRENT_NETWORK],
    AGGREGATOR: rawAggregatorABI,
  },
  PROVIDER: provider(CURRENT_NETWORK),
  USER: {
    TYPE: userType,
  },
  LEADERBOARD: LeaderBoard,
};
export default constant;
