// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// import * as express from 'express';
// import * as path from 'path';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   app.enableCors();

//   // ✅ Serve static files from 'uploads' directory
//   app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

//   // 🔐 Swagger config remains unchanged
//   const config = new DocumentBuilder()
//     .setTitle('CTO API')
//     .setDescription('API docs with JWT authentication')
//     .setVersion('1.0')
//     .addBearerAuth(
//       {
//         type: 'http',
//         scheme: 'bearer',
//         bearerFormat: 'JWT',
//         description: 'Enter JWT token',
//       },
//       'access-token',
//     )
//     .build();

//   const document = SwaggerModule.createDocument(app, config);
//   SwaggerModule.setup('api', app, document);

//   await app.listen(3005, '0.0.0.0');
// }
// bootstrap();


import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import * as path from 'path';
import { Server } from 'http';

let server: Server;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  const config = new DocumentBuilder()
    .setTitle('CTO API')
    .setDescription('API docs with JWT authentication')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  if (process.env.VERCEL) {
    // Don’t listen — export for Vercel
    await app.init();
    const expressApp = app.getHttpAdapter().getInstance();
    module.exports = expressApp;
  } else {
    // Normal local run
    await app.listen(3005, '0.0.0.0');
    console.log(`🚀 Server running on http://localhost:3005`);
  }
}

bootstrap();
