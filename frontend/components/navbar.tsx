'use client'

import { Link, usePathname, useRouter } from '@/i18n/routing'
import { useTheme } from 'next-themes'
import { Button } from './ui/button'
import { createClient } from '@/utils/supabase/client'
import { Home, FileText, LogOut, User, Moon, Sun } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { LanguageToggle } from './LanguageToggle'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './ui/dropdown-menu'

export function Navbar() {
    const pathname = usePathname()
    const router = useRouter()
    const { theme, setTheme } = useTheme()
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const t = useTranslations('Navbar')

    const handleLogout = async () => {
        setIsLoggingOut(true)
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
    }

    const navItems = [
        { href: '/dashboard', label: t('dashboard'), icon: Home },
        { href: '/dashboard/resume', label: t('resumeAnalyzer'), icon: FileText },
        { href: '/dashboard/profile', label: t('myProfile'), icon: User },
    ]

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-6">
                    <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
                        <span className="bg-primary text-primary-foreground px-2 py-1 rounded">AC</span>
                        AI Career Mentor
                    </Link>

                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            // Basic active check, might need improvement for subroutes
                            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                            return (
                                <Button
                                    key={item.href}
                                    asChild
                                    variant={isActive ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className="gap-2"
                                >
                                    <Link href={item.href}>
                                        <Icon className="w-4 h-4" />
                                        {item.label}
                                    </Link>
                                </Button>
                            )
                        })}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <LanguageToggle />

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        suppressHydrationWarning
                    >
                        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" suppressHydrationWarning>
                                <User className="w-5 h-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
                                <LogOut className="w-4 h-4 mr-2" />
                                {isLoggingOut ? t('loggingOut') : t('logout')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden border-t px-4 py-2 flex gap-1">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                        <Button
                            key={item.href}
                            asChild
                            variant={isActive ? 'secondary' : 'ghost'}
                            size="sm"
                            className="flex-1 gap-2"
                        >
                            <Link href={item.href}>
                                <Icon className="w-4 h-4" />
                                {item.label}
                            </Link>
                        </Button>
                    )
                })}
            </div>
        </nav>
    )
}
