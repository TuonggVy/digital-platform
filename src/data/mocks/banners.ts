import type { Banner } from '@/types'

export const mockBanners: Banner[] = [
  {
    id: 'banner-1',
    title: { vi: 'Ưu đãi mùa hè cho gói Cloud', en: 'Summer offer on Cloud plans' },
    subtitle: {
      vi: 'Giảm đến 15% cho các gói Cloud Server',
      en: 'Up to 15% off Cloud Server plans',
    },
    isActive: true,
  },
  {
    id: 'banner-2',
    title: {
      vi: 'eSIM du lịch hè - sẵn sàng kết nối',
      en: 'Summer travel eSIM — ready to connect',
    },
    subtitle: { vi: 'Ưu đãi eSIM cho hơn 100 quốc gia', en: 'eSIM deals for 100+ countries' },
    isActive: false,
  },
]
