import { redirect } from 'next/navigation'

export default function LocaleIndex({ params }: { params: { locale: string } }) {
  const { locale } = params
  // Redirect the locale root to the dashboard (or other desired landing page)
  redirect(`/${locale}/dashboard`)
}
