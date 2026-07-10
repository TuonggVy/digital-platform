import type { Testimonial } from '@/types'

export const mockTestimonials: Testimonial[] = [
  {
    id: 'testimonial-001',
    name: 'Trần Quốc Bảo',
    role: { vi: 'CTO, Startup công nghệ', en: 'CTO, Tech Startup' },
    avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=quocbao',
    content: {
      vi: 'Cloud Server của VTC TELECOM giúp đội ngũ chúng tôi triển khai hệ thống nhanh hơn rất nhiều, hiệu suất ổn định và hỗ trợ kỹ thuật phản hồi cực nhanh.',
      en: "VTC TELECOM's Cloud Server helped our team deploy systems much faster, with stable performance and lightning-fast technical support.",
    },
    rating: 5,
  },
  {
    id: 'testimonial-002',
    name: 'Lê Thị Hồng Nhung',
    role: { vi: 'Chủ doanh nghiệp nhỏ', en: 'Small business owner' },
    avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=hongnhung',
    content: {
      vi: 'Tôi dùng Kaspersky Small Office Security cho toàn bộ máy tính văn phòng, quản lý tập trung rất tiện và giá cả hợp lý.',
      en: 'I use Kaspersky Small Office Security across all office computers — centralized management is very convenient and the price is reasonable.',
    },
    rating: 5,
  },
  {
    id: 'testimonial-003',
    name: 'Phạm Anh Tuấn',
    role: { vi: 'Digital Nomad', en: 'Digital Nomad' },
    avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=anhtuan',
    content: {
      vi: 'eSIM Global là cứu cánh cho công việc di chuyển liên tục của tôi, chỉ cần quét mã QR là có mạng ngay tại sân bay.',
      en: 'eSIM Global is a lifesaver for my constant travel — just scan the QR code and I have connectivity right at the airport.',
    },
    rating: 4,
  },
  {
    id: 'testimonial-004',
    name: 'Ngô Thanh Hà',
    role: { vi: 'Quản lý IT, Doanh nghiệp vừa', en: 'IT Manager, Mid-size Enterprise' },
    avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=thanhha',
    content: {
      vi: 'Managed Kubernetes giúp đội DevOps của chúng tôi tiết kiệm rất nhiều thời gian vận hành hạ tầng.',
      en: 'Managed Kubernetes has saved our DevOps team a lot of infrastructure operations time.',
    },
    rating: 5,
  },
  {
    id: 'testimonial-005',
    name: 'Vũ Minh Khoa',
    role: { vi: 'Freelancer thiết kế', en: 'Freelance Designer' },
    avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=minhkhoa',
    content: {
      vi: 'Cloud Storage giúp tôi lưu trữ và chia sẻ file thiết kế với khách hàng an toàn, nhanh chóng.',
      en: 'Cloud Storage lets me store and share design files with clients safely and quickly.',
    },
    rating: 4,
  },
]
