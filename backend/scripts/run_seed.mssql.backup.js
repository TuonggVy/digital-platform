const sql = require('mssql');
const bcrypt = require('bcrypt');
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

// Fresh DB — IDs are our own choice (not inherited from V-Track's unverified 14/20/21/22 magic numbers).
const STATUSES = [
  { id: 1, code: 'ACTIVE', name: 'Active' },
  { id: 2, code: 'INACTIVE', name: 'Inactive' },
  { id: 3, code: 'PENDING', name: 'Pending' },
  { id: 4, code: 'DELETED', name: 'Deleted' },
];

const ROLES = [
  { code: 'ADMIN', name: 'Administrator' },
  { code: 'STAFF', name: 'Staff' },
  { code: 'CUSTOMER', name: 'Customer' },
];

// Codes match the FE's ProductCategory literals ('cloud' | 'kaspersky' | 'esim') exactly,
// so query params from the FE map directly onto categories.code with no translation layer.
const CATEGORIES = [
  { code: 'cloud', slug: 'cloud', name: { vi: 'Cloud', en: 'Cloud' } },
  { code: 'kaspersky', slug: 'kaspersky', name: { vi: 'Kaspersky', en: 'Kaspersky' } },
  { code: 'esim', slug: 'esim', name: { vi: 'eSIM', en: 'eSIM' } },
];

const ADMIN_ACCOUNT = {
  fullName: 'System Administrator',
  email: 'admin@digital-platform.local',
  password: 'Admin@123',
};

async function seedStatuses(pool) {
  const existing = await pool.request().query('SELECT code FROM status');
  const existingCodes = new Set(existing.recordset.map((r) => r.code));
  const pending = STATUSES.filter((status) => !existingCodes.has(status.code));
  if (pending.length === 0) return;

  // Table is expected to be empty on first seed, so IDENTITY auto-assigns
  // 1..4 in insertion order — matching STATUS_CODE in common/utils/constant.ts
  // without fighting the connection-pool/session scoping of IDENTITY_INSERT.
  if (existingCodes.size > 0) {
    throw new Error(
      'status table already has rows but is missing some seed codes — resolve IDs manually before reseeding.',
    );
  }
  for (const status of pending) {
    await pool
      .request()
      .input('code', sql.NVarChar, status.code)
      .input('name', sql.NVarChar, status.name)
      .query('INSERT INTO status (code, name) VALUES (@code, @name)');
    console.log(`status seeded: ${status.code}`);
  }
}

async function seedRoles(pool) {
  const existing = await pool.request().query('SELECT code FROM roles');
  const existingCodes = new Set(existing.recordset.map((r) => r.code));

  for (const role of ROLES) {
    if (existingCodes.has(role.code)) continue;
    await pool
      .request()
      .input('code', sql.NVarChar, role.code)
      .input('name', sql.NVarChar, role.name)
      .query('INSERT INTO roles (code, name) VALUES (@code, @name)');
    console.log(`role seeded: ${role.code}`);
  }
}

async function seedCategories(pool) {
  const activeStatus = await pool.request().query(`SELECT id FROM status WHERE code = 'ACTIVE'`);
  const activeStatusId = activeStatus.recordset[0].id;

  const existing = await pool.request().query('SELECT code FROM categories');
  const existingCodes = new Set(existing.recordset.map((r) => r.code));

  for (const category of CATEGORIES) {
    if (existingCodes.has(category.code)) continue;
    await pool
      .request()
      .input('name', sql.NVarChar, JSON.stringify(category.name))
      .input('slug', sql.NVarChar, category.slug)
      .input('code', sql.NVarChar, category.code)
      .input('statusId', sql.Int, activeStatusId)
      .query(
        'INSERT INTO categories (name, slug, code, status_id) VALUES (@name, @slug, @code, @statusId)',
      );
    console.log(`category seeded: ${category.code}`);
  }
}

async function seedAdmin(pool) {
  const existing = await pool
    .request()
    .input('email', sql.NVarChar, ADMIN_ACCOUNT.email)
    .query('SELECT id FROM users WHERE email = @email');
  if (existing.recordset.length > 0) {
    console.log('admin user already exists, skipping');
    return;
  }

  const adminRole = await pool.request().query(`SELECT id FROM roles WHERE code = 'ADMIN'`);
  const activeStatus = await pool.request().query(`SELECT id FROM status WHERE code = 'ACTIVE'`);
  const passwordHash = await bcrypt.hash(
    ADMIN_ACCOUNT.password,
    Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
  );

  await pool
    .request()
    .input('fullName', sql.NVarChar, ADMIN_ACCOUNT.fullName)
    .input('email', sql.NVarChar, ADMIN_ACCOUNT.email)
    .input('passwordHash', sql.NVarChar, passwordHash)
    .input('roleId', sql.Int, adminRole.recordset[0].id)
    .input('statusId', sql.Int, activeStatus.recordset[0].id)
    .query(
      `INSERT INTO users (full_name, email, password_hash, role_id, status_id)
       VALUES (@fullName, @email, @passwordHash, @roleId, @statusId)`,
    );
  console.log(`admin user seeded: ${ADMIN_ACCOUNT.email} (dev password: ${ADMIN_ACCOUNT.password})`);
}

async function run() {
  const pool = await sql.connect(config);
  try {
    await seedStatuses(pool);
    await seedRoles(pool);
    await seedCategories(pool);
    await seedAdmin(pool);
    console.log('Seed complete.');
  } finally {
    await pool.close();
  }
}

run().catch((err) => {
  console.error('Seed error:', err.message);
  process.exit(1);
});
