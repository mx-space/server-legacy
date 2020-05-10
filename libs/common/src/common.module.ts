import { CacheInterceptor, CacheModule, Module, Provider } from '@nestjs/common'
import * as redisStore from 'cache-manager-redis-store'
import { ConfigModule } from '@nestjs/config'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { TasksModule } from './tasks/tasks.module'
const providers: Provider<any>[] = []

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
        process.env.NODE_ENV === 'production'
          ? '.env.production'
          : '.env.development',
        '.env',
      ],
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      useFactory: () =>
        ~~process.env.REDIS === 1
          ? {
              store: redisStore,
              host: 'localhost',
              port: 6379,
            }
          : {
              ttl: 30, // seconds
              max: 100, // maximum number of items in cache
            },
    }),
    TasksModule,
  ],
  providers,
})
export class CommonModule {}
