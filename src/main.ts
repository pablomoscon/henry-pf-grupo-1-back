import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';
import { SeedManager } from './seeds/seed.manager';
import { loggerGlobal } from './middlewares/logger.middleware';
import { GlobalExceptionFilter } from './filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
  });

  app.use(loggerGlobal);
  app.useGlobalFilters(new GlobalExceptionFilter());

  setupSwagger(app);

  const seedManager = app.get(SeedManager);
  await seedManager.runSeeders();

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
