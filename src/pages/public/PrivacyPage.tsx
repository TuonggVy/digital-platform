import { useTranslation } from 'react-i18next'
import { Seo } from '@/components/common/Seo'
import { Badge } from '@/components/common/Badge'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'
import { useLocale } from '@/hooks/useLocale'

const SECTIONS_VI = [
  {
    title: '1. Thông tin thu thập',
    body: 'VTC TELECOM thu thập thông tin bạn cung cấp khi đăng ký tài khoản, đặt hàng hoặc liên hệ hỗ trợ, bao gồm họ tên, email, số điện thoại, địa chỉ và thông tin thanh toán liên quan.',
  },
  {
    title: '2. Mục đích sử dụng dữ liệu',
    body: 'Dữ liệu được sử dụng để xử lý đơn hàng, cung cấp dịch vụ, chăm sóc khách hàng, cải thiện trải nghiệm sử dụng và gửi thông báo liên quan đến tài khoản hoặc dịch vụ của bạn.',
  },
  {
    title: '3. Cookie và công nghệ theo dõi',
    body: 'Website sử dụng cookie để ghi nhớ tùy chọn ngôn ngữ, phiên đăng nhập và phân tích lưu lượng truy cập nhằm cải thiện chất lượng dịch vụ. Bạn có thể tắt cookie trong trình duyệt, tuy nhiên một số chức năng có thể bị hạn chế.',
  },
  {
    title: '4. Chia sẻ với bên thứ ba',
    body: 'VTC TELECOM không bán thông tin cá nhân của bạn. Dữ liệu chỉ được chia sẻ với các đối tác cung cấp hạ tầng, cổng thanh toán hoặc khi có yêu cầu hợp pháp từ cơ quan nhà nước có thẩm quyền.',
  },
  {
    title: '5. Quyền của người dùng',
    body: 'Bạn có quyền yêu cầu truy cập, chỉnh sửa hoặc xóa thông tin cá nhân của mình bất cứ lúc nào bằng cách liên hệ với đội ngũ hỗ trợ của chúng tôi.',
  },
  {
    title: '6. Thời gian lưu trữ dữ liệu',
    body: 'Thông tin cá nhân được lưu trữ trong suốt thời gian bạn sử dụng dịch vụ và một khoảng thời gian hợp lý sau đó để phục vụ mục đích kế toán, pháp lý hoặc giải quyết khiếu nại.',
  },
]

const SECTIONS_EN = [
  {
    title: '1. Information we collect',
    body: 'VTC TELECOM collects the information you provide when registering an account, placing an order, or contacting support, including your name, email, phone number, address, and related payment details.',
  },
  {
    title: '2. How we use your data',
    body: 'Data is used to process orders, deliver services, provide customer support, improve the user experience, and send notifications related to your account or services.',
  },
  {
    title: '3. Cookies and tracking technologies',
    body: 'This website uses cookies to remember your language preference, keep you signed in, and analyze traffic to improve service quality. You may disable cookies in your browser, though some features may be limited.',
  },
  {
    title: '4. Sharing with third parties',
    body: 'VTC TELECOM does not sell your personal information. Data is only shared with infrastructure and payment gateway partners, or when required by a lawful request from a competent authority.',
  },
  {
    title: '5. Your rights',
    body: 'You may request access to, correction of, or deletion of your personal information at any time by contacting our support team.',
  },
  {
    title: '6. Data retention',
    body: 'Personal information is retained for as long as you use our services, plus a reasonable period afterward for accounting, legal, or dispute-resolution purposes.',
  },
]

export function PrivacyPage() {
  const { t } = useTranslation()
  const locale = useLocale()
  const sections = locale === 'vi' ? SECTIONS_VI : SECTIONS_EN

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Seo title={t('legal.privacyTitle')} />

      <RevealOnScroll>
        <div className="mb-4 flex justify-center">
          <Badge variant="warning">{t('demoLabel')}</Badge>
        </div>
        <h1 className="text-center text-3xl font-semibold text-text-primary sm:text-4xl">
          {t('legal.privacyTitle')}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-center text-sm text-text-secondary">
          {t('legal.privacyDisclaimer')}
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
