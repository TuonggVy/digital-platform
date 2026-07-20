# TODO.md

> Danh sách việc còn lại, sắp theo độ ưu tiên đề xuất. Không có mục nào được tự ý bắt đầu — luôn hỏi/xác nhận hướng đi với người dùng trước khi code (đúng convention "chờ xác nhận từng bước" đã dùng xuyên suốt dự án).

## Ưu tiên cao — dọn dẹp kỹ thuật còn treo lại

- [ ] **Xoá mock Order layer đã orphan** (0 dependency, đã grep xác nhận ở Bước 9):
  - `src/stores/orderStore.ts` (export `useOrderStore`)
  - `src/components/common/OrderStatusBadge.tsx`
  - Lưu ý: **CHƯA thể xoá** `src/services/orderService.ts` + `src/types/order.ts` (mock `Order`/`OrderItem`/`OrderStatus`/`CreateOrderInput`/`PaymentStatus`/`PaymentMethod`/`OrderCustomerInfo`) vì `AdminCustomersPage.tsx` vẫn còn import `orderService.getAllOrders()` + `type Order`. Phải xử lý mục tiếp theo trước.
  - Cũng cân nhắc xoá `src/data/mocks/orders.ts` sau khi `orderService.ts` bị xoá.

- [ ] **Quyết định hướng cho `AdminCustomersPage.tsx`** (đang dùng 100% mock, cả customer lẫn order):
  - Option A: Xây dựng Users/Customers backend API thật trước (hiện `backend/src/features/users/` chỉ có `user.entity.ts` + `users.service.ts` tối giản — `findByEmail`/`findById`/`setRefreshToken` — KHÔNG có Controller, không có create/update/list/soft-delete). Cần thêm `UsersController` + mở rộng `UsersService` (CRUD đầy đủ) rồi mới nối `AdminCustomersPage` sang API thật, tính `orderCount`/`totalSpent` chính xác theo `userId` thật.
  - Option B: Bỏ hẳn 2 cột `orderCount`/`totalSpent` khỏi `AdminCustomersPage`, giữ trang này thuần hiển thị danh sách mock user cho tới khi có Users API thật.
  - **Không được**: ghép `orderApiService` (Orders thật) vào danh sách customer mock hiện tại — `customer.id` mock không khớp `order.userId` thật, sẽ tạo dữ liệu vô nghĩa.

- [ ] **Bug `PageTransition.tsx`** (phát hiện ở Bước 8, xác nhận qua `MutationObserver` — KHÔNG phải do các bước Order Module gây ra, đã tồn tại từ trước):
  - File: `src/components/animation/PageTransition.tsx`
  - Cơ chế: `AnimatePresence mode="wait"` + `key={location.pathname}` bọc `<Outlet/>` toàn cục trong `PublicLayout`. Khi điều hướng client-side (không phải full reload), trang đích mount tạm bên trong wrapper cũ đang chạy exit-animation (~250–400ms), sau đó **mount lại hoàn toàn mới** — bất kỳ input/state nào set trong cửa sổ đó bị mất vì DOM node bị huỷ+tạo lại.
  - Ảnh hưởng rõ nhất: gõ nhanh vào form Checkout ngay sau khi rời `/cart`. Người dùng thật gõ tay bình thường hiếm khi bị ảnh hưởng (mất >400ms để đọc nhãn + gõ), nhưng vẫn là rủi ro UX thật (gõ nhanh, trợ năng, test tự động).
  - Cách sửa gợi ý (chưa làm, cần task riêng vì ảnh hưởng toàn app): đổi `mode="wait"` thành không dùng `AnimatePresence` bọc `Outlet`, hoặc dùng `mode="popLayout"`/bỏ animation exit, hoặc đảm bảo `Outlet` không remount trong lúc exit đang chạy (tách `key` ra khỏi `location.pathname` toàn phần, hoặc dùng `initial={false}` kết hợp animate riêng từng route thay vì bọc quanh Outlet).

## Ưu tiên trung bình — hoàn thiện thêm cho module Orders

- [ ] `AdminOrdersPage`/`AdminOrderDetailPage`: cân nhắc thêm page-size chọn được (hiện cố định 10, UI `Pagination` component không hỗ trợ đổi pageSize).
- [ ] Cân nhắc bổ sung "8 request đếm theo status" cho Admin Dashboard nếu thực sự cần con số breakdown theo trạng thái (đã cân nhắc ở Bước 9, KHÔNG bắt buộc, tối đa 8 request `pageSize:1` mỗi status).
- [ ] Xem xét sửa edge case đã ghi nhận ở Bước 6 nhưng chưa hoàn toàn xử lý: khi Product **có** package nhưng client gửi `packageId` không hợp lệ thuộc product khác → đã trả lỗi đúng (400). Không còn vấn đề tồn đọng ở nhánh này (đã audit kỹ ở Bước 7 phần packageId rác, đã fix cho nhánh "product không có package").

## Ưu tiên thấp / các module hoàn toàn chưa động tới

Các mục này **explicitly nằm ngoài phạm vi** mọi bước đã làm — cần task riêng hoàn toàn mới nếu muốn bắt đầu:

- [ ] Register / Forgot Password / Change Password — nối backend thật (hiện Auth backend chỉ có login/refresh/logout/me; register vẫn 100% mock trong `authService.ts`)
- [ ] Payment backend (chưa tồn tại ở backend — Order hiện luôn dừng ở `PENDING` sau khi tạo, không có xác nhận thanh toán thật)
- [ ] Coupon backend (chưa tồn tại — `couponService.ts` vẫn mock, Checkout chỉ hiển thị cảnh báo "chưa áp dụng vào đơn thật")
- [ ] Refund workflow hoàn chỉnh (hiện chỉ có transition status `REFUNDED`, không có nghiệp vụ hoàn tiền thật)
- [ ] Service/License/eSIM provisioning tự động sau khi Order hoàn tất
- [ ] Notification / Email
- [ ] Invoice generation (nút "Tải hoá đơn" ở Order Detail cũ là demo, đã bỏ khỏi trang Order Detail thật)
- [ ] **Categories backend API** — hiện `backend/src/features/categories/` chỉ có `category.entity.ts` + `categories.module.ts`, KHÔNG có Controller/Service CRUD. Categories hiện chỉ được dùng nội bộ bởi `ProductsService` (resolve category code → id), không có endpoint `/categories` công khai.
- [ ] **Users backend API** — xem mục "AdminCustomersPage" ở trên, cùng vấn đề gốc.
- [ ] Gỡ `recharts` khỏi `package.json` nếu xác nhận không còn dùng ở đâu (đã gỡ khỏi `AdminDashboardPage` ở Bước 9, hiện dead dependency — không bắt buộc, chỉ là dọn dẹp bundle).

## Việc KHÔNG được tự làm khi chưa hỏi

Nhắc lại rõ ràng (đã lặp lại nhiều lần trong các bước trước, quan trọng để không lặp lại sai lầm):
- Không tự chuyển `AdminCustomersPage` sang API thật mà không xây Users backend trước.
- Không tự xoá `orderService.ts`/`types/order.ts` khi `AdminCustomersPage` còn phụ thuộc.
- Không tự sửa `PageTransition.tsx` khi task hiện tại không phải về animation/routing toàn app.
- Không tự thêm Payment/Coupon backend "cho tiện" khi đang làm việc khác liên quan Order.
