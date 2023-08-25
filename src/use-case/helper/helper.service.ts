import { Injectable, Logger } from '@nestjs/common';
import { CronJob } from 'cron';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';

@Injectable()
export class HelperService {
  constructor(private readonly factory: ContractFactoryAbstract, private readonly db: IDataServices) {}

  createCronJob(logger: Logger, cj: { [id: string]: CronJob }, date: Date, id: number, message: string, cb?: () => Promise<void>) {
    const cronjob = new CronJob(date, async function () {
      await cb?.();
    });

    if (cj[id] && cj[id].running) {
      logger.log(`Cronjob for round ${id} have already set !`);
      return;
    }

    cj[id] = cronjob;

    cronjob.start();

    logger.log(message);

    return cj;
  }
}
