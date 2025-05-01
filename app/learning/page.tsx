"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  AlignLeft,
  MessageSquare,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Loader2,
  Settings,
  RefreshCw,
  BookOpenIcon,
  X,
  CheckCircle,
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

// Import our new components
import WordLearning from "@/components/learning/word-learning"
import SentenceLearning from "@/components/learning/sentence-learning"
import PassageLearning from "@/components/learning/passage-learning"

export default function LearningPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const topic = searchParams.get("topic") || "일반"
  const initialLevel = searchParams.get("level") || "B1"
  const { toast } = useToast()

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
  const [showApiKeyInput, setShowApiKeyInput] = useState(false)
  const [tempApiKey, setTempApiKey] = useState("")
  const [isSavingApiKey, setIsSavingApiKey] = useState(false)

  // 커스텀 퀴즈 관련 상태
  const [customWordQuizzes, setCustomWordQuizzes] = useState<Quiz[]>([])
  const [customSentenceQuizzes, setCustomSentenceQuizzes] = useState<Quiz[]>([])
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false)
  const [quizError, setQuizError] = useState<string | null>(null)

  // AI 생성 콘텐츠 관련 상태
  const [learningContent, setLearningContent] = useState<GeneratedContent | null>(null)
  const [isLoadingContent, setIsLoadingContent] = useState(true)
  const [contentError, setContentError] = useState<string | null>(null)

  // 계속 학습 관련 상태
  const [showContinueLearningDialog, setShowContinueLearningDialog] = useState(false)
  const [continueLearningCount, setContinueLearningCount] = useState(0)

  // API 키 로드
  useEffect(() => {
    if (typeof window !== "undefined") {
      // 로컬 스토리지 또는 세션 스토리지에서 API 키 불러오기
      const savedApiKey = localStorage.getItem("google_api_key") || sessionStorage.getItem("google_api_key") || ""
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

  // API 키 저장 함수
  const saveApiKey = () => {
    if (!tempApiKey.trim()) {
      toast({
        title: "API 키를 입력해주세요",
        variant: "destructive",
      })
      return
    }

    setIsSavingApiKey(true)

    try {
      // 로컬 스토리지에 API 키 저장
      localStorage.setItem("google_api_key", tempApiKey.trim())
      setApiKey(tempApiKey.trim())
      setShowApiKeyInput(false)

      toast({
        title: "API 키가 저장되었습니다",
        description: "이제 학습을 시작할 수 있습니다.",
      })

      // 콘텐츠 로드
      loadContent(tempApiKey.trim())
    } catch (error) {
      toast({
        title: "API 키 저장 중 오류가 발생했습니다",
        variant: "destructive",
      })
    } finally {
      setIsSavingApiKey(false)
    }
  }

  // 학습 콘텐츠 로드 함수
  const loadContent = async (key: string = apiKey) => {
    if (!key) {
      setContentError("API 키가 설정되지 않았습니다. API 키를 입력해주세요.")
      setIsLoadingContent(false)
      setShowApiKeyInput(true)
      return
    }

    setIsLoadingContent(true)
    setContentError(null)

    try {
      const content = await generateLearningContent(topic, currentLevel, key)
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

  // 학습 콘텐츠 로드
  useEffect(() => {
    loadContent()
  }, [topic, currentLevel]) // apiKey 의존성 제거

  // 콘텐츠 새로고침
  const handleRefreshContent = async () => {
    if (!apiKey) {
      setShowApiKeyInput(true)
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
      console.error("콘텐츠 새로고침 오류:", error)
      setContentError(error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.")
    } finally {
      setIsLoadingContent(false)
    }
  }

  // 계속 학습하기 - 새로운 지문 생성 및 학습 상태 초기화
  const handleContinueLearning = async () => {
    setShowContinueLearningDialog(false)

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
    setCustomWordQuizzes([])
    setCustomSentenceQuizzes([])
    setFilteredWordQuizzes([])
    setFilteredSentenceQuizzes([])
    setFilteredPassageQuizzes([])
    setIncorrectWordQuizIndices([])
    setIncorrectSentenceQuizIndices([])
    setIncorrectPassageQuizIndices([])

    // 단어 정의 초기화
    setWordDefinitions({})

    // 문장 분석 초기화
    setSentenceAnalyses({})

    // 학습 횟수 증가
    setContinueLearningCount((prev) => prev + 1)

    // 새로운 콘텐츠 로드
    setIsLoadingContent(true)
    setContentError(null)

    try {
      // 강제로 새로운 콘텐츠 생성 (캐시 무시)
      const timestamp = new Date().getTime()
      // 타임스탬프와 학습 횟수를 모두 포함하여 확실히 새로운 콘텐츠가 생성되도록 함
      const content = await generateLearningContent(
        `${topic}?t=${timestamp}&count=${continueLearningCount}`,
        currentLevel,
        apiKey,
      )
      setLearningContent(content)

      if (content.error) {
        setContentError(content.error)
      }

      // 성공 메시지 표시
      toast({
        title: "새로운 학습 콘텐츠가 생성되었습니다",
        description: "새로운 지문으로 학습을 계속합니다.",
      })
    } catch (error) {
      console.error("콘텐츠 로드 오류:", error)
      setContentError(error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.")

      // 오류 메시지 표시
      toast({
        title: "콘텐츠 생성 오류",
        description: "새로운 학습 콘텐츠를 생성하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingContent(false)
    }
  }

  // 학습 종료하기
  const handleFinishLearning = () => {
    setShowContinueLearningDialog(false)
    router.push(`/level-complete?topic=${topic}&level=${currentLevel}`)
  }

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
          // 모든 문제를 맞았으면 학습 완료 처리
          setQuizCompleted(true)
          setLearningComplete({
            ...learningComplete,
            [activeTab]: true,
          })

          // 단어 학습 완료 시 모르는 단어 비율 계산 및 저장
          if (activeTab === "words" && learningContent) {
            // 단어 배열 생성
            const words = learningContent.passage
              ? learningContent.passage
                  .split(/\s+/)
                  .map((word) => word.replace(/[.,!?;:()]/g, ""))
                  .filter((word) => word.length > 0)
              : []

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

          // 지문 학습 퀴즈를 완료한 경우 바로 학습 완료 다이얼로그 표시
          if (activeTab === "passage") {
            setShowContinueLearningDialog(true)
          } else {
            // 다른 탭은 자동으로 다음 단계로 이동
            handleNextSection()
          }
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

  // handleNextSection 함수 수정 - 지문 학습 완료 시 계속 학습 다이얼로그 표시
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
    }
    // 지문 학습 완료 시 다이얼로그 표시
  }

  // API 키 입력 UI
  if (showApiKeyInput) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl">API 키 설정</CardTitle>
            <CardDescription>학습을 시작하려면 Google Gemini API 키를 입력해주세요.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="api-key">Google Gemini API 키</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="AIza..."
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">API 키는 로컬에만 저장되며 서버로 전송되지 않습니다.</p>
            </div>
            <div className="flex justify-end space-x-2">
              <Link href="/settings">
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  설정으로 이동
                </Button>
              </Link>
              <Button onClick={saveApiKey} disabled={isSavingApiKey}>
                {isSavingApiKey ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  "API 키 저장 및 계속"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
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
                    <Button variant="outline" onClick={() => setShowApiKeyInput(true)}>
                      <Settings className="h-4 w-4 mr-2" />
                      API 키 설정
                    </Button>
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
                {continueLearningCount > 0 && ` | 학습 횟수: ${continueLearningCount + 1}`}
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
              <TabsContent value="words">
                <WordLearning
                  learningContent={learningContent}
                  selectedWords={selectedWords}
                  setSelectedWords={setSelectedWords}
                  wordDefinitions={wordDefinitions}
                  handleWordClick={handleWordClick}
                  quizMode={quizMode}
                  quizCompleted={quizCompleted}
                  showResults={showResults}
                  wordQuizAnswers={wordQuizAnswers}
                  setWordQuizAnswers={setWordQuizAnswers}
                  quizResults={quizResults}
                  handleCompleteSection={handleCompleteSection}
                  apiKey={apiKey}
                  isGeneratingQuiz={isGeneratingQuiz}
                  quizError={quizError}
                  customWordQuizzes={customWordQuizzes}
                  filteredWordQuizzes={filteredWordQuizzes}
                />
              </TabsContent>
              <TabsContent value="sentences">
                <SentenceLearning
                  learningContent={learningContent}
                  selectedSentences={selectedSentences}
                  handleSentenceClick={handleSentenceClick}
                  sentenceAnalyses={sentenceAnalyses}
                  quizMode={quizMode}
                  quizCompleted={quizCompleted}
                  showResults={showResults}
                  sentenceQuizAnswers={sentenceQuizAnswers}
                  setSentenceQuizAnswers={setSentenceQuizAnswers}
                  quizResults={quizResults}
                  handleCompleteSection={handleCompleteSection}
                  isGeneratingQuiz={isGeneratingQuiz}
                  quizError={quizError}
                  customSentenceQuizzes={customSentenceQuizzes}
                  filteredSentenceQuizzes={filteredSentenceQuizzes}
                />
              </TabsContent>
              <TabsContent value="passage">
                <PassageLearning
                  learningContent={learningContent}
                  showExplanation={showExplanation}
                  setShowExplanation={setShowExplanation}
                  quizMode={quizMode}
                  quizCompleted={quizCompleted}
                  showResults={showResults}
                  passageQuizAnswers={passageQuizAnswers}
                  setPassageQuizAnswers={setPassageQuizAnswers}
                  quizResults={quizResults}
                  handleCompleteSection={handleCompleteSection}
                  filteredPassageQuizzes={filteredPassageQuizzes}
                />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* 레벨 변경 다이얼로그 */}
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

      {/* 계속 학습 다이얼로그 */}
      <Dialog open={showContinueLearningDialog} onOpenChange={setShowContinueLearningDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>학습 완료</DialogTitle>
            <DialogDescription>지문 학습을 성공적으로 완료했습니다. 계속해서 학습하시겠습니까?</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-4">
            <div className="inline-flex items-center justify-center rounded-full bg-green-100 p-6 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="flex flex-col space-y-2 text-center">
            <h3 className="text-lg font-medium">학습 정보</h3>
            <p className="text-muted-foreground">
              주제: <span className="font-medium text-foreground">{topic}</span> | 레벨:{" "}
              <span className="font-medium text-foreground">{currentLevel}</span>
            </p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" className="flex-1" onClick={handleFinishLearning}>
              <X className="h-4 w-4 mr-2" />
              학습 종료하기
            </Button>
            <Button className="flex-1" onClick={handleContinueLearning}>
              <BookOpenIcon className="h-4 w-4 mr-2" />
              계속 학습하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
