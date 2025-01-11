import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';
import { UsersSeed } from './seeds/users/users.seed';
import { RoomsSeed } from './seeds/rooms/rooms.seed';
import { ReservationsSeed } from './seeds/reservations/reservations.seed';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setupSwagger(app);

  const usersSeed = app.get(UsersSeed);
  await usersSeed.seed();
  console.log('users seeded');

  const roomsSeed = app.get(RoomsSeed);
  await roomsSeed.seed();
  console.log('rooms seeded');

  const reservationsSeed = app.get(ReservationsSeed);
  await reservationsSeed.seed();
  console.log('reservations seeded');

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
