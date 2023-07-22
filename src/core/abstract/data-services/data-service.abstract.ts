import { Bet } from 'src/core/interface/bet/bet.entity';
import { IGenericRepository } from './generic-repository.abstract';
import { Round } from 'src/core/interface/round/round.entity';
import { User } from 'src/core/interface/user/user.interface';

export abstract class IDataServices {
  // Firestore

  abstract firestore: any;

  abstract betRepo: IGenericRepository<Bet>;

  abstract roundRepo: IGenericRepository<Round>;

  abstract userRepo: IGenericRepository<User>;
}
