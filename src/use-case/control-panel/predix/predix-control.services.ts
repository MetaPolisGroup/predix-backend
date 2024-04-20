import { Injectable } from '@nestjs/common';
import { HelperService } from 'src/use-case/helper/helper.service';
import { PreferenceService } from 'src/use-case/preference/preference.service';

@Injectable()
export class PredixControlService {
    constructor(
        private readonly helper: HelperService,
        private readonly preference: PreferenceService,
    ) {}

    async PredixEnable() {
        const d = await this.preference.getPredixPreference();
        return !d.manual_paused;
    }

    InPlayTime(from: number, to: number) {
        const fromTs = this.helper.getToDayTimestampAtHourInSeconds(from);
        const toTs = this.helper.getToDayTimestampAtHourInSeconds(to);
        const now = this.helper.getNowTimeStampsSeconds();

        if (now >= fromTs && now <= toTs) {
            return true;
        }

        return false;
    }
}
