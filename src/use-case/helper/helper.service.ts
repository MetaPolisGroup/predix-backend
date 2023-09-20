import { Injectable, Logger } from '@nestjs/common';
import { CronJob } from 'cron';
import { Contract, ethers } from 'ethers';
import constant from 'src/configuration';
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

  async executeContract(
    contract: Contract,
    functionName: string,
    successMsg = 'Execute successfully !',
    failedMsg = 'Execute failed !',
    callBackSuccess?: () => Promise<void>,
    callBackFailed?: () => Promise<void>,
    gasFee?: number,
    ...agrs: string[]
  ) {
    const gasLimit = await contract[functionName].estimateGas(...agrs);
    const gasPrice = await this.factory.provider.getFeeData();

    const executeRoundTx = await contract[functionName](...agrs, {
      gasLimit,

      maxFeePerGas: gasFee ? BigInt(gasFee) : gasPrice.maxFeePerGas,
      maxPriorityFeePerGas: gasFee ? BigInt(gasFee) : gasPrice.maxPriorityFeePerGas,
    });

    const executeRound = await this.factory.provider.waitForTransaction(executeRoundTx.hash as string);

    // Execute round success
    if (executeRound.status === 1) {
      console.log(successMsg);
      await callBackSuccess?.();
    }

    // Execute round failed
    else {
      console.log(failedMsg);
      await callBackFailed?.();
    }
  }
}
