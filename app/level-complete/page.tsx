"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ArrowRight, BarChart } from "lucide-react"

export default function LevelCompletePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const topic = searchParams.get("topic") || "일반"
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
