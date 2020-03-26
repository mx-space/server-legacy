import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { AllExceptionsFilter } from 'src/core/filters/any-exception.filter'
import { ResponseInterceptor } from 'src/core/interceptors/response.interceptors'

declare const module: any

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  // const { httpAdapter } = app.get(HttpAdapterHost)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )
  app.useGlobalFilters(new AllExceptionsFilter())
  app.useGlobalInterceptors(new ResponseInterceptor())
  if (process.env.NODE_ENV !== 'production') {
    app.enableCors()
  } else {
    app.setGlobalPrefix('api')
  }

  const options = new DocumentBuilder()
    .setTitle('API')
    .setDescription('The blog API description')
    .setVersion('1.0')
    .addSecurity('bearer', {
      type: 'http',
      scheme: 'bearer',
    })
    .build()
  const document = SwaggerModule.createDocument(app, options)
  SwaggerModule.setup('api-docs', app, document)

  await app.listen(3003)

  if (module.hot) {
    module.hot.accept()
    module.hot.dispose(() => app.close())
  }
  console.log('http://localhost:3003/api-docs')
}
bootstrap()
