/*
 * @Author: Innei
 * @Date: 2020-05-21 11:05:42
 * @LastEditTime: 2020-06-24 20:07:45
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/main.ts
 * @Coding with Love
 */

import { NestFactory } from '@nestjs/core'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AllExceptionsFilter } from 'src/core/filters/any-exception.filter'
import { ResponseInterceptor } from 'src/core/interceptors/response.interceptors'
import { AppModule } from './app.module'
import { fastifyApp } from './core/adapt/fastify'
import { isDev } from './utils'

// import { ExtendsIoAdapter } from './core/gateway/extend.gateway'

const PORT = parseInt(process.env.PORT) || 2333
const APIVersion = 1

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyApp,
  )
  // app.useWebSocketAdapter(new ExtendsIoAdapter(app))
  app.useGlobalFilters(new AllExceptionsFilter())
  app.useGlobalInterceptors(new ResponseInterceptor())
  if (isDev) {
    app.enableCors({ origin: true, credentials: true })
  } else {
    if (1 === parseInt(process.env.CORS as any)) {
      app.enableCors({ origin: true, credentials: true })
    }
  }
  app.setGlobalPrefix(isDev ? '' : `api/v${APIVersion}`)
  if (isDev) {
    const options = new DocumentBuilder()
      .setTitle('API')
      .setDescription('The blog API description')
      .setVersion(`${APIVersion}`)
      .addSecurity('bearer', {
        type: 'http',
        scheme: 'bearer',
      })
      .addBearerAuth()
      .build()
    const document = SwaggerModule.createDocument(app, options)
    SwaggerModule.setup('api-docs', app, document)
  }

  await app.listen(PORT, '0.0.0.0', () => {
    if (isDev) {
      console.log(`http://localhost:${PORT}/api-docs`)
    }
  })
}
bootstrap()
