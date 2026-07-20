# CHANGELOG.md

> Lịch sử thay đổi theo từng "Bước" đã thực hiện trong dự án, ghi theo thứ tự thời gian. Dùng để tra cứu "việc X được làm ở bước nào, vì sao".

## Task A: Chuẩn hoá RESTful API (Products + Auth) — trước Order Module

**Phạm vi cuối cùng** (sau khi hỏi & xác nhận chỉ làm Products + Auth, KHÔNG làm Categories/Users vì chưa có Controller):

- **Backend**:
  - `backend/src/features/products/products.controller.ts` — route mới:
    - Public: `GET /products`, `GET /products/featured`, `GET /products/:idOrSlug`, `GET /products/:idOrSlug/related`
    - Admin: `GET /admin/products`, `GET /admin/products/:id`, `POST /admin/products`, `PATCH /admin/products/:id`, `DELETE /admin/products/:id`
  - Xoá `update-product-body.dto.ts`, `product-id.dto.ts` (không cần nữa vì id lấy từ `@Param`, không từ body)
  - `backend/src/features/auth/auth.controller.ts` — đổi prefix `auth_management` → `auth`
- **Frontend**:
  - `src/services/apiClient.ts` — sửa URL refresh-token, `isAuthEndpoint` check sang `/auth/*`; thêm `apiPatch`/`apiDelete`
  - `src/services/authService.ts` — login/logout gọi `/auth/*`
  - `src/services/productService.ts` — toàn bộ 8 method chuyển route mới, `updateProduct`/`deleteProduct` dùng đúng PATCH/DELETE thay vì giả bằng POST

Route cũ (`products_management`, `auth_management`, verb trong path như `create_product`) đã bị xoá hoàn toàn, không còn tham chiếu nào trong code.

## Bước 1-9: Order Module (backend mới + tích hợp frontend từng phần)

### Bước 1 — Phân tích & thiết kế (không code)
Đề xuất entity/migration/controller/service/DTO/folder structure cho Order Module. Xác nhận với người dùng: `packageId` bắt buộc khi Product có package (xem DECISIONS.md #4).

### Bước 2 — Entity, Migration, DTO
- Tạo `Order`, `OrderItem` entity; `enums/order-status.enum.ts`; 5 DTO (`create-order-item`, `create-order`, `get-my-orders`, `get-admin-orders`, `update-order-status`).
- Migration `006_create_orders.sql`, chạy thành công, verify schema qua `INFORMATION_SCHEMA.COLUMNS`.
- `orders.module.ts` tạo tối giản (chỉ đăng ký entity), đăng ký vào `app.module.ts`.

### Bước 3 — Service (business logic) + audit tự phát hiện bug
Viết `OrdersService` đầy đủ. Sau đó **tự audit 12 câu hỏi** và sửa 9 vấn đề phát hiện được (chỉ sửa trong `orders.service.ts`, không đổi module/route):
1. Bắt buộc `packageId` khi Product có package (trước đó fallback sai về `startingPrice`)
2. Chỉ dùng `startingPrice` khi Product thực sự không có package
3. Thêm `ALLOWED_STATUS_TRANSITIONS` map + validate (trước đó cho đổi status tuỳ ý)
4. Liệt kê transition hợp lệ (xem DECISIONS.md #5)
5. Retry sinh `orderCode` khi trùng (bắt lỗi MSSQL 2627/2601), tối đa 5 lần
6. `roundMoney()` cho mọi phép tính tiền — tránh sai số float
7. Xác nhận snapshot OrderItem đầy đủ field (đã đúng từ đầu)
8. Thêm `customerPhone` vào search Admin (trước đó thiếu)
9. Gom query Product theo `In(productIds)` 1 lần thay vì loop N query
10. Query `User` xác nhận tồn tại + active trước khi tạo Order (trước đó không kiểm tra, dựa vào FK constraint DB sẽ lỗi thô nếu user bị xoá)

### Bước 4 — Controller + Swagger
`OrdersController` với 7 route (4 customer + 3 admin). `ParseUUIDPipe` cho mọi `:id`. `@HttpCode(200)` cho `POST /orders/:id/cancel` (ghi đè default 201). Swagger đầy đủ `@ApiOperation/@ApiBody/@ApiQuery/@ApiParam/@ApiResponse`.

### Bước 5 — `orderApiService.ts` (frontend)
Tạo file service THẬT, tách biệt hoàn toàn khỏi mock `orderService.ts` (xem DECISIONS.md #7 — lý do đặt tên/type riêng). 7 method, dùng `apiGet/apiPost/apiPatch` có sẵn. Export thêm `BackendOrder`, `BackendOrderItem`, `OrderStatus`, `CreateOrderRequest`, `CreateOrderItemRequest`, `GetMyOrdersParams`, `GetAdminOrdersParams`. Thêm `export` cho `PaginatedResult` trong `productService.ts` để tái sử dụng (tránh định nghĩa trùng).

### Bước 6 — Test toàn diện backend (curl + MSSQL trực tiếp)
Tạo dữ liệu test (2 tài khoản CUSTOMER qua SQL insert, 3 product test qua Admin API). Test: auth, tạo order (có/không package), validation (thiếu packageId, packageId sai, product không tồn tại/inactive/deleted), transaction rollback, customer list/detail/cancel, admin list/search/filter/sort/detail/status-transition, authorization 401/403, DB snapshot integrity, orphan check, orderCode collision logic (audit code, không ép collision thật). **Kết quả: PASS**, phát hiện 1 vấn đề nhỏ (không phải bug blocker theo đặc tả gốc): `packageId` rác từ client bị lưu nguyên vào snapshot khi Product không có package (đã sửa ở Bước 7).

### Bước 7 — Nối Checkout → Orders API thật
- Audit: `CartItem.packageId` LUÔN có giá trị thật (không bao giờ rỗng) vì cả 2 nơi duy nhất gọi `addItem` (`PackageSelector.tsx`, `ProductCard.tsx`) đều bắt buộc chọn package trước.
- **Sửa bug đã ghi nhận ở Bước 6**: `orders.service.ts` — khi Product không có package, ép `packageId`/`packageName` về `null`, không dùng giá trị client gửi.
- `src/pages/public/CheckoutPage.tsx` — bỏ `useOrderStore`, gọi thẳng `orderApiService.createOrder`; map `CartItem[]` → `CreateOrderItemRequest[]`; guard double-submit; giữ cart khi lỗi; thêm cảnh báo coupon (xem DECISIONS.md #12); không gửi paymentMethod (xem DECISIONS.md #13).
- `src/pages/public/CheckoutSuccessPage.tsx` — viết lại: nhận `BackendOrder` qua route `state`, fallback `getOrderDetail(id)` khi reload; bỏ nút "Xem đơn hàng" (route cũ trỏ mock, chưa tương thích UUID — khôi phục lại ở Bước 8).
- Thêm i18n: `checkout.success.createdAt`, `checkout.couponNotAppliedYet`.
- **Phát hiện bug KHÔNG sửa** (ngoài phạm vi Checkout, ảnh hưởng toàn app): `PageTransition.tsx` — `AnimatePresence mode="wait"` gây remount trang ~250-400ms sau điều hướng client-side, có thể xoá input form nếu gõ quá nhanh. Xác nhận qua `MutationObserver` (DOM node bị removed+added đúng lúc). Ghi vào TODO.md.
- Test: 6 case qua Playwright (browser thật) — cài Playwright tạm trong scratchpad, không đụng package.json chính.

### Bước 8 — Nối My Orders / Order Detail / Cancel (customer) → Orders API thật
- Route: `/account/orders/:orderCode` → `/account/orders/:orderId` (đổi tên param, giữ path, giá trị truyền vào đổi từ `order.orderCode` sang `order.id`).
- Tạo `src/components/common/BackendOrderStatusBadge.tsx` (8 status, không đụng `OrderStatusBadge.tsx` cũ).
- `src/pages/customer/OrdersPage.tsx` — viết lại: `getMyOrders`, pagination thật, bỏ status filter (backend `GetMyOrdersDto` không hỗ trợ).
- `src/pages/customer/OrderDetailPage.tsx` — viết lại: `getOrderDetail`, `cancelOrder` (có `ConfirmDialog`), bỏ timeline/paymentInfo (field mock không có ở backend).
- `src/pages/customer/DashboardPage.tsx` — tách fetch Orders ra effect riêng (không còn gộp `Promise.all` với services/tickets — Orders lỗi không còn làm crash cả dashboard); bỏ card "Tổng chi tiêu" (không có aggregate chính xác từ 5 order gần nhất).
- `src/pages/public/CheckoutSuccessPage.tsx` — khôi phục nút "Xem đơn hàng" → `ACCOUNT_ORDER_DETAIL(order.id)`.
- i18n mới: `status.backendOrder.*` (8 key), `common.error`, `account.orderDetail.{notFound,tax,cancelOrder,cancelConfirmTitle,cancelConfirmDescription,cancelSuccess}`.
- Test: 10 case qua Playwright — bao gồm phát hiện & xác nhận rõ bug `PageTransition.tsx` (mục trên) qua debug MutationObserver script riêng.
- Dọn dữ liệu test: soft-delete 3 product test (`order-test-no-package`, `order-test-with-package`, `order-test-inactive`) sau khi hoàn tất test.

### Bước 9 — Nối Admin Orders → Orders API thật
- `src/pages/admin/AdminOrdersPage.tsx` — viết lại hoàn toàn: search debounce 400ms, filter 8 status, sort 4 kiểu, `DataTable` + `Pagination` (bỏ pattern accordion cũ).
- `src/pages/admin/AdminOrderDetailPage.tsx` — **MỚI**, route `/admin/orders/:orderId` (theo convention `AdminProductsPage`/trang riêng, không dùng modal). Có mapping transition FE (mirror backend, chỉ để UX) + `ConfirmDialog` trước khi đổi status.
- `src/pages/admin/AdminDashboardPage.tsx` — bỏ hoàn toàn: card Revenue, biểu đồ doanh thu theo tháng, biểu đồ theo danh mục, top sản phẩm (cần aggregate toàn hệ thống, không có từ endpoint phân trang — xem DECISIONS.md #10). Giữ/nối thật: "Tổng đơn hàng" (`response.total`), "Đơn hàng gần đây" (5 đơn mới nhất).
- `src/routes/AppRoutes.tsx`, `src/constants/routes.ts` — thêm `/admin/orders/:orderId`, `ADMIN_ORDER_DETAIL`.
- i18n mới: `admin.orders.{searchPlaceholder,sortNewest,sortOldest,sortTotalAsc,sortTotalDesc,currentStatus,newStatus,confirmStatusChangeTitle,confirmStatusChangeDescription,noValidNextStatus,systemId,modifiedDate}`.
- **KHÔNG đụng** `AdminCustomersPage.tsx` (xem DECISIONS.md #11 — lý do: customer list ở đó cũng là mock, ghép Order thật vào sẽ vô nghĩa).
- Test: 12 case qua Playwright — pass 100% ngay lần chạy đầu (không gặp lại bug PageTransition vì luồng test không có thao tác gõ form ngay sau điều hướng).
- Side effect tích cực: bundle frontend giảm từ ~1.87MB → ~1.47MB vì `recharts`/`date-fns` không còn được import ở đâu (đã grep xác nhận, không phải side-effect ẩn nguy hiểm).
- Audit cuối: `orderStore.ts`/`useOrderStore` và `OrderStatusBadge.tsx` xác nhận **0 dependency thật** còn lại trong repo (an toàn xoá, đề xuất Bước 10). `orderService.ts`/`types/order.ts` còn đúng 1 dependency: `AdminCustomersPage.tsx`.

## Trạng thái build tại mọi mốc dừng
Mọi bước từ Bước 2 trở đi đều kết thúc bằng: `npm run build` (backend, nếu có sửa), `npm run build` + `npm run lint` (frontend) — **luôn pass sạch**, không có lỗi/warning mới phát sinh so với baseline (10 warning pre-existing về `any` type ở vài file backend + 1 warning react-refresh ở `Button.tsx`, không liên quan Order Module).
