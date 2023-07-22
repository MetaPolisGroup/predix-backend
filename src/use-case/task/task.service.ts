import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class TaskService {
  constructor() {}

  @Cron('* */5 * * * *')
  async executeRound() {
    console.log('Cron');
  }
}
