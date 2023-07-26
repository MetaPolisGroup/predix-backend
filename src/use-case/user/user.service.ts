import { Injectable } from '@nestjs/common';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { Leaderboard } from 'src/core/entity/leaderboard.entity';

@Injectable()
export class UserService {
  constructor(private readonly db: IDataServices) {}
}
