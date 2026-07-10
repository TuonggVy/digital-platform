import type { SupportArticle } from '@/types'

export const mockSupportArticles: SupportArticle[] = [
  {
    id: 'article-001',
    slug: 'huong-dan-khoi-tao-cloud-server',
    category: 'cloud',
    title: {
      vi: 'Hướng dẫn khởi tạo Cloud Server đầu tiên',
      en: 'How to create your first Cloud Server',
    },
    summary: {
      vi: 'Các bước cơ bản để khởi tạo và truy cập Cloud Server mới.',
      en: 'Basic steps to create and access a new Cloud Server.',
    },
    content: [
      {
        vi: 'Đăng nhập vào tài khoản VTC TELECOM của bạn.',
        en: 'Log in to your VTC TELECOM account.',
      },
      {
        vi: 'Chọn sản phẩm Cloud Server và gói phù hợp.',
        en: 'Choose the Cloud Server product and the plan that fits.',
      },
      {
        vi: 'Hoàn tất thanh toán để hệ thống khởi tạo máy chủ.',
        en: 'Complete payment so the system can provision your server.',
      },
      {
        vi: 'Truy cập mục Dịch vụ của tôi để lấy thông tin đăng nhập SSH.',
        en: 'Go to My Services to get your SSH access details.',
      },
    ],
    readTimeMinutes: 4,
    relatedSlugs: ['cach-nang-cap-cau-hinh-may-chu'],
    updatedAt: '2025-06-01T00:00:00.000Z',
  },
  {
    id: 'article-002',
    slug: 'cach-nang-cap-cau-hinh-may-chu',
    category: 'cloud',
    title: { vi: 'Cách nâng cấp cấu hình máy chủ', en: 'How to upgrade your server configuration' },
    summary: {
      vi: 'Nâng cấp CPU, RAM, SSD cho Cloud Server hiện có.',
      en: 'Upgrade CPU, RAM, and SSD for an existing Cloud Server.',
    },
    content: [
      {
        vi: 'Vào Dịch vụ của tôi và chọn máy chủ cần nâng cấp.',
        en: 'Go to My Services and select the server to upgrade.',
      },
      {
        vi: 'Chọn cấu hình mới và xác nhận thanh toán chênh lệch.',
        en: 'Choose the new configuration and confirm the price difference.',
      },
      {
        vi: 'Máy chủ sẽ được nâng cấp trong vài phút.',
        en: 'Your server will be upgraded within minutes.',
      },
    ],
    readTimeMinutes: 3,
    relatedSlugs: ['huong-dan-khoi-tao-cloud-server'],
    updatedAt: '2025-06-02T00:00:00.000Z',
  },
  {
    id: 'article-003',
    slug: 'kich-hoat-license-kaspersky',
    category: 'kaspersky',
    title: { vi: 'Cách kích hoạt license Kaspersky', en: 'How to activate a Kaspersky license' },
    summary: {
      vi: 'Kích hoạt license key trên thiết bị của bạn.',
      en: 'Activate your license key on your device.',
    },
    content: [
      {
        vi: 'Tải ứng dụng Kaspersky tương ứng với gói đã mua.',
        en: 'Download the Kaspersky app matching your plan.',
      },
      {
        vi: 'Mở mục Dịch vụ của tôi để lấy license key.',
        en: 'Open My Services to get your license key.',
      },
      {
        vi: 'Nhập license key vào ứng dụng để kích hoạt.',
        en: 'Enter the license key in the app to activate.',
      },
    ],
    readTimeMinutes: 3,
    relatedSlugs: ['gia-han-license-kaspersky'],
    updatedAt: '2025-06-03T00:00:00.000Z',
  },
  {
    id: 'article-004',
    slug: 'gia-han-license-kaspersky',
    category: 'kaspersky',
    title: { vi: 'Cách gia hạn license Kaspersky', en: 'How to renew a Kaspersky license' },
    summary: {
      vi: 'Gia hạn license trước khi hết hạn để không gián đoạn bảo vệ.',
      en: 'Renew before expiry to avoid a protection gap.',
    },
    content: [
      { vi: 'Vào Dịch vụ của tôi > Kaspersky.', en: 'Go to My Services > Kaspersky.' },
      {
        vi: 'Chọn dịch vụ sắp hết hạn và bấm Gia hạn.',
        en: 'Select the expiring service and click Renew.',
      },
      {
        vi: 'Hoàn tất thanh toán để gia hạn thêm 1 năm.',
        en: 'Complete payment to extend by one more year.',
      },
    ],
    readTimeMinutes: 2,
    relatedSlugs: ['kich-hoat-license-kaspersky'],
    updatedAt: '2025-06-04T00:00:00.000Z',
  },
  {
    id: 'article-005',
    slug: 'cai-dat-esim-qua-ma-qr',
    category: 'esim',
    title: { vi: 'Cài đặt eSIM qua mã QR', en: 'Installing eSIM via QR code' },
    summary: {
      vi: 'Các bước quét mã QR để cài đặt eSIM lên điện thoại.',
      en: 'Steps to scan the QR code and install eSIM on your phone.',
    },
    content: [
      {
        vi: 'Vào Cài đặt > Di động > Thêm gói cước eSIM.',
        en: 'Go to Settings > Cellular > Add eSIM.',
      },
      {
        vi: 'Quét mã QR nhận được sau khi thanh toán.',
        en: 'Scan the QR code you received after payment.',
      },
      {
        vi: 'Đợi thiết bị xác nhận và bật roaming dữ liệu.',
        en: 'Wait for confirmation, then enable data roaming.',
      },
    ],
    readTimeMinutes: 3,
    relatedSlugs: ['kiem-tra-thiet-bi-ho-tro-esim'],
    updatedAt: '2025-06-05T00:00:00.000Z',
  },
  {
    id: 'article-006',
    slug: 'kiem-tra-thiet-bi-ho-tro-esim',
    category: 'esim',
    title: {
      vi: 'Kiểm tra thiết bị có hỗ trợ eSIM không',
      en: 'Checking if your device supports eSIM',
    },
    summary: {
      vi: 'Danh sách thiết bị phổ biến hỗ trợ eSIM.',
      en: 'A list of common eSIM-compatible devices.',
    },
    content: [
      {
        vi: 'Hầu hết iPhone từ XS trở lên đều hỗ trợ eSIM.',
        en: 'Most iPhones from the XS onward support eSIM.',
      },
      {
        vi: 'Nhiều dòng Samsung Galaxy S và Z Fold/Flip hỗ trợ eSIM.',
        en: 'Many Samsung Galaxy S and Z Fold/Flip models support eSIM.',
      },
      {
        vi: 'Xem danh sách đầy đủ tại trang Kiểm tra thiết bị eSIM.',
        en: 'See the full list on our eSIM Device Compatibility page.',
      },
    ],
    readTimeMinutes: 2,
    relatedSlugs: ['cai-dat-esim-qua-ma-qr'],
    updatedAt: '2025-06-06T00:00:00.000Z',
  },
  {
    id: 'article-007',
    slug: 'huong-dan-thanh-toan-vietqr',
    category: 'billing',
    title: { vi: 'Hướng dẫn thanh toán qua VietQR', en: 'How to pay via VietQR' },
    summary: {
      vi: 'Các bước quét mã VietQR để hoàn tất thanh toán.',
      en: 'Steps to scan a VietQR code to complete payment.',
    },
    content: [
      {
        vi: 'Ở bước thanh toán, chọn phương thức VietQR.',
        en: 'At the payment step, choose the VietQR method.',
      },
      {
        vi: 'Mở ứng dụng ngân hàng và quét mã QR hiển thị.',
        en: 'Open your banking app and scan the displayed QR code.',
      },
      {
        vi: 'Xác nhận số tiền và nội dung chuyển khoản đúng mã đơn.',
        en: 'Confirm the amount and transfer content match your order code.',
      },
    ],
    readTimeMinutes: 2,
    relatedSlugs: [],
    updatedAt: '2025-06-07T00:00:00.000Z',
  },
  {
    id: 'article-008',
    slug: 'quan-ly-tai-khoan-va-mat-khau',
    category: 'account',
    title: { vi: 'Quản lý tài khoản và mật khẩu', en: 'Managing your account and password' },
    summary: {
      vi: 'Cập nhật hồ sơ và thay đổi mật khẩu an toàn.',
      en: 'Update your profile and change your password securely.',
    },
    content: [
      {
        vi: 'Vào Tài khoản > Hồ sơ để cập nhật thông tin cá nhân.',
        en: 'Go to Account > Profile to update personal information.',
      },
      {
        vi: 'Vào Tài khoản > Bảo mật để đổi mật khẩu.',
        en: 'Go to Account > Security to change your password.',
      },
    ],
    readTimeMinutes: 2,
    relatedSlugs: [],
    updatedAt: '2025-06-08T00:00:00.000Z',
  },
]
