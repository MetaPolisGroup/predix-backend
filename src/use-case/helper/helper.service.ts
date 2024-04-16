import { Injectable } from '@nestjs/common';
import { CronJob } from 'cron';
import { CronJob as MyCronjob } from 'src/core/types/cronjob.type';
import { ethers } from 'ethers';
import { uniqueNamesGenerator, Config, starWars } from 'unique-names-generator';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';

@Injectable()
export class HelperService {
    constructor(
        private readonly factory: ContractFactoryAbstract,
        private readonly db: IDataServices,
    ) {}

    createCronJob(log: () => void, date: Date, cb?: () => Promise<void> | void): MyCronjob {
        const cronjob = new CronJob(
            date,
            async function () {
                await cb?.();
            },
            null,
            true,
        );

        log();

        const myCronjob: MyCronjob = {
            date,
            running: true,
        };

        return myCronjob;
    }

    createWallets() {
        const wallet = ethers.Wallet.createRandom();
        return wallet;
    }

    randomName(): string {
        const config: Config = {
            dictionaries: [starWars],
        };

        const characterName: string = uniqueNamesGenerator(config);

        return characterName;
    }

    randomNumber(from: number, to: number): number {
        // Ensure `from` is smaller than or equal to `to`
        if (from > to) {
            throw Error("'from' value must be smaller than or equal to 'to' value");
        }
        const d = 1 + 1;
        // Generate a random integer between `from` and `to`
        return Math.round(Math.random() * (to - from + 1)) + from;
    }

    getRandomDateFromNowTo(to: number) {
        const now = new Date().getTime() / 1000;
        const randomTimestamp = this.randomNumber(now, to);
        const date = new Date(randomTimestamp * 1000);

        return date;
    }

    getRandomDateFromTo(from: number, to: number) {
        const randomTimestamp = this.randomNumber(from, to);
        const date = new Date(randomTimestamp * 1000);

        return date;
    }

    getNowTimeStampsSeconds() {
        return Math.round(new Date().getTime() / 1000);
    }

    getNowTimeStampsMiliseconds() {
        return new Date().getTime();
    }

    isInThePast(timeStamp: number) {
        const now = this.getNowTimeStampsSeconds();
        if (now > timeStamp) {
            return true;
        }
        return false;
    }

    toWei(amount: number) {
        return ethers.parseUnits(amount.toString()).toString();
    }

    toEtherNumber(amount: bigint): number {
        return +ethers.formatEther(amount.toString());
    }

    parseUnit(amount: number, unit: number) {
        return Number(ethers.parseUnits(amount.toString(), unit));
    }

    formatChainlinkPrice(amount: bigint) {
        return Number(amount) / 10 ** 8;
    }

    getTimestampAtBeginningOfDayInSeconds() {
        const now = new Date();
        return Math.round(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).getTime() / 1000);
    }
}
