import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UsersSeed } from './users/users.seed';
import { CredentialsSeed } from './credentials/credentials.seed';
import { RoomsSeed } from './rooms/rooms.seed';
import { ReservationsSeed } from './reservations/reservations.seed';

@Injectable()
export class SeedManager {
  constructor(
    private readonly dataSource: DataSource,
    private readonly usersSeed: UsersSeed,
    private readonly credentialsSeed: CredentialsSeed,
    private readonly roomsSeed: RoomsSeed,
    private readonly reservationsSeed: ReservationsSeed,
  ) {}

  async runSeeders() {
    // await this.disableForeignKeyChecks();

    try {
      await this.credentialsSeed.seed();
      console.log('Credentials seeded');

      await this.usersSeed.seed();
      console.log('Users seeded');

      await this.roomsSeed.seed();
      console.log('Rooms seeded');

      await this.reservationsSeed.seed();
      console.log('Reservations seeded');
    } catch (error) {
      console.error('Error during seeding:', error);
    } finally {
      // await this.enableForeignKeyChecks();
    }
  }

  // private async disableForeignKeyChecks() {
  //   await this.dataSource.query(`ALTER TABLE "users" DISABLE TRIGGER ALL;`);
  //   await this.dataSource.query(
  //     `ALTER TABLE "credentials" DISABLE TRIGGER ALL;`,
  //   );
  // }

  // private async enableForeignKeyChecks() {
  //   await this.dataSource.query(`ALTER TABLE "users" ENABLE TRIGGER ALL;`);
  //   await this.dataSource.query(
  //     `ALTER TABLE "credentials" ENABLE TRIGGER ALL;`,
  //   );
  // }
}
