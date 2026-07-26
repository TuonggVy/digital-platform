const { Client } = require('pg');
const bcrypt = require('bcrypt');
const path = require('path');

require('dotenv').config({
  path: path.join(__dirname, '../.env'),
});

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'digital_platform',
};

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

const CATEGORIES = [
  {
    code: 'cloud',
    slug: 'cloud',
    name: {
      vi: 'Cloud',
      en: 'Cloud',
    },
  },
  {
    code: 'kaspersky',
    slug: 'kaspersky',
    name: {
      vi: 'Kaspersky',
      en: 'Kaspersky',
    },
  },
  {
    code: 'esim',
    slug: 'esim',
    name: {
      vi: 'eSIM',
      en: 'eSIM',
    },
  },
];

const ADMIN_ACCOUNT = {
  fullName: 'System Administrator',
  email: 'admin@digital-platform.local',
  password: 'Admin@123',
};

/**
 * Lấy ID trạng thái theo code.
 */
async function getStatusId(client, code) {
  const result = await client.query(
    `
      SELECT id
      FROM status
      WHERE code = $1
      LIMIT 1
    `,
    [code],
  );

  if (result.rowCount === 0) {
    throw new Error(`Không tìm thấy trạng thái có code=${code}`);
  }

  return result.rows[0].id;
}

/**
 * Lấy ID vai trò theo code.
 */
async function getRoleId(client, code) {
  const result = await client.query(
    `
      SELECT id
      FROM roles
      WHERE code = $1
      LIMIT 1
    `,
    [code],
  );

  if (result.rowCount === 0) {
    throw new Error(`Không tìm thấy vai trò có code=${code}`);
  }

  return result.rows[0].id;
}

/**
 * Tạo 4 trạng thái nền.
 *
 * ID của status cần cố định từ 1 đến 4 vì code backend
 * có thể đang sử dụng trực tiếp các ID này.
 */
async function seedStatuses(client) {
  for (const status of STATUSES) {
    const existingByCode = await client.query(
      `
        SELECT id, code
        FROM status
        WHERE code = $1
        LIMIT 1
      `,
      [status.code],
    );

    if (existingByCode.rowCount > 0) {
      const existing = existingByCode.rows[0];

      if (Number(existing.id) !== status.id) {
        throw new Error(
          `Trạng thái ${status.code} đang có id=${existing.id}, ` +
            `nhưng hệ thống yêu cầu id=${status.id}.`,
        );
      }

      await client.query(
        `
          UPDATE status
          SET name = $1
          WHERE code = $2
        `,
        [status.name, status.code],
      );

      console.log(`Status đã tồn tại: ${status.code}`);
      continue;
    }

    const existingById = await client.query(
      `
        SELECT id, code
        FROM status
        WHERE id = $1
        LIMIT 1
      `,
      [status.id],
    );

    if (existingById.rowCount > 0) {
      throw new Error(
        `ID trạng thái ${status.id} đang được sử dụng bởi ` +
          `code=${existingById.rows[0].code}.`,
      );
    }

    await client.query(
      `
        INSERT INTO status (
          id,
          code,
          name
        )
        VALUES ($1, $2, $3)
      `,
      [status.id, status.code, status.name],
    );

    console.log(`Đã tạo status: ${status.code}`);
  }
}

/**
 * Tạo các vai trò nền.
 */
async function seedRoles(client) {
  for (const role of ROLES) {
    const existing = await client.query(
      `
        SELECT id
        FROM roles
        WHERE code = $1
        LIMIT 1
      `,
      [role.code],
    );

    if (existing.rowCount > 0) {
      await client.query(
        `
          UPDATE roles
          SET name = $1
          WHERE code = $2
        `,
        [role.name, role.code],
      );

      console.log(`Role đã tồn tại: ${role.code}`);
      continue;
    }

    const inserted = await client.query(
      `
        INSERT INTO roles (
          code,
          name
        )
        VALUES ($1, $2)
        RETURNING id
      `,
      [role.code, role.name],
    );

    console.log(
      `Đã tạo role: ${role.code}, id=${inserted.rows[0].id}`,
    );
  }
}

/**
 * Tạo ba danh mục sản phẩm.
 */
async function seedCategories(client) {
  const activeStatusId = await getStatusId(client, 'ACTIVE');

  for (const category of CATEGORIES) {
    const serializedName = JSON.stringify(category.name);

    const existing = await client.query(
      `
        SELECT id
        FROM categories
        WHERE code = $1
        LIMIT 1
      `,
      [category.code],
    );

    if (existing.rowCount > 0) {
      await client.query(
        `
          UPDATE categories
          SET
            name = $1,
            slug = $2,
            status_id = $3
          WHERE code = $4
        `,
        [
          serializedName,
          category.slug,
          activeStatusId,
          category.code,
        ],
      );

      console.log(`Category đã tồn tại: ${category.code}`);
      continue;
    }

    const inserted = await client.query(
      `
        INSERT INTO categories (
          name,
          slug,
          code,
          status_id
        )
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `,
      [
        serializedName,
        category.slug,
        category.code,
        activeStatusId,
      ],
    );

    console.log(
      `Đã tạo category: ${category.code}, id=${inserted.rows[0].id}`,
    );
  }
}

/**
 * Tạo tài khoản quản trị mặc định.
 */
async function seedAdmin(client) {
  const existing = await client.query(
    `
      SELECT id
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [ADMIN_ACCOUNT.email],
  );

  if (existing.rowCount > 0) {
    console.log(
      `Admin đã tồn tại: ${ADMIN_ACCOUNT.email}, bỏ qua.`,
    );
    return;
  }

  const adminRoleId = await getRoleId(client, 'ADMIN');
  const activeStatusId = await getStatusId(client, 'ACTIVE');

  const saltRounds = Number(
    process.env.BCRYPT_SALT_ROUNDS || 10,
  );

  const passwordHash = await bcrypt.hash(
    ADMIN_ACCOUNT.password,
    saltRounds,
  );

  const inserted = await client.query(
    `
      INSERT INTO users (
        full_name,
        email,
        password_hash,
        role_id,
        status_id
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `,
    [
      ADMIN_ACCOUNT.fullName,
      ADMIN_ACCOUNT.email,
      passwordHash,
      adminRoleId,
      activeStatusId,
    ],
  );

  console.log(
    `Đã tạo admin: ${ADMIN_ACCOUNT.email}, ` +
      `id=${inserted.rows[0].id}`,
  );

  console.log(
    `Mật khẩu dùng trong môi trường local: ${ADMIN_ACCOUNT.password}`,
  );
}

/**
 * Đồng bộ sequence sau khi chèn ID thủ công.
 */
async function resetSequence(
  client,
  tableName,
  columnName = 'id',
) {
  const sequenceResult = await client.query(
    `
      SELECT pg_get_serial_sequence($1, $2)
      AS sequence_name
    `,
    [`public.${tableName}`, columnName],
  );

  const sequenceName =
    sequenceResult.rows[0]?.sequence_name;

  if (!sequenceName) {
    return;
  }

  const maximumResult = await client.query(
    `
      SELECT MAX("${columnName}") AS maximum_id
      FROM "${tableName}"
    `,
  );

  const maximumId = Number(
    maximumResult.rows[0]?.maximum_id || 0,
  );

  if (maximumId > 0) {
    await client.query(
      `
        SELECT setval($1, $2, true)
      `,
      [sequenceName, maximumId],
    );
  }
}

/**
 * Chạy toàn bộ seed trong transaction.
 */
async function run() {
  if (!config.password) {
    throw new Error(
      'Thiếu DB_PASSWORD của PostgreSQL trong file .env',
    );
  }

  const client = new Client(config);

  await client.connect();

  try {
    console.log('Đã kết nối PostgreSQL.');

    await client.query('BEGIN');

    await seedStatuses(client);
    await seedRoles(client);
    await seedCategories(client);
    await seedAdmin(client);

    await resetSequence(client, 'status');
    await resetSequence(client, 'roles');
    await resetSequence(client, 'categories');
    await resetSequence(client, 'users');

    await client.query('COMMIT');

    console.log('Seed PostgreSQL hoàn tất.');
  } catch (error) {
    await client.query('ROLLBACK');

    console.error('Seed thất bại, dữ liệu đã được rollback.');

    throw error;
  } finally {
    await client.end();
  }
}

run().catch((error) => {
  console.error('Seed error:', error.message);
  process.exit(1);
});