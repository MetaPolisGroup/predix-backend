import { Injectable } from '@nestjs/common';
import constant from 'src/configuration';
import { IDataServices } from 'src/core/abstract/data-services/data-service.abstract';
import { BotPreferences } from 'src/core/entity/preferences.entity';

@Injectable()
export class PreferenceService {
    constructor(private readonly db: IDataServices) {}

    async getPredixPreference() {
        return this.db.preferenceRepo.getDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE.PREDICTION);
    }

    async getDicePreference() {
        return this.db.preferenceRepo.getDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE.DICE);
    }

    async getMarketPreference() {
        return this.db.preferenceRepo.getDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE.MARKET);
    }

    async getPredixBotProfitPreference() {
        const preference = await this._getPredixBotProfitPreference();

        if (!preference) {
            return this._createPredixBotProfitPreference();
        }

        return preference;
    }

    private async _createPredixBotProfitPreference() {
        const preference: BotPreferences = {
            paused: false,
            max_profit_percent: 5,
            min_profit_percent: -10,
            span_unit: 'day',
        };

        return this.db.botPreferenceRepo.upsertDocumentData(
            constant.FIREBASE.DOCUMENT.PREFERENCE.PREDIX_BOT,
            preference,
        );
    }

    private async _getPredixBotProfitPreference() {
        return this.db.botPreferenceRepo.getDocumentData(constant.FIREBASE.DOCUMENT.PREFERENCE.PREDIX_BOT);
    }
}
