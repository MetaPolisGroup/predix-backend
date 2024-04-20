import { Module } from '@nestjs/common';
import { PredixControlService } from './predix/predix-control.services';
import { PredixBotControlService } from './predix/predix-bot-control.service';
import { PreferenceModule } from '../preference/preference.module';

@Module({
    imports: [PreferenceModule],
    providers: [PredixControlService, PredixBotControlService],
    exports: [PredixControlService, PredixBotControlService],
})
export class ControlPanelModule {}
