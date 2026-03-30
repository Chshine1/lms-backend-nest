import { DataSource, DataSourceOptions } from 'typeorm';

const options: DataSourceOptions = {
  type: 'postgres',
  host: process.env['DB_HOST'] || 'localhost',
  port: 5432,
  username: 'lms',
  password: 'lms',
  database: 'lms',
  entities: ['apps/*/src/entities/**/*.entity.ts'],
  migrations: ['migrations/*.ts'],
  synchronize: false,
};

// noinspection JSUnusedGlobalSymbols
export default new DataSource(options);
