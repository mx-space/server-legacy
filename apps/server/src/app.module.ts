/*
 * @Author: Innei
 * @Date: 2020-05-12 15:52:01
 * @LastEditTime: 2020-10-08 14:06:10
 * @LastEditors: Innei
 * @FilePath: /server/src/app.module.ts
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
import { APP_GUARD, APP_PIPE } from '@nestjs/core'
import { join } from 'path'
import { SpiderGuard } from 'apps/server/src/core/guards/spider.guard'
import { GatewayModule } from 'apps/server/src/gateway/gateway.module'
import { AppController } from './app.controller'
import { AuthModule } from './auth/auth.module'
import { GlobalModule } from './common/global/global.module'
import { AnalyzeMiddleware } from './core/middlewares/analyze.middleware'
import { SkipBrowserDefaultRequestMiddleware } from './core/middlewares/favicon.middleware'
import { SecurityMiddleware } from './core/middlewares/security.middleware'
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
      })
    },
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
