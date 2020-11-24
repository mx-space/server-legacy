import { Controller, Get } from '@nestjs/common'
import { GraphqlService } from './graphql.service'

@Controller()
export class GraphqlController {
  constructor(private readonly graphqlService: GraphqlService) {}

  @Get()
  getHello(): string {
    return this.graphqlService.getHello()
  }
}
