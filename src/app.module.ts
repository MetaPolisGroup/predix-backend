import { ConfigurableModuleBuilder, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './use-case/user/user.module';
import { AuthModule } from './use-case/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    UserModule,
    AuthModule,
    MongooseModule.forRoot(process.env.MONGO_DB_HOST, {}),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
