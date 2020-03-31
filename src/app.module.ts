import { DbModule } from '@libs/db'
import {
  CacheInterceptor,
  CacheModule,
  Module,
  ValidationPipe,
  Provider,
} from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { AuthModule } from './auth/auth.module'
import { MasterModule } from './master/master.module'
import { SharedModule } from './shared/shared.module'
import { GatewayModule } from 'src/gateway/gateway.module'

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

const CacheProvider = {
  provide: APP_INTERCEPTOR,
  useClass: CacheInterceptor,
}
if (process.env.NODE_ENV === 'production') {
  providers.push(CacheProvider)
}

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
    CacheModule.register({
      ttl: 30, // seconds
      max: 100, // maximum number of items in cache
    }),
    DbModule,
    GatewayModule,
    AuthModule,
    MasterModule,
    SharedModule,
  ],
  providers,
})
export class AppModule {}
