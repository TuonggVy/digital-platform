# PROJECT_CONTEXT.md

> Tài liệu này là bộ nhớ bền vững của dự án cho AI assistant qua các phiên làm việc. Đọc file này trước khi bắt đầu bất kỳ công việc nào.

## 1. Tổng quan dự án

**Tên dự án**: Digital Platform (thương hiệu hiển thị: **VTC TELECOM**)

**Mô tả**: Nền tảng thương mại điện tử bán dịch vụ số, gồm 3 nhóm sản phẩm chính:
- **Cloud** — VPS/Cloud Server, Kubernetes, Cloud Storage, Cloud Backup, Load Balancer
- **Kaspersky** — phần mềm bảo mật (Standard/Plus/Premium/Small Office)
- **eSIM** — eSIM du lịch quốc tế theo vùng (Asia/Europe/North America/Global)

Có 3 vai trò người dùng: **Customer** (khách mua hàng), **Staff**, **Admin** (quản trị catalogue/đơn hàng).

## 2. Mục tiêu nghiệp vụ

Dự án đang trong quá trình **migrate dần từ toàn bộ mock/localStorage sang backend thật**, theo từng module một, không đại tu toàn bộ cùng lúc. Trình tự đã thực hiện:

1. Chuẩn hoá toàn bộ Backend hiện có sang RESTful API (đã xong: Products, Auth).
2. Xây mới hoàn toàn **Order Module** (backend từ đầu — entity, migration, service, controller, Swagger).
3. Nối Frontend Checkout → Orders API thật.
4. Nối Frontend My Orders / Order Detail (customer) → Orders API thật.
5. Nối Frontend Admin Orders → Orders API thật.
6. (Kế tiếp, chưa làm) Admin Customers cần Users backend API thật; dọn mock Order layer đã orphan.

**Nguyên tắc xuyên suốt cả dự án** (đã được nhắc lại và tuân thủ ở mọi bước):
- Không đổi business logic khi refactor route.
- Không đổi database schema ngoài phạm vi module đang làm.
- Không đổi JWT, Response format, Validation, Logging.
- Không tự bịa dữ liệu/aggregate khi backend chưa hỗ trợ — thà ẩn UI còn hơn hiển thị sai.
- Không tự mở rộng phạm vi (scope creep) — mỗi "Bước" làm đúng phần được giao, dừng lại báo cáo, chờ xác nhận mới sang bước tiếp theo.
- Giữ mock layer cũ nếu vẫn còn nơi khác phụ thuộc; không tự xoá khi chưa xác nhận hết dependency.
- Luôn build + lint + test runtime thật (Playwright, browser thật, không chỉ đọc code) trước khi báo cáo hoàn thành.

## 3. Tech stack

### Backend (`backend/`)
- **NestJS 10** (`@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`)
- **TypeORM 0.3** + **MSSQL** (`mssql` driver, `@nestjs/typeorm`)
- **Auth**: `@nestjs/jwt` + `passport-jwt`, JWT access + refresh token
- **Validation**: `class-validator` + `class-transformer`, `ValidationPipe({whitelist:true, transform:true})` global
- **Swagger**: `@nestjs/swagger`, doc tại `/api/docs`
- **Logging**: `winston` + `winston-daily-rotate-file` (file logs tại `backend/logs/{error,combined,debug,warn}/`)
- **Password hashing**: `bcrypt`
- Chạy dev: `npm run start:dev` (nest start --watch, tự reload)
- Port mặc định: `3000`

### Frontend (root `/`)
- **React 19** + **Vite 8** + **TypeScript ~6.0**
- **Routing**: `react-router-dom` v7
- **State**: `zustand` v5 (với `persist` middleware cho cart/auth)
- **Form**: `react-hook-form` + `zod` + `@hookform/resolvers`
- **HTTP**: `axios` (qua `src/services/apiClient.ts`)
- **UI/Style**: Tailwind CSS v4, `framer-motion` (animation), `lucide-react` (icon)
- **i18n**: `i18next` + `react-i18next`, 2 ngôn ngữ `vi`/`en` (`src/locales/{vi,en}.json`)
- **Chart**: `recharts` — **hiện KHÔNG còn được import ở đâu trong repo** (đã gỡ khỏi AdminDashboardPage ở Bước 9, dependency vẫn còn trong package.json nhưng dead — có thể cân nhắc gỡ khỏi package.json sau)
- Chạy dev: `npm run dev` (hoặc `npm run dev:all` chạy cả FE+BE qua `concurrently`)
- Port mặc định: `5173`

### Database
- **MSSQL** chạy qua Docker Compose (`backend/docker-compose.yml`), container tên `digital-platform-mssql`
- Migration: file `.sql` thô trong `backend/migrations/`, chạy bằng `node scripts/run_migration.js` (script tự viết, không dùng TypeORM migration runner), track trạng thái qua bảng `schema_migrations`
- Xem chi tiết: [DATABASE.md](./DATABASE.md)

## 4. Cấu trúc thư mục

```
DigitalPlatform/
├── backend/                       # NestJS backend
│   ├── migrations/                # File .sql thô, chạy tuần tự theo tên file
│   ├── scripts/                   # run_migration.js, run_seed.js, migration_status.js
│   ├── src/
│   │   ├── common/                # config, decorators, entities (BaseEntity), filters, guards, interceptors, log_service, utils
│   │   └── features/
│   │       ├── auth/               # AuthController/Service, JWT strategy
│   │       ├── categories/         # Chỉ có entity + module — CHƯA có Controller/API
│   │       ├── health/
│   │       ├── orders/              # Order Module (mới xây trong session này)
│   │       ├── products/            # Product CRUD, RESTful
│   │       ├── roles/
│   │       ├── statuses/
│   │       └── users/               # Chỉ có entity + service tối giản — CHƯA có Controller/API
│   ├── logs/
│   └── uploads/
├── src/                            # React frontend
│   ├── components/                 # admin/, animation/, cart/, checkout/, common/, home/, layout/, product/, ui/
│   ├── constants/                  # config.ts (STORAGE_KEYS, env), nav.ts, routes.ts (ROUTES)
│   ├── data/mocks/                 # Toàn bộ data mock cho các module CHƯA migrate (products cũ không dùng nữa, orders, coupons, tickets, services, licenses, esim...)
│   ├── hooks/
│   ├── layouts/                    # PublicLayout, CustomerLayout, AdminLayout
│   ├── locales/                    # vi.json, en.json, i18n.ts
│   ├── pages/                      # admin/, auth/, customer/, public/
│   ├── routes/                     # AppRoutes.tsx, AdminRoute, CustomerRoute, GuestRoute
│   ├── services/                   # 1 file / domain — xem API_REFERENCE.md
│   ├── stores/                     # zustand store: authStore, cartStore, orderStore (mock, xem CHANGELOG), productStore, uiStore
│   ├── types/                      # Định nghĩa TypeScript dùng chung (mock-era types)
│   └── utils/
├── dist/                           # build output frontend
└── docs/ai/                        # ← Bộ tài liệu AI-memory này
```

## 5. Coding convention quan trọng

- **Backend module pattern**: mỗi domain dưới `backend/src/features/<name>/` gồm `*.entity.ts`, `*.module.ts`, `*.service.ts`, `*.controller.ts`, `dto/*.dto.ts`. Entity kế thừa `BaseEntity` (common) nếu cần soft-delete (`createdDate`/`modifiedDate`/`deletedDate`); entity KHÔNG cần soft-delete riêng (như `OrderItem` — snapshot bất biến) thì tự khai báo `createdDate` riêng, không extends `BaseEntity`.
- **Naming route**: RESTful chuẩn — danh từ số nhiều, `GET/POST/PATCH/DELETE`, id lấy từ `@Param()` không lấy từ body. Route customer không tiền tố, route admin tiền tố `/admin/...`.
- **Response envelope cố định** (không được đổi): `{ code: number, message: string, data: T | null }` — áp dụng toàn cục qua `ResponseInterceptor` + `AllExceptionsFilter`. `code: 0` = success; xem bảng mã lỗi trong [API_REFERENCE.md](./API_REFERENCE.md).
- **Soft delete**: không bao giờ hard-delete. Set `deletedDate = now()` + `statusId = STATUS_CODE.DELETED`. Query luôn lọc `deletedDate IS NULL`.
- **Money rounding**: `Math.round((value + Number.EPSILON) * 100) / 100` — tránh sai số float khi tính tiền (áp dụng trong `orders.service.ts`).
- **Frontend service pattern**: 1 file `src/services/<domain>Service.ts` = 1 object export (`export const xService = {...}`), mỗi method là 1 API call hoặc mock call. Import trực tiếp file cụ thể (`@/services/productService`), KHÔNG import qua barrel `@/services` trong page/store code (barrel `services/index.ts` chỉ để re-export tiện lợi).
- **Response unwrap 1 lớp duy nhất**: `apiClient.ts` có `apiGet/apiPost/apiPatch/apiDelete` đã tự bóc `response.data.data` — service layer KHÔNG được bóc thêm lần nữa.
- **Không hard-code text**: mọi UI string qua `t('namespace.key')` (i18next), thêm key mới vào cả `vi.json` và `en.json` song song. Không xoá key cũ dù không còn dùng (an toàn khi rollback/còn nơi khác dùng).
- **State pattern cho page mới**: `loading`/`error`/`data` local state (không dùng global store) cho các trang list/detail đã migrate — xem ví dụ `OrdersPage.tsx`, `OrderDetailPage.tsx`, `AdminOrdersPage.tsx`. Không catch-rồi-trả-mảng-rỗng khi lỗi — luôn hiển thị lỗi thật + nút retry.
- **Guard double-submit**: đóng dialog/set flag TRƯỚC khi `await` request, kèm early-return nếu đang loading.
- **Hai hệ type Order song song có chủ đích** (xem ARCHITECTURE.md mục 7): type mock trong `@/types` (dùng bởi phần chưa migrate) và type thật `BackendOrder`/`OrderStatus` trong `@/services/orderApiService.ts` (dùng bởi phần đã migrate) — KHÔNG hợp nhất cho tới khi toàn bộ mock bị loại bỏ.

## 6. Liên kết tài liệu khác

- [CURRENT_PROGRESS.md](./CURRENT_PROGRESS.md) — đang dừng ở đâu, làm tiếp gì
- [TODO.md](./TODO.md) — việc còn lại, theo độ ưu tiên
- [DECISIONS.md](./DECISIONS.md) — các quyết định thiết kế quan trọng và lý do
- [ARCHITECTURE.md](./ARCHITECTURE.md) — kiến trúc chi tiết, luồng dữ liệu
- [DATABASE.md](./DATABASE.md) — schema, migration, seed
- [API_REFERENCE.md](./API_REFERENCE.md) — toàn bộ route backend + mapping frontend service
- [CHANGELOG.md](./CHANGELOG.md) — lịch sử thay đổi theo từng "Bước"
