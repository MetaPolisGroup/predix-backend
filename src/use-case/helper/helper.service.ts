import { Injectable } from '@nestjs/common';
import { CronJob } from 'cron';
import { CronJob as MyCronjob } from 'src/core/types/cronjob.type';
import { ethers } from 'ethers';
import { uniqueNamesGenerator, Config, starWars } from 'unique-names-generator';
import { ContractFactoryAbstract } from 'src/core/abstract/contract-factory/contract-factory.abstract';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';

@Injectable()
export class HelperService {
    constructor() {}

    createCronJob(date: Date, cb?: () => Promise<void> | void): MyCronjob {
        new CronJob(
            date,
            async function () {
                await cb?.();
            },
            null,
            true,
        );

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
        if (from > to) {
            return;
        }

        return Math.round(Math.random() * (to - from + 1)) + from;
    }

    getToDayTimestampAtHourInSeconds(hour: number) {
        const today = new Date();

        // Set the time to the specified hour
        today.setHours(hour, 0, 0, 0); // Set minutes, seconds, and milliseconds to zero

        // Get the timestamp of the updated Date object
        const timestamp = today.getTime() / 1000;

        return timestamp;
    }

    getRandomDateFromNowTo(to: number) {
        const now = this.getNowTimeStampsSeconds();
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
