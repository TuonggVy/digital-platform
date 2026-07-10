import type { Faq } from '@/types'

export const mockFaqs: Faq[] = [
  {
    id: 'faq-general-1',
    group: 'general',
    question: {
      vi: 'VTC TELECOM cung cấp những dịch vụ nào?',
      en: 'What services does VTC TELECOM offer?',
    },
    answer: {
      vi: 'VTC TELECOM cung cấp ba nhóm dịch vụ chính: Cloud (máy chủ, Kubernetes, lưu trữ), phần mềm bảo mật Kaspersky và eSIM du lịch quốc tế.',
      en: 'VTC TELECOM offers three core service groups: Cloud (servers, Kubernetes, storage), Kaspersky security software, and international travel eSIM.',
    },
  },
  {
    id: 'faq-general-2',
    group: 'general',
    question: {
      vi: 'Tôi có cần tài khoản để mua hàng không?',
      en: 'Do I need an account to make a purchase?',
    },
    answer: {
      vi: 'Bạn cần đăng ký tài khoản để theo dõi đơn hàng và quản lý dịch vụ của mình.',
      en: 'You need to register an account to track your orders and manage your services.',
    },
  },
  {
    id: 'faq-cloud-1',
    group: 'cloud',
    question: {
      vi: 'Tôi có thể nâng cấp cấu hình Cloud Server không?',
      en: 'Can I upgrade my Cloud Server configuration?',
    },
    answer: {
      vi: 'Có, bạn có thể nâng cấp bất kỳ lúc nào từ khu vực quản lý dịch vụ.',
      en: 'Yes, you can upgrade at any time from your service management area.',
    },
  },
  {
    id: 'faq-cloud-2',
    group: 'cloud',
    question: {
      vi: 'Cloud Server hỗ trợ hệ điều hành nào?',
      en: 'Which operating systems does Cloud Server support?',
    },
    answer: {
      vi: 'Hỗ trợ Ubuntu, CentOS, Windows Server và nhiều hệ điều hành phổ biến khác.',
      en: 'It supports Ubuntu, CentOS, Windows Server, and other popular operating systems.',
    },
  },
  {
    id: 'faq-kaspersky-1',
    group: 'kaspersky',
    question: {
      vi: 'License Kaspersky có dùng được trên nhiều thiết bị không?',
      en: 'Can a Kaspersky license be used on multiple devices?',
    },
    answer: {
      vi: 'Tùy vào gói bạn chọn, license có thể áp dụng cho 1, 3, 5 hoặc 10 thiết bị.',
      en: 'Depending on your plan, the license can cover 1, 3, 5, or 10 devices.',
    },
  },
  {
    id: 'faq-kaspersky-2',
    group: 'kaspersky',
    question: {
      vi: 'Làm sao để kích hoạt license Kaspersky?',
      en: 'How do I activate my Kaspersky license?',
    },
    answer: {
      vi: 'Tải ứng dụng Kaspersky và nhập license key được cung cấp trong mục Dịch vụ của tôi.',
      en: 'Download the Kaspersky app and enter the license key provided in My Services.',
    },
  },
  {
    id: 'faq-esim-1',
    group: 'esim',
    question: {
      vi: 'Làm sao để biết thiết bị của tôi có hỗ trợ eSIM?',
      en: 'How do I know if my device supports eSIM?',
    },
    answer: {
      vi: 'Bạn có thể kiểm tra tại trang Kiểm tra thiết bị eSIM của chúng tôi.',
      en: 'You can check our eSIM Device Compatibility page.',
    },
  },
  {
    id: 'faq-esim-2',
    group: 'esim',
    question: {
      vi: 'Gói eSIM có thể dùng lại nhiều lần không?',
      en: 'Can an eSIM plan be reused multiple times?',
    },
    answer: {
      vi: 'Mỗi gói eSIM chỉ sử dụng cho một lần kích hoạt trong thời hạn đã mua.',
      en: 'Each eSIM plan is valid for a single activation within its purchased duration.',
    },
  },
  {
    id: 'faq-billing-1',
    group: 'billing',
    question: {
      vi: 'VTC TELECOM hỗ trợ những phương thức thanh toán nào?',
      en: 'What payment methods does VTC TELECOM support?',
    },
    answer: {
      vi: 'Chuyển khoản ngân hàng, VietQR, ví điện tử và thẻ quốc tế.',
      en: 'Bank transfer, VietQR, e-wallets, and international cards.',
    },
  },
  {
    id: 'faq-billing-2',
    group: 'billing',
    question: { vi: 'Tôi có thể xuất hóa đơn VAT không?', en: 'Can I get a VAT invoice?' },
    answer: {
      vi: 'Có, vui lòng cung cấp thông tin công ty và mã số thuế khi thanh toán.',
      en: 'Yes, please provide your company details and tax code at checkout.',
    },
  },
  {
    id: 'faq-renewal-1',
    group: 'renewal',
    question: {
      vi: 'Dịch vụ của tôi có tự động gia hạn không?',
      en: 'Do my services renew automatically?',
    },
    answer: {
      vi: 'Hiện tại dịch vụ demo chưa hỗ trợ tự động gia hạn, bạn cần gia hạn thủ công.',
      en: 'This demo does not support auto-renewal yet; you need to renew manually.',
    },
  },
  {
    id: 'faq-renewal-2',
    group: 'renewal',
    question: {
      vi: 'Tôi sẽ được thông báo khi dịch vụ sắp hết hạn không?',
      en: 'Will I be notified before my service expires?',
    },
    answer: {
      vi: 'Có, dịch vụ sắp hết hạn sẽ hiển thị trạng thái "Sắp hết hạn" trong tài khoản của bạn.',
      en: 'Yes, expiring services show an "Expiring soon" status in your account.',
    },
  },
]
