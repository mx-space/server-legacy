import { CommonModule } from '@libs/common'
import { DbModule } from '@libs/db'
import { Module, Provider, ValidationPipe } from '@nestjs/common'
import { APP_PIPE, APP_GUARD } from '@nestjs/core'
import { GatewayModule } from 'src/gateway/gateway.module'
import { AuthModule } from './auth/auth.module'
import { MasterModule } from './master/master.module'
import { SharedModule } from './shared/shared.module'
import { SpiderGuard } from 'src/core/guards/spider.guard'
import { ConfigsModule } from './configs/configs.module'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
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
    ConfigsModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'admin'),
      renderPath: '/admin',
    }),
  ],
  providers,
})
export class AppModule {}
