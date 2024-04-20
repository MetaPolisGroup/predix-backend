import { Injectable } from '@nestjs/common';
import { Position } from 'src/configuration/type';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { Bet } from 'src/core/entity/bet.entity';
import { Prophecy, Manipulation, ManipulationStatistic } from 'src/core/entity/manipulation.entity';
import { Prediction } from 'src/core/entity/prediction.enity';
import { HelperService } from '../helper/helper.service';
import { ExecuteData } from 'src/core/entity/chainlink.entity';

@Injectable()
export class ManipulationUsecases {
    constructor(
        private readonly db: IDataServices,
        private readonly helper: HelperService,
    ) {}

    //Reads
    async getProphecyPrice(liveround: Prediction): Promise<ExecuteData> {
        const manipulation = await this.getManipulationByEpoch(liveround.epoch);

        if (!manipulation || !manipulation.manipulated_closed_price) {
            return null;
        }

        return {
            price: this.helper.parseUnit(manipulation.manipulated_closed_price, 8),
            roundId: this.helper.parseUnit(manipulation.manipulated_closed_price, 8),
        };
    }

    async getManipulationByEpoch(epoch: number) {
        return this.db.manipulationRepo.getDocumentData(epoch.toString());
    }

    //Writes
    async createManipulateionRecord(round: Prediction, prophecy: Prophecy) {
        if (await this.getManipulationByEpoch(round.epoch)) {
            return;
        }

        await this._createManipulationRecord(round, prophecy);
    }

    async updateRecordUserBetUp(bet: Bet, record: Manipulation) {
        let { total_user_bet_up } = record;

        total_user_bet_up += bet.amount;

        await this.db.manipulationRepo.upsertDocumentData(record.id, {
            total_user_bet_up,
        });
    }

    async updateRecordUserBetDown(bet: Bet, record: Manipulation) {
        let { total_user_bet_down } = record;

        total_user_bet_down += bet.amount;

        await this.db.manipulationRepo.upsertDocumentData(record.id, {
            total_user_bet_down,
        });
    }

    async updateRecordBotBetDown(bet: Bet, record: Manipulation) {
        let { total_bot_bet_down } = record;

        total_bot_bet_down += bet.amount;

        await this.db.manipulationRepo.upsertDocumentData(record.id, {
            total_bot_bet_down,
        });
    }

    async updateRecordBotBetUp(bet: Bet, record: Manipulation) {
        let { total_bot_bet_up } = record;

        total_bot_bet_up += bet.amount;

        await this.db.manipulationRepo.upsertDocumentData(record.id, {
            total_bot_bet_up,
        });
    }

    async updateManipulationPosition(epoch: number, position: Position) {
        return this.upsertManipulation(epoch, { position });
    }

    async upsertManipulation(epoch: number, manipulation: Manipulation | object) {
        return this.db.manipulationRepo.upsertDocumentData(epoch.toString(), manipulation);
    }

    private async _createManipulationRecord(round: Prediction, prophecy_result: Prophecy) {
        const manipulation: Manipulation = {
            statistic: null,
            epoch: round.epoch,
            chart_structure: null,
            created_at: this.helper.getNowTimeStampsSeconds(),
            updated_at: this.helper.getNowTimeStampsSeconds(),
            deleted: false,
            deleted_at: null,
            profitable_amount: 0,
            suspended: false,
            total_bot_bet_down: 0,
            total_bot_bet_up: 0,
            total_user_bet_down: 0,
            total_user_bet_up: 0,
            round,
            chainlink_price: null,
            manipulated_closed_price: null,
            prophecy_result,
            position: null,
            bot_position: null,
        };

        await this.db.manipulationRepo.upsertDocumentData(manipulation.epoch.toString(), manipulation);
    }
}
