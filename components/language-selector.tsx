"use client"

import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"
import { useEffect, useState } from "react"

export default function LanguageSelector() {
  const { i18n, t } = useTranslation()
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted before rendering to avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Globe className="h-4 w-4" />
          <span className="sr-only">{t("interface_language")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeLanguage("ko")}>🇰🇷 {t("korean")}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage("en")}>🇺🇸 {t("english")}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage("zh")}>🇨🇳 {t("chinese")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
