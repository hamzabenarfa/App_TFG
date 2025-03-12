import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { MailerModule } from './mailer/mailer.module';
import { APP_GUARD } from '@nestjs/core';
import { ActiveUserGuard, AtGuard } from './common/guards';
import { UserModule } from './user/user.module';
import { DeliveryModule } from './delivery/delivery.module';
import { TruckModule } from './truck/truck.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    MailerModule,
    UserModule,
    DeliveryModule,
    TruckModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ActiveUserGuard,
    },
  ],
})
export class AppModule {}
