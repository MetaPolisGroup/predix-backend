import { predictionABI, tokenABI, rawAggregatorABI } from './abi';
import { predictionAddr, tokenAddr } from './address';
import { ChainType } from './chain';
import { collectionNames } from './constant';
import { Path } from './constant/storage';
import provider from './provider';
import { userType } from './constant/user';
import { LeaderBoard } from './constant/leaderboard';

const CURRENT_NETWORK = ChainType.BSCTESTNET;
const constant = {
  ENABLE: true,
  STORAGE_PATH: Path,
  FIREBASE: {
    NAME: 'FirestoreDataservices',
    COLLECTIONS: collectionNames,
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
    AGGREGATOR: '0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE',
  },
  ABI: {
    PREDICTION: predictionABI[CURRENT_NETWORK],
    TOKEN: tokenABI[CURRENT_NETWORK],
    AGGREGATOR: rawAggregatorABI,
  },
  PROVIDER: provider(CURRENT_NETWORK),
  USER: {
    TYPE: userType,
  },
  LEADERBOARD: LeaderBoard,
};
export default constant;
