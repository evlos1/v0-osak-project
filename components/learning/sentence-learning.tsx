"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Volume2, FileText, BookOpen } from "lucide-react"
import { CheckCircle } from "lucide-react"
import type { SentenceAnalysis } from "@/app/actions/sentence-analyzer"
import type { Quiz } from "@/app/actions/quiz-generator"
import { useTextToSpeech } from "@/hooks/use-text-to-speech"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "react-i18next"
import { Checkbox } from "@/components/ui/checkbox"

interface SentenceLearningProps {
  learningContent: any
  selectedSentences: number[]
  handleSentenceClick: (index: number) => void
  sentenceAnalyses: Record<number, SentenceAnalysis>
  quizMode: boolean
  quizCompleted: boolean
  showResults: boolean
  sentenceQuizAnswers: number[]
  setSentenceQuizAnswers: (answers: number[]) => void
  quizResults: boolean[]
  handleCompleteSection: () => void
  isGeneratingQuiz: boolean
  quizError: string | null
  customSentenceQuizzes: Quiz[]
  filteredSentenceQuizzes: Quiz[]
  knowAllSentences: boolean
  setKnowAllSentences: (value: boolean) => void
  learningMode: "review" | "quiz"
  reviewCompleted: boolean
  incorrectIndices: number[]
}

export default function SentenceLearning({
  learningContent,
  selectedSentences,
  handleSentenceClick,
  sentenceAnalyses,
  quizMode,
  quizCompleted,
  showResults,
  sentenceQuizAnswers,
  setSentenceQuizAnswers,
  quizResults,
  handleCompleteSection,
  isGeneratingQuiz,
  quizError,
  customSentenceQuizzes,
  filteredSentenceQuizzes,
  knowAllSentences,
  setKnowAllSentences,
  learningMode,
  reviewCompleted,
  incorrectIndices,
}: SentenceLearningProps) {
  const { speak, speaking, supported } = useTextToSpeech()
  const [speakingSentenceIndex, setSpeakingSentenceIndex] = useState<number | null>(null)
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
            <h3 className="text-xl font-bold">{t("sentence_learning_complete")}</h3>
            <p className="text-muted-foreground mt-2">{t("sentence_learning_success")}</p>
          </div>
        </div>
      )
    }

    // 틀린 문제만 필터링하여 보여주거나 전체 퀴즈 보여주기
    const quizzes =
      filteredSentenceQuizzes.length > 0
        ? filteredSentenceQuizzes
        : customSentenceQuizzes.length > 0
          ? customSentenceQuizzes
          : learningContent.quizzes.sentences

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium">
          {filteredSentenceQuizzes.length > 0 ? t("wrong_problems") : t("sentence_quiz")}
          {filteredSentenceQuizzes.length > 0 && (
            <span className="text-sm text-muted-foreground ml-2">
              {t("wrong_problems_display", { count: filteredSentenceQuizzes.length })}
            </span>
          )}
        </h3>
        {quizzes.map((quiz: Quiz, index: number) => (
          <Card key={index} className="mb-4">
            <CardContent className="pt-6">
              {/* 퀴즈 유형 표시 */}
              <div className="flex items-center gap-2 mb-3">
                {quiz.questionType === "structure" ? (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {t("sentence_structure_quiz")}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {t("sentence_comprehension")}
                  </Badge>
                )}
              </div>

              {/* 관련 문장 표시 */}
              {quiz.relatedSentence && (
                <div className="mb-4 p-3 bg-muted rounded-md">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm text-muted-foreground mb-1">{t("related_sentence")}</p>
                    {supported && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => speak(quiz.relatedSentence!, { rate: 0.8 })}
                        title={t("read_passage")}
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
                          : sentenceQuizAnswers[index] === optIndex
                            ? "bg-red-50 border-red-200"
                            : ""
                        : sentenceQuizAnswers[index] === optIndex
                          ? "bg-primary/10 border-primary"
                          : ""
                    }`}
                    onClick={() => {
                      if (!showResults) {
                        const newAnswers = [...sentenceQuizAnswers]
                        newAnswers[index] = optIndex
                        setSentenceQuizAnswers(newAnswers)
                      }
                    }}
                  >
                    <div className="h-5 w-5 rounded-full border mr-3 flex items-center justify-center">
                      {showResults ? (
                        optIndex === quiz.answer ? (
                          <div className="h-3 w-3 rounded-full bg-green-500" />
                        ) : sentenceQuizAnswers[index] === optIndex ? (
                          <div className="h-3 w-3 rounded-full bg-red-500" />
                        ) : null
                      ) : sentenceQuizAnswers[index] === optIndex ? (
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
          <Button
            onClick={handleCompleteSection}
            disabled={!showResults && sentenceQuizAnswers.length < quizzes.length}
          >
            {showResults ? (quizResults.every((r) => r) ? t("complete") : t("continue_learning")) : t("check_answer")}
          </Button>
        </div>
      </div>
    )
  }

  // 문장 발음 재생
  const handleSpeakSentence = (sentence: string, index: number) => {
    if (supported) {
      setSpeakingSentenceIndex(index)
      speak(sentence, { rate: 0.8 })

      // 문장 길이에 따라 애니메이션 시간 조정 (최소 1초, 최대 5초)
      const duration = Math.min(Math.max(sentence.length * 50, 1000), 5000)
      setTimeout(() => {
        setSpeakingSentenceIndex(null)
      }, duration)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-2">{t("back")}:</h3>
        <p className="text-muted-foreground mb-4">{t("sentence_guide")}</p>

        {/* 모든 문장을 이해해요 체크박스 추가 */}
        <div className="flex items-center space-x-2 mb-4 p-3 bg-muted rounded-md">
          <Checkbox
            id="know-all-sentences"
            checked={knowAllSentences}
            onCheckedChange={(checked) => {
              setKnowAllSentences(checked === true)
              if (checked) {
                // 체크 시 선택된 문장 초기화
                handleSentenceClick(-1)
              }
            }}
          />
          <label
            htmlFor="know-all-sentences"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            {t("know_all_sentences")}
          </label>
        </div>

        <div className="space-y-2">
          {learningContent.sentences.map((sentence: string, index: number) => (
            <div
              key={index}
              className={`p-3 rounded-md cursor-pointer ${
                selectedSentences.includes(index) ? "bg-primary/10 border-l-4 border-primary" : "hover:bg-muted"
              } ${knowAllSentences ? "opacity-50 pointer-events-none" : ""}`}
            >
              <div className="flex justify-between items-center">
                <p className="flex-1" onClick={() => handleSentenceClick(index)}>
                  {sentence}
                </p>
                {supported && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-8 w-8 p-0 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSpeakSentence(sentence, index)
                    }}
                    title={t("read_passage")}
                    disabled={knowAllSentences}
                  >
                    <Volume2
                      className={`h-4 w-4 ${speakingSentenceIndex === index ? "text-primary animate-pulse" : ""}`}
                    />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedSentences.length > 0 && !knowAllSentences && (
        <div className="space-y-4 mt-6">
          <h3 className="font-medium">{t("selected_sentences")}</h3>
          {selectedSentences.map((sentenceIndex) => (
            <Card key={sentenceIndex}>
              <CardContent className="p-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold">{learningContent.sentences[sentenceIndex]}</h4>
                    {supported && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2 h-8 w-8 p-0"
                        onClick={() => speak(learningContent.sentences[sentenceIndex], { rate: 0.8 })}
                        title={t("read_passage")}
                      >
                        <Volume2 className={`h-4 w-4 ${speaking ? "text-primary animate-pulse" : ""}`} />
                      </Button>
                    )}
                  </div>
                  {sentenceAnalyses[sentenceIndex] ? (
                    sentenceAnalyses[sentenceIndex].loading ? (
                      <div className="flex items-center space-x-2 mt-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <p className="text-muted-foreground">{t("analyzing_sentence")}</p>
                      </div>
                    ) : sentenceAnalyses[sentenceIndex].error ? (
                      <div>
                        <p className="text-red-500 mt-1">
                          {sentenceAnalyses[sentenceIndex].error}: {t("sentence_analysis_error")}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => handleSentenceClick(sentenceIndex)}
                        >
                          {t("retry")}
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="mt-3 space-y-2">
                          <p className="text-sm font-medium">{t("sentence_structure")}</p>
                          <p className="text-sm text-muted-foreground">{sentenceAnalyses[sentenceIndex].structure}</p>
                        </div>
                        <div className="mt-3 space-y-2">
                          <p className="text-sm font-medium">{t("interpretation")}</p>
                          <p className="text-sm text-muted-foreground">{sentenceAnalyses[sentenceIndex].explanation}</p>
                        </div>
                      </>
                    )
                  ) : (
                    <div className="flex items-center space-x-2 mt-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <p className="text-muted-foreground">{t("analyzing_sentence")}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="pt-4 flex justify-end">
        <Button
          onClick={handleCompleteSection}
          disabled={(selectedSentences.length === 0 && !knowAllSentences) || isGeneratingQuiz}
        >
          {isGeneratingQuiz ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t("generating_quiz")}
            </>
          ) : learningMode === "review" && incorrectIndices.length > 0 ? (
            reviewCompleted ? (
              t("retry_wrong_questions")
            ) : (
              t("complete_review")
            )
          ) : knowAllSentences ? (
            t("next_section")
          ) : (
            t("generate_sentence_quiz")
          )}
        </Button>
      </div>

      {quizError && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">{quizError}</div>
      )}
    </div>
  )
}
