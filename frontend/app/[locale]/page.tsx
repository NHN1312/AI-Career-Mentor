import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BrainCircuit, FileSearch, TrendingUp, MessageSquare, Quote, ArrowRight, CheckCircle, LayoutDashboard } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Landing' })
  return { title: `AI Career Mentor — ${t('hero.title')}` }
}

export default async function LandingPage() {
  // Check if user is already logged in (server side)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user

  return <LandingContent isLoggedIn={isLoggedIn} />
}

function LandingContent({ isLoggedIn }: { isLoggedIn: boolean }) {
  const t = useTranslations('Landing')

  const features = [
    { icon: FileSearch, title: t('features.resume.title'), desc: t('features.resume.desc') },
    { icon: TrendingUp, title: t('features.skillGap.title'), desc: t('features.skillGap.desc') },
    { icon: MessageSquare, title: t('features.interview.title'), desc: t('features.interview.desc') },
  ]

  const testimonials = [0, 1, 2].map((i) => ({
    quote: t(`testimonials.items.${i}.quote`),
    name: t(`testimonials.items.${i}.name`),
    role: t(`testimonials.items.${i}.role`),
  }))

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-sm">
            <BrainCircuit className="w-5 h-5 text-primary" />
            AI Career Mentor
          </Link>
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">
              {t('nav.features')}
            </Link>
            <Link href="#testimonials" className="hover:text-foreground transition-colors">
              {t('nav.testimonials')}
            </Link>
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button size="sm" className="gap-1.5">
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button size="sm" variant="outline">{t('nav.login')}</Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="py-24 md:py-36">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
            <span className="inline-block text-xs font-medium tracking-widest uppercase text-muted-foreground border rounded-full px-3 py-1">
              {t('hero.badge')}
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight">
              {t('hero.title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-wrap gap-3 justify-center pt-2">
              {isLoggedIn ? (
                <Link href="/dashboard">
                  <Button size="lg" className="gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button size="lg" className="gap-2">
                    {t('hero.cta')}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              )}
              <Link href="#features">
                <Button size="lg" variant="outline">{t('hero.learnMore')}</Button>
              </Link>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4"><div className="border-t" /></div>

        {/* ── Features ── */}
        <section id="features" className="py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-14 space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">{t('features.title')}</h2>
              <p className="text-muted-foreground">{t('features.subtitle')}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((f) => {
                const Icon = f.icon
                return (
                  <div key={f.title} className="space-y-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-base">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                )
              })}
            </div>
            <div className="mt-16 border rounded-xl p-8 bg-muted/30">
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  t('features.resume.title'),
                  t('features.skillGap.title'),
                  t('features.interview.title'),
                  'AI Career Chat',
                  'CV Builder',
                  'Multi-language (VI / EN)',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4"><div className="border-t" /></div>

        {/* ── Testimonials ── */}
        <section id="testimonials" className="py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-14 space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">{t('testimonials.title')}</h2>
              <p className="text-muted-foreground">{t('testimonials.subtitle')}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((item, i) => (
                <div key={i} className="border rounded-xl p-6 space-y-4 bg-card">
                  <Quote className="w-5 h-5 text-muted-foreground" />
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.quote}</p>
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="border rounded-xl p-10 text-center space-y-4 bg-muted/30">
              <h2 className="text-2xl font-bold">
                {isLoggedIn ? 'Tiếp tục hành trình sự nghiệp của bạn' : t('hero.cta')}
              </h2>
              <p className="text-muted-foreground text-sm">{t('hero.subtitle')}</p>
              <Link href={isLoggedIn ? '/dashboard' : '/login'}>
                <Button size="lg" className="mt-2 gap-2">
                  {isLoggedIn ? <><LayoutDashboard className="w-4 h-4" /> Dashboard</> : <>{t('hero.cta')} <ArrowRight className="w-4 h-4" /></>}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4" />
            <span>{t('footer.rights')}</span>
          </div>
          <nav className="flex gap-4">
            <Link href="#" className="hover:text-foreground transition-colors">{t('footer.terms')}</Link>
            <Link href="#" className="hover:text-foreground transition-colors">{t('footer.privacy')}</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
