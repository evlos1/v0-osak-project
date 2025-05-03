"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Bot, Book, Volume2, FileText, BookOpen, CheckCircle2 } from 'lucide-react'
import { CheckCircle } from 'lucide-react'
import Link from "next/link"
import { Settings } from 'lucide-react'
import type { WordDefinition } from "@/app/actions/dictionary"
import type { Quiz } from "@/app/actions/quiz-generator"
import { useTextToSpeech } from "@/hooks/use-text-to-speech"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "react-i18next"
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
  knowAllWords: boolean
  setKnowAllWords: (value: boolean) => void
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
  knowAllWords,
  setKnowAllWords,
}: WordLearningProps) {
  const { speak, speaking, supported } = useTextToSpeech()
  const { t } = useTranslation()

  if (!learningContent) return null

  if (quizMode) {
    if (quizCompleted) {
      return (
        <div className="space-y-6 py-4">
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center rounded-full bg-green-100 p-4 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold">{t("word_learning_complete")}</h3>
            <p className="text-muted-foreground mt-2">{t("word_learning_success")}</p>
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
          {filteredWordQuizzes.length > 0 ? t("wrong_problems") : t("word_quiz")}
          {filteredWordQuizzes.length > 0 && (
            <span className="text-sm text-muted-foreground ml-2">
              {t("wrong_problems_display", { count: filteredWordQuizzes.length })}
            </span>
          )}
        </h3>
        {quizzes.map((quiz: Quiz, index: number) => (
          <Card key={index} className="mb-4">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-3">
                {quiz.questionType === "fill-in-blank" ? (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {t("fill_in_blank")}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {t("word_meaning")}
                  </Badge>
                )}
              </div>
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
                    <p className="text-green-600">{t("correct_answer")}</p>
                  ) : (
                    <p className="text-red-600">{t("wrong_answer")}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        <div className="flex justify-end">
          <Button onClick={handleCompleteSection} disabled={!showResults && wordQuizAnswers.length < quizzes.length}>
            {showResults ? (quizResults.every((r) => r) ? t("complete") : t("retry_wrong")) : t("check_answer")}
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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-2">{t("back")}:</h3>
        <p className="text-muted-foreground mb-4">{t("word_guide")}</p>
        <div className="p-4 bg-muted rounded-md">
          <p className="leading-relaxed whitespace-normal break-words">
            {words.map((word: string, index: number) => (
              <span
                key={index}
                className={`cursor-pointer inline-block mx-0.5 mb-1 ${
                  selectedWords.includes(word) ? "bg-primary/20 text-primary underline" : ""
                }`}
                onClick={() => handleWordClick(word)}
              >
                {word}
              </span>
            ))}
          </p>
        </div>
      </div>

      {/* 모든 단어를 알고 있습니다 옵션 */}
      <div className="flex items-center space-x-2">
        <Button
          variant={knowAllWords ? "default" : "outline"}
          size="sm"
          className="flex items-center gap-2"
          onClick={() => {
            setKnowAllWords(!knowAllWords)
            if (!knowAllWords) {
              setSelectedWords([]) // 모든 단어를 알고 있다고 선택하면 선택된 단어 초기화
            }
          }}
        >
          {knowAllWords && <CheckCircle2 className="h-4 w-4" />}
          {t("know_all_words")}
        </Button>
        <span className="text-sm text-muted-foreground">{t("know_all_words_description")}</span>
      </div>

      {selectedWords.length > 0 && (
        <div className="space-y-4 mt-6">
          <h3 className="font-medium">{t("selected_words")}</h3>
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
                          title={t("read_passage")}
                        >
                          <Volume2 className={`h-4 w-4 ${speaking ? "text-primary animate-pulse" : ""}`} />
                        </Button>
                      )}
                    </div>
                    {wordDefinitions[word] ? (
                      wordDefinitions[word].loading ? (
                        <div className="flex items-center space-x-2 mt-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <p className="text-muted-foreground">{t("loading_meaning")}</p>
                        </div>
                      ) : wordDefinitions[word].error ? (
                        <div>
                          <p className="text-red-500 mt-1">
                            {wordDefinitions[word].error}: {t("meaning_error")}
                          </p>
                          <Button variant="outline" size="sm" className="mt-2" onClick={() => handleWordClick(word)}>
                            {t("retry")}
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
                                title={t("read_passage")}
                              >
                                <Volume2 className={`h-4 w-4 ${speaking ? "text-primary animate-pulse" : ""}`} />
                              </Button>
                            )}
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground flex items-center">
                            {wordDefinitions[word].source === "ai" ? (
                              <>
                                <Bot className="h-3 w-3 mr-1" />
                                <span>{t("ai_definition")}</span>
                              </>
                            ) : (
                              <>
                                <Book className="h-3 w-3 mr-1" />
                                <span>{t("dict_definition")}</span>
                              </>
                            )}
                          </div>
                        </>
                      )
                    ) : (
                      <div className="flex items-center space-x-2 mt-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <p className="text-muted-foreground">{t("loading_meaning")}</p>
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
              {t("api_key_settings")}
            </Button>
          </Link>
        )}
        <div className="ml-auto">
          <Button 
            onClick={handleCompleteSection} 
            disabled={isGeneratingQuiz || (!knowAllWords && selectedWords.length === 0)}
          >
            {isGeneratingQuiz ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("generating_quiz")}
              </>
            ) : knowAllWords ? (
              t("continue_to_next")
            ) : (
              t("generate_quiz")
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
