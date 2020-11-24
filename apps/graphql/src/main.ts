import { NestFactory } from '@nestjs/core'
import { GraphqlModule } from './graphql.module'

async function bootstrap() {
  const app = await NestFactory.create(GraphqlModule)
  await app.listen(3000)
}
bootstrap()
