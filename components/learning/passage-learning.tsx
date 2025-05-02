"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Volume2, Pause } from "lucide-react"
import type { Quiz } from "@/app/actions/quiz-generator"
import { useTextToSpeech } from "@/hooks/use-text-to-speech"
import { useState, useEffect, useRef } from "react"

interface PassageLearningProps {
  learningContent: any
  showExplanation: boolean
  setShowExplanation: (show: boolean) => void
  quizMode: boolean
  quizCompleted: boolean
  showResults: boolean
  passageQuizAnswers: number[]
  setPassageQuizAnswers: (answers: number[]) => void
  quizResults: boolean[]
  handleCompleteSection: () => void
  filteredPassageQuizzes: Quiz[]
}

export default function PassageLearning({
  learningContent,
  showExplanation,
  setShowExplanation,
  quizMode,
  quizCompleted,
  showResults,
  passageQuizAnswers,
  setPassageQuizAnswers,
  quizResults,
  handleCompleteSection,
  filteredPassageQuizzes,
}: PassageLearningProps) {
  const { speak, stop, speaking, supported } = useTextToSpeech()
  const [isSpeakingPassage, setIsSpeakingPassage] = useState(false)
  const cleanupRef = useRef<(() => void) | null>(null)

  // 음성 재생 상태 감지
  useEffect(() => {
    if (!speaking && isSpeakingPassage) {
      setIsSpeakingPassage(false)
    }
  }, [speaking, isSpeakingPassage])

  // 컴포넌트 언마운트 시 음성 재생 정리
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
        cleanupRef.current = null
      }
      stop()
    }
  }, [stop])

  if (!learningContent) return null

  if (quizMode) {
    if (quizCompleted) {
      return (
        <div className="space-y-6 py-4">
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center rounded-full bg-green-100 p-4 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold">지문 학습 완료!</h3>
            <p className="text-muted-foreground mt-2">지문 학습을 성공적으로 마쳤습니다.</p>
          </div>
        </div>
      )
    }

    // 틀린 문제만 필터링하여 보여주거나 전체 퀴즈 보여주기
    const quizzes = filteredPassageQuizzes.length > 0 ? filteredPassageQuizzes : learningContent.quizzes.passage

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium">
          {filteredPassageQuizzes.length > 0 ? "틀린 문제 다시 풀기" : "지문 이해 퀴즈"}
          {filteredPassageQuizzes.length > 0 && (
            <span className="text-sm text-muted-foreground ml-2">
              (틀린 {filteredPassageQuizzes.length}문제만 표시됩니다)
            </span>
          )}
        </h3>
        {quizzes.map((quiz: Quiz, index: number) => (
          <Card key={index} className="mb-4">
            <CardContent className="pt-6">
              {/* 관련 문장 표시 (지문 퀴즈에는 없을 수 있음) */}
              {quiz.relatedSentence && (
                <div className="mb-4 p-3 bg-muted rounded-md">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm text-muted-foreground mb-1">관련 문장:</p>
                    {supported && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => speak(quiz.relatedSentence!, { rate: 0.8 })}
                        title="문장 발음 듣기"
                      >
                        <Volume2 className={`h-4 w-4 ${speaking ? "text-primary animate-pulse" : ""}`} />
                      </Button>
                    )}
                  </div>
                  <p className="italic">{quiz.relatedSentence}</p>
                </div>
              )}
              <p className="font-medium mb-3">{quiz.question}</p>
              <div className="space-y-2">
                {quiz.options.map((option: string, optIndex: number) => (
                  <div
                    key={optIndex}
                    className={`flex items-center p-3 rounded-md border cursor-pointer hover:bg-muted ${
                      showResults
                        ? optIndex === quiz.answer
                          ? "bg-green-50 border-green-200"
                          : passageQuizAnswers[index] === optIndex
                            ? "bg-red-50 border-red-200"
                            : ""
                        : passageQuizAnswers[index] === optIndex
                          ? "bg-primary/10 border-primary"
                          : ""
                    }`}
                    onClick={() => {
                      if (!showResults) {
                        const newAnswers = [...passageQuizAnswers]
                        newAnswers[index] = optIndex
                        setPassageQuizAnswers(newAnswers)
                      }
                    }}
                  >
                    <div className="h-5 w-5 rounded-full border mr-3 flex items-center justify-center">
                      {showResults ? (
                        optIndex === quiz.answer ? (
                          <div className="h-3 w-3 rounded-full bg-green-500" />
                        ) : passageQuizAnswers[index] === optIndex ? (
                          <div className="h-3 w-3 rounded-full bg-red-500" />
                        ) : null
                      ) : passageQuizAnswers[index] === optIndex ? (
                        <div className="h-3 w-3 rounded-full bg-primary" />
                      ) : null}
                    </div>
                    <span>{option}</span>
                  </div>
                ))}
              </div>
              {showResults && (
                <div className="mt-2 text-sm">
                  {quizResults[index] ? (
                    <p className="text-green-600">정답입니다!</p>
                  ) : (
                    <p className="text-red-600">오답입니다. 다시 시도해보세요.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        <div className="flex justify-end">
          <Button onClick={handleCompleteSection} disabled={!showResults && passageQuizAnswers.length < quizzes.length}>
            {showResults ? (quizResults.every((r) => r) ? "완료" : "틀린 문제 다시 풀기") : "정답 확인"}
          </Button>
        </div>
      </div>
    )
  }

  // 지문 읽기 시작
  const handleSpeakPassage = () => {
    if (!supported) return

    if (isSpeakingPassage) {
      if (cleanupRef.current) {
        cleanupRef.current()
        cleanupRef.current = null
      }
      stop()
      setIsSpeakingPassage(false)
    } else {
      setIsSpeakingPassage(true)

      // 지문 읽기 시작 및 정리 함수 저장
      const cleanup = speak(learningContent.passage, {
        rate: 0.8,
        onEnd: () => {
          setIsSpeakingPassage(false)
          cleanupRef.current = null
        },
      })

      // 정리 함수 저장
      if (typeof cleanup === "function") {
        cleanupRef.current = cleanup
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">지문:</h3>
          {supported && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSpeakPassage}
              className={isSpeakingPassage ? "bg-primary/10" : ""}
            >
              {isSpeakingPassage ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  읽기 중지
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4 mr-2" />
                  지문 읽기
                </>
              )}
            </Button>
          )}
        </div>
        <div className="p-4 bg-muted rounded-md">
          <p className={`leading-relaxed whitespace-normal break-words ${isSpeakingPassage ? "bg-primary/5" : ""}`}>
            {learningContent.passage}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => setShowExplanation(!showExplanation)}>
          {showExplanation ? "설명 숨기기" : "지문 이해가 어려워요"}
        </Button>
        <Button onClick={handleCompleteSection}>학습 완료 및 퀴즈 시작</Button>
      </div>

      {showExplanation && (
        <Card className="mt-4">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">주제:</h4>
                <p className="text-muted-foreground">{learningContent.passageExplanation.theme}</p>
              </div>
              <div>
                <h4 className="font-medium">구조적 패턴:</h4>
                <p className="text-muted-foreground">{learningContent.passageExplanation.structure}</p>
              </div>
              <div>
                <h4 className="font-medium">한글 해석:</h4>
                <p className="text-muted-foreground">
                  {learningContent.passageExplanation.translation || learningContent.passageExplanation.summary}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
