import { Global, Module } from '@nestjs/common';
import { HelperService } from './helper.service';

@Global()
@Module({
  providers: [HelperService],
  controllers: [],
  imports: [],
  exports: [HelperService],
})
export class HelperModule { }
