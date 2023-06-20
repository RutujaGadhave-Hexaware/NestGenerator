import { initializeOpentelemtry } from './tracing';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  if(process.env.IS_OTEL_ENABLED == 'true'){
    initializeOpentelemtry(process.env.COMPONENT_NAME, process.env.OTEL_COLLECTOR_URL);
  }
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  const config = new DocumentBuilder()
    .setTitle(process.env.COMPONENT_NAME)
    .setDescription(process.env.COMPONENT_DESCRIPTION)
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(3000);
}
bootstrap();
