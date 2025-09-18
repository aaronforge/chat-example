import { AsyncApiDocumentBuilder } from 'nestjs-asyncapi';

export const AsyncApiConfig = new AsyncApiDocumentBuilder()
  .setTitle('Chat Example WS API')
  .setDescription('The Chat Example API description')
  .setVersion('1.0')
  .setDefaultContentType('application/json')
  .addServer('local', {
    url: 'ws://localhost:3000',
    protocol: 'ws',
    description: 'Local',
    security: [{ bearerAuth: [] }],
  })
  .addSecurity('bearerAuth', {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  })
  .build();
