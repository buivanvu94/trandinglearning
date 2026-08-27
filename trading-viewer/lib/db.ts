import mysql from 'mysql2/promise';

interface GlobalWithDb {
  mysqlPool?: mysql.Pool;
}

const globalForDb = global as unknown as GlobalWithDb;

function getPoolConfig(): mysql.PoolOptions {
  return {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'trading_db',
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    charset: 'utf8mb4',
  };
}

export const pool: mysql.Pool =
  globalForDb.mysqlPool ?? mysql.createPool(getPoolConfig());

if (process.env.NODE_ENV !== 'production') {
  globalForDb.mysqlPool = pool;
}

export type DbParam =
  | string
  | number
  | boolean
  | Date
  | null
  | Buffer
  | bigint;

function sanitizeValues(values?: unknown[]): DbParam[] | undefined {
  if (!values) return undefined;
  return values.map((v) => (v === undefined ? null : (v as DbParam)));
}

export async function query<T>(
  sql: string,
  values?: unknown[]
): Promise<T> {
  const sanitized = sanitizeValues(values);
  const result = await pool.query(sql, sanitized);
  const rows = result[0];
  return rows as unknown as T;
}

export async function execute(
  sql: string,
  values?: unknown[]
): Promise<mysql.ResultSetHeader> {
  const sanitized = sanitizeValues(values);
  const result = await pool.execute(sql, sanitized);
  const header = result[0] as mysql.ResultSetHeader;
  return header;
}

export async function withTransaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
