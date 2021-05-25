/*
 * @Author: Innei
 * @Date: 2020-05-12 15:52:01
 * @LastEditTime: 2021-01-15 14:54:28
 * @LastEditors: Innei
 * @FilePath: /server/apps/server/src/app.module.ts
 * @MIT
 */

import { CommonModule } from '@libs/common'
import { DbModule } from '@libs/db'
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  Provider,
  RequestMethod,
  ValidationPipe,
} from '@nestjs/common'
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { GatewayModule } from 'apps/server/src/gateway/gateway.module'
import { JSONSerializeInterceptor } from 'core/interceptors/response.interceptors'
import { RedisModule } from 'nestjs-redis'
import { SpiderGuard } from 'shared/core/guards/spider.guard'
import { isDev } from 'utils/index'

import { AnalyzeMiddleware } from '../../../shared/core/middlewares/analyze.middleware'
import { SkipBrowserDefaultRequestMiddleware } from '../../../shared/core/middlewares/favicon.middleware'
import { SecurityMiddleware } from '../../../shared/core/middlewares/security.middleware'
import { GlobalModule } from '../../../shared/global/global.module'
import { AppController } from './app.controller'
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
        errorHttpStatusCode: 422,
        forbidUnknownValues: true,
        enableDebugMessages: isDev,
        stopAtFirstError: true
      })
    },
  },
  {
    provide: APP_INTERCEPTOR,
    useClass: JSONSerializeInterceptor,
  },
]

if (process.env.NODE_ENV === 'production') {
  providers.push({
    provide: APP_GUARD,
    useClass: SpiderGuard,
  })
}

@Module({
  imports: [
    CommonModule,
    DbModule,
    GatewayModule,
    AuthModule,
    MasterModule,
    SharedModule,
    GlobalModule,
    RedisModule,
  ],
  providers,
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AnalyzeMiddleware)
      .forRoutes({ path: '(.*?)', method: RequestMethod.GET })
      .apply(SkipBrowserDefaultRequestMiddleware, SecurityMiddleware)
      .forRoutes({ path: '(.*?)', method: RequestMethod.ALL })
  }
}
