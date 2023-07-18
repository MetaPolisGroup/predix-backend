import { Global, Module } from '@nestjs/common';
import { FirestoreModule } from 'src/frameworks/firestore/firestore.module';
@Global()
@Module({
  imports: [FirestoreModule],
  exports: [FirestoreModule],
})
export class DataServicesModule {}
