"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Bot, Book, Volume2 } from "lucide-react"
import { CheckCircle } from "lucide-react"
import Link from "next/link"
import { Settings } from "lucide-react"
import type { WordDefinition } from "@/app/actions/dictionary"
import type { Quiz } from "@/app/actions/quiz-generator"
import { useTextToSpeech } from "@/hooks/use-text-to-speech"
import { useState } from "react"

interface WordLearningProps {
  learningContent: any
  selectedWords: string[]
  setSelectedWords: (words: string[]) => void
  wordDefinitions: Record<string, WordDefinition>
  handleWordClick: (word: string) => void
  quizMode: boolean
  quizCompleted: boolean
  showResults: boolean
  wordQuizAnswers: number[]
  setWordQuizAnswers: (answers: number[]) => void
  quizResults: boolean[]
  handleCompleteSection: () => void
  apiKey: string
  isGeneratingQuiz: boolean
  quizError: string | null
  customWordQuizzes: Quiz[]
  filteredWordQuizzes: Quiz[]
}

export default function WordLearning({
  learningContent,
  selectedWords,
  setSelectedWords,
  wordDefinitions,
  handleWordClick,
  quizMode,
  quizCompleted,
  showResults,
  wordQuizAnswers,
  setWordQuizAnswers,
  quizResults,
  handleCompleteSection,
  apiKey,
  isGeneratingQuiz,
  quizError,
  customWordQuizzes,
  filteredWordQuizzes,
}: WordLearningProps) {
  const { speak, speaking, supported } = useTextToSpeech()
  const [speakingWordIndex, setSpeakingWordIndex] = useState<number | null>(null)

  if (!learningContent) return null

  if (quizMode) {
    if (quizCompleted) {
      return (
        <div className="space-y-6 py-4">
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center rounded-full bg-green-100 p-4 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold">단어 학습 완료!</h3>
            <p className="text-muted-foreground mt-2">단어 학습을 성공적으로 마쳤습니다.</p>
          </div>
        </div>
      )
    }

    // 틀린 문제만 필터링하여 보여주거나 전체 퀴즈 보여주기
    const quizzes =
      filteredWordQuizzes.length > 0
        ? filteredWordQuizzes
        : customWordQuizzes.length > 0
          ? customWordQuizzes
          : learningContent.quizzes.words

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium">
          {filteredWordQuizzes.length > 0 ? "틀린 문제 다시 풀기" : "단어 퀴즈"}
          {filteredWordQuizzes.length > 0 && (
            <span className="text-sm text-muted-foreground ml-2">
              (틀린 {filteredWordQuizzes.length}문제만 표시됩니다)
            </span>
          )}
        </h3>
        {quizzes.map((quiz: Quiz, index: number) => (
          <Card key={index} className="mb-4">
            <CardContent className="pt-6">
              <p className="font-medium mb-3">{quiz.question}</p>
              <div className="space-y-2">
                {quiz.options.map((option: string, optIndex: number) => (
                  <div
                    key={optIndex}
                    className={`flex items-center p-3 rounded-md border cursor-pointer hover:bg-muted ${
                      showResults
                        ? optIndex === quiz.answer
                          ? "bg-green-50 border-green-200"
                          : wordQuizAnswers[index] === optIndex
                            ? "bg-red-50 border-red-200"
                            : ""
                        : wordQuizAnswers[index] === optIndex
                          ? "bg-primary/10 border-primary"
                          : ""
                    }`}
                    onClick={() => {
                      if (!showResults) {
                        const newAnswers = [...wordQuizAnswers]
                        newAnswers[index] = optIndex
                        setWordQuizAnswers(newAnswers)
                      }
                    }}
                  >
                    <div className="h-5 w-5 rounded-full border mr-3 flex items-center justify-center">
                      {showResults ? (
                        optIndex === quiz.answer ? (
                          <div className="h-3 w-3 rounded-full bg-green-500" />
                        ) : wordQuizAnswers[index] === optIndex ? (
                          <div className="h-3 w-3 rounded-full bg-red-500" />
                        ) : null
                      ) : wordQuizAnswers[index] === optIndex ? (
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
          <Button onClick={handleCompleteSection} disabled={!showResults && wordQuizAnswers.length < quizzes.length}>
            {showResults ? (quizResults.every((r) => r) ? "완료" : "틀린 문제 다시 풀기") : "정답 확인"}
          </Button>
        </div>
      </div>
    )
  }

  // 단어 배열 생성
  const words = learningContent?.passage
    ? learningContent.passage
        .split(/\s+/)
        .map((word: string) => word.replace(/[.,!?;:()]/g, ""))
        .filter((word: string) => word.length > 0)
    : []

  // 단어 발음 재생
  const handleSpeakWord = (word: string, index: number) => {
    if (supported) {
      setSpeakingWordIndex(index)
      speak(word, { rate: 0.8 })
      setTimeout(() => {
        setSpeakingWordIndex(null)
      }, 1000) // 1초 후 스피킹 상태 초기화
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-2">안내:</h3>
        <p className="text-muted-foreground mb-4">
          아래 텍스트에서 모르는 단어를 클릭하세요. 선택한 단어의 의미와 예문을 확인할 수 있습니다. 단어 옆의 스피커
          아이콘을 클릭하면 발음을 들을 수 있습니다.
        </p>
        <div className="p-4 bg-muted rounded-md">
          <p className="leading-relaxed whitespace-normal break-words">
            {words.map((word: string, index: number) => (
              <span key={index} className="inline-flex items-center mx-0.5 mb-1">
                <span
                  className={`cursor-pointer ${
                    selectedWords.includes(word) ? "bg-primary/20 text-primary underline" : ""
                  }`}
                  onClick={() => handleWordClick(word)}
                >
                  {word}
                </span>
                {supported && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSpeakWord(word, index)
                    }}
                    className={`ml-0.5 p-0.5 rounded-full hover:bg-gray-200 focus:outline-none ${
                      speakingWordIndex === index ? "text-primary animate-pulse" : "text-gray-400"
                    }`}
                    title="발음 듣기"
                  >
                    <Volume2 className="h-3 w-3" />
                  </button>
                )}
              </span>
            ))}
          </p>
        </div>
      </div>

      {selectedWords.length > 0 && (
        <div className="space-y-4 mt-6">
          <h3 className="font-medium">선택한 단어:</h3>
          {selectedWords.map((word, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="w-full">
                    <div className="flex items-center">
                      <h4 className="font-bold text-lg">{word}</h4>
                      {supported && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2 h-6 w-6 p-0"
                          onClick={() => speak(word, { rate: 0.8 })}
                          title="발음 듣기"
                        >
                          <Volume2 className={`h-4 w-4 ${speaking ? "text-primary animate-pulse" : ""}`} />
                        </Button>
                      )}
                    </div>
                    {wordDefinitions[word] ? (
                      wordDefinitions[word].loading ? (
                        <div className="flex items-center space-x-2 mt-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <p className="text-muted-foreground">단어 의미를 가져오는 중...</p>
                        </div>
                      ) : wordDefinitions[word].error ? (
                        <div>
                          <p className="text-red-500 mt-1">
                            {wordDefinitions[word].error}: 단어 의미를 가져오지 못했습니다.
                          </p>
                          <Button variant="outline" size="sm" className="mt-2" onClick={() => handleWordClick(word)}>
                            다시 시도
                          </Button>
                        </div>
                      ) : (
                        <>
                          <p className="text-muted-foreground mt-1">{wordDefinitions[word].meaning}</p>
                          <div className="mt-2 text-sm italic flex items-center">
                            <span>"{wordDefinitions[word].example}"</span>
                            {supported && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="ml-2 h-6 w-6 p-0"
                                onClick={() => speak(wordDefinitions[word].example, { rate: 0.8 })}
                                title="예문 발음 듣기"
                              >
                                <Volume2 className={`h-4 w-4 ${speaking ? "text-primary animate-pulse" : ""}`} />
                              </Button>
                            )}
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground flex items-center">
                            {wordDefinitions[word].source === "ai" ? (
                              <>
                                <Bot className="h-3 w-3 mr-1" />
                                <span>AI 제공 정의</span>
                              </>
                            ) : (
                              <>
                                <Book className="h-3 w-3 mr-1" />
                                <span>사전 제공 정의</span>
                              </>
                            )}
                          </div>
                        </>
                      )
                    ) : (
                      <div className="flex items-center space-x-2 mt-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <p className="text-muted-foreground">단어 의미를 가져오는 중...</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="pt-4 flex justify-between">
        {!apiKey && (
          <Link href="/settings">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              API 키 설정
            </Button>
          </Link>
        )}
        <div className="ml-auto">
          <Button onClick={handleCompleteSection} disabled={selectedWords.length === 0 || isGeneratingQuiz}>
            {isGeneratingQuiz ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                퀴즈 생성 중...
              </>
            ) : (
              "선택한 단어로 퀴즈 생성"
            )}
          </Button>
        </div>
      </div>

      {quizError && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">{quizError}</div>
      )}
    </div>
  )
}
