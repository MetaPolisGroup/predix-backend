import { predictionABI } from './abi';
import { predictionAddr, tokenAddr } from './address';
import { ChainType } from './chain';
import { collectionNames } from './constant';
import { Path } from './constant/storage';
import provider from './provider';
import { userType } from './constant/user';

const CURRENT_NETWORK = ChainType.BSCTESTNET;
const constant = {
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
  },
  ABI: {
    PREDICTION: predictionABI[CURRENT_NETWORK],
  },
  PROVIDER: provider(CURRENT_NETWORK),
  USER: {
    TYPE: userType,
  },
};
export default constant;
