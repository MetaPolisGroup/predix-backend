import { Global, Module } from '@nestjs/common';
import { FirestoreModule } from 'src/framework/firestore/firestore.module';
@Global()
@Module({
  imports: [FirestoreModule],
  exports: [FirestoreModule],
})
export class DataServicesModule {}
