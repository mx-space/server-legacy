import { DbModule } from '@libs/db'
import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { ConfigsModule } from 'apps/server/src/common/global/configs/configs.module'
import { GlobalModule } from 'apps/server/src/common/global/global.module'
import { isDev } from 'apps/server/src/utils'

import { SharedModule } from './shared/shared.module'

@Module({
  imports: [
    ConfigsModule,
    DbModule,
    GlobalModule,
    GraphQLModule.forRoot({
      debug: isDev,
      playground: isDev,
      autoSchemaFile: 'schema.gql',
      // installSubscriptionHandlers: true,
      context: ({ req }) => ({ req }),
      // typePaths: ['./**/*.gql'],
      // autoSchemaFile: true,
    }),
    SharedModule,
  ],

  controllers: [],
  providers: [],
})
export class GraphqlModule {}
