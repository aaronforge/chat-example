import 'source-map-support/register';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './module/app/app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { SwaggerConfig } from './config/swagger.config';
import { VersioningType } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filter/http-exception.filter';
import { ValidationConfig } from './config/validation.config';
import { AsyncApiModule } from 'nestjs-asyncapi';
import { AsyncApiConfig } from './config/async-api.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 전역 파이프
  app.useGlobalPipes(ValidationConfig);

  // 전역 필터
  app.useGlobalFilters(new HttpExceptionFilter());

  // 버저닝
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Swagger
  const documentFactory = () =>
    SwaggerModule.createDocument(app, SwaggerConfig);

  SwaggerModule.setup('docs', app, documentFactory, {
    jsonDocumentUrl: 'docs-json',
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // AsyncAPI
  const asyncApiDoc = AsyncApiModule.createDocument(app, AsyncApiConfig);
  await AsyncApiModule.setup('/asyncapi', app, asyncApiDoc);

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
