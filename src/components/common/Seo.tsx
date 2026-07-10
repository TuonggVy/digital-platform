import { Helmet } from 'react-helmet-async'
import { BRAND_NAME } from '@/constants/config'

interface SeoProps {
  title: string
  description?: string
}

export function Seo({ title, description }: SeoProps) {
  const fullTitle = `${title} | ${BRAND_NAME}`
  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:site_name" content={BRAND_NAME} />}
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content="website" />
    </Helmet>
  )
}
