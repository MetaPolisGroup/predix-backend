import { User } from 'src/core/entity/user.enity';
import { IGenericRepository } from './generic-repository.abstract';
import { CashHistory } from 'src/core/entity/cash-history.enity';
import { Prediction } from 'src/core/entity/prediction.enity';
import { PointHistory } from 'src/core/entity/point-history.enity';
import { Product } from 'src/core/entity/product.entiy';
import { Bet } from 'src/core/entity/bet.entity';
import { Chainlink } from 'src/core/entity/chainlink.entity';
import { Leaderboard } from 'src/core/entity/leaderboard.entity';
import { Chart } from 'src/core/entity/chart.entity';

export abstract class IDataServices {
  // Firestore

  abstract firestore: any;

  abstract userRepo: IGenericRepository<User>;

  abstract betRepo: IGenericRepository<Bet>;

  abstract chartRepo: IGenericRepository<Chart>;

  abstract cashHistoryRepo: IGenericRepository<CashHistory>;

  abstract pointHistoryRepo: IGenericRepository<PointHistory>;

  abstract predictionRepo: IGenericRepository<Prediction>;

  abstract productRepo: IGenericRepository<Product>;

  abstract chainlinkRepo: IGenericRepository<Chainlink>;

  abstract leaderboardRepo: IGenericRepository<Leaderboard>;
}
