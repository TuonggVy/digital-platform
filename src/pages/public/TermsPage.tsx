import { useTranslation } from 'react-i18next'
import { Seo } from '@/components/common/Seo'
import { Badge } from '@/components/common/Badge'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'
import { useLocale } from '@/hooks/useLocale'

const SECTIONS_VI = [
  {
    title: '1. Sử dụng tài khoản',
    body: 'Khi tạo tài khoản trên VTC TELECOM, bạn cam kết cung cấp thông tin chính xác và chịu trách nhiệm bảo mật thông tin đăng nhập của mình. VTC TELECOM có quyền tạm ngưng hoặc chấm dứt tài khoản nếu phát hiện hành vi vi phạm điều khoản sử dụng.',
  },
  {
    title: '2. Mô tả dịch vụ',
    body: 'VTC TELECOM cung cấp các dịch vụ số bao gồm hạ tầng Cloud, phần mềm bảo mật Kaspersky và eSIM du lịch quốc tế. Chúng tôi có quyền thay đổi, bổ sung hoặc ngừng cung cấp một phần dịch vụ nhằm cải thiện chất lượng, đồng thời sẽ thông báo trước cho khách hàng khi có thay đổi ảnh hưởng trực tiếp.',
  },
  {
    title: '3. Thanh toán và hoàn tiền',
    body: 'Giá dịch vụ được niêm yết công khai và có thể thay đổi theo thời gian. Các khoản thanh toán đã hoàn tất chỉ được hoàn lại trong các trường hợp cụ thể theo chính sách hoàn tiền của VTC TELECOM. Việc gia hạn dịch vụ cần được thực hiện trước thời điểm hết hạn để tránh gián đoạn.',
  },
  {
    title: '4. Trách nhiệm của người dùng',
    body: 'Người dùng cam kết không sử dụng dịch vụ cho các mục đích vi phạm pháp luật, phát tán mã độc, xâm phạm quyền sở hữu trí tuệ hoặc gây ảnh hưởng đến hệ thống của VTC TELECOM và bên thứ ba.',
  },
  {
    title: '5. Giới hạn trách nhiệm',
    body: 'VTC TELECOM nỗ lực đảm bảo tính ổn định của dịch vụ nhưng không chịu trách nhiệm cho các thiệt hại gián tiếp phát sinh từ sự cố kỹ thuật, gián đoạn mạng hoặc các nguyên nhân bất khả kháng nằm ngoài khả năng kiểm soát hợp lý.',
  },
  {
    title: '6. Thay đổi điều khoản',
    body: 'Điều khoản sử dụng có thể được cập nhật theo thời gian. Phiên bản mới nhất sẽ luôn được đăng tải trên trang này và có hiệu lực ngay khi công bố, trừ khi có quy định khác.',
  },
]

const SECTIONS_EN = [
  {
    title: '1. Account usage',
    body: 'When creating a VTC TELECOM account, you agree to provide accurate information and are responsible for keeping your login credentials secure. VTC TELECOM reserves the right to suspend or terminate accounts found to violate these terms.',
  },
  {
    title: '2. Service description',
    body: 'VTC TELECOM provides digital services including Cloud infrastructure, Kaspersky security software, and international travel eSIM. We may modify, extend, or discontinue parts of the service to improve quality, and will provide advance notice for changes with direct customer impact.',
  },
  {
    title: '3. Payment and refunds',
    body: "Service pricing is published publicly and may change over time. Completed payments are only refunded in specific cases under VTC TELECOM's refund policy. Renewals must be completed before expiry to avoid service interruption.",
  },
  {
    title: '4. User responsibilities',
    body: "Users agree not to use the service for unlawful purposes, to distribute malware, to infringe intellectual property rights, or to negatively affect VTC TELECOM's systems or third parties.",
  },
  {
    title: '5. Limitation of liability',
    body: 'VTC TELECOM works to ensure service stability but is not liable for indirect damages arising from technical incidents, network interruptions, or force majeure events beyond our reasonable control.',
  },
  {
    title: '6. Changes to these terms',
    body: 'These terms may be updated periodically. The latest version will always be published on this page and takes effect upon publication unless stated otherwise.',
  },
]

export function TermsPage() {
  const { t } = useTranslation()
  const locale = useLocale()
  const sections = locale === 'vi' ? SECTIONS_VI : SECTIONS_EN

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Seo title={t('legal.termsTitle')} />

      <RevealOnScroll>
        <div className="mb-4 flex justify-center">
          <Badge variant="warning">{t('demoLabel')}</Badge>
        </div>
        <h1 className="text-center text-3xl font-semibold text-text-primary sm:text-4xl">
          {t('legal.termsTitle')}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-center text-sm text-text-secondary">
          {t('legal.termsDisclaimer')}
        </p>
      </RevealOnScroll>

      <div className="mt-10 flex flex-col gap-8">
        {sections.map((section) => (
          <RevealOnScroll key={section.title}>
            <h2 className="text-lg font-semibold text-text-primary">{section.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">{section.body}</p>
          </RevealOnScroll>
        ))}
      </div>
    </div>
  )
}
