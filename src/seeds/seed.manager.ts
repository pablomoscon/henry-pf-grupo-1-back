import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UsersSeed } from './users/users.seed';
import { CredentialsSeed } from './credentials/credentials.seed';
import { RoomsSeed } from './rooms/rooms.seed';
import { ReservationsSeed } from './reservations/reservations.seed';
import { CatsSeed } from './cats/cats-seed';
import { ReviewsSeed } from './review/reviews-seed';
import { CaretakersSeed } from './caretakers/caretakers-seed';


@Injectable()
export class SeedManager {
  constructor(
    private readonly dataSource: DataSource,
    private readonly usersSeed: UsersSeed,
    private readonly credentialsSeed: CredentialsSeed,
    private readonly roomsSeed: RoomsSeed,
    private readonly reservationsSeed: ReservationsSeed,
    private readonly catsSeed: CatsSeed,
    private readonly reviewsSeed: ReviewsSeed,
    private readonly caretakersSeed: CaretakersSeed,


  ) {}

  async runSeeders() {
    // await this.disableForeignKeyChecks();

    try {

      await this.usersSeed.seed();
      console.log('Users seeded');

      await this.credentialsSeed.seed();
      console.log('Credentials seeded');

      await this.caretakersSeed.seed();
      console.log('Caretakers seeded');

      await this.reviewsSeed.seed();
      console.log('Reviews seeded');

      await this.roomsSeed.seed();
      console.log('Rooms seeded');
      
      await this.catsSeed.seed();
      console.log('Cats seeded');

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
