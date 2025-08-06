import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  const rawOrigins = config.get('FRONTEND_ORIGIN') || 'http://localhost:4200';
  const allowedOrigins = rawOrigins.split(',').map(origin => origin.trim());
  const appPort = config.get('APP_PORT') || 3000;

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Swagger setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Documentación API')
    .setDescription('Swagger generado automáticamente por NestJS')
    .setVersion('1.0')
    .addBearerAuth() // si usas autenticación con JWT
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document); // Ruta: http://localhost:3000/api

  await app.listen(appPort, '0.0.0.0');
}
bootstrap();
