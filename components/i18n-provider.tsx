"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { I18nextProvider } from "react-i18next"
import i18n from "../i18n"

interface I18nProviderProps {
  children: React.ReactNode
}

export default function I18nProvider({ children }: I18nProviderProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // 언어 변경 감지 및 HTML lang 속성 업데이트
    const handleLanguageChanged = (lng: string) => {
      document.documentElement.lang = lng
      document.documentElement.dir = lng === "ar" ? "rtl" : "ltr" // 아랍어 등 RTL 언어 지원
    }

    i18n.on("languageChanged", handleLanguageChanged)

    // 초기 언어 설정
    handleLanguageChanged(i18n.language)
    setMounted(true)

    return () => {
      i18n.off("languageChanged", handleLanguageChanged)
    }
  }, [])

  if (!mounted) {
    // 간단한 로딩 상태 반환
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
