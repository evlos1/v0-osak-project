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
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return a simple loading state or null
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
