"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, Settings } from "lucide-react"
import { getWordDefinition, type WordDefinition } from "../actions/dictionary"
import { generateLearningContent, type GeneratedContent } from "../actions/content-generator"
import { analyzeSentence, type SentenceAnalysis } from "../actions/sentence-analyzer"
import { generateWordQuizzes, generateSentenceQuizzes, type Quiz } from "../actions/quiz-generator"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from "react-i18next"

export default function LearningPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const topic = searchParams.get("topic") || "일반"
  const initialLevel = searchParams.get("level") || "B1"
  const { toast } = useToast()
  const { t } = useTranslation()

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
        title: t("error"),
        description: t("api_key_description"),
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
        title: t("settings_saved"),
        description: t("api_key_saved"),
      })

      // 콘텐츠 로드
      loadContent(tempApiKey.trim())
    } catch (error) {
      toast({
        title: t("error_occurred"),
        description: t("save_error"),
        variant: "destructive",
      })
    } finally {
      setIsSavingApiKey(false)
    }
  }

  // 학습 콘텐츠 로드 함수
  const loadContent = async (key: string = apiKey) => {
    if (!key) {
      setContentError(t("api_key_description"))
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
      setContentError(error instanceof Error ? error.message : t("error"))
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
      setContentError(error instanceof Error ? error.message : t("error"))
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
        title: t("success"),
        description: t("continue_learning"),
      })
    } catch (error) {
      console.error("콘텐츠 로드 오류:", error)
      setContentError(error instanceof Error ? error.message : t("error"))

      // 오류 메시지 표시
      toast({
        title: t("error"),
        description: t("error"),
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
      [word]: { word, meaning: t("loading_meaning"), example: t("loading"), loading: true },
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
          meaning: t("meaning_error"),
          example: t("meaning_error"),
          loading: false,
          error: error instanceof Error ? error.message : t("error"),
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
      [index]: { structure: t("loading"), explanation: t("loading"), loading: true },
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
          structure: t("sentence_analysis_error"),
          explanation: t("sentence_analysis_error"),
          loading: false,
          error: error instanceof Error ? error.message : t("error"),
        },
      }))
    }
  }

  // 선택된 단어를 기반으로 퀴즈 생성
  const generateCustomWordQuiz = async () => {
    if (selectedWords.length === 0) {
      setQuizError(t("word_guide"))
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
        setQuizError(t("error"))
      } else {
        setCustomWordQuizzes(quizSet.quizzes)
        setQuizMode(true)
        setShowResults(false)
        setWordQuizAnswers([])
        setQuizResults([])
      }
    } catch (error) {
      console.error("단어 퀴즈 생성 오류:", error)
      setQuizError(error instanceof Error ? error.message : t("error"))
    } finally {
      setIsGeneratingQuiz(false)
    }
  }

  // 선택된 문장을 기반으로 퀴즈 생성
  const generateCustomSentenceQuiz = async () => {
    if (selectedSentences.length === 0 || !learningContent) {
      setQuizError(t("sentence_guide"))
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
        setQuizError(t("error"))
      } else {
        setCustomSentenceQuizzes(quizSet.quizzes)
        setQuizMode(true)
        setShowResults(false)
        setSentenceQuizAnswers([])
        setQuizResults([])
      }
    } catch (error) {
      console.error("문장 퀴즈 생성 오류:", error)
      setQuizError(error instanceof Error ? error.message : t("error"))
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
      <div className="container max-wxl mx-auto px-4 py-8">
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl">{t("api_key_settings")}</CardTitle>
            <CardDescription>{t("api_key_description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="api-key">{t("google_api_key")}</Label>
              <Input
                id="api-key"
                type="password"
                placeholder={t("api_key_placeholder")}
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">{t("api_key_note")}</p>
            </div>
            <div className="flex justify-end space-x-2">
              <Link href="/settings">
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  {t("settings")}
                </Button>
              </Link>
              <Button onClick={saveApiKey} disabled={isSavingApiKey}>
                {isSavingApiKey ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("saving")}
                  </>
                ) : (
                  t("save")
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 로딩 중
}
