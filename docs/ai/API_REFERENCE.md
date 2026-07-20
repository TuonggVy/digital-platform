# API_REFERENCE.md

> Backend: `http://localhost:3000` (dev). Swagger UI: `http://localhost:3000/api/docs`. Không có global prefix (`/orders` không phải `/api/orders`).

## Response envelope (áp dụng TOÀN BỘ, không ngoại lệ)

```json
{ "code": 0, "message": "Thành công", "data": { } }
```

| HTTP status | `code` | Ý nghĩa |
|---|---|---|
| 200/201 | `0` | Success |
| 400 | `-2` | Bad Request (validation, business rule) |
| 401 | `-3` | Unauthorized (chưa đăng nhập / token hết hạn / thiếu quyền — dùng chung code cho cả 401 và 403!) |
| 403 | `-3` | Forbidden (role không đủ quyền) — **lưu ý: cùng code `-3` như 401** |
| 404 | `-4` | Not Found |
| 409 | `-5` | Conflict |
| 500 | `-1` | Internal Error |

Frontend (`apiClient.ts`) đã bóc `data` ra khỏi envelope tự động — service layer nhận thẳng giá trị `data`, lỗi thì nhận `Error(message)` (message lấy từ `envelope.message`, KHÔNG còn giữ mã HTTP status ở tầng service/page).

## 1. Auth — RESTful, đã chuẩn hoá

| Method | Route | Auth | Body/Query | Ghi chú |
|---|---|---|---|---|
| POST | `/auth/login` | Public | `{email, password}` | Trả `{accessToken, refreshToken, user}` |
| POST | `/auth/refresh` | Public | `{refreshToken}` | Trả token mới |
| POST | `/auth/logout` | JWT | — | Thu hồi refresh token phía server |
| GET | `/auth/me` | JWT | — | Trả `PublicUser` hiện tại |

`JWT_ACCESS_EXPIRES_IN` mặc định 15 phút — access token hết hạn khá nhanh, `apiClient.ts` tự refresh 1 lần khi gặp 401 (trừ chính route login/refresh).

## 2. Products — RESTful, đã chuẩn hoá

### Public (không cần JWT)
| Method | Route | Query params |
|---|---|---|
| GET | `/products` | `category, subCategory, search, minPrice, maxPrice, billingCycle, region, days, hotspot, userType, devices, sort(featured\|price_asc\|price_desc), page, pageSize` |
| GET | `/products/featured` | `limit` |
| GET | `/products/:idOrSlug` | — (thực chất chỉ tra theo slug — xem ghi chú) |
| GET | `/products/:idOrSlug/related` | — |

Ghi chú: `:idOrSlug` chỉ tra theo `slug` (giữ nguyên business logic gốc lúc RESTful hoá, chỉ đổi route/param location, KHÔNG thêm logic tra theo UUID).

### Admin (JWT + role ADMIN)
| Method | Route | Body |
|---|---|---|
| GET | `/admin/products` | — (không hỗ trợ pagination/search/filter — trả toàn bộ) |
| GET | `/admin/products/:id` | — |
| POST | `/admin/products` | `CreateProductDto` |
| PATCH | `/admin/products/:id` | `UpdateProductDto` (Partial của Create, id từ URL) |
| DELETE | `/admin/products/:id` | — (soft delete) |

## 3. Categories / Users — CHƯA có API (chỉ entity)

Không có route nào tồn tại. `Categories` chỉ dùng nội bộ (ProductsService resolve code→id). `Users` chỉ có 3 method service nội bộ phục vụ Auth. Xem TODO.md nếu cần xây.

## 4. Orders — MỚI, xây hoàn toàn trong session này

### Customer (JWT required, không cần role đặc biệt)

#### `POST /orders` — Tạo đơn hàng
```jsonc
// Request
{
  "items": [{ "productId": "uuid", "packageId": "string (bắt buộc nếu Product có package)", "quantity": 1 }],
  "customerName": "string",
  "customerEmail": "email",
  "customerPhone": "string",
  "note": "string (optional)"
}
// Response 201 — data: BackendOrder đầy đủ kèm items[]
```
Validation lỗi thường gặp (400):
- `Sản phẩm không tồn tại: <id>` — id sai hoặc product đã soft-delete
- `Sản phẩm không khả dụng: <slug>` — product tồn tại nhưng statusId ≠ ACTIVE
- `Sản phẩm <slug> yêu cầu chọn gói (packageId)` — product có packages nhưng thiếu packageId
- `Gói sản phẩm không tồn tại: <packageId>` — packageId sai hoặc thuộc product khác
- `Tài khoản không tồn tại hoặc không còn hoạt động` — user bị xoá/inactive giữa lúc token còn hạn

#### `GET /orders?page=&pageSize=` — Danh sách đơn của chính mình
Response: `{items: BackendOrder[] (không có items con), total, page, pageSize, totalPages}`.

#### `GET /orders/:id` — Chi tiết đơn (chỉ của chính mình)
`:id` phải là UUID hợp lệ (`ParseUUIDPipe` → 400 nếu sai format). 404 nếu không tồn tại HOẶC thuộc user khác (không phân biệt để tránh lộ thông tin).

#### `POST /orders/:id/cancel` — Huỷ đơn (không cần body)
200 (không phải 201, ghi đè mặc định `@Post`). Chỉ cho phép khi status ∈ `{PENDING, AWAITING_PAYMENT}`, ngược lại 400 "Đơn hàng đã thanh toán hoặc không thể huỷ".

### Admin (JWT + `@Roles(ADMIN)`)

#### `GET /admin/orders` — Danh sách toàn bộ
Query: `page, pageSize, search (orderCode|customerName|customerEmail|customerPhone), status (1 trong 8 enum), sort (newest|oldest|total_asc|total_desc, default newest)`.
Response: `{items, total, page, pageSize, totalPages}` — **KHÔNG có `items` con (OrderItem) trong mỗi order của list.**

#### `GET /admin/orders/:id` — Chi tiết (không ràng buộc owner)
Có đầy đủ `items[]`.

#### `PATCH /admin/orders/:id/status` — Đổi trạng thái
```jsonc
// Request
{ "status": "AWAITING_PAYMENT" }   // chỉ field này, không sửa field khác của Order
```
400 nếu transition không hợp lệ, message dạng: `"Không thể chuyển trạng thái từ X sang Y. Trạng thái hợp lệ tiếp theo: A, B, C"` (hoặc `"Đây là trạng thái cuối, không thể chuyển tiếp"` nếu terminal).

**Transition map đầy đủ**: xem DECISIONS.md #5 hoặc `backend/src/features/orders/orders.service.ts` (const `ALLOWED_STATUS_TRANSITIONS`) — đây là nguồn chân lý.

### `BackendOrder` shape (response, camelCase — TypeORM tự map từ snake_case)
```ts
{
  id: string
  orderCode: string
  status: 'PENDING'|'AWAITING_PAYMENT'|'PAID'|'PROCESSING'|'COMPLETED'|'CANCELLED'|'FAILED'|'REFUNDED'
  subtotal: number
  discountAmount: number
  taxAmount: number
  totalAmount: number
  currency: string          // luôn 'VND' hiện tại
  customerName: string
  customerEmail: string
  customerPhone: string
  note: string | null
  createdDate: string       // ISO
  modifiedDate: string | null
  deletedDate: string | null
  userId: string            // có trong response thật nhưng KHÔNG khai báo trong FE type BackendOrder (xem ghi chú)
  items?: BackendOrderItem[]  // chỉ có ở detail, KHÔNG có ở list
}
```
> Ghi chú: FE `BackendOrder` interface (`src/services/orderApiService.ts`) hiện **không khai báo field `userId`** dù backend luôn trả về — vì chưa có UI nào cần dùng nó. Nếu cần (vd. để AdminCustomersPage nối Orders thật sau này), chỉ cần thêm 1 dòng vào interface, backend không cần đổi gì.

### `BackendOrderItem` shape
```ts
{
  id: string
  productId: string
  productName: { vi: string, en: string }
  productType: string
  packageId: string | null
  packageName: { vi: string, en: string } | null
  unitPrice: number
  quantity: number
  totalPrice: number
  createdDate: string
}
```

## 5. Frontend service → Backend route mapping

### `src/services/orderApiService.ts` (THẬT — dùng cho mọi trang đã migrate)
```ts
orderApiService.createOrder(payload: CreateOrderRequest): Promise<BackendOrder>
  → POST /orders

orderApiService.getMyOrders(params?: {page?, pageSize?}): Promise<PaginatedResult<BackendOrder>>
  → GET /orders

orderApiService.getOrderDetail(id: string): Promise<BackendOrder>
  → GET /orders/:id

orderApiService.cancelOrder(id: string): Promise<BackendOrder>
  → POST /orders/:id/cancel   (không gửi body)

orderApiService.getAdminOrders(params?: {page?, pageSize?, search?, status?, sort?}): Promise<PaginatedResult<BackendOrder>>
  → GET /admin/orders

orderApiService.getAdminOrderDetail(id: string): Promise<BackendOrder>
  → GET /admin/orders/:id

orderApiService.updateOrderStatus(id: string, status: OrderStatus): Promise<BackendOrder>
  → PATCH /admin/orders/:id/status   body: {status}
```
`PaginatedResult<T>` được export từ `src/services/productService.ts` (dùng lại, không định nghĩa trùng).

### `src/services/orderService.ts` (MOCK — vẫn còn 1 dependency: `AdminCustomersPage.tsx`)
Chạy hoàn toàn trên `localStorage` (qua `createRepository`), không gọi network. Method: `createOrder`, `getOrdersByUser`, `getOrderByCode`, `getAllOrders`, `updateOrderStatus`. **Không dùng cho code mới.**

### `src/services/productService.ts` (THẬT — RESTful hoá từ trước)
```ts
productService.getProducts(filters)        → GET /products
productService.getProductBySlug(slug)      → GET /products/:idOrSlug
productService.getFeaturedProducts(limit)  → GET /products/featured
productService.getRelatedProducts(product) → GET /products/:idOrSlug/related
productService.getAllForAdmin()            → GET /admin/products
productService.createProduct(input)        → POST /admin/products
productService.updateProduct(id, input)    → PATCH /admin/products/:id
productService.deleteProduct(id)           → DELETE /admin/products/:id
```

### `src/services/authService.ts` (MIX — login/logout thật, register/profile vẫn mock)
```ts
authService.login(email, password)   → POST /auth/login  (fallback mock nếu backend lỗi — xem code, có try/catch)
authService.logout()                 → POST /auth/logout
authService.register(...)            → MOCK (localStorage) — backend chưa có register
authService.updateProfile(...)       → MOCK
authService.changePassword(...)      → MOCK
authService.getAllCustomers()        → MOCK — dùng bởi AdminCustomersPage
```

### `src/services/apiClient.ts` — helper HTTP dùng chung
```ts
apiGet<T>(url, params?)    → axios.get,   trả response.data.data
apiPost<T>(url, body?)     → axios.post,  trả response.data.data
apiPatch<T>(url, body?)    → axios.patch, trả response.data.data
apiDelete<T>(url)          → axios.delete, trả response.data.data
```
`baseURL` từ `import.meta.env.VITE_API_BASE_URL` (mặc định `http://localhost:3000` nếu env không set — xem `.env` ở root, KHÔNG phải `backend/.env`).

## 6. Mã lỗi nghiệp vụ Order thường gặp (để hiển thị đúng, không cần đoán)

| Tình huống | HTTP | Message (vi) |
|---|---|---|
| Product không tồn tại/đã xoá | 400 | `Sản phẩm không tồn tại: <id>` |
| Product không active | 400 | `Sản phẩm không khả dụng: <slug>` |
| Thiếu packageId khi product có package | 400 | `Sản phẩm <slug> yêu cầu chọn gói (packageId)` |
| packageId sai/thuộc product khác | 400 | `Gói sản phẩm không tồn tại: <packageId>` |
| User bị xoá/inactive | 400 | `Tài khoản không tồn tại hoặc không còn hoạt động` |
| Cancel order không hợp lệ status | 400 | `Đơn hàng đã thanh toán hoặc không thể huỷ` |
| Update status sai transition | 400 | `Không thể chuyển trạng thái từ X sang Y. Trạng thái hợp lệ tiếp theo: ...` |
| Order không tồn tại/không phải chủ sở hữu | 404 | `Không tìm thấy đơn hàng` |
| Chưa đăng nhập | 401 | `Token không hợp lệ hoặc đã hết hạn` |
| Không đủ quyền (role) | 403 | `Forbidden resource` |
