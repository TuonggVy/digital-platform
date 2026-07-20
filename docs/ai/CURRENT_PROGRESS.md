# CURRENT_PROGRESS.md

> Cập nhật lần cuối: sau khi hoàn thành **Bước 9** (Admin Orders → API thật), ngay trước khi nén hội thoại lần đầu tiên. Đọc file này ĐẦU TIÊN khi tiếp tục phiên làm việc mới.

## Đang dừng ở đâu

Vừa hoàn thành và **báo cáo PASS** cho toàn bộ chuỗi 9 bước xây & tích hợp **Order Module**:

1. ✅ Bước 1-4 (trước đó, task riêng): Chuẩn hoá **Products** + **Auth** backend sang RESTful, cập nhật frontend tương ứng.
2. ✅ Bước 1 (Order Module): Phân tích & thiết kế Order Module.
3. ✅ Bước 2: Entity (`Order`, `OrderItem`), Migration `006_create_orders.sql`, DTOs.
4. ✅ Bước 3: `OrdersService` (business logic) — đã qua 1 vòng audit phát hiện & sửa 9 vấn đề (transaction, package pricing, order code collision, rounding, N+1 query, user validation).
5. ✅ Bước 4: `OrdersController` + Swagger.
6. ✅ Bước 5: `orderApiService.ts` (frontend service layer thật, KHÔNG đụng mock `orderService.ts`).
7. ✅ Bước 6: Test toàn diện lifecycle backend (curl + MSSQL trực tiếp) — PASS, 1 bug nhỏ ghi nhận (packageId rác khi Product không có package).
8. ✅ Bước 7: Nối **Checkout** (`CheckoutPage`, `CheckoutSuccessPage`) → Orders API thật. Sửa bug packageId (Bước 6 để lại). Phát hiện thêm bug `PageTransition.tsx` (KHÔNG sửa, đã ghi nhận).
9. ✅ Bước 8: Nối **My Orders / Order Detail / Cancel** (customer) → Orders API thật. Route `:orderCode` → `:orderId`. Tạo `BackendOrderStatusBadge`.
10. ✅ Bước 9: Nối **Admin Orders** (list + detail mới + status update) → Orders API thật. Trim Admin Dashboard (bỏ Revenue/chart không đủ dữ liệu).

**Trạng thái hiện tại**: Cả Customer flow (Checkout → My Orders → Order Detail → Cancel) và Admin flow (Orders list → Detail → Status update) đều đã chạy 100% trên backend thật, đã test runtime qua Playwright + xác minh MSSQL trực tiếp ở mọi bước. Build + lint frontend & backend đều pass sạch tại thời điểm dừng.

## File đang/đã sửa trong phiên này (chưa commit — xem `git status`)

Xem đầy đủ trong [CHANGELOG.md](./CHANGELOG.md). Tóm tắt nhóm file còn "dirty" so với git:

**Backend** (thư mục `backend/` toàn bộ là mới — chưa từng commit trong git history hiển thị, xuất hiện dạng `??` trong `git status`):
- Toàn bộ Order Module: `backend/src/features/orders/**`
- `backend/src/features/products/products.controller.ts` (RESTful hoá — task trước session Order Module)
- `backend/src/features/auth/auth.controller.ts` (RESTful hoá)
- `backend/src/app.module.ts` (đăng ký `OrdersModule`)
- `backend/migrations/006_create_orders.sql`

**Frontend** (`M` = modified, `??` = untracked mới):
- `?? src/services/orderApiService.ts` — service thật, 7 method
- `?? src/services/apiClient.ts` — RESTful hoá (task trước)
- `?? src/components/common/BackendOrderStatusBadge.tsx`
- `?? src/pages/admin/AdminOrderDetailPage.tsx`
- `M src/pages/public/CheckoutPage.tsx`, `CheckoutSuccessPage.tsx`
- `M src/pages/customer/OrdersPage.tsx`, `OrderDetailPage.tsx`, `DashboardPage.tsx`
- `M src/pages/admin/AdminOrdersPage.tsx`, `AdminDashboardPage.tsx`
- `M src/routes/AppRoutes.tsx`, `src/constants/routes.ts`
- `M src/locales/vi.json`, `src/locales/en.json`
- `M src/services/authService.ts`, `productService.ts`, `index.ts` (RESTful hoá, task trước)
- `M src/stores/authStore.ts` (RESTful hoá, task trước)
- `?? src/vite-env.d.ts`, `.env.example`

**KHÔNG sửa** (giữ nguyên có chủ đích): `src/services/orderService.ts`, `src/stores/orderStore.ts`, `src/types/order.ts`, `src/components/common/OrderStatusBadge.tsx`, `src/pages/admin/AdminCustomersPage.tsx`.

## Dữ liệu test hiện có trong DB (MSSQL, môi trường dev)

- **Tài khoản**: `admin@digital-platform.local` / `Admin@123` (ADMIN); `order-test-a@digital-platform.local` / `Customer@123` và `order-test-b@digital-platform.local` / `Customer@123` (CUSTOMER, tạo bằng SQL insert trực tiếp vì backend chưa có API tạo customer).
- **Sản phẩm test** (`order-test-no-package`, `order-test-with-package`, `order-test-inactive`) đã **soft-delete** sau khi hoàn tất test ở Bước 8 — không còn hiện trong catalogue `/products`.
- **~12 Order test** còn tồn tại trong DB (nhiều trạng thái khác nhau: PENDING/AWAITING_PAYMENT/PAID/PROCESSING/CANCELLED/FAILED/REFUNDED) — dữ liệu thật hợp lệ, KHÔNG cần xoá, có thể tiếp tục dùng để test các bước sau.
- Sản phẩm thật còn ACTIVE có package: `cloud-server-starter` (package `pkg-1`, giá 150.000₫).

## Việc cần làm tiếp theo (theo đề xuất đã đưa ra cuối Bước 9)

Xem chi tiết & độ ưu tiên đầy đủ trong [TODO.md](./TODO.md). Tóm tắt các hướng khả dĩ cho phiên tiếp theo (chưa có bước nào được xác nhận bắt đầu):

1. **Cleanup mock Order layer (đề xuất "Bước 10")**: `orderStore.ts`/`useOrderStore` và `OrderStatusBadge.tsx` hiện có **0 dependency thật** trong toàn repo (đã grep xác nhận) — an toàn xoá. `orderService.ts`/`types/order.ts` còn đúng 1 dependency: `AdminCustomersPage.tsx`.
2. **Quyết định hướng cho `AdminCustomersPage`**: cần Users/Customers backend API thật (hiện `backend/src/features/users/` chỉ có entity + service tối giản, KHÔNG có Controller) trước khi có thể tích hợp Orders thật một cách có ý nghĩa — nếu không, giữ nguyên mock hoặc bỏ 2 cột `orderCount`/`totalSpent`.
3. **Xử lý bug `PageTransition.tsx`** (đã phát hiện ở Bước 8, chưa sửa) — `AnimatePresence mode="wait"` gây remount trang ~250-400ms sau điều hướng client-side, có thể làm mất dữ liệu form nếu user gõ quá nhanh. Ảnh hưởng toàn app, cần task riêng.
4. Các module hoàn toàn chưa động tới: Register/Forgot Password/Change Password thật, Payment, Coupon, Refund, Service/License/eSIM provisioning, Notification/Email, Invoice, Categories backend API (chỉ có entity, chưa có Controller).

**Nếu người dùng nói "tiếp tục"**: hỏi rõ họ muốn bắt đầu hướng nào trong 4 mục trên trước, KHÔNG tự chọn thay (đúng tinh thần "chờ xác nhận" đã áp dụng xuyên suốt 9 bước vừa qua).
