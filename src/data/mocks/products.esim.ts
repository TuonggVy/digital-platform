import type { Product } from '@/types'

function esimProduct(config: {
  id: string
  nameVi: string
  nameEn: string
  country: { vi: string; en: string }
  countryCode: string
  region: 'asia' | 'europe' | 'north-america' | 'global'
  dataAmount: string
  isUnlimited: boolean
  days: number
  price: number
  badge?: { vi: string; en: string }
  coveredCountries?: number
  featured?: boolean
}): Product {
  return {
    id: config.id,
    slug: config.id,
    category: 'esim',
    subCategory: config.region,
    name: { vi: config.nameVi, en: config.nameEn },
    shortDescription: {
      vi: `Gói eSIM ${config.dataAmount} dùng trong ${config.days} ngày tại ${config.country.vi}.`,
      en: `${config.dataAmount} eSIM plan for ${config.days} days in ${config.country.en}.`,
    },
    description: {
      vi: `Gói eSIM ${config.nameVi} giúp bạn kết nối internet ngay khi đến ${config.country.vi} mà không cần đổi SIM vật lý. Kích hoạt nhanh chóng chỉ với mã QR.`,
      en: `The ${config.nameEn} eSIM plan keeps you connected the moment you arrive in ${config.country.en} — no physical SIM swap needed. Activate instantly with a QR code.`,
    },
    icon: 'Wifi',
    badge: config.badge,
    startingPrice: config.price,
    currency: 'VND',
    billingCycles: ['one_time'],
    features: [
      { vi: 'Kích hoạt bằng mã QR', en: 'QR code activation' },
      { vi: 'Không cần SIM vật lý', en: 'No physical SIM needed' },
      { vi: 'Hỗ trợ hotspot chia sẻ mạng', en: 'Hotspot sharing support' },
    ],
    benefits: [
      { vi: 'Kết nối ngay khi hạ cánh', en: 'Connected the moment you land' },
      { vi: 'Không lo cước roaming đắt đỏ', en: 'Avoid expensive roaming charges' },
      { vi: 'Dễ dàng theo dõi dung lượng sử dụng', en: 'Easily track your data usage' },
    ],
    howItWorks: [
      { vi: 'Mua gói eSIM phù hợp với chuyến đi', en: 'Buy the eSIM plan that fits your trip' },
      {
        vi: 'Nhận mã QR qua email ngay sau khi thanh toán',
        en: 'Receive a QR code via email right after payment',
      },
      {
        vi: 'Quét mã QR để cài đặt eSIM lên thiết bị',
        en: 'Scan the QR code to install the eSIM on your device',
      },
      { vi: 'Kích hoạt gói dữ liệu khi đến nơi', en: 'Activate the data plan upon arrival' },
    ],
    suitableFor: [
      { vi: 'Khách du lịch quốc tế', en: 'International travelers' },
      { vi: 'Người thường xuyên công tác nước ngoài', en: 'Frequent business travelers' },
    ],
    faqs: [
      {
        question: {
          vi: 'Thiết bị của tôi có hỗ trợ eSIM không?',
          en: 'Does my device support eSIM?',
        },
        answer: {
          vi: 'Hầu hết các dòng điện thoại flagship từ 2019 trở lại đây đều hỗ trợ eSIM. Vui lòng kiểm tra tại trang kiểm tra thiết bị.',
          en: 'Most flagship phones from 2019 onward support eSIM. Please check our device compatibility page.',
        },
      },
      {
        question: {
          vi: 'Tôi có thể dùng eSIM song song với SIM vật lý không?',
          en: 'Can I use eSIM alongside my physical SIM?',
        },
        answer: {
          vi: 'Có, hầu hết thiết bị hỗ trợ dual SIM giữa eSIM và SIM vật lý.',
          en: 'Yes, most devices support dual SIM between eSIM and a physical SIM.',
        },
      },
    ],
    rating: 4.7,
    reviewCount: Math.floor(40 + Math.random() * 120),
    isFeatured: !!config.featured,
    isActive: true,
    relatedProductIds: [],
    createdAt: '2025-03-01T00:00:00.000Z',
    updatedAt: '2025-05-01T00:00:00.000Z',
    packages: [
      {
        id: `${config.id}-pkg`,
        name: { vi: config.nameVi, en: config.nameEn },
        price: config.price,
        billingCycle: 'one_time',
        isPopular: true,
        esim: {
          country: config.country,
          countryCode: config.countryCode,
          region: config.region,
          dataAmount: config.dataAmount,
          isUnlimited: config.isUnlimited,
          days: config.days,
          hotspot: true,
          networkType: '4G/5G',
          coveredCountries: config.coveredCountries,
        },
      },
    ],
  }
}

export const esimProducts: Product[] = [
  esimProduct({
    id: 'esim-japan-5gb',
    nameVi: 'eSIM Japan 5 GB',
    nameEn: 'eSIM Japan 5 GB',
    country: { vi: 'Nhật Bản', en: 'Japan' },
    countryCode: 'JP',
    region: 'asia',
    dataAmount: '5 GB',
    isUnlimited: false,
    days: 7,
    price: 249000,
    featured: true,
  }),
  esimProduct({
    id: 'esim-korea-unlimited',
    nameVi: 'eSIM Korea Unlimited',
    nameEn: 'eSIM Korea Unlimited',
    country: { vi: 'Hàn Quốc', en: 'Korea' },
    countryCode: 'KR',
    region: 'asia',
    dataAmount: 'Không giới hạn',
    isUnlimited: true,
    days: 5,
    price: 399000,
    badge: { vi: 'Tốc độ cao', en: 'High speed' },
  }),
  esimProduct({
    id: 'esim-thailand-10gb',
    nameVi: 'eSIM Thailand 10 GB',
    nameEn: 'eSIM Thailand 10 GB',
    country: { vi: 'Thái Lan', en: 'Thailand' },
    countryCode: 'TH',
    region: 'asia',
    dataAmount: '10 GB',
    isUnlimited: false,
    days: 10,
    price: 229000,
  }),
  esimProduct({
    id: 'esim-asia-regional',
    nameVi: 'eSIM Asia Regional',
    nameEn: 'eSIM Asia Regional',
    country: { vi: 'Châu Á (12 quốc gia)', en: 'Asia (12 countries)' },
    countryCode: 'ASIA',
    region: 'asia',
    dataAmount: '10 GB',
    isUnlimited: false,
    days: 15,
    price: 549000,
    coveredCountries: 12,
    featured: true,
  }),
  esimProduct({
    id: 'esim-europe',
    nameVi: 'eSIM Europe',
    nameEn: 'eSIM Europe',
    country: { vi: 'Châu Âu (30 quốc gia)', en: 'Europe (30 countries)' },
    countryCode: 'EU',
    region: 'europe',
    dataAmount: '20 GB',
    isUnlimited: false,
    days: 30,
    price: 749000,
    coveredCountries: 30,
    featured: true,
  }),
  esimProduct({
    id: 'esim-usa-unlimited',
    nameVi: 'eSIM USA Unlimited',
    nameEn: 'eSIM USA Unlimited',
    country: { vi: 'Hoa Kỳ', en: 'United States' },
    countryCode: 'US',
    region: 'north-america',
    dataAmount: 'Không giới hạn',
    isUnlimited: true,
    days: 10,
    price: 699000,
    badge: { vi: 'Không giới hạn', en: 'Unlimited' },
    featured: true,
  }),
  esimProduct({
    id: 'esim-global',
    nameVi: 'eSIM Global',
    nameEn: 'eSIM Global',
    country: { vi: 'Toàn cầu (100+ quốc gia)', en: 'Global (100+ countries)' },
    countryCode: 'GLOBAL',
    region: 'global',
    dataAmount: '20 GB',
    isUnlimited: false,
    days: 30,
    price: 1199000,
    coveredCountries: 100,
    badge: { vi: 'Phủ sóng rộng nhất', en: 'Widest coverage' },
  }),
]
