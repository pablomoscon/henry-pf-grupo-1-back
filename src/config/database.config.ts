import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { registerAs } from '@nestjs/config';

dotenv.config({
  path: '.env.development.local',
});

const isLocal = process.env.POSTGRES_CONNECTION === 'local';

const PostgresDatabaseOptions: DataSourceOptions = {
  type: 'postgres',
  host: isLocal ? process.env.POSTGRES_HOST : process.env.POSTGRES_DEPLOY_HOST,
  port: parseInt(
    isLocal ? process.env.POSTGRES_PORT : process.env.POSTGRES_DEPLOY_PORT,
    10,
  ),
  username: isLocal
    ? process.env.POSTGRES_USER
    : process.env.POSTGRES_DEPLOY_USER,
  password: isLocal
    ? process.env.POSTGRES_PASSWORD
    : process.env.POSTGRES_DEPLOY_PASSWORD,
  database: isLocal ? process.env.POSTGRES_DB : process.env.POSTGRES_DEPLOY_DB,
  synchronize: true,
  dropSchema: true,
  logging: false,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../**/migrations/*{.ts,.js}'],
  subscribers: [],
  ssl: isLocal ? false : { rejectUnauthorized: false },
};

export const databaseConfig = registerAs(
  'databaseConfig',
  () => PostgresDatabaseOptions,
);

export const PostgresDatabase = new DataSource(PostgresDatabaseOptions);
