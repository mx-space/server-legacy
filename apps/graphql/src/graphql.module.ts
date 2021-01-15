/*
 * @Author: Innei
 * @Date: 2020-11-24 16:20:37
 * @LastEditTime: 2021-01-15 13:48:39
 * @LastEditors: Innei
 * @FilePath: /server/apps/graphql/src/graphql.module.ts
 * @Mark: Coding with Love
 */
import { DbModule } from '@libs/db'
import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { ConfigsModule } from 'shared/global/configs/configs.module'
import { GlobalModule } from 'shared/global/global.module'
import { isDev } from 'shared/utils'
import { RootController } from './root.controller'

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

  controllers: [RootController],
  providers: [],
})
export class GraphqlModule {}
