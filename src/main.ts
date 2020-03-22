import { NestFactory } from '@nestjs/core'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )
  if (process.env.NODE_ENV !== 'production') {
    app.enableCors()
  } else {
    app.setGlobalPrefix('api')
  }

  const options = new DocumentBuilder()
    .setTitle('API')
    .setDescription('The blog API description')
    .setVersion('1.0')
    .build()
  const document = SwaggerModule.createDocument(app, options)
  SwaggerModule.setup('api-docs', app, document)

  await app.listen(3003)
  console.log('http://localhost:3003/api-docs')
}
bootstrap()
