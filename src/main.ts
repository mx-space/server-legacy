import { NestFactory } from '@nestjs/core'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AllExceptionsFilter } from 'src/core/filters/any-exception.filter'
import { ResponseInterceptor } from 'src/core/interceptors/response.interceptors'
import { AppModule } from './app.module'
import * as FastifyMultipart from 'fastify-multipart'
import { ExtendsIoAdapter } from './core/gateway/extend.gateway'

const PORT = parseInt(process.env.PORT) || 3003
const APIVersion = 1
const isDev = process.env.NODE_ENV === 'development'

async function bootstrap() {
  const fAdapt = new FastifyAdapter({ logger: isDev ? true : false })
  fAdapt.register(FastifyMultipart, {
    addToBody: true,
    limits: {
      fields: 10, // Max number of non-file fields
      fileSize: 1024 * 1024 * 6, // limit size 6M
      files: 5, // Max number of file fields
    },
  })
  fAdapt.register(require('fastify-cookie'), {
    secret: 'asdasdasdasdsadsaxsaxassdasdqwdasdxczardja', // for cookies signature
    parseOptions: {}, // options for parsing cookies
  })
  fAdapt.register(require('fastify-session'), {
    cookieName: 'mx-space',
    secret: 'asdasdasdasdsadsaxsaxassdasdqwdasdxczardja',
    cookie: { secure: false },
    expires: 84000,
  })

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fAdapt,
  )
  app.useWebSocketAdapter(new ExtendsIoAdapter(app))
  app.useGlobalFilters(new AllExceptionsFilter())
  app.useGlobalInterceptors(new ResponseInterceptor())
  if (isDev) {
    app.enableCors({ credentials: true })
  } else {
    if (1 === parseInt(process.env.CORS as any)) {
      app.enableCors({ credentials: true })
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
    console.log(`http://localhost:${PORT}/api-docs`)
  }

  await app.listen(PORT, '0.0.0.0')
}
bootstrap()
