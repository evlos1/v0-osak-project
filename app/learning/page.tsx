"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import WordLearning from "@/components/learning/word-learning"
import SentenceLearning from "@/components/learning/sentence-learning"
import PassageLearning from "@/components/learning/passage-learning"
import { useTranslation } from "@/app/i18n"
import { isApiKeyRequired } from "@/lib/api-key-utils"

// 학습 콘텐츠 타입 정의
type GeneratedContent = {
  words: Array<{ word: string; definition: string; translation: string }>
  sentences: Array<{ sentence: string; translation: string }>
  passage: { text: string; translation: string }
}

export default function LearningPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [content, setContent] = useState<GeneratedContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("words")
  const [apiKeyMissing, setApiKeyMissing] = useState(false)

  // 컴포넌트 마운트 시 API 키 확인 및 콘텐츠 로드
  useEffect(() => {
    const checkApiKeyAndLoadContent = async () => {
      try {
        // API 키 필요 여부 확인
        const apiKeyNeeded = isApiKeyRequired()
        console.log("학습 페이지 - API 키 필요 여부:", apiKeyNeeded)

        if (apiKeyNeeded) {
          console.log("학습 페이지 - API 키가 필요합니다")
          setApiKeyMissing(true)
          setLoading(false)
          return
        }

        // URL 파라미터에서 주제와 레벨 가져오기
        const topic = searchParams?.get("topic") || "technology"
        const level = searchParams?.get("level") || "intermediate"

        // 로컬 스토리지에서 기존 콘텐츠 확인
        const storageKey = `learning-content-${topic}-${level}`
        const storedContent = localStorage.getItem(storageKey)

        if (storedContent) {
          try {
            const parsedContent = JSON.parse(storedContent)
            setContent(parsedContent)
            setLoading(false)
            console.log("학습 페이지 - 저장된 콘텐츠 로드 성공")
            return
          } catch (parseError) {
            console.error("저장된 콘텐츠 파싱 오류:", parseError)
            // 파싱 오류 시 계속 진행하여 새 콘텐츠 생성
          }
        }

        // 콘텐츠 생성 API 호출
        console.log("학습 페이지 - 새 콘텐츠 생성 시작")
        const response = await fetch("/api/generate-content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic, level }),
        })

        if (!response.ok) {
          throw new Error(`콘텐츠 생성 실패: ${response.status}`)
        }

        const newContent = await response.json()

        // 생성된 콘텐츠 저장
        localStorage.setItem(storageKey, JSON.stringify(newContent))
        setContent(newContent)
        console.log("학습 페이지 - 새 콘텐츠 생성 및 저장 성공")
      } catch (err) {
        console.error("콘텐츠 로드 중 오류:", err)
        setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다")
      } finally {
        setLoading(false)
      }
    }

    checkApiKeyAndLoadContent()
  }, [searchParams])

  // 설정 페이지로 이동
  const goToSettings = () => {
    router.push("/settings")
  }

  // 로딩 중 표시
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-8 w-2/3" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // API 키 누락 오류 표시
  if (apiKeyMissing) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("api_key_required_title")}</AlertTitle>
          <AlertDescription>{t("api_key_required_description")}</AlertDescription>
        </Alert>
        <Button onClick={goToSettings}>{t("go_to_settings")}</Button>
      </div>
    )
  }

  // 기타 오류 표시
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("error_occurred")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.back()}>{t("go_back")}</Button>
      </div>
    )
  }

  // 콘텐츠가 없는 경우
  if (!content) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("content_not_available")}</AlertTitle>
          <AlertDescription>{t("content_not_available_description")}</AlertDescription>
        </Alert>
        <Button onClick={() => router.back()}>{t("go_back")}</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="words">{t("words")}</TabsTrigger>
          <TabsTrigger value="sentences">{t("sentences")}</TabsTrigger>
          <TabsTrigger value="passage">{t("passage")}</TabsTrigger>
        </TabsList>

        <TabsContent value="words">
          <WordLearning words={content.words} />
        </TabsContent>

        <TabsContent value="sentences">
          <SentenceLearning sentences={content.sentences} />
        </TabsContent>

        <TabsContent value="passage">
          <PassageLearning passage={content.passage} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
