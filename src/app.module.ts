import { DbModule } from '@libs/db'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { MasterController } from './master/master.controller'
import { MasterModule } from './master/master.module'
import { PostsModule } from './posts/posts.module'
import { SharedModule } from './shared/shared.module';
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
    PostsModule,
    SharedModule,
  ],
  controllers: [MasterController],
  providers: [AppService],
})
export class AppModule {}
