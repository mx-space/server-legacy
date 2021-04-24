/*
 * @Author: Innei
 * @Date: 2020-05-08 17:02:08
 * @LastEditTime: 2021-03-21 19:31:13
 * @LastEditors: Innei
 * @FilePath: /server/libs/common/src/common.module.ts
 * @Coding with Love
 */

import { CacheModule, Module, Provider } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_INTERCEPTOR } from '@nestjs/core'
import * as redisStore from 'cache-manager-redis-store'
import { HttpCacheInterceptor } from 'core/interceptors/http-cache.interceptors'
import { RedisModule } from 'nestjs-redis'
import { RedisNames } from './redis/redis.types'
import { TasksModule } from './tasks/tasks.module'

const providers: Provider<any>[] = []

const CacheProvider = {
  provide: APP_INTERCEPTOR,
  useClass: HttpCacheInterceptor,
}

if (process.env.NODE_ENV === 'production') {
  providers.push(CacheProvider)
}

const CacheModuleDynamic = CacheModule.registerAsync({
  useFactory: () => ({
    store: redisStore,
    host: 'localhost',
    port: 6379,
    ttl: 30,
    max: 300,
  }),
})
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
    CacheModuleDynamic,
    RedisModule.register([
      {
        name: RedisNames.Access,
        keyPrefix: 'mx_access_',
      },
      {
        name: RedisNames.Like,
        keyPrefix: 'mx_like_',
      },
      {
        name: RedisNames.Read,
        keyPrefix: 'mx_read_',
      },
      {
        name: RedisNames.LoginRecord,
        keyPrefix: 'mx_' + RedisNames.LoginRecord + '_',
      },
      { name: RedisNames.MaxOnlineCount, keyPrefix: 'mx_count' },
      // { name: RedisNames.LikeThisSite, keyPrefix: 'mx_like_site' },
    ]),
    TasksModule,
  ],
  providers,
  exports: [CacheModuleDynamic],
})
export class CommonModule {}
