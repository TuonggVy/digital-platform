# DECISIONS.md

> Ghi lại các quyết định thiết kế quan trọng và lý do đằng sau, để không phải tranh luận lại hoặc vô tình đảo ngược ở phiên sau.

## 1. RESTful hoá — phạm vi chỉ Products + Auth

**Quyết định**: Chỉ refactor route cho `Products` và `Auth` sang RESTful; **không** đụng vào `Categories`/`Users` dù đề bài ban đầu ngụ ý cả 4.

**Lý do**: `Categories` và `Users` lúc đó chỉ có `entity` + `module`, KHÔNG có `Controller`/route nào tồn tại để "refactor". Xây route mới cho chúng sẽ là code mới hoàn toàn (feature mới), không phải đổi tên route thuần tuý — vi phạm ràng buộc "không đổi business logic" vì logic đó chưa từng tồn tại. Người dùng được hỏi và xác nhận chọn "chỉ Products + Auth".

**Ảnh hưởng**: `/categories` và `/admin/users` vẫn không tồn tại. Nếu cần, phải làm như một feature mới, không phải phần "chuẩn hoá RESTful" tiếp theo.

## 2. Order status — cột string riêng, KHÔNG dùng bảng `status` dùng chung

**Quyết định**: `Order.status` là cột `nvarchar(30)` riêng + TS enum `OrderStatus` (8 giá trị), có `CK_orders_status` CHECK constraint ở DB — **không** map vào bảng `status` (chỉ có 4 giá trị ACTIVE/INACTIVE/PENDING/DELETED, dùng chung cho Product/User/Category).

**Lý do**: Bảng `status` là vòng đời bật/tắt chung (generic lifecycle), trong khi 8 trạng thái Order là một state machine nghiệp vụ hoàn toàn khác. Nhồi chung sẽ ô nhiễm 1 bảng đang được nhiều module khác phụ thuộc.

## 3. `OrderItem` không kế thừa `BaseEntity`

**Quyết định**: `OrderItem` chỉ có `createdDate` riêng, không có `modifiedDate`/`deletedDate` như các entity khác.

**Lý do**: OrderItem là snapshot bất biến tại thời điểm mua — không bao giờ update hay soft-delete riêng lẻ, nó sống/chết theo Order cha.

## 4. Giá sản phẩm: `packageId` bắt buộc nếu Product có package

**Quyết định**: Khi tạo Order, nếu Product có `packages[]` khác rỗng → **bắt buộc** phải gửi `packageId` hợp lệ (thuộc đúng Product đó), lấy giá từ `package.price`. Nếu Product không có package → dùng `startingPrice`, và **ép `packageId`/`packageName` về `null`** bất kể client gửi gì (sửa ở Bước 7, xem CHANGELOG).

**Lý do**: Product có `packages[]` với giá khác nhau đáng kể so với `startingPrice` (chỉ là giá hiển thị "từ..."). Nếu không bắt buộc packageId, khách có thể mua với giá sai. Quyết định này được hỏi và xác nhận rõ với người dùng trước khi code (xem Bước 1 của Order Module).

**Giới hạn đã biết**: `ProductPackage` (trong `product.entity.ts`) không có field trạng thái active/inactive riêng cho từng gói — chỉ Product-level status được kiểm tra. Không thể sửa nếu không đụng vào `Product` entity (ngoài phạm vi Order Module).

## 5. Order status transition map — cố định, không cho sửa tuỳ ý

**Quyết định**: Backend là nguồn chân lý duy nhất cho transition hợp lệ (`ALLOWED_STATUS_TRANSITIONS` trong `orders.service.ts`):
```
PENDING          → AWAITING_PAYMENT | CANCELLED | FAILED
AWAITING_PAYMENT → PAID | CANCELLED | FAILED
PAID             → PROCESSING | REFUNDED
PROCESSING       → COMPLETED | REFUNDED | FAILED
COMPLETED        → REFUNDED
FAILED           → AWAITING_PAYMENT   (business rule đặc biệt — cho phép retry thanh toán)
CANCELLED        → (terminal, không transition nào)
REFUNDED         → (terminal, không transition nào)
```
Frontend (cả customer cancel lẫn Admin update status) chỉ dùng map này để **giới hạn UX** (ẩn option sai), **KHÔNG** phải nguồn validation — mọi request vẫn đi qua backend kiểm tra lại, trả 400 kèm message liệt kê transition hợp lệ nếu sai.

**Lý do `FAILED → AWAITING_PAYMENT`**: cho phép admin đưa đơn thanh toán thất bại quay lại trạng thái chờ thanh toán để khách thử lại, thay vì phải tạo đơn mới.

## 6. `orderCode` — sinh ở service, retry khi trùng, không dùng DB sequence

**Quyết định**: Format `ORD-YYYYMMDD-XXXXXX` (6 ký tự base36 ngẫu nhiên, uppercase). Khi insert, catch lỗi unique-violation MSSQL (`driverError.number === 2627 || 2601` hoặc message chứa `UQ_orders_order_code`) và retry tối đa 5 lần với code mới; lỗi khác thì throw ngay không retry.

**Lý do**: Đơn giản, không phụ thuộc DB sequence/identity, đủ entropy (36^6 ≈ 2.17 tỷ tổ hợp/ngày) để va chạm gần như không xảy ra trong thực tế, nhưng vẫn có cơ chế phòng vệ thay vì để lỗi DB thô rơi ra ngoài.

## 7. Hai hệ type Order song song — cố ý, không hợp nhất sớm

**Quyết định**: Giữ 2 bộ type hoàn toàn tách biệt:
- **Mock** (`@/types` → `types/order.ts`): `Order`, `OrderItem`, `OrderStatus` (6 giá trị: `PENDING_PAYMENT`/`PAID`/`PROCESSING`/`COMPLETED`/`CANCELLED`/`REFUNDED`), `CreateOrderInput`, `PaymentStatus`, `PaymentMethod`, `OrderCustomerInfo` — dùng bởi `orderService.ts`/`orderStore.ts`/`OrderStatusBadge.tsx`/`AdminCustomersPage.tsx`.
- **Thật** (`@/services/orderApiService.ts`): `BackendOrder`, `BackendOrderItem`, `OrderStatus` (8 giá trị đúng backend) — dùng bởi mọi trang đã migrate.

**Lý do**: Method `createOrder`/`updateOrderStatus` mock và thật có chữ ký hoàn toàn khác nhau, không thể trùng tên trong cùng 1 object export. Người dùng được hỏi và chọn "giữ mock nguyên vẹn, API mới ở file riêng" thay vì rename hàng loạt method/component mock. Hệ quả: `OrderStatus` là tên type tồn tại ở CẢ HAI nơi với nghĩa khác nhau — không sao vì không file nào import cả hai cùng lúc, nhưng **phải luôn ý thức import đúng nguồn** khi viết code mới liên quan Order.

**Điều kiện để hợp nhất**: chỉ khi `AdminCustomersPage` (dependency cuối cùng của mock Order) được xử lý xong (xem TODO.md).

## 8. Route Order Detail — đổi param `:orderCode` → `:orderId`, giữ nguyên path

**Quyết định**: Đổi tên param trong `AppRoutes.tsx`/`ROUTES` từ `:orderCode` sang `:orderId`, giá trị truyền vào đổi từ `order.orderCode` sang `order.id` (UUID) — cho cả customer (`/account/orders/:orderId`) và admin (route mới `/admin/orders/:orderId`).

**Lý do**: Backend `GET /orders/:id`/`GET /admin/orders/:id` nhận UUID, không có endpoint "get by code". Đổi tên param (không đổi cấu trúc path) là thay đổi tối thiểu, không ảnh hưởng phạm vi ngoài Order.

## 9. Admin Order Detail — trang riêng, không phải modal/expand

**Quyết định**: Tạo `AdminOrderDetailPage.tsx` là 1 page riêng ở route mới, thay vì giữ kiểu "accordion expand inline" mà `AdminOrdersPage` cũ dùng.

**Lý do**: Convention Admin đã thiết lập rõ qua `AdminProductsPage` (dùng `DataTable` + navigate sang trang riêng `ADMIN_PRODUCT_EDIT` để sửa/xem chi tiết, không dùng expand/modal). Theo convention có sẵn nhất quán hơn là giữ pattern cũ chỉ vì nó là cách `AdminOrdersPage` từng làm. Cũng giải quyết gọn vấn đề: **API list `GET /admin/orders` không trả `items`** (đã xác nhận đọc code backend) — nên "detail" bắt buộc phải là 1 lần fetch riêng (`getAdminOrderDetail`), tự nhiên phù hợp với trang riêng hơn là inline expand.

## 10. Admin Dashboard — bỏ hẳn Revenue/Category chart/Top Products, không tính gần đúng

**Quyết định**: Gỡ hoàn toàn card "Tổng doanh thu", biểu đồ doanh thu theo tháng, biểu đồ đơn hàng theo danh mục, bảng "Sản phẩm bán chạy" khỏi `AdminDashboardPage`. Chỉ giữ "Tổng đơn hàng" (`response.total` từ 1 lần gọi `pageSize:1`) và "Đơn hàng gần đây" (5 đơn mới nhất thật).

**Lý do**: Cả 4 thứ bị gỡ đều cần **aggregate toàn bộ lịch sử Order** (tổng tiền, gộp theo tháng, gộp theo category, gộp theo sản phẩm) mà `GET /admin/orders` (phân trang) không cung cấp trực tiếp, và việc tải hết tất cả các trang để tự cộng ở frontend bị cấm rõ ràng (tốn kém, không scale). Nguyên tắc chung đã áp dụng: **thà ẩn thống kê còn hơn hiển thị số sai/gần đúng mà không giải thích**.

## 11. `AdminCustomersPage` — giữ nguyên 100% mock, không đụng

**Quyết định**: Không nối bất kỳ phần nào của `AdminCustomersPage` sang Orders API thật, kể cả một phần nhỏ.

**Lý do**: Danh sách "customer" trang này lấy từ `authService.getAllCustomers()` — **cũng là mock**, vì backend Users module không có Controller (không có cách nào liệt kê user thật qua API). `customer.id` mock không hề khớp với `order.userId` thật trong backend Orders — nếu ghép Orders thật vào, `orderCount`/`totalSpent` sẽ luôn ra 0 hoặc dữ liệu vô nghĩa. Giữ nguyên mock (nhất quán nội bộ: mock customer + mock order khớp nhau) an toàn hơn một bản ghép nửa-thật-nửa-giả.

## 12. Coupon ở Checkout — giữ UI, chỉ thêm cảnh báo, không gửi backend

**Quyết định**: Checkout vẫn hiển thị `OrderSummaryCard` với `discount` tính từ coupon mock như cũ (không đổi số hiển thị), nhưng thêm 1 dòng cảnh báo nếu `appliedCoupon` tồn tại: "Mã giảm giá sẽ được áp dụng ở bước thanh toán tiếp theo — đơn hàng hiện được tạo theo giá gốc." Payload gửi lên `POST /orders` **không bao giờ** chứa `discount`/`couponCode`/`unitPrice`/`total`/`paymentMethod` — backend tự tính subtotal/total từ `productId`+`packageId`+`quantity`.

**Lý do**: Backend Orders chưa hỗ trợ Coupon. Không được để UI hiển thị giá đã giảm mà backend âm thầm tính giá gốc không giải thích — nhưng cũng không xoá tính năng coupon UI hoàn toàn (còn dùng ở Cart page, ngoài phạm vi).

## 13. Payment method ở Checkout — vẫn cho chọn, không gửi backend, không đổi status

**Quyết định**: Bước 3 Checkout vẫn hiển thị radio chọn phương thức thanh toán + QR minh hoạ (giữ nguyên UI), nhưng giá trị này **không** được gửi vào `POST /orders`. Sau khi tạo thành công, Order giữ nguyên trạng thái backend trả về (`PENDING`), **không** tự đánh dấu `PAID`/gọi mock payment success/tự tạo service.

**Lý do**: Backend chưa có Payment thật. Message thành công đổi thành "Đặt hàng thành công" (không phải "Thanh toán thành công") — thực ra bản gốc trong `locales/*.json` (`checkout.success.title`) đã sẵn đúng nghĩa này từ trước, không cần sửa.

## 14. Test data — tạo qua API có sẵn khi có thể, SQL insert tối thiểu khi không có API

**Quyết định thứ tự ưu tiên khi cần dữ liệu test** (áp dụng nhất quán mọi bước test):
1. Seed/script có sẵn (`run_seed.js`)
2. API có sẵn (vd. `POST /admin/products` để tạo product test)
3. SQL insert tối thiểu, chỉ khi 2 cách trên không tồn tại (vd. tạo tài khoản CUSTOMER — không có API register thật trên backend, phải insert thẳng vào bảng `users` giống hệt cách `seedAdmin()` làm, bcrypt-hash password).

**Dọn dẹp**: Soft-delete (không hard-delete) mọi product test sau khi hoàn tất test, qua đúng API `DELETE /admin/products/:id` — không xoá Order test lịch sử (có FK, giữ nguyên để tham khảo/audit).

## 15. Runtime test — luôn dùng browser thật (Playwright), không chỉ test API

**Quyết định**: Từ Bước 7 trở đi, mọi "runtime test" đều dùng Playwright điều khiển Chromium thật (cài tạm trong scratchpad, KHÔNG thêm vào `package.json`/lockfile của project) thay vì chỉ gọi API bằng curl. Dùng `page.route()` để giả lập lỗi mạng (400/500) thay vì phụ thuộc backend thật trả lỗi — cách ly được việc test hành vi FRONTEND (toast, giữ cart, không điều hướng) khỏi việc phải tái tạo đúng lỗi backend.

**Lý do**: Nhiều bug (đặc biệt là bug `PageTransition.tsx`) chỉ lộ ra khi tương tác thật trên DOM, không thể phát hiện chỉ bằng đọc code hoặc gọi API trực tiếp.

## 16. Không dùng `chromium-cli` — cài Playwright thủ công trong scratchpad

**Quyết định**: Môi trường không có sẵn `chromium-cli` (công cụ được gợi ý trong skill `run`). Đã cài `playwright` qua `npm install` trong một thư mục tạm dưới scratchpad (`pw-driver/`), tách biệt hoàn toàn khỏi `package.json` chính của dự án.

**Lý do**: Tránh làm bẩn dependency chính của dự án chỉ vì mục đích test một lần. Chromium binary đã có sẵn trong cache hệ thống (`~/Library/Caches/ms-playwright/`) nên không tốn thời gian tải lại.
