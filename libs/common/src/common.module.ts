import { CacheInterceptor, CacheModule, Module, Provider } from '@nestjs/common'
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
    TasksModule,
  ],
  providers,
})
export class CommonModule {}
