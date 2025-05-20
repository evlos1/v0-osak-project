"use client"

import { useState, useEffect, useCallback } from "react" // useCallback 추가
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import WordLearning from "@/components/learning/word-learning" // 해당 컴포넌트들이 존재한다고 가정
import SentenceLearning from "@/components/learning/sentence-learning" // 해당 컴포넌트들이 존재한다고 가정
import PassageLearning from "@/components/learning/passage-learning" // 해당 컴포넌트들이 존재한다고 가정
import { useTranslation } from "@/app/i18n"
import { getApiKey } from "@/lib/api-key-utils" // isApiKeyRequired 대신 getApiKey 사용

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

  // 콘텐츠 로드 및 API 키 확인 로직을 useCallback으로 래핑
  const loadLearningContent = useCallback(async () => {
    setLoading(true); // 로딩 상태 시작
    setError(null); // 이전 오류 초기화
    setApiKeyMissing(false); // API 키 누락 상태 초기화

    try {
      // API 키 필요 여부 확인 (getApiKey()를 사용하여 직접 키 존재 여부 확인)
      const storedApiKey = getApiKey();
      console.log("학습 페이지 - API 키 확인:", storedApiKey ? "존재함" : "없음");

      if (!storedApiKey) {
        console.warn("학습 페이지 - API 키가 없어 설정 페이지로 이동합니다.");
        setApiKeyMissing(true);
        setLoading(false);
        // API 키가 없으면 설정 페이지로 즉시 리디렉션
        router.replace("/settings"); // replace 사용 (뒤로가기 방지)
        return;
      }

      // URL 파라미터에서 주제와 레벨 가져오기 (useSearchParams는 useEffect 내에서 접근 권장)
      const topic = searchParams.get("topic") || "일반"; // 기본값 설정
      const level = searchParams.get("level") || "B1"; // 기본값 설정

      // 로컬 스토리지에서 기존 콘텐츠 확인
      const storageKey = `learning-content-${topic}-${level}`;
      const storedContent = localStorage.getItem(storageKey);

      if (storedContent) {
        try {
          const parsedContent = JSON.parse(storedContent);
          setContent(parsedContent);
          setLoading(false);
          console.log("학습 페이지 - 저장된 콘텐츠 로드 성공");
          return; // 저장된 콘텐츠가 있으면 여기서 함수 종료
        } catch (parseError) {
          console.error("저장된 콘텐츠 파싱 오류:", parseError);
          // 파싱 오류 시 새 콘텐츠 생성 로직으로 계속 진행
          localStorage.removeItem(storageKey); // 잘못된 데이터 제거
        }
      }

      // 콘텐츠 생성 API 호출
      console.log(`학습 페이지 - 새 콘텐츠 생성 시작 (주제: ${topic}, 레벨: ${level})`);
      const response = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, level, apiKey: storedApiKey }), // 백엔드에 API 키 전달 (필요한 경우)
      });

      if (!response.ok) {
        // 서버 응답이 성공적이지 않은 경우, 에러 메시지를 파싱 시도
        const errorData = await response.json().catch(() => ({ message: "서버 응답 오류 (JSON 아님)" }));
        throw new Error(errorData.message || `콘텐츠 생성 실패: ${response.status} ${response.statusText}`);
      }

      const newContent = await response.json();

      // 생성된 콘텐츠 유효성 검사 (선택 사항)
      if (!newContent || !newContent.words || !newContent.sentences || !newContent.passage) {
        throw new Error("생성된 콘텐츠 형식이 유효하지 않습니다.");
      }

      // 생성된 콘텐츠 저장
      localStorage.setItem(storageKey, JSON.stringify(newContent));
      setContent(newContent);
      console.log("학습 페이지 - 새 콘텐츠 생성 및 저장 성공");

    } catch (err) {
      console.error("콘텐츠 로드 중 치명적인 오류:", err);
      // 사용자에게 보여줄 에러 메시지 설정
      setError(err instanceof Error ? err.message : t("unknown_error_occurred"));
    } finally {
      setLoading(false); // 로딩 상태 종료 (성공 또는 실패에 관계없이)
    }
  }, [searchParams, router, t]); // searchParams와 router, t를 의존성 배열에 추가

  // 컴포넌트 마운트 시 콘텐츠 로드 함수 호출
  useEffect(() => {
    loadLearningContent();
  }, [loadLearningContent]); // loadLearningContent를 의존성 배열에 추가

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
            <p className="text-center mt-4 text-muted-foreground">{t("loading_learning_content") || "학습 콘텐츠 로딩 중..."}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // API 키 누락 오류 표시 (API 키가 없어 초기 useEffect에서 바로 리디렉션하는 경우에만 보임)
  if (apiKeyMissing) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("api_key_required")}</AlertTitle> {/* API 키 필요 제목 */}
          <AlertDescription>{t("api_key_description")}</AlertDescription> {/* API 키 설명 */}
        </Alert>
        <Button onClick={goToSettings}>{t("go_to_settings")}</Button>
      </div>
    )
  }

  // 기타 오류 표시 (API 호출 실패 등)
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("error_occurred")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.back()}>{t("back")}</Button> {/* "뒤로" 버튼 */}
      </div>
    )
  }

  // 콘텐츠가 없는 경우 (API 호출은 성공했지만 데이터가 비어있거나 예상과 다를 때)
  if (!content || !content.words || !content.sentences || !content.passage) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("content_not_available") || "콘텐츠를 불러올 수 없습니다."}</AlertTitle>
          <AlertDescription>{t("content_not_available_description") || "학습 콘텐츠를 생성하지 못했거나 형식이 올바르지 않습니다."}</AlertDescription>
        </Alert>
        <Button onClick={loadLearningContent}>{t("retry")}</Button> {/* 다시 시도 버튼 */}
        <Button variant="outline" className="ml-2" onClick={() => router.push("/topic-selection")}>{t("select_new_topic")}</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="words">{t("words_learning")}</TabsTrigger>
          <TabsTrigger value="sentences">{t("sentences_learning")}</TabsTrigger>
          <TabsTrigger value="passage">{t("passage_learning")}</TabsTrigger>
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