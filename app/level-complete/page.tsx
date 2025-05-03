"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ArrowRight, BarChart } from "lucide-react"

// 파일 상단에 i18n 및 카테고리 번역 관련 코드 추가
import i18n from "@/i18n"

// 다국어 지원을 위한 카테고리 매핑 추가
const categoryTranslations = {
  // 주 카테고리 번역
  과학: { en: "Science", zh: "科学" },
  예술: { en: "Arts", zh: "艺术" },
  스포츠: { en: "Sports", zh: "体育" },
  기술: { en: "Technology", zh: "技术" },
  역사: { en: "History", zh: "历史" },
  문학: { en: "Literature", zh: "文学" },
  비즈니스: { en: "Business", zh: "商业" },
  여행: { en: "Travel", zh: "旅行" },

  // 예술 서브 카테고리
  음악: { en: "Music", zh: "音乐" },
  미술: { en: "Fine Arts", zh: "美术" },
  영화: { en: "Film", zh: "电影" },
  연극: { en: "Theater", zh: "戏剧" },
  사진: { en: "Photography", zh: "摄影" },
  조각: { en: "Sculpture", zh: "雕塑" },

  // 물리학 상세 카테고리
  역학: { en: "Mechanics", zh: "力学" },
  양자역학: { en: "Quantum Mechanics", zh: "量子力学" },
  상대성이론: { en: "Theory of Relativity", zh: "相对论" },
  열역학: { en: "Thermodynamics", zh: "热力学" },
  전자기학: { en: "Electromagnetism", zh: "电磁学" },
}

// 현재 언어에 맞는 카테고리 이름 가져오기
const getLocalizedCategoryName = (koreanName: string) => {
  const currentLang = i18n.language
  if (currentLang === "ko") return koreanName

  const translation = categoryTranslations[koreanName]
  return translation ? translation[currentLang] || koreanName : koreanName
}

// 기존 LevelCompletePage 함수 내부에서 topic 변수 사용 부분 수정
export default function LevelCompletePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawTopic = searchParams.get("topic") || "일반"
  // 현재 언어에 맞게 토픽 이름 변환
  const topic = getLocalizedCategoryName(rawTopic)
  const level = searchParams.get("level") || "B1"

  // 다음 레벨 계산
  const getNextLevel = () => {
    if (level === "A1") return "A2"
    if (level === "A2") return "B1"
    if (level === "B1") return "B2"
    if (level === "B2") return "C1"
    if (level === "C1") return "C2"
    return level
  }

  const nextLevel = getNextLevel()

  const handleContinue = () => {
    router.push(`/learning?topic=${topic}&level=${nextLevel}`)
  }

  const handleNewTopic = () => {
    router.push("/topic-selection")
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <Card className="border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">학습 모듈 완료!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center rounded-full bg-green-100 p-6 mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold mt-4">축하합니다!</h3>
            <p className="text-muted-foreground mt-2">
              <span className="font-medium text-foreground">{topic}</span> 주제의
              <Badge variant="outline" className="mx-1 font-medium">
                {level}
              </Badge>
              레벨 학습을 성공적으로 완료했습니다.
            </p>
          </div>

          <div className="bg-muted p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <BarChart className="h-5 w-5 mr-2" />
              <h3 className="font-medium">학습 통계</h3>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">15</p>
                <p className="text-sm text-muted-foreground">학습한 단어</p>
              </div>
              <div>
                <p className="text-2xl font-bold">9</p>
                <p className="text-sm text-muted-foreground">학습한 문장</p>
              </div>
              <div>
                <p className="text-2xl font-bold">1</p>
                <p className="text-sm text-muted-foreground">학습한 지문</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <p className="text-center">다음 단계를 선택하세요:</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Button onClick={handleContinue} className="flex-1">
                <Badge variant="outline" className="mr-2 font-medium">
                  {nextLevel}
                </Badge>
                레벨로 계속하기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button onClick={handleNewTopic} variant="outline" className="flex-1">
                새로운 주제 선택하기
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
