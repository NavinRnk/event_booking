import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { env } from '../config/env';

export const ensureDatabaseReady = async (): Promise<void> => {
  const schemaPath = path.join(__dirname, '..', '..', 'sql', 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  console.log(`[db] Connecting to MySQL at ${env.mysql.host}:${env.mysql.port} as "${env.mysql.user}"...`);

  const connection = await mysql.createConnection({
    host: env.mysql.host,
    port: env.mysql.port,
    user: env.mysql.user,
    password: env.mysql.password,
    multipleStatements: true,
  });

  try {
    console.log(`[db] Ensuring database "${env.mysql.database}" and tables exist...`);
    await connection.query(schemaSql);
    console.log(`[db] Database "${env.mysql.database}" is ready.`);
  } finally {
    await connection.end();
  }
};
