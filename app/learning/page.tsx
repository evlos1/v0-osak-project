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
import Link from "next/link"

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

  // 샘플 학습 콘텐츠 (실제로는 선택된 주제와 레벨에 맞는 콘텐츠를 가져와야 함)
  const learningContents = {
    A1: {
      title: "인공지능 소개 (A1 레벨)",
      passage: `AI is new. It is a smart computer. AI can help us. It can read and write. It can see pictures. AI is in phones. AI is in cars. AI is in homes. Some AI can talk to you. Some AI can play games. AI gets better every day. People make AI. AI needs data to learn. Some people like AI. Some people do not like AI. What do you think about AI?`,
      sentences: [
        "AI is new.",
        "It is a smart computer.",
        "AI can help us.",
        "It can read and write.",
        "It can see pictures.",
        "AI is in phones.",
        "AI is in cars.",
        "AI is in homes.",
        "Some AI can talk to you.",
        "Some AI can play games.",
      ],
    },
    A2: {
      title: "인공지능의 기초 (A2 레벨)",
      passage: `AI is a new technology. It helps people do many things. Computers can learn from data. They can find patterns and make choices. Many apps use AI today. Your phone has AI in it. AI can understand your voice. It can show you things you might like. Some jobs might change because of AI. But new jobs will also come. AI is getting better every year. Some people worry about AI. Others think it is very useful. What do you think about AI?`,
      sentences: [
        "AI is a new technology.",
        "It helps people do many things.",
        "Computers can learn from data.",
        "They can find patterns and make choices.",
        "Many apps use AI today.",
        "Your phone has AI in it.",
        "AI can understand your voice.",
        "It can show you things you might like.",
        "Some jobs might change because of AI.",
        "But new jobs will also come.",
      ],
    },
    B1: {
      title: "인공지능의 기초 (B1 레벨)",
      passage: `Artificial Intelligence is changing the way we live and work. Machine learning algorithms can analyze large amounts of data and make predictions. These systems are becoming more common in our daily lives. From voice assistants to recommendation systems, AI is everywhere. Companies are investing heavily in this technology. Researchers are working to make AI more efficient and accurate. Some people worry about the impact of AI on jobs. Others see it as an opportunity for new types of work. The future of AI depends on how we choose to use this powerful technology.`,
      sentences: [
        "Artificial Intelligence is changing the way we live and work.",
        "Machine learning algorithms can analyze large amounts of data and make predictions.",
        "These systems are becoming more common in our daily lives.",
        "From voice assistants to recommendation systems, AI is everywhere.",
        "Companies are investing heavily in this technology.",
        "Researchers are working to make AI more efficient and accurate.",
        "Some people worry about the impact of AI on jobs.",
        "Others see it as an opportunity for new types of work.",
        "The future of AI depends on how we choose to use this powerful technology.",
      ],
    },
    B2: {
      title: "인공지능의 발전 (B2 레벨)",
      passage: `The rapid advancement of artificial intelligence has profound implications for society. Machine learning algorithms, which form the backbone of modern AI systems, can process vast datasets to identify patterns imperceptible to humans. These sophisticated systems are increasingly being integrated into critical infrastructure, healthcare diagnostics, and financial services. The proliferation of AI technologies raises important questions about privacy, accountability, and the future of work. While some experts express concern about potential job displacement, others argue that AI will create new economic opportunities and enhance human capabilities. The ethical dimensions of AI development, including issues of bias in training data and decision-making transparency, remain significant challenges for researchers and policymakers alike.`,
      sentences: [
        "The rapid advancement of artificial intelligence has profound implications for society.",
        "Machine learning algorithms, which form the backbone of modern AI systems, can process vast datasets to identify patterns imperceptible to humans.",
        "These sophisticated systems are increasingly being integrated into critical infrastructure, healthcare diagnostics, and financial services.",
        "The proliferation of AI technologies raises important questions about privacy, accountability, and the future of work.",
        "While some experts express concern about potential job displacement, others argue that AI will create new economic opportunities and enhance human capabilities.",
        "The ethical dimensions of AI development, including issues of bias in training data and decision-making transparency, remain significant challenges for researchers and policymakers alike.",
      ],
    },
    C1: {
      title: "인공지능의 영향 (C1 레벨)",
      passage: `The inexorable progression of artificial intelligence technologies presents a multifaceted paradigm shift that transcends mere technological innovation, permeating socioeconomic structures and challenging established ethical frameworks. Contemporary machine learning architectures, particularly deep neural networks, demonstrate unprecedented capabilities in pattern recognition and predictive analytics, enabling applications that were hitherto confined to the realm of science fiction. The integration of these systems into critical domains such as healthcare diagnostics, financial risk assessment, and judicial decision-making processes necessitates rigorous scrutiny regarding algorithmic transparency, accountability mechanisms, and potential perpetuation of societal biases. Furthermore, the accelerating automation of cognitive tasks traditionally performed by human workers portends significant labor market disruptions, potentially exacerbating economic inequality while simultaneously creating novel professional opportunities in emerging technological sectors.`,
      sentences: [
        "The inexorable progression of artificial intelligence technologies presents a multifaceted paradigm shift that transcends mere technological innovation, permeating socioeconomic structures and challenging established ethical frameworks.",
        "Contemporary machine learning architectures, particularly deep neural networks, demonstrate unprecedented capabilities in pattern recognition and predictive analytics, enabling applications that were hitherto confined to the realm of science fiction.",
        "The integration of these systems into critical domains such as healthcare diagnostics, financial risk assessment, and judicial decision-making processes necessitates rigorous scrutiny regarding algorithmic transparency, accountability mechanisms, and potential perpetuation of societal biases.",
        "Furthermore, the accelerating automation of cognitive tasks traditionally performed by human workers portends significant labor market disruptions, potentially exacerbating economic inequality while simultaneously creating novel professional opportunities in emerging technological sectors.",
      ],
    },
    C2: {
      title: "인공지능의 미래 (C2 레벨)",
      passage: `The inexorable ascendancy of artificial superintelligence portends a watershed moment in human civilization, one that transcends conventional paradigms of technological advancement and necessitates a profound recalibration of our epistemological, ethical, and existential frameworks. The recursive self-improvement capabilities inherent in advanced machine learning architectures engender the possibility of an intelligence explosion—a hypothetical scenario wherein artificial general intelligence surpasses human cognitive capacities across all domains and subsequently accelerates its own development at an exponential rate. This prospective technological singularity presents both unprecedented opportunities for addressing intractable global challenges and existential risks that demand preemptive governance structures. The philosophical implications are equally profound, challenging fundamental assumptions about consciousness, autonomy, and the ontological status of synthetic intelligences. As we navigate this uncharted intellectual terrain, interdisciplinary collaboration becomes imperative, synthesizing insights from computer science, neuroscience, philosophy of mind, and complex systems theory to formulate robust ethical frameworks and technical safeguards that ensure artificial superintelligence remains aligned with human values and beneficial to our collective flourishing.`,
      sentences: [
        "The inexorable ascendancy of artificial superintelligence portends a watershed moment in human civilization, one that transcends conventional paradigms of technological advancement and necessitates a profound recalibration of our epistemological, ethical, and existential frameworks.",
        "The recursive self-improvement capabilities inherent in advanced machine learning architectures engender the possibility of an intelligence explosion—a hypothetical scenario wherein artificial general intelligence surpasses human cognitive capacities across all domains and subsequently accelerates its own development at an exponential rate.",
        "This prospective technological singularity presents both unprecedented opportunities for addressing intractable global challenges and existential risks that demand preemptive governance structures.",
        "The philosophical implications are equally profound, challenging fundamental assumptions about consciousness, autonomy, and the ontological status of synthetic intelligences.",
      ],
    },
  }

  // 현재 레벨에 맞는 학습 콘텐츠 선택
  const learningContent = {
    title: learningContents[currentLevel]?.title || "인공지능의 기초",
    passage: learningContents[currentLevel]?.passage || learningContents.B1.passage,
    sentences: learningContents[currentLevel]?.sentences || learningContents.B1.sentences,
    sentenceExplanations: {
      0: {
        structure: "주어(Artificial Intelligence) + 동사(is changing) + 목적어(the way) + 부사절(we live and work)",
        explanation:
          "인공지능이 우리가 생활하고 일하는 방식을 변화시키고 있다는 의미입니다. 현재진행형을 사용하여 현재 진행 중인 변화를 나타냅니다.",
      },
      1: {
        structure:
          "주어(Machine learning algorithms) + 조동사+동사(can analyze) + 목적어(large amounts of data) + 접속사(and) + 동사(make) + 목적어(predictions)",
        explanation:
          "기계학습 알고리즘이 대량의 데이터를 분석하고 예측을 할 수 있다는 의미입니다. 'can'은 능력을 나타내는 조동사입니다.",
      },
      6: {
        structure: "주어(Some people) + 동사(worry about) + 목적어(the impact of AI on jobs)",
        explanation:
          "일부 사람들이 인공지능이 일자리에 미치는 영향에 대해 걱정한다는 의미입니다. 'worry about'는 '~에 대해 걱정하다'라는 의미의 구문입니다.",
      },
    },
    passageExplanation: {
      theme: "인공지능의 현재와 미래",
      structure:
        "도입부에서 AI의 중요성을 소개하고, 중간 부분에서 현재 AI의 활용과 연구 상황을 설명하며, 마지막 부분에서 AI가 가져올 수 있는 영향과 미래에 대해 논의합니다.",
      summary:
        "이 지문은 인공지능 기술이 우리 생활과 일에 미치는 영향, 현재의 활용 상황, 그리고 미래에 대한 다양한 관점을 간략하게 소개하고 있습니다.",
    },
    quizzes: {
      words: [
        {
          question: "'Artificial'의 의미는 무엇인가요?",
          options: ["자연적인", "인공적인", "지능적인", "기계적인"],
          answer: 1,
        },
        {
          question: "'Predictions'와 가장 관련 있는 단어는?",
          options: ["과거", "현재", "미래", "분석"],
          answer: 2,
        },
      ],
      sentences: [
        {
          question: "'Machine learning algorithms can analyze large amounts of data and make predictions.'에서 주어는?",
          options: ["Machine", "Machine learning", "Machine learning algorithms", "Algorithms"],
          answer: 2,
        },
        {
          question: "'Some people worry about the impact of AI on jobs.'에서 'worry about'의 의미는?",
          options: ["~에 대해 생각하다", "~에 대해 걱정하다", "~에 영향을 주다", "~에 관심을 갖다"],
          answer: 1,
        },
      ],
      passage: [
        {
          question: "이 지문의 주요 주제는 무엇인가요?",
          options: [
            "인공지능의 역사",
            "인공지능의 현재와 미래 영향",
            "기계학습 알고리즘의 작동 방식",
            "음성 비서 시스템",
          ],
          answer: 1,
        },
        {
          question: "지문에 따르면, 인공지능에 대한 사람들의 태도는 어떠한가요?",
          options: ["모두 긍정적이다", "모두 부정적이다", "일부는 걱정하고 일부는 기회로 본다", "언급되지 않았다"],
          answer: 2,
        },
      ],
    },
  }

  const words = learningContent.passage
    .split(/\s+/)
    .map((word) => word.replace(/[.,!?;:()]/g, ""))
    .filter((word) => word.length > 0)

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
  }

  const handleSentenceClick = (index: number) => {
    if (selectedSentences.includes(index)) {
      setSelectedSentences(selectedSentences.filter((i) => i !== index))
    } else {
      setSelectedSentences([...selectedSentences, index])
    }
  }

  const handleCompleteSection = () => {
    if (quizMode) {
      if (showResults) {
        // 모든 답변이 정답인지 확인
        const allCorrect = quizResults.every((result) => result === true)

        if (allCorrect) {
          setQuizCompleted(true)
          setLearningComplete({
            ...learningComplete,
            [activeTab]: true,
          })
          setQuizMode(false)

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
        } else {
          // 틀린 문제가 있으면 다시 풀게 함
          setShowResults(false)
          if (activeTab === "words") {
            setWordQuizAnswers([])
          } else if (activeTab === "sentences") {
            setSentenceQuizAnswers([])
          } else if (activeTab === "passage") {
            setPassageQuizAnswers([])
          }
        }
      } else {
        // 퀴즈 결과 확인
        let currentAnswers: number[] = []
        let correctAnswers: number[] = []

        if (activeTab === "words") {
          currentAnswers = wordQuizAnswers
          correctAnswers = learningContent.quizzes.words.map((q) => q.answer)
        } else if (activeTab === "sentences") {
          currentAnswers = sentenceQuizAnswers
          correctAnswers = learningContent.quizzes.sentences.map((q) => q.answer)
        } else if (activeTab === "passage") {
          currentAnswers = passageQuizAnswers
          correctAnswers = learningContent.quizzes.passage.map((q) => q.answer)
        }

        // 각 문제별 정답 여부 확인
        const results = currentAnswers.map((answer, index) => answer === correctAnswers[index])

        setQuizResults(results)
        setShowResults(true)
      }
    } else {
      setQuizMode(true)
      setShowResults(false)
      setWordQuizAnswers([])
      setSentenceQuizAnswers([])
      setPassageQuizAnswers([])
    }
  }

  const handleNextSection = () => {
    setQuizCompleted(false)
    setQuizMode(false)
    setSelectedWords([])
    setSelectedSentences([])
    setShowExplanation(false)

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
            <div className="flex justify-center">
              <Button onClick={handleNextSection}>문장 학습으로 넘어가기</Button>
            </div>
          </div>
        )
      }

      return (
        <div className="space-y-6">
          <h3 className="text-lg font-medium">단어 퀴즈</h3>
          {learningContent.quizzes.words.map((quiz, index) => (
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
            <Button
              onClick={handleCompleteSection}
              disabled={!showResults && wordQuizAnswers.length < learningContent.quizzes.words.length}
            >
              {showResults ? (quizResults.every((r) => r) ? "완료" : "다시 풀기") : "정답 확인"}
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
            <Button onClick={handleCompleteSection}>학습 완료 및 퀴즈 시작</Button>
          </div>
        </div>
      </div>
    )
  }

  const renderSentenceLearning = () => {
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
            <div className="flex justify-center">
              <Button onClick={handleNextSection}>지문 학습으로 넘어가기</Button>
            </div>
          </div>
        )
      }

      return (
        <div className="space-y-6">
          <h3 className="text-lg font-medium">문장 퀴즈</h3>
          {learningContent.quizzes.sentences.map((quiz, index) => (
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
              disabled={!showResults && sentenceQuizAnswers.length < learningContent.quizzes.sentences.length}
            >
              {showResults ? (quizResults.every((r) => r) ? "완료" : "다시 풀기") : "정답 확인"}
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
                    {learningContent.sentenceExplanations[sentenceIndex] ? (
                      <>
                        <div className="mt-3 space-y-2">
                          <p className="text-sm font-medium">문장 구조:</p>
                          <p className="text-sm text-muted-foreground">
                            {learningContent.sentenceExplanations[sentenceIndex].structure}
                          </p>
                        </div>
                        <div className="mt-3 space-y-2">
                          <p className="text-sm font-medium">해석:</p>
                          <p className="text-sm text-muted-foreground">
                            {learningContent.sentenceExplanations[sentenceIndex].explanation}
                          </p>
                        </div>
                      </>
                    ) : (
                      <p className="text-muted-foreground mt-1">이 문장에 대한 설명이 준비되지 않았습니다.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="pt-4 flex justify-end">
          <Button onClick={handleCompleteSection}>학습 완료 및 퀴즈 시작</Button>
        </div>
      </div>
    )
  }

  const renderPassageLearning = () => {
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
            <div className="flex justify-center">
              <Button onClick={handleNextSection}>학습 모듈 완료하기</Button>
            </div>
          </div>
        )
      }

      return (
        <div className="space-y-6">
          <h3 className="text-lg font-medium">지문 이해 퀴즈</h3>
          {learningContent.quizzes.passage.map((quiz, index) => (
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
              disabled={!showResults && passageQuizAnswers.length < learningContent.quizzes.passage.length}
            >
              {showResults ? (quizResults.every((r) => r) ? "완료" : "다시 풀기") : "정답 확인"}
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

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <Card className="border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{learningContent.title}</CardTitle>
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
