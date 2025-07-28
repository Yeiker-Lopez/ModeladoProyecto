import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
dotenv.config();
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  const rawOrigins = config.get('FRONTEND_ORIGIN') || 'http://localhost:4200';
  const allowedOrigins = rawOrigins.split(',').map(origin => origin.trim());
  const appPort = config.get('APP_PORT') || 3000;//4000;

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  await app.listen(appPort, '0.0.0.0');
}
bootstrap();
