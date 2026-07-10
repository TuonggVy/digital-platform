import type { Product } from '@/types'

export const kasperskyProducts: Product[] = [
  {
    id: 'kaspersky-standard',
    slug: 'kaspersky-standard',
    category: 'kaspersky',
    subCategory: 'standard',
    name: { vi: 'Kaspersky Standard', en: 'Kaspersky Standard' },
    shortDescription: {
      vi: 'Bảo vệ cơ bản chống virus và lừa đảo trực tuyến.',
      en: 'Essential protection against viruses and online scams.',
    },
    description: {
      vi: 'Kaspersky Standard cung cấp lớp bảo vệ thiết yếu chống virus, mã độc và các trang web lừa đảo, giúp thiết bị của bạn luôn an toàn khi lướt web hàng ngày.',
      en: 'Kaspersky Standard provides essential protection against viruses, malware, and phishing sites, keeping your device safe during everyday browsing.',
    },
    icon: 'ShieldCheck',
    startingPrice: 399000,
    currency: 'VND',
    billingCycles: ['yearly'],
    features: [
      { vi: 'Chống virus', en: 'Antivirus protection' },
      { vi: 'Chống lừa đảo', en: 'Anti-phishing' },
      { vi: 'Bảo vệ web', en: 'Web protection' },
    ],
    benefits: [
      { vi: 'Quét virus theo thời gian thực', en: 'Real-time virus scanning' },
      { vi: 'Cảnh báo trang web độc hại', en: 'Malicious website warnings' },
      { vi: 'Ít ảnh hưởng hiệu năng thiết bị', en: 'Low impact on device performance' },
    ],
    howItWorks: [
      { vi: 'Chọn số lượng thiết bị cần bảo vệ', en: 'Choose how many devices to protect' },
      { vi: 'Nhận license key sau khi thanh toán', en: 'Receive your license key after payment' },
      {
        vi: 'Tải và kích hoạt ứng dụng trên thiết bị',
        en: 'Download and activate the app on your device',
      },
    ],
    suitableFor: [
      { vi: 'Cá nhân cần bảo vệ cơ bản', en: 'Individuals needing essential protection' },
    ],
    faqs: [
      {
        question: {
          vi: 'Tôi có thể dùng license trên nhiều thiết bị không?',
          en: 'Can I use one license on multiple devices?',
        },
        answer: {
          vi: 'Có, tùy theo gói bạn chọn (1 hoặc 3 thiết bị).',
          en: 'Yes, depending on the plan you choose (1 or 3 devices).',
        },
      },
    ],
    rating: 4.6,
    reviewCount: 302,
    isFeatured: true,
    isActive: true,
    relatedProductIds: ['kaspersky-plus', 'kaspersky-premium'],
    createdAt: '2025-02-01T00:00:00.000Z',
    updatedAt: '2025-05-01T00:00:00.000Z',
    packages: [
      {
        id: 'kaspersky-standard-1d-1y',
        name: { vi: '1 thiết bị - 1 năm', en: '1 device - 1 year' },
        price: 399000,
        billingCycle: 'yearly',
        kaspersky: {
          devices: 1,
          duration: '1 năm',
          userType: 'personal',
          supportedOS: ['Windows', 'macOS', 'Android'],
        },
      },
      {
        id: 'kaspersky-standard-3d-1y',
        name: { vi: '3 thiết bị - 1 năm', en: '3 devices - 1 year' },
        price: 699000,
        billingCycle: 'yearly',
        isPopular: true,
        kaspersky: {
          devices: 3,
          duration: '1 năm',
          userType: 'family',
          supportedOS: ['Windows', 'macOS', 'Android', 'iOS'],
        },
      },
    ],
  },
  {
    id: 'kaspersky-plus',
    slug: 'kaspersky-plus',
    category: 'kaspersky',
    subCategory: 'plus',
    name: { vi: 'Kaspersky Plus', en: 'Kaspersky Plus' },
    shortDescription: {
      vi: 'Bảo vệ nâng cao kèm VPN và trình quản lý mật khẩu.',
      en: 'Advanced protection with VPN and password manager.',
    },
    description: {
      vi: 'Kaspersky Plus bao gồm toàn bộ tính năng của Standard, bổ sung VPN không giới hạn, trình quản lý mật khẩu và kiểm tra rò rỉ dữ liệu cá nhân.',
      en: 'Kaspersky Plus includes everything in Standard, plus unlimited VPN, a password manager, and personal data leak checks.',
    },
    icon: 'Lock',
    badge: { vi: 'Phổ biến', en: 'Popular' },
    startingPrice: 599000,
    currency: 'VND',
    billingCycles: ['yearly'],
    features: [
      { vi: 'VPN không giới hạn', en: 'Unlimited VPN' },
      { vi: 'Trình quản lý mật khẩu', en: 'Password manager' },
      { vi: 'Kiểm tra rò rỉ dữ liệu', en: 'Data leak checker' },
    ],
    benefits: [
      { vi: 'Bao gồm toàn bộ tính năng Standard', en: 'Includes all Standard features' },
      { vi: 'Duyệt web riêng tư với VPN', en: 'Private browsing with VPN' },
      { vi: 'Lưu trữ mật khẩu an toàn', en: 'Secure password storage' },
    ],
    howItWorks: [
      { vi: 'Chọn số lượng thiết bị cần bảo vệ', en: 'Choose how many devices to protect' },
      { vi: 'Nhận license key sau khi thanh toán', en: 'Receive your license key after payment' },
      {
        vi: 'Kích hoạt và thiết lập VPN, password manager',
        en: 'Activate and set up VPN and password manager',
      },
    ],
    suitableFor: [
      {
        vi: 'Người dùng cần bảo mật và riêng tư nâng cao',
        en: 'Users needing advanced security and privacy',
      },
    ],
    faqs: [
      {
        question: { vi: 'VPN có giới hạn dung lượng không?', en: 'Is the VPN data-limited?' },
        answer: {
          vi: 'Không, VPN đi kèm Kaspersky Plus không giới hạn dung lượng.',
          en: 'No, the VPN included with Kaspersky Plus is unlimited.',
        },
      },
    ],
    rating: 4.8,
    reviewCount: 189,
    isFeatured: true,
    isActive: true,
    relatedProductIds: ['kaspersky-standard', 'kaspersky-premium'],
    createdAt: '2025-02-05T00:00:00.000Z',
    updatedAt: '2025-05-02T00:00:00.000Z',
    packages: [
      {
        id: 'kaspersky-plus-1d-1y',
        name: { vi: '1 thiết bị - 1 năm', en: '1 device - 1 year' },
        price: 599000,
        billingCycle: 'yearly',
        kaspersky: {
          devices: 1,
          duration: '1 năm',
          userType: 'personal',
          supportedOS: ['Windows', 'macOS', 'Android'],
        },
      },
      {
        id: 'kaspersky-plus-5d-1y',
        name: { vi: '5 thiết bị - 1 năm', en: '5 devices - 1 year' },
        price: 1099000,
        billingCycle: 'yearly',
        isPopular: true,
        kaspersky: {
          devices: 5,
          duration: '1 năm',
          userType: 'family',
          supportedOS: ['Windows', 'macOS', 'Android', 'iOS'],
        },
      },
    ],
  },
  {
    id: 'kaspersky-premium',
    slug: 'kaspersky-premium',
    category: 'kaspersky',
    subCategory: 'premium',
    name: { vi: 'Kaspersky Premium', en: 'Kaspersky Premium' },
    shortDescription: {
      vi: 'Bảo vệ danh tính toàn diện với hỗ trợ cao cấp.',
      en: 'Complete identity protection with premium support.',
    },
    description: {
      vi: 'Kaspersky Premium mang đến khả năng bảo vệ danh tính toàn diện, VPN, trình quản lý mật khẩu và hỗ trợ kỹ thuật ưu tiên dành cho người dùng đòi hỏi cao.',
      en: 'Kaspersky Premium delivers comprehensive identity protection, VPN, password manager, and priority technical support for demanding users.',
    },
    icon: 'ShieldCheck',
    startingPrice: 1499000,
    currency: 'VND',
    billingCycles: ['yearly'],
    features: [
      { vi: 'Bảo vệ danh tính', en: 'Identity protection' },
      { vi: 'Hỗ trợ cao cấp', en: 'Premium support' },
      { vi: 'VPN & Password Manager', en: 'VPN & password manager' },
    ],
    benefits: [
      { vi: 'Ưu tiên hỗ trợ kỹ thuật 24/7', en: 'Priority 24/7 technical support' },
      { vi: 'Giám sát danh tính trên internet', en: 'Identity monitoring across the internet' },
      { vi: 'Bảo vệ trẻ em trực tuyến', en: 'Online child protection tools' },
    ],
    howItWorks: [
      { vi: 'Chọn số lượng thiết bị cần bảo vệ', en: 'Choose how many devices to protect' },
      { vi: 'Nhận license key sau khi thanh toán', en: 'Receive your license key after payment' },
      {
        vi: 'Kích hoạt và cấu hình các tính năng nâng cao',
        en: 'Activate and configure advanced features',
      },
    ],
    suitableFor: [
      {
        vi: 'Gia đình và cá nhân cần bảo vệ toàn diện',
        en: 'Families and individuals needing full protection',
      },
    ],
    faqs: [
      {
        question: {
          vi: 'Hỗ trợ cao cấp bao gồm những gì?',
          en: 'What does premium support include?',
        },
        answer: {
          vi: 'Bạn được ưu tiên xử lý sự cố và tư vấn kỹ thuật riêng.',
          en: 'You get priority incident handling and dedicated technical consultation.',
        },
      },
    ],
    rating: 4.9,
    reviewCount: 97,
    isFeatured: false,
    isActive: true,
    relatedProductIds: ['kaspersky-plus', 'kaspersky-small-office-security'],
    createdAt: '2025-02-10T00:00:00.000Z',
    updatedAt: '2025-05-03T00:00:00.000Z',
    packages: [
      {
        id: 'kaspersky-premium-5d-1y',
        name: { vi: '5 thiết bị - 1 năm', en: '5 devices - 1 year' },
        price: 1499000,
        billingCycle: 'yearly',
        isPopular: true,
        kaspersky: {
          devices: 5,
          duration: '1 năm',
          userType: 'family',
          supportedOS: ['Windows', 'macOS', 'Android', 'iOS'],
        },
      },
    ],
  },
  {
    id: 'kaspersky-small-office-security',
    slug: 'kaspersky-small-office-security',
    category: 'kaspersky',
    subCategory: 'small-office',
    name: { vi: 'Kaspersky Small Office Security', en: 'Kaspersky Small Office Security' },
    shortDescription: {
      vi: 'Bảo mật tập trung cho doanh nghiệp nhỏ.',
      en: 'Centralized security for small businesses.',
    },
    description: {
      vi: 'Kaspersky Small Office Security bảo vệ máy tính và máy chủ trong doanh nghiệp nhỏ với khả năng quản lý tập trung, giúp đội ngũ IT dễ dàng giám sát toàn bộ hệ thống.',
      en: 'Kaspersky Small Office Security protects computers and servers in small businesses with centralized management, making it easy for IT teams to monitor the whole system.',
    },
    icon: 'Building2',
    startingPrice: 2990000,
    currency: 'VND',
    billingCycles: ['yearly'],
    features: [
      { vi: 'Bảo vệ máy tính và máy chủ', en: 'Protects computers and servers' },
      { vi: 'Quản lý tập trung', en: 'Centralized management' },
      { vi: 'Phù hợp doanh nghiệp nhỏ', en: 'Built for small businesses' },
    ],
    benefits: [
      { vi: 'Bảng điều khiển quản trị tập trung', en: 'Centralized admin console' },
      { vi: 'Bảo vệ cả máy chủ file server', en: 'Protects file servers too' },
      { vi: 'Triển khai nhanh cho nhiều máy', en: 'Fast deployment across many machines' },
    ],
    howItWorks: [
      { vi: 'Chọn số lượng thiết bị cần bảo vệ', en: 'Choose how many devices to protect' },
      {
        vi: 'Nhận license key và hướng dẫn triển khai',
        en: 'Receive your license key and deployment guide',
      },
      {
        vi: 'Quản lý toàn bộ thiết bị từ một bảng điều khiển',
        en: 'Manage all devices from a single console',
      },
    ],
    suitableFor: [
      { vi: 'Doanh nghiệp nhỏ có 5-10 thiết bị', en: 'Small businesses with 5-10 devices' },
    ],
    faqs: [
      {
        question: { vi: 'Gói này có bảo vệ máy chủ không?', en: 'Does this plan protect servers?' },
        answer: {
          vi: 'Có, gói này bao gồm bảo vệ cho cả máy trạm và máy chủ file.',
          en: 'Yes, it covers both workstations and file servers.',
        },
      },
    ],
    rating: 4.7,
    reviewCount: 34,
    isFeatured: false,
    isActive: true,
    relatedProductIds: ['kaspersky-premium', 'kaspersky-plus'],
    createdAt: '2025-02-15T00:00:00.000Z',
    updatedAt: '2025-05-04T00:00:00.000Z',
    packages: [
      {
        id: 'kaspersky-soho-10d-1y',
        name: { vi: '10 thiết bị - 1 năm', en: '10 devices - 1 year' },
        price: 2990000,
        billingCycle: 'yearly',
        isPopular: true,
        kaspersky: {
          devices: 10,
          duration: '1 năm',
          userType: 'business',
          supportedOS: ['Windows', 'Windows Server', 'macOS'],
        },
      },
    ],
  },
]
