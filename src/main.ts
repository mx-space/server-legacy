import { NestFactory } from '@nestjs/core'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const options = new DocumentBuilder()
    .setTitle('API')
    .setDescription('The blog API description')
    .setVersion('1.0')
    .addTag('focus')
    .build()
  const document = SwaggerModule.createDocument(app, options)
  SwaggerModule.setup('api-docs', app, document)
  await app.listen(3003)
  console.log('http://localhost:3003/api-docs')
}
bootstrap()
