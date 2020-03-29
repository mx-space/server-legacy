import { DbModule } from '@libs/db'
import { Module, ValidationPipe } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_PIPE } from '@nestjs/core'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { MasterController } from './master/master.controller'
import { MasterModule } from './master/master.module'
import { SharedModule } from './shared/shared.module'
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [
        '.env.development.local',
        '.env.development',
        '.env',
        '.env.production',
      ],
      isGlobal: true,
    }),
    DbModule,
    AuthModule,
    MasterModule,
    SharedModule,
  ],
  controllers: [MasterController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useFactory: () => {
        return new ValidationPipe({
          transform: true,
          whitelist: true,
          // exceptionFactory: errors => new BadRequestException(errors),
        })
      },
    },
  ],
})
export class AppModule {}
