const sql = require('mssql');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const config = {
  server: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 1433,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
  },
};

const MIGRATIONS_DIR = path.join(__dirname, '../migrations');

async function ensureDatabaseExists() {
  const masterPool = await sql.connect({ ...config, database: 'master' });
  try {
    await masterPool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = '${config.database}')
      CREATE DATABASE [${config.database}];
    `);
  } finally {
    await masterPool.close();
  }
}

async function ensureMigrationsTable(pool) {
  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='schema_migrations' AND xtype='U')
    CREATE TABLE schema_migrations (
      id INT IDENTITY(1,1) PRIMARY KEY,
      name NVARCHAR(255) NOT NULL UNIQUE,
      executed_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
  `);
}

async function getExecutedMigrations(pool) {
  const result = await pool.request().query('SELECT name FROM schema_migrations');
  return new Set(result.recordset.map((row) => row.name));
}

function splitStatements(sqlText) {
  return sqlText
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n')
    .split(/;\s*(?:\r?\n|$)/)
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);
}

async function run() {
  await ensureDatabaseExists();
  const pool = await sql.connect(config);
  try {
    await ensureMigrationsTable(pool);
    const executed = await getExecutedMigrations(pool);

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    for (const file of files) {
      if (executed.has(file)) {
        console.log(`SKIP  ${file} (already executed)`);
        continue;
      }

      const filePath = path.join(MIGRATIONS_DIR, file);
      const statements = splitStatements(fs.readFileSync(filePath, 'utf8'));

      const transaction = new sql.Transaction(pool);
      await transaction.begin();
      try {
        for (const statement of statements) {
          await new sql.Request(transaction).query(statement);
        }
        await new sql.Request(transaction).query(
          `INSERT INTO schema_migrations (name) VALUES ('${file.replace(/'/g, "''")}')`,
        );
        await transaction.commit();
        console.log(`OK    ${file}`);
      } catch (err) {
        await transaction.rollback();
        console.error(`FAIL  ${file}:`, err.message);
        process.exit(1);
      }
    }

    console.log('Migrations complete.');
  } finally {
    await pool.close();
  }
}

run().catch((err) => {
  console.error('Migration runner error:', err.message);
  process.exit(1);
});
