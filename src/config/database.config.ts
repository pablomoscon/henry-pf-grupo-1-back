import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { registerAs } from '@nestjs/config';

dotenv.config({
  path: '.env.development.local',
});

const isLocal = process.env.POSTGRES_CONNECTION === 'local';

const PostgresDatabaseOptions: DataSourceOptions = isLocal
  ? {
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT, 10),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    synchronize: true,
    dropSchema: true,
    logging: false,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../**/migrations/*{.ts,.js}'],
    subscribers: [],
    ssl: false,
  }
  : {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: true,
    dropSchema: false,
    logging: false,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../**/migrations/*{.ts,.js}'],
    subscribers: [],
    ssl: { rejectUnauthorized: false },
  };


export const databaseConfig = registerAs(
  'databaseConfig',
  () => PostgresDatabaseOptions,
);

export const PostgresDatabase = new DataSource(PostgresDatabaseOptions);
