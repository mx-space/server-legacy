import { Module } from '@nestjs/common'
import { AppService } from './app.service'
import { DbModule } from '@libs/db'
import { MasterController } from './master/master.controller'
import { MasterModule } from './master/master.module'
import { ConfigModule } from '@nestjs/config'
import { PostsModule } from './posts/posts.module'
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
    MasterModule,
    PostsModule,
  ],
  controllers: [MasterController],
  providers: [AppService],
})
export class AppModule {}
