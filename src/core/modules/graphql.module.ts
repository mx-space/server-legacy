/*
 * @Author: Innei
 * @Date: 2020-09-09 13:58:08
 * @LastEditTime: 2020-09-09 16:00:07
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/core/modules/graphql.module.ts
 * @Mark: Coding with Love
 */
import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { ConfigsService } from 'src/common/global'
import { SCHEMA_GQL_FILE_NAME } from 'src/utils/constants'
@Module({
  imports: [
    GraphQLModule.forRootAsync({
      inject: [ConfigsService],
      useFactory: async (configService: ConfigsService) => {
        const isDev = configService.isDev

        return {
          debug: isDev,
          playground: isDev,
          installSubscriptionHandlers: true,
          autoSchemaFile: SCHEMA_GQL_FILE_NAME,
        }
      },
    }),
  ],
})
export class GraphModule {}
