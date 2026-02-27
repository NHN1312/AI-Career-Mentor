'use client'

import NextLink from 'next/link'
import { usePathname } from '@/i18n/routing'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import {
    LayoutDashboard,
    Users,
    Brain,
    FileText,
    LogOut,
    ChevronRight,
    Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLocale } from 'next-intl'

type NavItem = {
    href: string
    label: string
    icon: React.ElementType
    exact?: boolean
}

const navItems: NavItem[] = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/admin/users', label: 'User Manager', icon: Users },
    { href: '/admin/ai-config', label: 'AI Config', icon: Brain },
    { href: '/admin/content', label: 'Content', icon: FileText },
]

export default function AdminSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const locale = useLocale()

    // Build localized href: /vi/admin or /en/admin
    const localHref = (path: string) => `/${locale}${path}`

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push(`/${locale}/login`)
    }

    return (
        <aside className="w-64 border-r bg-card flex flex-col min-h-screen sticky top-0">
            {/* Header */}
            <div className="p-6 border-b">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary rounded-md">
                        <Shield className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                        <p className="font-bold text-sm">Admin Panel</p>
                        <p className="text-xs text-muted-foreground">AI Career Mentor</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = item.exact
                        ? pathname === '/admin'
                        : pathname.startsWith(item.href)
                    return (
                        <NextLink key={item.href} href={localHref(item.href)}>
                            <div
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer ${isActive
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                    }`}
                            >
                                <Icon className="w-4 h-4 flex-shrink-0" />
                                <span className="flex-1">{item.label}</span>
                                {isActive && <ChevronRight className="w-3 h-3" />}
                            </div>
                        </NextLink>
                    )
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t space-y-2">
                <NextLink href={localHref('/dashboard')}>
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all cursor-pointer">
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Về Dashboard</span>
                    </div>
                </NextLink>
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
                    onClick={handleLogout}
                >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                </Button>
            </div>
        </aside>
    )
}
