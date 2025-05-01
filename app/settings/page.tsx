"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, Key, Save, ArrowLeft } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch"

export default function SettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [apiKey, setApiKey] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [rememberApiKey, setRememberApiKey] = useState(true)

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

      toast({
        title: "설정이 저장되었습니다",
        description: "Google API 키가 성공적으로 저장되었습니다.",
      })

      // 홈으로 리디렉션
      setTimeout(() => {
        router.push("/")
      }, 1500)
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "설정을 저장하는 중 오류가 발생했습니다.",
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
        뒤로
      </Button>

      <Card className="border shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <CardTitle className="text-2xl">설정</CardTitle>
          </div>
          <CardDescription>애플리케이션 설정을 관리합니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              <h3 className="text-lg font-medium">API 키 설정</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              단어 정의를 가져오기 위한 Google Gemini API 키를 입력하세요. API 키는 로컬에만 저장되며 서버로 전송되지
              않습니다.
            </p>
            <div className="pt-2">
              <Label htmlFor="api-key">Google Gemini API 키</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="AIza..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">API 키가 없으면 로컬 사전이 사용됩니다.</p>
            </div>
            <div className="flex items-center space-x-2 mt-4">
              <Switch id="remember-api-key" checked={rememberApiKey} onCheckedChange={setRememberApiKey} />
              <Label htmlFor="remember-api-key">API 키 기억하기</Label>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {rememberApiKey
                ? "API 키를 브라우저에 저장하여 다음 방문 시에도 사용합니다."
                : "API 키를 현재 세션에만 사용하고 브라우저를 닫으면 삭제합니다."}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <span className="animate-spin mr-2">◌</span>
                저장 중...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                설정 저장
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
