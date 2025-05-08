"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useTranslation } from "@/app/i18n"
import { getApiKey, saveApiKey, API_KEY_TEST_VALUE } from "@/lib/api-key-utils"

export default function SettingsPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [apiKey, setApiKey] = useState("")
  const [testMode, setTestMode] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 컴포넌트 마운트 시 API 키 로드
  useEffect(() => {
    try {
      const storedApiKey = getApiKey()
      console.log("설정 페이지 - 저장된 API 키 로드:", storedApiKey ? "존재함" : "없음")

      if (storedApiKey) {
        if (storedApiKey === API_KEY_TEST_VALUE) {
          setTestMode(true)
          setApiKey("")
        } else {
          setApiKey(storedApiKey)
          setTestMode(false)
        }
      }
    } catch (error) {
      console.error("API 키 로드 중 오류:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // API 키 저장 처리
  const handleSave = () => {
    try {
      const keyToSave = testMode ? API_KEY_TEST_VALUE : apiKey.trim()
      const success = saveApiKey(keyToSave)

      if (success) {
        console.log("API 키 저장 성공:", testMode ? "TEST MODE" : "실제 키")
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      } else {
        console.error("API 키 저장 실패")
      }
    } catch (error) {
      console.error("API 키 저장 중 오류:", error)
    }
  }

  // 테스트 모드 토글 처리
  const handleTestModeToggle = (checked: boolean) => {
    setTestMode(checked)
    if (checked) {
      setApiKey("")
    }
  }

  // 뒤로 가기 처리
  const handleBack = () => {
    router.back()
  }

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">로딩 중...</div>
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>{t("settings")}</CardTitle>
          <CardDescription>{t("settings_description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-mode">{t("test_mode")}</Label>
            <div className="flex items-center space-x-2">
              <Switch id="test-mode" checked={testMode} onCheckedChange={handleTestModeToggle} />
              <span>{testMode ? t("test_mode_on") : t("test_mode_off")}</span>
            </div>
            <p className="text-sm text-gray-500">{t("test_mode_description")}</p>
          </div>

          {!testMode && (
            <div className="space-y-2">
              <Label htmlFor="api-key">{t("api_key")}</Label>
              <Input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={t("enter_api_key")}
                disabled={testMode}
              />
              <p className="text-sm text-gray-500">{t("api_key_description")}</p>
            </div>
          )}

          {saveSuccess && <div className="bg-green-100 text-green-700 p-2 rounded">{t("settings_saved")}</div>}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleBack}>
            {t("back")}
          </Button>
          <Button onClick={handleSave}>{t("save")}</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
