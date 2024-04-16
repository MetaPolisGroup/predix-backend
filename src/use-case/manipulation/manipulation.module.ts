import { Module } from '@nestjs/common';
import { ManipulationService } from './manipulation.service';
import { UserModule } from '../user/user.module';
import { ManipulationUsecases } from './manipulation.usecases';

@Module({
    providers: [ManipulationService, ManipulationUsecases],
    imports: [UserModule],
    exports: [ManipulationService, ManipulationUsecases],
})
export class ManipulationModule {}
