import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Automatically remove properties not defined in DTO
    forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are provided
    transform: true, // Automatically transform payloads to DTO instances
  }));
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI })
  app.use(cookieParser());
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT');
  // console.log(`Server running on http://localhost:${port}`);
  await app.listen(port);
}
bootstrap();
