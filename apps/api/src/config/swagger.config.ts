import { DocumentBuilder } from '@nestjs/swagger';

export const SwaggerConfig = new DocumentBuilder()
  .setTitle('Chat Example API')
  .setDescription('The Chat Example API description')
  .setVersion('1.0')
  .addBearerAuth({
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    in: 'header',
  })
  .build();
