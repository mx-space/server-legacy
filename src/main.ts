import { NestFactory } from '@nestjs/core'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { WsAdapter } from '@nestjs/platform-ws'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AllExceptionsFilter } from 'src/core/filters/any-exception.filter'
import { ResponseInterceptor } from 'src/core/interceptors/response.interceptors'
import { AppModule } from './app.module'
import * as FastifyMultipart from 'fastify-multipart'

async function bootstrap() {
  const fAdapt = new FastifyAdapter({ logger: true })
  fAdapt.register(FastifyMultipart, {
    addToBody: true,
    limits: {
      fields: 10, // Max number of non-file fields
      fileSize: 1024 * 1024 * 6, // limit size 6M
      files: 5, // Max number of file fields
    },
  })

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fAdapt,
  )

  app.useWebSocketAdapter(new WsAdapter(app))
  app.useGlobalFilters(new AllExceptionsFilter())
  app.useGlobalInterceptors(new ResponseInterceptor())
  if (process.env.NODE_ENV !== 'production') {
    app.enableCors({ credentials: true })
  } else {
    if (1 === parseInt(process.env.CORS as any)) {
      app.enableCors({ credentials: true })
    }
    app.setGlobalPrefix('api/v1')
  }

  const options = new DocumentBuilder()
    .setTitle('API')
    .setDescription('The blog API description')
    .setVersion('1.0')
    .addSecurity('bearer', {
      type: 'http',
      scheme: 'bearer',
    })
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, options)
  SwaggerModule.setup('api-docs', app, document)

  const PORT = parseInt(process.env.PORT) || 3003
  await app.listen(PORT, '0.0.0.0')

  console.log(`http://localhost:${PORT}/api-docs`)
}
bootstrap()
