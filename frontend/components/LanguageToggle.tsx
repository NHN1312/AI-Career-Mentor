"use client"

import * as React from "react"
import { usePathname, useRouter } from "@/i18n/routing"
import { useLocale } from "next-intl"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"

export function LanguageToggle() {
    const router = useRouter()
    const pathname = usePathname()
    const currentLocale = useLocale()

    const onSelectChange = (nextLocale: string) => {
        router.replace(pathname, { locale: nextLocale })
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Globe className="h-[1.2rem] w-[1.2rem]" />
                    <span className="sr-only">Toggle language</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onSelectChange("en")} disabled={currentLocale === "en"}>
                    English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSelectChange("vi")} disabled={currentLocale === "vi"}>
                    Tiếng Việt
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
