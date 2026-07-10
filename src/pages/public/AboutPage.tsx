import { useTranslation } from 'react-i18next'
import { DynamicIcon } from '@/components/common/DynamicIcon'
import { Seo } from '@/components/common/Seo'
import { SectionHeading } from '@/components/common/SectionHeading'
import { ContactCTA } from '@/components/common/ContactCTA'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'
import { StaggerContainer, StaggerItem } from '@/components/animation/StaggerContainer'
import { useLocale } from '@/hooks/useLocale'
import { localize } from '@/utils/localize'
import type { LocalizedText } from '@/types'

const VALUES = [
  { key: 'value1', icon: 'Eye' },
  { key: 'value2', icon: 'Sparkles' },
  { key: 'value3', icon: 'ShieldCheck' },
  { key: 'value4', icon: 'HeartHandshake' },
] as const

const MILESTONES: { year: string; text: LocalizedText }[] = [
  {
    year: '2022',
    text: {
      vi: 'Thành lập VTC TELECOM tại TP. Hồ Chí Minh.',
      en: 'VTC TELECOM was founded in Ho Chi Minh City.',
    },
  },
  {
    year: '2023',
    text: {
      vi: 'Ra mắt dịch vụ Cloud Server và Kubernetes.',
      en: 'Launched Cloud Server and Kubernetes services.',
    },
  },
  {
    year: '2024',
    text: {
      vi: 'Hợp tác phân phối phần mềm bảo mật Kaspersky.',
      en: 'Became a Kaspersky security software distribution partner.',
    },
  },
  {
    year: '2025',
    text: {
      vi: 'Ra mắt eSIM du lịch quốc tế tại hơn 100 quốc gia.',
      en: 'Launched international travel eSIM covering 100+ countries.',
    },
  },
]

const TEAM = [
  {
    name: 'Nguyễn Minh Anh',
    roleVi: 'Giám đốc điều hành',
    roleEn: 'Chief Executive Officer',
    seed: 'MinhAnh',
  },
  {
    name: 'Trần Quốc Bảo',
    roleVi: 'Giám đốc công nghệ',
    roleEn: 'Chief Technology Officer',
    seed: 'QuocBao',
  },
  {
    name: 'Lê Thị Cẩm',
    roleVi: 'Trưởng phòng vận hành',
    roleEn: 'Head of Operations',
    seed: 'ThiCam',
  },
  {
    name: 'Phạm Đức Duy',
    roleVi: 'Trưởng phòng chăm sóc khách hàng',
    roleEn: 'Head of Customer Success',
    seed: 'DucDuy',
  },
]

export function AboutPage() {
  const { t } = useTranslation()
  const locale = useLocale()

  return (
    <div>
      <Seo title={t('nav.about')} description={t('aboutPage.storyContent')} />

      <section className="relative overflow-hidden bg-grid px-4 py-16 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <RevealOnScroll>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              VTC TELECOM
            </span>
            <h1 className="mt-3 text-3xl font-semibold text-text-primary sm:text-4xl">
              {t('aboutPage.storyTitle')}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-text-secondary">
              {t('aboutPage.storyContent')}
            </p>
          </RevealOnScroll>
          <RevealOnScroll delay={0.1} direction="left">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-background p-6">
                <DynamicIcon name="Target" className="size-7 text-primary" />
                <h2 className="mt-3 text-base font-semibold text-text-primary">
                  {t('aboutPage.missionTitle')}
                </h2>
                <p className="mt-2 text-sm text-text-secondary">{t('aboutPage.missionContent')}</p>
              </div>
              <div className="rounded-2xl border border-border bg-background p-6">
                <DynamicIcon name="Telescope" className="size-7 text-primary" />
                <h2 className="mt-3 text-base font-semibold text-text-primary">
                  {t('aboutPage.visionTitle')}
                </h2>
                <p className="mt-2 text-sm text-text-secondary">{t('aboutPage.visionContent')}</p>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <SectionHeading title={t('aboutPage.valuesTitle')} className="mb-10" />
        </RevealOnScroll>
        <StaggerContainer className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((value) => (
            <StaggerItem key={value.key}>
              <div className="flex h-full flex-col items-center gap-3 rounded-2xl border border-border bg-background p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <DynamicIcon name={value.icon} className="size-6" />
                </span>
                <h3 className="text-base font-semibold text-text-primary">
                  {t(`aboutPage.${value.key}.title`)}
                </h3>
                <p className="text-sm text-text-secondary">{t(`aboutPage.${value.key}.desc`)}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      <section className="bg-surface/40 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <RevealOnScroll>
            <SectionHeading title={t('aboutPage.milestonesTitle')} className="mb-10" />
          </RevealOnScroll>
          <div className="relative flex flex-col gap-8 border-l-2 border-primary/20 pl-8">
            {MILESTONES.map((milestone, idx) => (
              <RevealOnScroll key={milestone.year} delay={idx * 0.08} direction="right">
                <div className="relative">
                  <span className="absolute -left-[2.35rem] top-1 flex size-4 items-center justify-center rounded-full bg-primary ring-4 ring-background" />
                  <p className="text-sm font-semibold text-primary">{milestone.year}</p>
                  <p className="mt-1 text-base text-text-primary">
                    {localize(milestone.text, locale)}
                  </p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <SectionHeading title={t('aboutPage.teamTitle')} className="mb-10" />
        </RevealOnScroll>
        <StaggerContainer className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TEAM.map((member) => (
            <StaggerItem key={member.seed}>
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-background p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <img
                  src={`https://api.dicebear.com/9.x/notionists/svg?seed=${member.seed}`}
                  alt={member.name}
                  className="size-20 rounded-full bg-surface"
                />
                <h3 className="text-base font-semibold text-text-primary">{member.name}</h3>
                <p className="text-sm text-text-secondary">
                  {locale === 'vi' ? member.roleVi : member.roleEn}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <ContactCTA
            title={t('aboutPage.ctaTitle')}
            primaryLabel={t('common.seeAll')}
            secondaryLabel={t('common.contactSales')}
          />
        </RevealOnScroll>
        <p className="mt-6 text-center text-xs text-text-secondary">{t('aboutPage.disclaimer')}</p>
      </section>
    </div>
  )
}
