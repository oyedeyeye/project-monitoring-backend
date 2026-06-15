import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Hardening: Enable Helmet for secure HTTP headers
  app.use(helmet());

  app.enableCors({
    origin: [
      'https://project-monitoring-dashboard-nhvra7pvj.vercel.app/',
      'https://project-monitoring-dashboard-hazel.vercel.app',
      'http://localhost:5173', // Keep local dev access if needed
      'http://localhost:3000'
    ],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Accept,Authorization,X-Requested-With',
    // preflightContinue: false,
    // optionsSuccessStatus: 204,
  });

  // Critical: Global Validation Pipe to prevent Mass Assignment
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Hardening: Limit body payload size to prevent DoS
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ limit: '1mb', extended: true }));

  const config = new DocumentBuilder()
    .setTitle('PPMIU Analytics API')
    .setDescription('The PPMIU Analytics API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
