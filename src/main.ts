import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';
import { SeedManager } from './seeds/seed.manager';
import { loggerGlobal } from './middlewares/logger.middleware';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import * as cookieParser from 'cookie-parser';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsOptions = {
    origin: [
      'https://henry-pf-grupo-1-front-git-main-courregesdos-projects.vercel.app',
      'http://localhost:3001',
    ],
    credentials: true,
  };

  app.enableCors(corsOptions);

  app.use(cookieParser());
  app.use(loggerGlobal);
  app.useGlobalFilters(new GlobalExceptionFilter());

  setupSwagger(app);

  const seedManager = app.get(SeedManager);
  await seedManager.runSeeders();

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
