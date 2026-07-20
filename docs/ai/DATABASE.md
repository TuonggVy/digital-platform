# DATABASE.md

## 1. Hệ quản trị & kết nối

- **MSSQL** chạy qua Docker Compose: `backend/docker-compose.yml`, container `digital-platform-mssql`, port `1433`.
- Bật/tắt: `npm run db:up` / `npm run db:down` (từ root package.json).
- Config kết nối đọc từ `backend/.env` (không commit — xem `backend/.env.example`):
  ```
  DB_HOST=localhost
  DB_PORT=1433
  DB_USERNAME=sa
  DB_PASSWORD=YourStrong@Passw0rd     # dev only
  DB_NAME=digital_platform
  DB_ENCRYPT=false
  DB_TRUST_SERVER_CERTIFICATE=true
  ```
- TypeORM: `synchronize: false` (luôn tắt — mọi thay đổi schema đi qua migration file thủ công), `autoLoadEntities: true`.

## 2. Cơ chế migration (KHÔNG dùng TypeORM migration runner chuẩn)

- File `.sql` thô đặt tại `backend/migrations/`, đặt tên `NNN_description.sql` (số thứ tự 3 chữ số, tăng dần).
- Chạy bằng script tự viết: `backend/scripts/run_migration.js` (dùng package `mssql` trực tiếp, KHÔNG qua TypeORM).
  - Lệnh: `npm run migration:run` (root) hoặc trong `backend/`.
  - Tự tạo database nếu chưa tồn tại (`ensureDatabaseExists`).
  - Track migration đã chạy qua bảng `schema_migrations` (`id, name, executed_at`) — mỗi file chỉ chạy 1 lần, bỏ qua (`SKIP`) nếu đã có trong bảng.
  - Mỗi file chạy trong 1 transaction — statement được tách bằng cách split theo `;` cuối dòng (loại bỏ dòng comment `--`).
  - Mọi file migration đều bọc `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='<table>' AND xtype='U')` trước `CREATE TABLE` — idempotent, an toàn chạy lại.
- Kiểm tra trạng thái: `npm run migration:status` → `backend/scripts/migration_status.js`.
- Seed dữ liệu ban đầu: `npm run seed` → `backend/scripts/run_seed.js` (xem mục 5).

## 3. Danh sách migration đã chạy

| File | Nội dung |
|---|---|
| `001_create_status.sql` | Bảng `status` (id, code, name, description) — generic lifecycle ACTIVE/INACTIVE/PENDING/DELETED |
| `002_create_roles.sql` | Bảng `roles` (id, code, name) — ADMIN/STAFF/CUSTOMER |
| `003_create_users.sql` | Bảng `users` |
| `004_create_categories.sql` | Bảng `categories` |
| `005_create_products.sql` | Bảng `products` |
| `006_create_orders.sql` | Bảng `orders` + `order_items` — **tạo mới trong session này** (Order Module) |

## 4. Schema chi tiết

### `status` (generic lifecycle — dùng chung Product/User/Category)
```sql
id INT IDENTITY PK, code NVARCHAR(50), name NVARCHAR(100), description NVARCHAR(255) NULL
```
Giá trị cố định (insert bởi seed, ID do IDENTITY tự gán 1..4 theo đúng thứ tự — khớp với `STATUS_CODE` trong `common/utils/constant.ts`):
`1=ACTIVE, 2=INACTIVE, 3=PENDING, 4=DELETED`

### `roles`
```sql
id INT IDENTITY PK, code NVARCHAR(50), name NVARCHAR(100)
```
`ADMIN`, `STAFF`, `CUSTOMER` (khớp `ROLE_CODE` trong `constant.ts`).

### `categories`
```sql
id UNIQUEIDENTIFIER PK DEFAULT NEWID(),
name NVARCHAR(MAX)              -- simple-json LocalizedText {vi, en}
slug NVARCHAR(100) UNIQUE
code NVARCHAR(50) UNIQUE        -- khớp 1:1 với FE ProductCategory: 'cloud'|'kaspersky'|'esim'
description NVARCHAR(MAX) NULL
status_id INT FK → status(id)
display_order INT DEFAULT 0
created_date, modified_date, deleted_date
```
Seed sẵn 3 category: `cloud`, `kaspersky`, `esim`.

### `users`
```sql
id UNIQUEIDENTIFIER PK DEFAULT NEWID()
full_name NVARCHAR(255)
email NVARCHAR(255) UNIQUE
phone NVARCHAR(20) NULL
company NVARCHAR(255) NULL
tax_code NVARCHAR(50) NULL
address NVARCHAR(500) NULL
password_hash NVARCHAR(255)
role_id INT FK → roles(id)
status_id INT FK → status(id)
refresh_token_hash NVARCHAR(255) NULL
refresh_token_expires_at DATETIME2 NULL
created_date, modified_date, deleted_date
```

### `products`
```sql
id UNIQUEIDENTIFIER PK DEFAULT NEWID()
category_id UNIQUEIDENTIFIER FK → categories(id)
sub_category NVARCHAR(100)
slug NVARCHAR(150) UNIQUE
sku NVARCHAR(100) NULL          -- unique qua filtered index IX_products_sku (WHERE sku IS NOT NULL)
name, short_description, description, badge NVARCHAR(MAX)   -- simple-json LocalizedText
icon NVARCHAR(100) NULL
starting_price DECIMAL(18,2)
currency NVARCHAR(10) DEFAULT 'VND'
billing_cycles NVARCHAR(MAX)     -- simple-json string[] ('monthly'|'yearly'|'one_time')
features, benefits, how_it_works, suitable_for NVARCHAR(MAX) NULL   -- simple-json LocalizedText[]
faqs NVARCHAR(MAX) NULL          -- simple-json {question, answer}[]
rating DECIMAL(3,2) DEFAULT 0
review_count INT DEFAULT 0
is_featured BIT DEFAULT 0
status_id INT FK → status(id)
packages NVARCHAR(MAX) DEFAULT '[]'          -- simple-json ProductPackage[] — xem cấu trúc bên dưới
related_product_ids NVARCHAR(MAX) DEFAULT '[]'
created_date, modified_date, deleted_date
```
Cấu trúc `packages[]` (JSON, không có bảng riêng): mỗi phần tử `{id, name:{vi,en}, price, billingCycle, isPopular?, cloud?, kaspersky?, esim?}` — **không có field trạng thái active/inactive riêng cho từng package** (giới hạn đã biết, xem DECISIONS.md #4).

### `orders` (MỚI — Order Module)
```sql
id UNIQUEIDENTIFIER PK DEFAULT NEWID()
order_code NVARCHAR(30) UNIQUE           -- CONSTRAINT UQ_orders_order_code
user_id UNIQUEIDENTIFIER FK → users(id)  -- CONSTRAINT FK_orders_user
status NVARCHAR(30) DEFAULT 'PENDING'    -- CONSTRAINT CK_orders_status CHECK IN (8 giá trị)
subtotal DECIMAL(18,2)
discount_amount DECIMAL(18,2) DEFAULT 0
tax_amount DECIMAL(18,2) DEFAULT 0
total_amount DECIMAL(18,2)
currency NVARCHAR(10) DEFAULT 'VND'
customer_name NVARCHAR(255)
customer_email NVARCHAR(255)
customer_phone NVARCHAR(20)
note NVARCHAR(MAX) NULL
created_date DATETIME2 DEFAULT SYSUTCDATETIME()
modified_date DATETIME2 NULL
deleted_date DATETIME2 NULL
```
`CK_orders_status` CHECK: `status IN ('PENDING','AWAITING_PAYMENT','PAID','PROCESSING','COMPLETED','CANCELLED','FAILED','REFUNDED')`.

### `order_items` (MỚI — Order Module)
```sql
id UNIQUEIDENTIFIER PK DEFAULT NEWID()
order_id UNIQUEIDENTIFIER FK → orders(id)     -- CONSTRAINT FK_order_items_order
product_id UNIQUEIDENTIFIER FK → products(id) -- CONSTRAINT FK_order_items_product
product_name NVARCHAR(MAX)        -- simple-json LocalizedText, snapshot
product_type NVARCHAR(50)         -- snapshot category.code hoặc subCategory
package_id NVARCHAR(100) NULL     -- snapshot, NULL nếu product không có package
package_name NVARCHAR(MAX) NULL   -- simple-json LocalizedText, snapshot
unit_price DECIMAL(18,2)
quantity INT
total_price DECIMAL(18,2)
created_date DATETIME2 DEFAULT SYSUTCDATETIME()
```
Không có `modified_date`/`deleted_date` — xem DECISIONS.md #3 (snapshot bất biến).

## 5. Seed data (`backend/scripts/run_seed.js`)

Chạy: `npm run seed`. Idempotent (skip nếu đã tồn tại).

- 4 status (ACTIVE/INACTIVE/PENDING/DELETED) — ID 1-4 theo đúng thứ tự IDENTITY.
- 3 roles (ADMIN/STAFF/CUSTOMER).
- 3 categories (cloud/kaspersky/esim).
- 1 tài khoản ADMIN: `admin@digital-platform.local` / `Admin@123` (dev password, in ra console khi seed).

**Không seed sẵn**: CUSTOMER account, Product mẫu. Phải tạo thủ công (xem mục 6) hoặc qua Admin Products API.

## 6. Dữ liệu test hiện có trong DB dev (tạo trong session này, KHÔNG qua seed script)

### Tài khoản CUSTOMER (tạo bằng SQL insert trực tiếp, bcrypt-hash password giống `seedAdmin()`)
- `order-test-a@digital-platform.local` / `Customer@123` — `id: 5C0F3E29-A44D-4B59-AB51-289F74B3EE5C`
- `order-test-b@digital-platform.local` / `Customer@123` — `id: A3BCE172-C4B2-4D6E-9F5A-3D368CAAE941`

### Product test (đã soft-delete sau khi hoàn tất test Bước 8 — KHÔNG còn hiện trong catalogue, nhưng vẫn còn record + được OrderItem tham chiếu)
- `order-test-no-package` (`id: D85CC863-1905-4781-A2C6-735A465870EC`) — ACTIVE lúc tạo, không có package, `startingPrice: 50000`
- `order-test-with-package` (`id: 0470D59C-553A-4E3A-8E09-33A1CBFCC2C4`) — có 1 package `pkg-basic` giá `99000`
- `order-test-inactive` (`id: CC094E16-E4E8-414D-8600-032FA53CA7BF`) — tạo ACTIVE, chuyển `status_id=2` (INACTIVE) bằng SQL trực tiếp để test nhánh "Product không active" (không có API set trạng thái này)

Cả 3 hiện đã ở trạng thái `deleted_date IS NOT NULL` (soft-deleted qua `DELETE /admin/products/:id`).

### Product thật vẫn ACTIVE, có sẵn từ trước, có package
- `cloud-server-starter` — package `pkg-1` ("Gói cơ bản"), giá `150000`

### Order test còn lại trong DB (~12 record, KHÔNG xoá — dữ liệu hợp lệ để tiếp tục test)
Trải đủ các trạng thái: PENDING, AWAITING_PAYMENT, PAID, PROCESSING (chưa test riêng), CANCELLED, FAILED, REFUNDED — có thể dùng lại để test Admin/Customer flow ở phiên sau mà không cần tạo mới. Xem CHANGELOG.md để biết chính xác `orderCode` nào đang ở trạng thái nào tại thời điểm cuối Bước 9 (dữ liệu sẽ tiếp tục thay đổi nếu test thêm).

## 7. Lệnh hữu ích

```bash
# Từ root
npm run db:up              # docker compose up -d (MSSQL)
npm run db:down
npm run migration:run      # chạy migration còn thiếu
npm run seed                # seed status/roles/categories/admin

# Query trực tiếp MSSQL từ Node (mẫu dùng trong suốt session để verify test)
cd backend && node -e "
const sql = require('mssql');
require('dotenv').config();
sql.connect({server:process.env.DB_HOST, port:Number(process.env.DB_PORT), user:process.env.DB_USERNAME,
  password:process.env.DB_PASSWORD, database:process.env.DB_NAME,
  options:{encrypt:false, trustServerCertificate:true}}).then(async pool=>{
  const r = await pool.request().query('SELECT TOP 20 * FROM orders ORDER BY created_date DESC');
  console.table(r.recordset);
  await pool.close();
});
"
```
