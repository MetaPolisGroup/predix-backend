import { Injectable } from '@nestjs/common';
import { HelperService } from 'src/use-case/helper/helper.service';

@Injectable()
export class PredixControlService {
    constructor(private readonly helper: HelperService) {}

    PredixEnable() {
        return process.env.CONSTANT_ENABLE === 'True';
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
