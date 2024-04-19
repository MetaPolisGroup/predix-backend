import { Injectable } from '@nestjs/common';

@Injectable()
export class PredixBotControlService {
    constructor() {}

    PredixBotEnable() {
        return process.env.CONSTANT_BOT === 'True';
    }
}
