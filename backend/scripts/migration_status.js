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

async function run() {
  const pool = await sql.connect(config);
  try {
    const exists = await pool
      .request()
      .query(`SELECT * FROM sysobjects WHERE name='schema_migrations' AND xtype='U'`);
    const executed = new Set();
    if (exists.recordset.length > 0) {
      const result = await pool.request().query('SELECT name FROM schema_migrations');
      result.recordset.forEach((row) => executed.add(row.name));
    }

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    files.forEach((file) => {
      console.log(`${executed.has(file) ? '[x]' : '[ ]'} ${file}`);
    });
  } finally {
    await pool.close();
  }
}

run().catch((err) => {
  console.error('Migration status error:', err.message);
  process.exit(1);
});
