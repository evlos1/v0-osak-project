"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, Key, Save, ArrowLeft, Globe } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useTranslation } from "react-i18next"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { t, i18n } = useTranslation()
  const [apiKey, setApiKey] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [rememberApiKey, setRememberApiKey] = useState(true)
  const [language, setLanguage] = useState(i18n.language || "ko")

  useEffect(() => {
    // 로컬 스토리지에서 API 키 불러오기
    const savedApiKey = localStorage.getItem("google_api_key") || ""
    setApiKey(savedApiKey)

    // 로컬 스토리지에서 API 키 기억 설정 불러오기
    const savedRememberSetting = localStorage.getItem("remember_api_key")
    setRememberApiKey(savedRememberSetting === null ? true : savedRememberSetting === "true")
  }, [])

  const handleSave = () => {
    setIsSaving(true)

    try {
      // API 키 저장
      if (rememberApiKey) {
        localStorage.setItem("google_api_key", apiKey.trim())
      } else {
        // 세션 스토리지에 저장 (브라우저 닫으면 사라짐)
        sessionStorage.setItem("google_api_key", apiKey.trim())
        localStorage.removeItem("google_api_key")
      }

      // API 키 기억 설정 저장
      localStorage.setItem("remember_api_key", rememberApiKey.toString())

      // 언어 설정 저장 및 적용
      i18n.changeLanguage(language)

      toast({
        title: t("settings_saved"),
        description: t("api_key_saved"),
      })

      // 홈으로 리디렉션
      setTimeout(() => {
        router.push("/")
      }, 1500)
    } catch (error) {
      toast({
        title: t("error_occurred"),
        description: t("save_error"),
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("back")}
      </Button>

      <Card className="border shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <CardTitle className="text-2xl">{t("settings_title")}</CardTitle>
          </div>
          <CardDescription>{t("manage_settings")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* API Key Settings */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              <h3 className="text-lg font-medium">{t("api_key_settings")}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{t("api_key_description")}</p>
            <div className="pt-2">
              <Label htmlFor="api-key">{t("google_api_key")}</Label>
              <Input
                id="api-key"
                type="password"
                placeholder={t("api_key_placeholder")}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">{t("api_key_note")}</p>
            </div>
            <div className="flex items-center space-x-2 mt-4">
              <Switch id="remember-api-key" checked={rememberApiKey} onCheckedChange={setRememberApiKey} />
              <Label htmlFor="remember-api-key">{t("remember_api_key")}</Label>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {rememberApiKey ? t("remember_api_key_yes") : t("remember_api_key_no")}
            </p>
          </div>

          <Separator />

          {/* Language Settings */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <h3 className="text-lg font-medium">{t("language_settings")}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{t("interface_language")}</p>
            <RadioGroup value={language} onValueChange={setLanguage} className="mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ko" id="ko" />
                <Label htmlFor="ko">🇰🇷 {t("korean")}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="en" id="en" />
                <Label htmlFor="en">🇺🇸 {t("english")}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="zh" id="zh" />
                <Label htmlFor="zh">🇨🇳 {t("chinese")}</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <span className="animate-spin mr-2">◌</span>
                {t("saving")}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {t("save_settings")}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
