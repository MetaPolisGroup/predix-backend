import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { IDataServices } from './core/abstract/data-services/data-service.abstract';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly db: IDataServices) {}

  @Get()
  async getHello() {}
}
