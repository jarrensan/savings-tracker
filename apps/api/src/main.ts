import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger OpenAPI documentation
  const config = new DocumentBuilder()
    .setTitle('Savings Tracker API')
    .setDescription('Personal Finance & Savings Tracker API with Onion Architecture')
    .setVersion('1.0')
    .addTag('transactions')
    .addTag('accounts')
    .addTag('analytics')
    .addTag('webhooks')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Savings Tracker API running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation on: http://localhost:${port}/api/docs`);
}

bootstrap();
