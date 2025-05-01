"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  BookOpen,
  AlignLeft,
  MessageSquare,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Loader2,
  Bot,
  Book,
  Settings,
  RefreshCw,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getWordDefinition, type WordDefinition } from "../actions/dictionary"
import { generateLearningContent, type GeneratedContent } from "../actions/content-generator"
import { analyzeSentence, type SentenceAnalysis } from "../actions/sentence-analyzer"
import { generateWordQuizzes, generateSentenceQuizzes, type Quiz } from "../actions/quiz-generator"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

export default function LearningPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const topic = searchParams.get("topic") || "일반"
  const initialLevel = searchParams.get("level") || "B1"

  const [currentLevel, setCurrentLevel] = useState(initialLevel)
  const [activeTab, setActiveTab] = useState("words")
  const [learningComplete, setLearningComplete] = useState({
    words: false,
    sentences: false,
    passage: false,
  })
  const [selectedWords, setSelectedWords] = useState<string[]>([])
  const [selectedSentences, setSelectedSentences] = useState<number[]>([])
  const [quizMode, setQuizMode] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [wordQuizAnswers, setWordQuizAnswers] = useState<number[]>([])
  const [sentenceQuizAnswers, setSentenceQuizAnswers] = useState<number[]>([])
  const [passageQuizAnswers, setPassageQuizAnswers] = useState<number[]>([])
  const [quizResults, setQuizResults] = useState<boolean[]>([])
  const [showResults, setShowResults] = useState(false)
  const [apiKey, setApiKey] = useState<string>("")
  const [sentenceAnalyses, setSentenceAnalyses] = useState<Record<number, SentenceAnalysis>>({})

  // 커스텀 퀴즈 관련 상태
  const [customWordQuizzes, setCustomWordQuizzes] = useState<Quiz[]>([])
  const [customSentenceQuizzes, setCustomSentenceQuizzes] = useState<Quiz[]>([])
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false)
  const [quizError, setQuizError] = useState<string | null>(null)

  // AI 생성 콘텐츠 관련 상태
  const [learningContent, setLearningContent] = useState<GeneratedContent | null>(null)
  const [isLoadingContent, setIsLoadingContent] = useState(true)
  const [contentError, setContentError] = useState<string | null>(null)

  // API 키 로드
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedApiKey = localStorage.getItem("google_api_key") || ""
      setApiKey(savedApiKey)
    }
  }, [])

  // 레벨 조정 관련 상태
  const [lowPercentageCount, setLowPercentageCount] = useState(0)
  const [unknownWordPercentages, setUnknownWordPercentages] = useState<number[]>([])
  const [showLevelChangeDialog, setShowLevelChangeDialog] = useState(false)
  const [levelChangeDirection, setLevelChangeDirection] = useState<"up" | "down" | null>(null)
  const [newLevel, setNewLevel] = useState("")

  // AI 단어 정의 관련 상태
  const [wordDefinitions, setWordDefinitions] = useState<Record<string, WordDefinition>>({})

  // CEFR 레벨 순서
  const levels = ["A1", "A2", "B1", "B2", "C1", "C2"]

  // 상태 추가 (기존 상태 선언 부분에 추가)
  const [incorrectWordQuizIndices, setIncorrectWordQuizIndices] = useState<number[]>([])
  const [incorrectSentenceQuizIndices, setIncorrectSentenceQuizIndices] = useState<number[]>([])
  const [incorrectPassageQuizIndices, setIncorrectPassageQuizIndices] = useState<number[]>([])
  const [filteredWordQuizzes, setFilteredWordQuizzes] = useState<Quiz[]>([])
  const [filteredSentenceQuizzes, setFilteredSentenceQuizzes] = useState<Quiz[]>([])
  const [filteredPassageQuizzes, setFilteredPassageQuizzes] = useState<Quiz[]>([])

  // 학습 콘텐츠 로드
  useEffect(() => {
    async function loadContent() {
      if (!apiKey) {
        setContentError("API 키가 설정되지 않았습니다. 설정 페이지에서 API 키를 입력해주세요.")
        setIsLoadingContent(false)
        return
      }

      setIsLoadingContent(true)
      setContentError(null)

      try {
        const content = await generateLearningContent(topic, currentLevel, apiKey)
        setLearningContent(content)

        if (content.error) {
          setContentError(content.error)
        }
      } catch (error) {
        console.error("콘텐츠 로드 오류:", error)
        setContentError(error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.")
      } finally {
        setIsLoadingContent(false)
      }
    }

    loadContent()
  }, [topic, currentLevel, apiKey])

  // 콘텐츠 새로고침
  const handleRefreshContent = async () => {
    setIsLoadingContent(true)
    setContentError(null)

    try {
      const content = await generateLearningContent(topic, currentLevel, apiKey)
      setLearningContent(content)

      if (content.error) {
        setContentError(content.error)
      }
    } catch (error) {
      console.error("콘텐츠 새로고침 오류:", error)
      setContentError(error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.")
    } finally {
      setIsLoadingContent(false)
    }
  }

  // 단어 배열 생성
  const words = learningContent?.passage
    ? learningContent.passage
        .split(/\s+/)
        .map((word) => word.replace(/[.,!?;:()]/g, ""))
        .filter((word) => word.length > 0)
    : []

  // 단어 클릭 시 AI로부터 정의 가져오기
  const handleWordClick = async (word: string) => {
    // 이미 선택된 단어인 경우 선택 해제
    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter((w) => w !== word))
      return
    }

    // 단어 선택에 추가
    setSelectedWords([...selectedWords, word])

    // 이미 정의가 있는 경우 다시 가져오지 않음
    if (wordDefinitions[word] && !wordDefinitions[word].loading && !wordDefinitions[word].error) {
      return
    }

    // 로딩 상태 설정
    setWordDefinitions((prev) => ({
      ...prev,
      [word]: { word, meaning: "로딩 중...", example: "로딩 중...", loading: true },
    }))

    try {
      // 서버 액션을 통해 단어 정의 가져오기
      const definition = await getWordDefinition(word, apiKey)

      // 결과 저장
      setWordDefinitions((prev) => ({
        ...prev,
        [word]: { ...definition, loading: false },
      }))
    } catch (error) {
      console.error("Error fetching word definition:", error)
      setWordDefinitions((prev) => ({
        ...prev,
        [word]: {
          word,
          meaning: "의미를 가져오는 중 오류가 발생했습니다.",
          example: "예문을 가져올 수 없습니다.",
          loading: false,
          error: error instanceof Error ? error.message : "알 수 없는 오류",
          source: "local",
        },
      }))
    }
  }

  // 레벨 변경 처리 함수
  const handleLevelChange = (direction: "up" | "down") => {
    const currentLevelIndex = levels.indexOf(currentLevel)
    let newLevelIndex

    if (direction === "up" && currentLevelIndex < levels.length - 1) {
      newLevelIndex = currentLevelIndex + 1
    } else if (direction === "down" && currentLevelIndex > 0) {
      newLevelIndex = currentLevelIndex - 1
    } else {
      return // 더 이상 변경할 수 없는 경우
    }

    const nextLevel = levels[newLevelIndex]
    setNewLevel(nextLevel)
    setLevelChangeDirection(direction)
    setShowLevelChangeDialog(true)
  }

  // 레벨 변경 확인
  const confirmLevelChange = () => {
    setCurrentLevel(newLevel)
    setShowLevelChangeDialog(false)

    // 학습 상태 초기화
    setActiveTab("words")
    setLearningComplete({
      words: false,
      sentences: false,
      passage: false,
    })
    setSelectedWords([])
    setSelectedSentences([])
    setQuizMode(false)
    setQuizCompleted(false)
    setShowExplanation(false)
    setWordQuizAnswers([])
    setSentenceQuizAnswers([])
    setPassageQuizAnswers([])
    setQuizResults([])
    setShowResults(false)

    // 레벨 조정 관련 상태 초기화
    setLowPercentageCount(0)
    setUnknownWordPercentages([])

    // 단어 정의 초기화
    setWordDefinitions({})

    // 커스텀 퀴즈 초기화
    setCustomWordQuizzes([])
    setCustomSentenceQuizzes([])
  }

  const handleSentenceClick = async (index: number) => {
    if (selectedSentences.includes(index)) {
      setSelectedSentences(selectedSentences.filter((i) => i !== index))
      return
    }

    // 문장 선택에 추가
    setSelectedSentences([...selectedSentences, index])

    // 이미 분석이 있는 경우 다시 가져오지 않음
    if (sentenceAnalyses[index] && !sentenceAnalyses[index].loading && !sentenceAnalyses[index].error) {
      return
    }

    if (!learningContent) return

    // 로딩 상태 설정
    setSentenceAnalyses((prev) => ({
      ...prev,
      [index]: { structure: "로딩 중...", explanation: "로딩 중...", loading: true },
    }))

    try {
      // 서버 액션을 통해 문장 분석 가져오기
      const analysis = await analyzeSentence(learningContent.sentences[index], apiKey)

      // 결과 저장
      setSentenceAnalyses((prev) => ({
        ...prev,
        [index]: { ...analysis, loading: false },
      }))
    } catch (error) {
      console.error("Error analyzing sentence:", error)
      setSentenceAnalyses((prev) => ({
        ...prev,
        [index]: {
          structure: "문장 구조를 분석하는 중 오류가 발생했습니다.",
          explanation: "문장 해석을 제공할 수 없습니다.",
          loading: false,
          error: error instanceof Error ? error.message : "알 수 없는 오류",
        },
      }))
    }
  }

  // 선택된 단어를 기반으로 퀴즈 생성
  const generateCustomWordQuiz = async () => {
    if (selectedWords.length === 0) {
      setQuizError("퀴즈를 생성하려면 먼저 단어를 선택해주세요.")
      return
    }

    setIsGeneratingQuiz(true)
    setQuizError(null)

    try {
      // 단어 정의 객체 생성
      const definitions: Record<string, { meaning: string; example: string }> = {}
      selectedWords.forEach((word) => {
        if (wordDefinitions[word] && !wordDefinitions[word].loading && !wordDefinitions[word].error) {
          definitions[word] = {
            meaning: wordDefinitions[word].meaning,
            example: wordDefinitions[word].example,
          }
        }
      })

      // 서버 액션을 통해 단어 퀴즈 생성
      const quizSet = await generateWordQuizzes(selectedWords, definitions, apiKey)

      if (quizSet.error) {
        setQuizError(quizSet.error)
      } else if (quizSet.quizzes.length === 0) {
        setQuizError("퀴즈를 생성할 수 없습니다. 다른 단어를 선택해보세요.")
      } else {
        setCustomWordQuizzes(quizSet.quizzes)
        setQuizMode(true)
        setShowResults(false)
        setWordQuizAnswers([])
        setQuizResults([])
      }
    } catch (error) {
      console.error("단어 퀴즈 생성 오류:", error)
      setQuizError(error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.")
    } finally {
      setIsGeneratingQuiz(false)
    }
  }

  // 선택된 문장을 기반으로 퀴즈 생성
  const generateCustomSentenceQuiz = async () => {
    if (selectedSentences.length === 0 || !learningContent) {
      setQuizError("퀴즈를 생성하려면 먼저 문장을 선택해주세요.")
      return
    }

    setIsGeneratingQuiz(true)
    setQuizError(null)

    try {
      // 선택된 문장 배열 생성
      const sentences = selectedSentences.map((index) => learningContent.sentences[index])

      // 문장 분석 객체 생성
      const analyses: Record<number, { structure: string; explanation: string }> = {}
      selectedSentences.forEach((sentenceIndex, index) => {
        if (
          sentenceAnalyses[sentenceIndex] &&
          !sentenceAnalyses[sentenceIndex].loading &&
          !sentenceAnalyses[sentenceIndex].error
        ) {
          analyses[index] = {
            structure: sentenceAnalyses[sentenceIndex].structure,
            explanation: sentenceAnalyses[sentenceIndex].explanation,
          }
        }
      })

      // 서버 액션을 통해 문장 퀴즈 생성
      const quizSet = await generateSentenceQuizzes(sentences, analyses, apiKey)

      if (quizSet.error) {
        setQuizError(quizSet.error)
      } else if (quizSet.quizzes.length === 0) {
        setQuizError("퀴즈를 생성할 수 없습니다. 다른 문장을 선택해보세요.")
      } else {
        setCustomSentenceQuizzes(quizSet.quizzes)
        setQuizMode(true)
        setShowResults(false)
        setSentenceQuizAnswers([])
        setQuizResults([])
      }
    } catch (error) {
      console.error("문장 퀴즈 생성 오류:", error)
      setQuizError(error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.")
    } finally {
      setIsGeneratingQuiz(false)
    }
  }

  // handleCompleteSection 함수 수정
  const handleCompleteSection = () => {
    if (quizMode) {
      if (showResults) {
        // 모든 답변이 정답인지 확인
        const allCorrect = quizResults.every((result) => result === true)

        if (allCorrect) {
          // 모든 문제를 맞았으면 학습 완료 처리 및 다음 단계로 자동 이동
          setQuizCompleted(true)
          setLearningComplete({
            ...learningComplete,
            [activeTab]: true,
          })

          // 단어 학습 완료 시 모르는 단어 비율 계산 및 저장
          if (activeTab === "words") {
            const unknownWordPercentage = (selectedWords.length / words.length) * 100
            const newPercentages = [...unknownWordPercentages, unknownWordPercentage]
            setUnknownWordPercentages(newPercentages)

            // 3% 미만인 경우 카운트 증가
            if (unknownWordPercentage < 3) {
              const newCount = lowPercentageCount + 1
              setLowPercentageCount(newCount)

              // 3번 연속 3% 미만이면 레벨 상향 제안
              if (newCount >= 3) {
                handleLevelChange("up")
                setLowPercentageCount(0) // 카운트 초기화
              }
            } else {
              setLowPercentageCount(0) // 3% 이상이면 카운트 초기화

              // 5% 초과면 레벨 하향 제안
              if (unknownWordPercentage > 5) {
                handleLevelChange("down")
              }
            }
          }

          // 자동으로 다음 단계로 이동
          handleNextSection()
        } else {
          // 틀린 문제가 있으면 틀린 문제만 다시 풀게 함
          const incorrectIndices = quizResults
            .map((result, index) => (result === false ? index : -1))
            .filter((index) => index !== -1)

          if (activeTab === "words") {
            setIncorrectWordQuizIndices(incorrectIndices)
            const quizzes = customWordQuizzes.length > 0 ? customWordQuizzes : learningContent?.quizzes.words || []
            setFilteredWordQuizzes(incorrectIndices.map((index) => quizzes[index]))
          } else if (activeTab === "sentences") {
            setIncorrectSentenceQuizIndices(incorrectIndices)
            const quizzes =
              customSentenceQuizzes.length > 0 ? customSentenceQuizzes : learningContent?.quizzes.sentences || []
            setFilteredSentenceQuizzes(incorrectIndices.map((index) => quizzes[index]))
          } else if (activeTab === "passage" && learningContent) {
            setIncorrectPassageQuizIndices(incorrectIndices)
            setFilteredPassageQuizzes(incorrectIndices.map((index) => learningContent.quizzes.passage[index]))
          }

          setShowResults(false)
          setWordQuizAnswers([])
          setSentenceQuizAnswers([])
          setPassageQuizAnswers([])
        }
      } else {
        // 퀴즈 결과 확인
        let currentAnswers: number[] = []
        let correctAnswers: number[] = []
        let quizzes: Quiz[] = []

        if (!learningContent) return

        if (activeTab === "words") {
          currentAnswers = wordQuizAnswers
          if (filteredWordQuizzes.length > 0) {
            quizzes = filteredWordQuizzes
            correctAnswers = filteredWordQuizzes.map((q) => q.answer)
          } else {
            quizzes = customWordQuizzes.length > 0 ? customWordQuizzes : learningContent.quizzes.words
            correctAnswers = quizzes.map((q) => q.answer)
          }
        } else if (activeTab === "sentences") {
          currentAnswers = sentenceQuizAnswers
          if (filteredSentenceQuizzes.length > 0) {
            quizzes = filteredSentenceQuizzes
            correctAnswers = filteredSentenceQuizzes.map((q) => q.answer)
          } else {
            quizzes = customSentenceQuizzes.length > 0 ? customSentenceQuizzes : learningContent.quizzes.sentences
            correctAnswers = quizzes.map((q) => q.answer)
          }
        } else if (activeTab === "passage") {
          currentAnswers = passageQuizAnswers
          if (filteredPassageQuizzes.length > 0) {
            quizzes = filteredPassageQuizzes
            correctAnswers = filteredPassageQuizzes.map((q) => q.answer)
          } else {
            quizzes = learningContent.quizzes.passage
            correctAnswers = quizzes.map((q) => q.answer)
          }
        }

        // 각 문제별 정답 여부 확인
        const results = currentAnswers.map((answer, index) => answer === correctAnswers[index])

        setQuizResults(results)
        setShowResults(true)
      }
    } else {
      // 단어 학습에서는 선택된 단어로 퀴즈 생성
      if (activeTab === "words") {
        generateCustomWordQuiz()
      }
      // 문장 학습에서는 선택된 문장으로 퀴즈 생성
      else if (activeTab === "sentences") {
        generateCustomSentenceQuiz()
      }
      // 지문 학습에서는 기존 퀴즈 사용
      else {
        setQuizMode(true)
        setShowResults(false)
        setPassageQuizAnswers([])
      }
    }
  }

  // handleNextSection 함수 수정
  const handleNextSection = () => {
    setQuizCompleted(false)
    setQuizMode(false)
    setSelectedWords([])
    setSelectedSentences([])
    setShowExplanation(false)
    setCustomWordQuizzes([])
    setCustomSentenceQuizzes([])
    setFilteredWordQuizzes([])
    setFilteredSentenceQuizzes([])
    setFilteredPassageQuizzes([])
    setIncorrectWordQuizIndices([])
    setIncorrectSentenceQuizIndices([])
    setIncorrectPassageQuizIndices([])

    if (activeTab === "words") {
      setActiveTab("sentences")
    } else if (activeTab === "sentences") {
      setActiveTab("passage")
    } else if (activeTab === "passage" && learningComplete.passage) {
      // 모든 학습이 완료되면 다음 레벨로 이동
      router.push(`/level-complete?topic=${topic}&level=${currentLevel}`)
    }
  }

  const renderWordLearning = () => {
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
          {quizzes.map((quiz, index) => (
            <Card key={index} className="mb-4">
              <CardContent className="pt-6">
                <p className="font-medium mb-3">{quiz.question}</p>
                <div className="space-y-2">
                  {quiz.options.map((option, optIndex) => (
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

    return (
      <div className="space-y-6">
        <div>
          <h3 className="font-medium mb-2">안내:</h3>
          <p className="text-muted-foreground mb-4">
            아래 텍스트에서 모르는 단어를 클릭하세요. 선택한 단어의 의미와 예문을 확인할 수 있습니다.
          </p>
          <div className="p-4 bg-muted rounded-md">
            <p className="leading-relaxed whitespace-normal break-words">
              {words.map((word, index) => (
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

        {selectedWords.length > 0 && (
          <div className="space-y-4 mt-6">
            <h3 className="font-medium">선택한 단어:</h3>
            {selectedWords.map((word, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="w-full">
                      <h4 className="font-bold text-lg">{word}</h4>
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
                            <p className="mt-2 text-sm italic">"{wordDefinitions[word].example}"</p>
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

  const renderSentenceLearning = () => {
    if (!learningContent) return null

    // renderSentenceLearning 함수의 퀴즈 모드 부분 수정
    if (quizMode) {
      if (quizCompleted) {
        return (
          <div className="space-y-6 py-4">
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center rounded-full bg-green-100 p-4 mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold">문장 학습 완료!</h3>
              <p className="text-muted-foreground mt-2">문장 학습을 성공적으로 마쳤습니다.</p>
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
            {filteredSentenceQuizzes.length > 0 ? "틀린 문제 다시 풀기" : "문장 퀴즈"}
            {filteredSentenceQuizzes.length > 0 && (
              <span className="text-sm text-muted-foreground ml-2">
                (틀린 {filteredSentenceQuizzes.length}문제만 표시됩니다)
              </span>
            )}
          </h3>
          {quizzes.map((quiz, index) => (
            <Card key={index} className="mb-4">
              <CardContent className="pt-6">
                <p className="font-medium mb-3">{quiz.question}</p>
                <div className="space-y-2">
                  {quiz.options.map((option, optIndex) => (
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
            <Button
              onClick={handleCompleteSection}
              disabled={!showResults && sentenceQuizAnswers.length < quizzes.length}
            >
              {showResults ? (quizResults.every((r) => r) ? "완료" : "틀린 문제 다시 풀기") : "정답 확인"}
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div>
          <h3 className="font-medium mb-2">안내:</h3>
          <p className="text-muted-foreground mb-4">
            아래 문장 중 이해하기 어려운 문장을 클릭하세요. 선택한 문장의 구조와 해석을 확인할 수 있습니다.
          </p>
          <div className="space-y-2">
            {learningContent.sentences.map((sentence, index) => (
              <div
                key={index}
                className={`p-3 rounded-md cursor-pointer ${
                  selectedSentences.includes(index) ? "bg-primary/10 border-l-4 border-primary" : "hover:bg-muted"
                }`}
                onClick={() => handleSentenceClick(index)}
              >
                <p>{sentence}</p>
              </div>
            ))}
          </div>
        </div>

        {selectedSentences.length > 0 && (
          <div className="space-y-4 mt-6">
            <h3 className="font-medium">선택한 문장:</h3>
            {selectedSentences.map((sentenceIndex) => (
              <Card key={sentenceIndex}>
                <CardContent className="p-4">
                  <div>
                    <h4 className="font-bold">{learningContent.sentences[sentenceIndex]}</h4>
                    {sentenceAnalyses[sentenceIndex] ? (
                      sentenceAnalyses[sentenceIndex].loading ? (
                        <div className="flex items-center space-x-2 mt-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <p className="text-muted-foreground">문장을 분석하는 중...</p>
                        </div>
                      ) : sentenceAnalyses[sentenceIndex].error ? (
                        <div>
                          <p className="text-red-500 mt-1">
                            {sentenceAnalyses[sentenceIndex].error}: 문장 분석을 가져오지 못했습니다.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => handleSentenceClick(sentenceIndex)}
                          >
                            다시 시도
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="mt-3 space-y-2">
                            <p className="text-sm font-medium">문장 구조:</p>
                            <p className="text-sm text-muted-foreground">{sentenceAnalyses[sentenceIndex].structure}</p>
                          </div>
                          <div className="mt-3 space-y-2">
                            <p className="text-sm font-medium">해석:</p>
                            <p className="text-sm text-muted-foreground">
                              {sentenceAnalyses[sentenceIndex].explanation}
                            </p>
                          </div>
                        </>
                      )
                    ) : (
                      <div className="flex items-center space-x-2 mt-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <p className="text-muted-foreground">문장을 분석하는 중...</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="pt-4 flex justify-end">
          <Button onClick={handleCompleteSection} disabled={selectedSentences.length === 0 || isGeneratingQuiz}>
            {isGeneratingQuiz ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                퀴즈 생성 중...
              </>
            ) : (
              "선택한 문장으로 퀴즈 생성"
            )}
          </Button>
        </div>

        {quizError && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">{quizError}</div>
        )}
      </div>
    )
  }

  const renderPassageLearning = () => {
    if (!learningContent) return null

    // renderPassageLearning 함수의 퀴즈 모드 부분 수정
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
          {quizzes.map((quiz, index) => (
            <Card key={index} className="mb-4">
              <CardContent className="pt-6">
                <p className="font-medium mb-3">{quiz.question}</p>
                <div className="space-y-2">
                  {quiz.options.map((option, optIndex) => (
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
            <Button
              onClick={handleCompleteSection}
              disabled={!showResults && passageQuizAnswers.length < quizzes.length}
            >
              {showResults ? (quizResults.every((r) => r) ? "완료" : "틀린 문제 다시 풀기") : "정답 확인"}
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div>
          <h3 className="font-medium mb-2">지문:</h3>
          <div className="p-4 bg-muted rounded-md">
            <p className="leading-relaxed whitespace-normal break-words">{learningContent.passage}</p>
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
                  <h4 className="font-medium">구성:</h4>
                  <p className="text-muted-foreground">{learningContent.passageExplanation.structure}</p>
                </div>
                <div>
                  <h4 className="font-medium">요약:</h4>
                  <p className="text-muted-foreground">{learningContent.passageExplanation.summary}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // 로딩 중 UI
  if (isLoadingContent) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Card className="border shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48 mt-2" />
              </div>
              <div className="flex space-x-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-medium">학습 콘텐츠를 생성하는 중...</h3>
                  <p className="text-muted-foreground mt-2">
                    AI가 "{topic}" 주제의 {currentLevel} 레벨 학습 콘텐츠를 생성하고 있습니다.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 오류 UI
  if (contentError && !learningContent) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Card className="border shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">
                  {topic} ({currentLevel} 레벨)
                </CardTitle>
                <CardDescription className="mt-2">학습 콘텐츠 생성 오류</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center rounded-full bg-red-100 p-6 mb-4">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-medium">콘텐츠 생성 중 오류가 발생했습니다</h3>
                  <p className="text-muted-foreground mt-2">{contentError}</p>
                  <div className="mt-6 flex justify-center gap-4">
                    <Button onClick={handleRefreshContent}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      다시 시도
                    </Button>
                    <Link href="/settings">
                      <Button variant="outline">
                        <Settings className="h-4 w-4 mr-2" />
                        API 키 설정
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <Card className="border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{learningContent?.title || `${topic} (${currentLevel} 레벨)`}</CardTitle>
              <CardDescription className="mt-2">
                주제: {topic} | 레벨: {currentLevel}
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Badge variant={learningComplete.words ? "default" : "outline"} className="gap-1">
                <BookOpen className="h-3 w-3" />
                단어
              </Badge>
              <Badge variant={learningComplete.sentences ? "default" : "outline"} className="gap-1">
                <AlignLeft className="h-3 w-3" />
                문장
              </Badge>
              <Badge variant={learningComplete.passage ? "default" : "outline"} className="gap-1">
                <MessageSquare className="h-3 w-3" />
                지문
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {unknownWordPercentages.length > 0 && (
            <div className="mb-4 p-3 bg-muted rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <h4 className="font-medium text-sm">학습 진행 상황</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                최근 단어 학습에서 모르는 단어 비율:{" "}
                {unknownWordPercentages[unknownWordPercentages.length - 1].toFixed(1)}%
              </p>
              {lowPercentageCount > 0 && (
                <p className="text-sm text-green-600 mt-1">
                  연속 {lowPercentageCount}회 모르는 단어가 3% 미만입니다. {3 - lowPercentageCount}회 더 유지되면 레벨이
                  상향됩니다.
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end mb-4">
            <Button variant="outline" size="sm" onClick={handleRefreshContent} disabled={isLoadingContent}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingContent ? "animate-spin" : ""}`} />
              콘텐츠 새로 생성
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="words" disabled={activeTab !== "words" && !learningComplete.words}>
                단어 학습
              </TabsTrigger>
              <TabsTrigger
                value="sentences"
                disabled={!learningComplete.words || (activeTab !== "sentences" && !learningComplete.sentences)}
              >
                문장 학습
              </TabsTrigger>
              <TabsTrigger
                value="passage"
                disabled={!learningComplete.sentences || (activeTab !== "passage" && !learningComplete.passage)}
              >
                지문 학습
              </TabsTrigger>
            </TabsList>
            <div className="mt-6">
              <TabsContent value="words">{renderWordLearning()}</TabsContent>
              <TabsContent value="sentences">{renderSentenceLearning()}</TabsContent>
              <TabsContent value="passage">{renderPassageLearning()}</TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={showLevelChangeDialog} onOpenChange={setShowLevelChangeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{levelChangeDirection === "up" ? "레벨 상향 추천" : "레벨 하향 추천"}</DialogTitle>
            <DialogDescription>
              {levelChangeDirection === "up"
                ? "모르는 단어의 비율이 3번 연속 3% 미만으로 나타났습니다. 더 높은 레벨로 이동하시겠습니까?"
                : "모르는 단어의 비율이 5%를 초과했습니다. 더 낮은 레벨로 이동하시겠습니까?"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-4">
            <div className={`p-4 rounded-full ${levelChangeDirection === "up" ? "bg-green-100" : "bg-amber-100"}`}>
              {levelChangeDirection === "up" ? (
                <ArrowUp className="h-8 w-8 text-green-600" />
              ) : (
                <ArrowDown className="h-8 w-8 text-amber-600" />
              )}
            </div>
          </div>
          <div className="flex justify-center items-center gap-4 py-2">
            <Badge variant="outline" className="text-lg px-3 py-1">
              {currentLevel}
            </Badge>
            <ArrowRight className="h-5 w-5" />
            <Badge variant="outline" className="text-lg px-3 py-1 font-bold">
              {newLevel}
            </Badge>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLevelChangeDialog(false)}>
              취소
            </Button>
            <Button onClick={confirmLevelChange}>
              {levelChangeDirection === "up" ? `${newLevel} 레벨로 상향` : `${newLevel} 레벨로 하향`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
