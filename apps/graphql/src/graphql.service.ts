import { Injectable } from '@nestjs/common'

@Injectable()
export class GraphqlService {
  getHello(): string {
    return 'Hello World!'
  }
}
