import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { isDev } from 'shared/utils'
import { GraphqlModule } from './graphql.module'

const PORT = 2331
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(GraphqlModule)

  await app.listen(PORT, async () => {
    if (isDev) {
      Logger.debug('Server listen on ' + `http://localhost:${PORT}`)
      Logger.debug(
        'GraphQL playground listen on ' + `http://localhost:${PORT}/graphql`,
      )
    }
  })
}
bootstrap()
