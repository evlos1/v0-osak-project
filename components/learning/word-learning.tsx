"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, History } from "lucide-react"
import { useTranslation } from "react-i18next"
import type { GeneratedContent } from "@/app/actions/content-generator"
import type { WordDefinition } from "@/app/actions/dictionary"
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

interface WordLearningProps {
  learningContent: GeneratedContent | null
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
  learningMode: "review" | "quiz"
  reviewCompleted: boolean
  incorrectIndices: number[]
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
  learningMode,
  reviewCompleted,
  incorrectIndices,
}: WordLearningProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState("meanings")

  if (!learningContent) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // 단어 배열 생성
  const words = learningContent.passage
    ? learningContent.passage
        .split(/\s+/)
        .map((word) => word.replace(/[.,!?;:()]/g, ""))
        .filter((word) => word.length > 0)
    : []

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
        filteredWordQuizzes.length > 0
          ? filteredWordQuizzes
          : customWordQuizzes.length > 0
            ? customWordQuizzes
            : learningContent.quizzes.words

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
                      {quiz.questionType === "fill-in-blank" ? t("fill_in_blank") : t("meaning")}
                    </div>
                    <div className="flex items-center gap-2">
                      <DifficultyBadge difficulty={quiz.difficulty} />
                      <Badge variant={quizResults[index] ? "outline" : "destructive"}>
                        {quizResults[index] ? t("correct") : t("incorrect")}
                      </Badge>
                    </div>
                  </div>
                  <p className="mb-3">{quiz.question}</p>
                  {quiz.relatedSentence && (
                    <p className="text-sm italic mb-3 text-muted-foreground">{quiz.relatedSentence}</p>
                  )}
                  <div className="grid gap-2">
                    {quiz.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={`p-2 rounded-md border ${
                          wordQuizAnswers[index] === optionIndex
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
      filteredWordQuizzes.length > 0
        ? filteredWordQuizzes
        : customWordQuizzes.length > 0
          ? customWordQuizzes
          : learningContent.quizzes.words

    return (
      <div className="space-y-6">
        <h3 className="font-medium text-lg mb-4">{t("word_quiz")}</h3>
        <div className="space-y-6">
          {quizzes.map((quiz, index) => (
            <Card key={index} className="border">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium">
                    {quiz.questionType === "fill-in-blank" ? t("fill_in_blank") : t("meaning")}
                  </div>
                  <DifficultyBadge difficulty={quiz.difficulty} />
                </div>
                <p className="mb-3">{quiz.question}</p>
                {quiz.relatedSentence && (
                  <p className="text-sm italic mb-3 text-muted-foreground">{quiz.relatedSentence}</p>
                )}
                <div className="grid gap-2">
                  {quiz.options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className={`p-2 rounded-md border cursor-pointer ${
                        wordQuizAnswers[index] === optionIndex
                          ? "bg-primary/10 border-primary"
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                      }`}
                      onClick={() => {
                        const newAnswers = [...wordQuizAnswers]
                        newAnswers[index] = optionIndex
                        setWordQuizAnswers(newAnswers)
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
          <Button onClick={handleCompleteSection} disabled={wordQuizAnswers.length < quizzes.length}>
            {t("check_answers")}
          </Button>
        </div>
      </div>
    )
  }

  // 복습 모드
  if (learningMode === "review" && incorrectIndices.length > 0) {
    const quizzes = customWordQuizzes.length > 0 ? customWordQuizzes : learningContent.quizzes.words

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
                      {quiz.questionType === "fill-in-blank" ? t("fill_in_blank") : t("meaning")}
                    </div>
                    <DifficultyBadge difficulty={quiz.difficulty} />
                  </div>
                  <p className="mb-3">{quiz.question}</p>
                  {quiz.relatedSentence && (
                    <p className="text-sm italic mb-3 text-muted-foreground">{quiz.relatedSentence}</p>
                  )}
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
      <div className="flex flex-wrap gap-2 mb-4">
        {words.map((word, index) => {
          // 단어 필터링 (중복 제거, 소문자 변환, 특수문자 제거)
          const cleanWord = word.toLowerCase().replace(/[.,!?;:()]/g, "")
          if (!cleanWord || cleanWord.length <= 1) return null

          return (
            <div
              key={index}
              className={`px-3 py-1.5 rounded-md cursor-pointer border ${
                selectedWords.includes(cleanWord)
                  ? "bg-primary/10 border-primary"
                  : "bg-gray-50 border-gray-200 hover:bg-gray-100"
              }`}
              onClick={() => handleWordClick(cleanWord)}
            >
              {cleanWord}
            </div>
          )
        })}
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <Checkbox
          id="know-all-words"
          checked={knowAllWords}
          onCheckedChange={(checked) => {
            setKnowAllWords(checked === true)
            if (checked) {
              setSelectedWords([])
            }
          }}
        />
        <label
          htmlFor="know-all-words"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {t("know_all_words")}
        </label>
      </div>

      {selectedWords.length > 0 && (
        <div className="mt-6">
          <Tabs defaultValue="meanings" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="meanings">{t("meanings")}</TabsTrigger>
              <TabsTrigger value="etymology">{t("etymology")}</TabsTrigger>
            </TabsList>
            <TabsContent value="meanings" className="space-y-4">
              {selectedWords.map((word) => (
                <Card key={word} className="border">
                  <CardContent className="p-4">
                    <div className="font-medium text-lg mb-2">{word}</div>
                    {wordDefinitions[word]?.loading ? (
                      <div className="flex items-center text-muted-foreground">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t("loading_meaning")}
                      </div>
                    ) : wordDefinitions[word]?.error ? (
                      <div className="text-red-500">{wordDefinitions[word].error}</div>
                    ) : (
                      <>
                        {wordDefinitions[word]?.meanings && wordDefinitions[word].meanings.length > 0 ? (
                          wordDefinitions[word].meanings.map((meaning, idx) => (
                            <div key={idx} className="mb-4">
                              {meaning.partOfSpeech && (
                                <div className="text-sm text-muted-foreground mb-1">{meaning.partOfSpeech}</div>
                              )}
                              <div className="mb-2">
                                <span className="font-medium">{t("meaning")}: </span>
                                {meaning.definition}
                              </div>
                              {meaning.example && (
                                <div>
                                  <span className="font-medium">{t("example")}: </span>
                                  <span className="italic">{meaning.example}</span>
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-muted-foreground">{t("no_meaning_found")}</div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="etymology" className="space-y-4">
              {selectedWords.map((word) => (
                <Card key={word} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <History className="h-4 w-4 text-primary" />
                      <div className="font-medium text-lg">{word}</div>
                    </div>
                    {wordDefinitions[word]?.loading ? (
                      <div className="flex items-center text-muted-foreground">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t("loading_etymology")}
                      </div>
                    ) : wordDefinitions[word]?.error ? (
                      <div className="text-red-500">{wordDefinitions[word].error}</div>
                    ) : wordDefinitions[word]?.etymology ? (
                      <div className="mb-4">
                        <div className="font-medium mb-2">{t("etymology")}</div>
                        <div>{wordDefinitions[word].etymology}</div>

                        {wordDefinitions[word].etymologyTimeline &&
                          wordDefinitions[word].etymologyTimeline.stages &&
                          wordDefinitions[word].etymologyTimeline.stages.length > 0 && (
                            <div className="mt-4">
                              <div className="font-medium mb-2">{t("etymology_timeline")}</div>
                              <div className="space-y-2">
                                {wordDefinitions[word].etymologyTimeline.stages.map((stage, idx) => (
                                  <div key={idx} className="border-l-2 border-primary pl-3 py-1">
                                    <div className="font-medium">
                                      {stage.period} {stage.year && `(${stage.year})`}
                                    </div>
                                    <div className="flex gap-2">
                                      <span className="font-medium">{stage.word}</span>
                                      {stage.meaning && <span>- {stage.meaning}</span>}
                                    </div>
                                    {stage.language && (
                                      <div className="text-sm text-muted-foreground">{stage.language}</div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    ) : (
                      <div className="text-muted-foreground">{t("no_etymology")}</div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      )}

      {quizError && <div className="text-red-500 mt-4">{quizError}</div>}

      <div className="flex justify-end">
        <Button
          onClick={handleCompleteSection}
          // 버튼 활성화 조건 수정: 단어를 선택했거나 모든 단어를 알고 있다고 체크했을 때 활성화
          disabled={selectedWords.length === 0 && !knowAllWords}
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
