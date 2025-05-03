"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import type { GeneratedContent } from "@/app/actions/content-generator"
import type { SentenceAnalysis } from "@/app/actions/sentence-analyzer"
import type { Quiz } from "@/app/actions/quiz-generator"

// 난이도 배지 컴포넌트 추가
function DifficultyBadge({ difficulty }: { difficulty?: string }) {
  if (!difficulty) return null

  const getVariant = () => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "medium":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "hard":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const getLabel = () => {
    switch (difficulty) {
      case "easy":
        return "쉬움"
      case "medium":
        return "보통"
      case "hard":
        return "어려움"
      default:
        return difficulty
    }
  }

  return <span className={`text-xs px-2 py-1 rounded-full font-medium ${getVariant()}`}>{getLabel()}</span>
}

interface SentenceLearningProps {
  learningContent: GeneratedContent | null
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
  const { t } = useTranslation()

  if (!learningContent) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // 퀴즈 모드
  if (quizMode) {
    // 퀴즈 완료 화면
    if (quizCompleted) {
      return (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center">
            <h3 className="font-medium text-green-800 mb-2">{t("quiz_completed")}</h3>
            <p className="text-green-700">{t("quiz_completed_description")}</p>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleCompleteSection}>{t("next_section")}</Button>
          </div>
        </div>
      )
    }

    // 퀴즈 결과 화면
    if (showResults) {
      const quizzes =
        filteredSentenceQuizzes.length > 0
          ? filteredSentenceQuizzes
          : customSentenceQuizzes.length > 0
            ? customSentenceQuizzes
            : learningContent.quizzes.sentences

      return (
        <div className="space-y-6">
          <h3 className="font-medium text-lg mb-4">{t("quiz_results")}</h3>
          <div className="space-y-4">
            {quizzes.map((quiz, index) => (
              <Card
                key={index}
                className={`border ${quizResults[index] ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium">
                      {quiz.questionType === "comprehension" ? t("comprehension") : t("structure")}
                    </div>
                    <div className="flex items-center gap-2">
                      <DifficultyBadge difficulty={quiz.difficulty} />
                      <Badge variant={quizResults[index] ? "outline" : "destructive"}>
                        {quizResults[index] ? t("correct") : t("incorrect")}
                      </Badge>
                    </div>
                  </div>
                  {quiz.relatedSentence && (
                    <p className="text-sm italic mb-3 p-2 bg-gray-50 rounded-md border border-gray-200">
                      {quiz.relatedSentence}
                    </p>
                  )}
                  <p className="mb-3">{quiz.question}</p>
                  <div className="grid gap-2">
                    {quiz.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={`p-2 rounded-md border ${
                          sentenceQuizAnswers[index] === optionIndex
                            ? quizResults[index]
                              ? "bg-green-100 border-green-300"
                              : "bg-red-100 border-red-300"
                            : quiz.answer === optionIndex && !quizResults[index]
                              ? "bg-green-100 border-green-300"
                              : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-end">
            <Button onClick={handleCompleteSection}>{t("complete_section")}</Button>
          </div>
        </div>
      )
    }

    // 퀴즈 문제 화면
    const quizzes =
      filteredSentenceQuizzes.length > 0
        ? filteredSentenceQuizzes
        : customSentenceQuizzes.length > 0
          ? customSentenceQuizzes
          : learningContent.quizzes.sentences

    return (
      <div className="space-y-6">
        <h3 className="font-medium text-lg mb-4">{t("sentence_quiz")}</h3>
        <div className="space-y-6">
          {quizzes.map((quiz, index) => (
            <Card key={index} className="border">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium">
                    {quiz.questionType === "comprehension" ? t("comprehension") : t("structure")}
                  </div>
                  <DifficultyBadge difficulty={quiz.difficulty} />
                </div>
                {quiz.relatedSentence && (
                  <p className="text-sm italic mb-3 p-2 bg-gray-50 rounded-md border border-gray-200">
                    {quiz.relatedSentence}
                  </p>
                )}
                <p className="mb-3">{quiz.question}</p>
                <div className="grid gap-2">
                  {quiz.options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className={`p-2 rounded-md border cursor-pointer ${
                        sentenceQuizAnswers[index] === optionIndex
                          ? "bg-primary/10 border-primary"
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                      }`}
                      onClick={() => {
                        const newAnswers = [...sentenceQuizAnswers]
                        newAnswers[index] = optionIndex
                        setSentenceQuizAnswers(newAnswers)
                      }}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex justify-end">
          <Button onClick={handleCompleteSection} disabled={sentenceQuizAnswers.length < quizzes.length}>
            {t("check_answers")}
          </Button>
        </div>
      </div>
    )
  }

  // 복습 모드
  if (learningMode === "review" && incorrectIndices.length > 0) {
    const quizzes = customSentenceQuizzes.length > 0 ? customSentenceQuizzes : learningContent.quizzes.sentences

    return (
      <div className="space-y-6">
        <h3 className="font-medium text-lg mb-4">{t("review_incorrect_answers")}</h3>
        <div className="space-y-4">
          {incorrectIndices.map((quizIndex) => {
            const quiz = quizzes[quizIndex]
            return (
              <Card key={quizIndex} className="border border-amber-200 bg-amber-50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium">
                      {quiz.questionType === "comprehension" ? t("comprehension") : t("structure")}
                    </div>
                    <DifficultyBadge difficulty={quiz.difficulty} />
                  </div>
                  {quiz.relatedSentence && (
                    <p className="text-sm italic mb-3 p-2 bg-gray-50 rounded-md border border-gray-200">
                      {quiz.relatedSentence}
                    </p>
                  )}
                  <p className="mb-3">{quiz.question}</p>
                  <div className="grid gap-2">
                    {quiz.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={`p-2 rounded-md border ${
                          quiz.answer === optionIndex ? "bg-green-100 border-green-300" : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
        <div className="flex justify-end">
          <Button onClick={handleCompleteSection} disabled={!reviewCompleted}>
            {reviewCompleted ? t("retry_quiz") : t("complete_review")}
          </Button>
        </div>
      </div>
    )
  }

  // 학습 모드
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {learningContent.sentences.map((sentence, index) => (
          <div
            key={index}
            className={`p-3 rounded-md cursor-pointer border ${
              selectedSentences.includes(index)
                ? "bg-primary/10 border-primary"
                : "bg-gray-50 border-gray-200 hover:bg-gray-100"
            }`}
            onClick={() => handleSentenceClick(index)}
          >
            {sentence}
          </div>
        ))}
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <Checkbox
          id="know-all-sentences"
          checked={knowAllSentences}
          onCheckedChange={(checked) => {
            setKnowAllSentences(checked === true)
            if (checked) {
              handleSentenceClick(-1) // 모든 선택 초기화
            }
          }}
        />
        <label
          htmlFor="know-all-sentences"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {t("know_all_sentences")}
        </label>
      </div>

      {selectedSentences.length > 0 && (
        <div className="mt-6 space-y-4">
          {selectedSentences.map((sentenceIndex) => (
            <Card key={sentenceIndex} className="border">
              <CardContent className="p-4">
                <div className="font-medium mb-2">{learningContent.sentences[sentenceIndex]}</div>
                {sentenceAnalyses[sentenceIndex]?.loading ? (
                  <div className="flex items-center text-muted-foreground">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("loading_analysis")}
                  </div>
                ) : sentenceAnalyses[sentenceIndex]?.error ? (
                  <div className="text-red-500">{sentenceAnalyses[sentenceIndex].error}</div>
                ) : (
                  <>
                    <div className="mb-2">
                      <span className="font-medium">{t("structure")}: </span>
                      {sentenceAnalyses[sentenceIndex]?.structure}
                    </div>
                    <div>
                      <span className="font-medium">{t("explanation")}: </span>
                      {sentenceAnalyses[sentenceIndex]?.explanation}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {quizError && <div className="text-red-500 mt-4">{quizError}</div>}

      <div className="flex justify-end">
        <Button
          onClick={handleCompleteSection}
          disabled={selectedSentences.length === 0 && !knowAllSentences && !reviewCompleted}
        >
          {isGeneratingQuiz ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t("generating_quiz")}
            </>
          ) : reviewCompleted ? (
            t("retry_quiz")
          ) : (
            t("start_quiz")
          )}
        </Button>
      </div>
    </div>
  )
}
