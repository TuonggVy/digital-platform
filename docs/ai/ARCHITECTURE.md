# ARCHITECTURE.md

## 1. Kiến trúc tổng thể

```
┌─────────────────────────┐        HTTP/JSON        ┌──────────────────────────┐
│   React SPA (Vite)      │ ───────────────────────▶ │   NestJS API (port 3000) │
│   port 5173             │ ◀─────────────────────── │                          │
└─────────────────────────┘   {code,message,data}    └──────────┬───────────────┘
                                                                  │ TypeORM
                                                                  ▼
                                                       ┌──────────────────────┐
                                                       │  MSSQL (Docker)      │
                                                       │  digital_platform DB │
                                                       └──────────────────────┘
```

Không có SSR/BFF — SPA gọi thẳng REST API NestJS. Không có API Gateway riêng.

## 2. Backend — cấu trúc module (NestJS)

Mỗi feature là 1 thư mục độc lập dưới `backend/src/features/<name>/`:

```
features/<name>/
  <name>.entity.ts       # TypeORM entity
  <name>.module.ts        # @Module({ imports: [TypeOrmModule.forFeature([...])], controllers, providers, exports })
  <name>.service.ts       # business logic, @InjectRepository
  <name>.controller.ts    # @Controller, route handlers
  dto/*.dto.ts            # class-validator DTO, tách theo action (create/update/get-*)
  enums/*.enum.ts         # enum riêng nếu cần (vd order-status.enum.ts)
```

**Global pipeline** (đăng ký trong `main.ts` + `app.module.ts`):
- `ValidationPipe({whitelist: true, transform: true})` — global, tự động strip field lạ + transform type theo DTO.
- `JwtAuthGuard` (global qua `APP_GUARD`) — bắt buộc JWT trừ khi có `@Public()` decorator trên method/class.
- `RolesGuard` (global qua `APP_GUARD`) — kiểm tra `@Roles(ROLE_CODE.ADMIN)` so với `userData.role` (gắn vào request bởi `JwtAuthGuard`/`JwtStrategy`).
- `AllExceptionsFilter` (global) — bắt mọi exception, map sang envelope `{code, message, data:null}` theo status HTTP (xem API_REFERENCE.md mục mã lỗi). Chỉ log ra file nếu exception KHÔNG phải `HttpException` (lỗi runtime thật, không log các lỗi nghiệp vụ 400/401/403/404 chủ động throw).
- `ResponseInterceptor` (global) — bọc mọi response thành công thành `{code:0, message:'Thành công', data: result}` (trừ khi `result` đã có sẵn shape `{code,message,data}`).
- CORS: cho phép origin từ `FRONTEND_URL`/`FRONTEND_PRODUCTION_URL` (env), methods GET/POST/PUT/DELETE/PATCH/OPTIONS.
- Swagger UI tại `/api/docs`, generate từ decorator (`@ApiTags`, `@ApiOperation`, `@ApiBody`, `@ApiQuery`, `@ApiParam`, `@ApiResponse`, `@ApiBearerAuth`).
- `autoLoadEntities: true` trong TypeORM config — entity tự động được nạp miễn là xuất hiện trong `forFeature([...])` của bất kỳ module nào được import vào `AppModule`.

**Danh sách module hiện có** (đăng ký trong `app.module.ts`):
`ConfigModule` (global) → `TypeOrmModule` (async, từ `buildTypeOrmConfig`) → `LogModule` → `HealthModule` → `StatusesModule` → `RolesModule` → `UsersModule` → `AuthModule` → `CategoriesModule` → `ProductsModule` → `OrdersModule`.

**Module chỉ có entity, chưa có API** (quan trọng — tránh nhầm là "đã xong"):
- `CategoriesModule`: chỉ `category.entity.ts` + module đăng ký `TypeOrmModule.forFeature`. KHÔNG có Controller/Service CRUD.
- `UsersModule`: có `user.entity.ts` + `users.service.ts` NHƯNG service chỉ có 3 method nội bộ phục vụ Auth (`findByEmail`, `findById`, `setRefreshToken`) — KHÔNG có Controller, KHÔNG có create/update/delete/list.

## 3. Order Module — kiến trúc chi tiết (module mới, xây từ đầu trong session này)

### 3.1 Entity

```
Order (extends BaseEntity → createdDate/modifiedDate/deletedDate)
  id (uuid, PK)
  orderCode (nvarchar30, unique)
  userId (uuid, FK users.id) — @ManyToOne(User) một chiều, KHÔNG sửa User entity
  status (nvarchar30, enum OrderStatus, default PENDING) — cột riêng, không FK vào bảng status
  subtotal, discountAmount, taxAmount, totalAmount (decimal 18,2)
  currency (nvarchar10, default 'VND')
  customerName, customerEmail, customerPhone (snapshot lúc đặt hàng)
  note (nvarchar MAX, nullable)
  items: OrderItem[] (@OneToMany)

OrderItem (KHÔNG extends BaseEntity — chỉ createdDate riêng)
  id (uuid, PK)
  orderId (uuid, FK orders.id) — @ManyToOne(Order)
  productId (uuid, FK products.id) — @ManyToOne(Product) một chiều, KHÔNG sửa Product entity
  productName (simple-json LocalizedText) — snapshot
  productType (nvarchar50) — snapshot category.code hoặc subCategory
  packageId (nvarchar100, nullable) — snapshot, null nếu Product không có package
  packageName (simple-json LocalizedText, nullable) — snapshot
  unitPrice, totalPrice (decimal 18,2)
  quantity (int)
  createdDate
```

### 3.2 Service — `OrdersService` (business logic, nguồn chân lý duy nhất)

**`createOrder(userId, dto)`** — chạy trong 1 `DataSource.transaction()`:
1. Query `User` theo `userId`, kiểm tra tồn tại + `deletedDate IS NULL` + `statusId === ACTIVE` → 400 nếu không.
2. Gom `productIds` unique từ `dto.items`, **1 lần query** `manager.find(Product, {where:{id: In(productIds), deletedDate: IsNull()}, relations:['category']})` (tránh N+1).
3. Với mỗi item: kiểm tra product tồn tại (400 nếu không — message "Sản phẩm không tồn tại"), kiểm tra `statusId === ACTIVE` (400 nếu không — message "Sản phẩm không khả dụng").
4. Nếu `product.packages.length > 0`: bắt buộc `itemDto.packageId`, tìm đúng package trong `product.packages` (400 nếu thiếu/sai), `unitPrice = pkg.price`, `packageName = pkg.name`, `resolvedPackageId = itemDto.packageId`.
5. Nếu KHÔNG có package: `unitPrice = product.startingPrice`, `resolvedPackageId = null` LUÔN LUÔN (bất kể client gửi gì — đây là fix của Bước 7, xem CHANGELOG).
6. `totalPrice = roundMoney(unitPrice * quantity)`, cộng dồn `subtotal`.
7. `totalAmount = roundMoney(subtotal - discountAmount(0) + taxAmount(0))` — hiện discount/tax luôn = 0 (chưa có Coupon/Tax nghiệp vụ thật).
8. Sinh `orderCode`, insert `Order`, nếu vi phạm unique constraint (MSSQL error 2627/2601) thì retry tối đa 5 lần với code mới.
9. Insert toàn bộ `OrderItem` cùng transaction.
10. Trả về `Order` kèm `items` (không cần query lại).

**`getMyOrders(userId, {page, pageSize})`** — `findAndCount` where `userId` + `deletedDate IS NULL`, order by `createdDate DESC`. Trả `{items, total, page, pageSize, totalPages}`. **KHÔNG load `items` (OrderItem) trong list** — chỉ field Order gốc.

**`getOrderDetail(userId, id)`** — where `id` + `userId` (bắt buộc khớp cả 2) + `deletedDate IS NULL`, `relations:['items']`. Không tìm thấy → `NotFoundException` (404) — **cố ý không phân biệt** "không tồn tại" với "thuộc về user khác" để tránh lộ thông tin tồn tại của Order người khác.

**`cancelOrder(userId, id)`** — gọi lại `getOrderDetail` (đảm bảo ownership), kiểm tra `status` thuộc `CANCELLABLE_ORDER_STATUSES = [PENDING, AWAITING_PAYMENT]` (400 nếu không), set `status = CANCELLED`, `modifiedDate = now()`.

**`getAllForAdmin(query)`** — `createQueryBuilder`, filter `status` (exact match), `search` (LIKE trên `orderCode`/`customerName`/`customerEmail`/`customerPhone`, case-insensitive cho 3 trường đầu qua `LOWER()`), sort (`newest`/`oldest`/`total_asc`/`total_desc`, default `newest`), phân trang. **KHÔNG load `items`** (giống list customer).

**`getByIdForAdmin(id)`** — where `id` + `deletedDate IS NULL`, `relations:['items']`, không ràng buộc `userId`.

**`updateStatus(id, dto)`** — lấy order qua `getByIdForAdmin`, kiểm tra `dto.status` có trong `ALLOWED_STATUS_TRANSITIONS[order.status]` (xem DECISIONS.md mục 5), 400 kèm message liệt kê transition hợp lệ nếu sai. Cập nhật `status` + `modifiedDate`.

### 3.3 Controller — `OrdersController` (1 controller, cả customer + admin)

```
POST   /orders                     JWT required           createOrder(user.id, dto)
GET    /orders                     JWT required            getMyOrders(user.id, query)
GET    /orders/:id                 JWT required            getOrderDetail(user.id, id)  — ParseUUIDPipe
POST   /orders/:id/cancel           JWT required            cancelOrder(user.id, id)     — @HttpCode(200), ParseUUIDPipe

GET    /admin/orders               JWT + @Roles(ADMIN)      getAllForAdmin(query)
GET    /admin/orders/:id           JWT + @Roles(ADMIN)      getByIdForAdmin(id)          — ParseUUIDPipe
PATCH  /admin/orders/:id/status    JWT + @Roles(ADMIN)      updateStatus(id, dto)        — ParseUUIDPipe
```

`userId` LUÔN lấy từ `@CurrentUser()` decorator (đọc `request.userData` do `JwtAuthGuard` gắn vào sau khi verify token) — KHÔNG BAO GIỜ nhận từ body/param của client.

## 4. Frontend — kiến trúc data flow cho Order (phần đã migrate)

```
Page (OrdersPage/OrderDetailPage/CheckoutPage/AdminOrdersPage/AdminOrderDetailPage)
  │  useState local: data, isLoading, error
  │  useEffect/useCallback gọi trực tiếp
  ▼
orderApiService.ts  (export const orderApiService = { createOrder, getMyOrders, getOrderDetail,
                      cancelOrder, getAdminOrders, getAdminOrderDetail, updateOrderStatus })
  │  gọi apiGet/apiPost/apiPatch (KHÔNG tự tạo axios instance riêng)
  ▼
apiClient.ts
  │  axios instance, baseURL từ VITE_API_BASE_URL
  │  request interceptor: gắn Authorization: Bearer <accessToken> từ localStorage
  │  response interceptor: 401 (trừ /auth/login, /auth/refresh) → tự refresh token 1 lần → retry request gốc;
  │                         refresh thất bại → clear token; mọi lỗi khác → reject(new Error(message)) lấy từ
  │                         error.response.data.message (đã unwrap khỏi envelope)
  │  apiGet/apiPost/apiPatch/apiDelete: trả thẳng response.data.data (bóc 1 lớp envelope duy nhất)
  ▼
Backend NestJS (xem mục 3)
```

**Không dùng global store (zustand) cho phần Order đã migrate** — khác với cách cũ (`orderStore.ts` dùng zustand). Lý do: state list/detail là dữ liệu server-driven theo trang, không cần chia sẻ toàn cục; local `useState` + `useCallback` load function là đủ và rõ ràng hơn.

## 5. Routing (frontend)

```
PublicLayout (Header/Footer/MobileNav/CartDrawer/ToastContainer, bọc PageTransition)
  /                       HomePage
  /products, /products/:slug, ...
  /cart, /checkout, /checkout/success/:orderCode  ← param tên cũ nhưng giá trị truyền vào giờ là order.id (UUID)
  /login, /register, ... (GuestRoute — chặn nếu đã đăng nhập)

CustomerRoute (chặn nếu chưa đăng nhập, redirect /login)
  CustomerLayout (sidebar customer)
    /account                       DashboardPage
    /account/orders                OrdersPage        ← đã migrate (Bước 8)
    /account/orders/:orderId       OrderDetailPage    ← đã migrate, param đổi từ :orderCode
    /account/services, /account/tickets, ... (chưa migrate, vẫn mock)

AdminRoute (chặn nếu currentUser.role !== 'admin', redirect /account; chưa login → /login)
  AdminLayout (sidebar admin)
    /admin                          AdminDashboardPage  ← đã migrate 1 phần (Bước 9)
    /admin/orders                   AdminOrdersPage      ← đã migrate (Bước 9)
    /admin/orders/:orderId          AdminOrderDetailPage ← MỚI, tạo ở Bước 9
    /admin/products, /admin/customers, /admin/services, ... (mix mock/thật, xem CHANGELOG)
```

`AdminRoute`/`CustomerRoute`/`GuestRoute` là guard **client-side** (kiểm tra `useAuthStore().currentUser`), độc lập với guard **server-side** (`JwtAuthGuard`/`RolesGuard` của NestJS) — cả hai lớp đều có, không lớp nào thay thế lớp kia.

## 6. Component dùng chung liên quan Order

- `src/components/common/BackendOrderStatusBadge.tsx` — badge cho 8 status backend, dùng `Badge` (common) + i18n `status.backendOrder.*`. Dùng bởi MỌI trang đã migrate (Checkout Success, customer Orders/OrderDetail/Dashboard, Admin Orders/OrderDetail/Dashboard).
- `src/components/common/OrderStatusBadge.tsx` — badge CŨ cho 6 status mock, hiện **0 nơi sử dụng** (orphan, xem TODO.md) nhưng CHƯA xoá.
- `src/components/common/Pagination.tsx` — generic, tái sử dụng cho mọi list đã migrate (customer Orders, Admin Orders).
- `src/components/common/ConfirmDialog.tsx` — dùng cho: cancel Order (customer), đổi status (Admin), xoá product (Admin Products, có từ trước).
- `src/components/admin/DataTable.tsx` — generic table với `columns`/`rowKey`/`isLoading`/`emptyTitle`, dùng cho Admin Orders list + Admin Dashboard recent orders.
- `src/components/common/EmptyState.tsx` — dùng cho cả empty-state THẬT lẫn error-state (truyền icon `AlertCircle` để phân biệt trực quan) — không có component `ErrorState` riêng trong dự án.

## 7. Hai hệ type Order (nhắc lại từ DECISIONS.md, quan trọng khi code)

| | Mock (`@/types` → `types/order.ts`) | Thật (`@/services/orderApiService.ts`) |
|---|---|---|
| Type chính | `Order`, `OrderItem` | `BackendOrder`, `BackendOrderItem` |
| `OrderStatus` | 6 giá trị: `PENDING_PAYMENT`\|`PAID`\|`PROCESSING`\|`COMPLETED`\|`CANCELLED`\|`REFUNDED` | 8 giá trị: `PENDING`\|`AWAITING_PAYMENT`\|`PAID`\|`PROCESSING`\|`COMPLETED`\|`CANCELLED`\|`FAILED`\|`REFUNDED` |
| Field id sản phẩm trong item | `productName: string`, `packageName: string` (đã localize sẵn) | `productName: LocalizedText`, `packageName: LocalizedText \| null` (localize ở FE bằng `localize()`) |
| Field tiền | `total`, `discount`, `subtotal` | `totalAmount`, `discountAmount`, `subtotal`, `taxAmount` |
| Dùng bởi | `orderService.ts`, `orderStore.ts`, `OrderStatusBadge.tsx`, `AdminCustomersPage.tsx` | Mọi trang đã migrate (xem mục 5) |

**Luôn kiểm tra đang import từ nguồn nào trước khi thêm code mới liên quan Order.**
