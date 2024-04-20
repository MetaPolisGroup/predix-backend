import { Injectable } from '@nestjs/common';
import { PreferenceService } from 'src/use-case/preference/preference.service';

@Injectable()
export class PredixBotControlService {
    constructor(private readonly preference: PreferenceService) {}

    async PredixBotEnable() {
        const preference = await this.preference.getPredixBotProfitPreference();

        return !preference.pause;
    }
}
