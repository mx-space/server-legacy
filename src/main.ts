import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { AllExceptionsFilter } from './filters/any-exception.filter'
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
  console.log('http://localhost:3003/api-docs')
}
bootstrap()
