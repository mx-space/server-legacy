import { CommonModule } from '@libs/common'
import { DbModule } from '@libs/db'
import { Module, Provider, ValidationPipe } from '@nestjs/common'
import { APP_PIPE } from '@nestjs/core'
import { GatewayModule } from 'src/gateway/gateway.module'
import { AuthModule } from './auth/auth.module'
import { MasterModule } from './master/master.module'
import { SharedModule } from './shared/shared.module'

const providers: Provider<any>[] = [
  {
    provide: APP_PIPE,
    useFactory: () => {
      return new ValidationPipe({
        transform: true,
        whitelist: true,
        // errorHttpStatusCode: 422,
        // exceptionFactory: errors => new BadRequestException(errors),
      })
    },
  },
]

@Module({
  imports: [
    CommonModule,
    DbModule,
    GatewayModule,
    AuthModule,
    MasterModule,
    SharedModule,
  ],
  providers,
})
export class AppModule {}
