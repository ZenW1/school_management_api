import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from './util/transform.interceptor';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security Middlewares
  app.use(helmet());
  app.enableCors();

  // Global API prefix — all routes become /api/*
  app.setGlobalPrefix('api');

  // Global Pipes & Interceptors
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Nest Review API')
    .setDescription(
      'The API description. [<a href="/api/swagger.json" target="_blank">swagger.json</a>]',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  // Swagger UI at /docs (avoids conflict with the /api global prefix)
  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: 'docs/swagger.json',
  });

  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
