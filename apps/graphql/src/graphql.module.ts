import { Module } from '@nestjs/common'
import { GraphqlController } from './graphql.controller'
import { GraphqlService } from './graphql.service'

@Module({
  imports: [],
  controllers: [GraphqlController],
  providers: [GraphqlService],
})
export class GraphqlModule {}
