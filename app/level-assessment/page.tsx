"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Check, ArrowUp, ArrowDown } from "lucide-react"

export default function LevelAssessmentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const topic = searchParams.get("topic") || "일반"

  // CEFR 레벨 순서 (낮은 레벨부터 높은 레벨까지)
  const levels = ["A1", "A2", "B1", "B2", "C1", "C2"]

  const [currentLevel, setCurrentLevel] = useState("B1") // 중간 레벨에서 시작
  const [currentLevelIndex, setCurrentLevelIndex] = useState(2) // B1은 인덱스 2
  const [selectedWords, setSelectedWords] = useState<string[]>([])
  const [assessmentComplete, setAssessmentComplete] = useState(false)
  const [finalLevel, setFinalLevel] = useState("")
  const [assessmentHistory, setAssessmentHistory] = useState<{ level: string; percentage: number; result: string }[]>(
    [],
  )
  const [isMovingUp, setIsMovingUp] = useState<boolean | null>(null)
  const [isEvaluating, setIsEvaluating] = useState(false)

  // 샘플 텍스트 (실제로는 선택된 주제와 레벨에 맞는 텍스트를 가져와야 함)
  const sampleText = {
    A1: `Hello. My name is John. I am from the USA. I like to eat pizza. I drink coffee in the morning. I have a dog. His name is Max. He is black and white. I walk with him every day. The weather is nice today. It is sunny and warm.`,
    A2: `AI is a new technology. It helps people do many things. Computers can learn from data. They can find patterns and make choices. Many apps use AI today. Your phone has AI in it. AI can understand your voice. It can show you things you might like. Some jobs might change because of AI. But new jobs will also come. AI is getting better every year.`,
    B1: `Artificial Intelligence is changing the way we live and work. Machine learning algorithms can analyze large amounts of data and make predictions. These systems are becoming more common in our daily lives. From voice assistants to recommendation systems, AI is everywhere. Companies are investing heavily in this technology. Researchers are working to make AI more efficient and accurate. Some people worry about the impact of AI on jobs. Others see it as an opportunity for new types of work. The future of AI depends on how we choose to use this powerful technology.`,
    B2: `The rapid advancement of artificial intelligence has profound implications for society. Machine learning algorithms, which form the backbone of modern AI systems, can process vast datasets to identify patterns imperceptible to humans. These sophisticated systems are increasingly being integrated into critical infrastructure, healthcare diagnostics, and financial services. The proliferation of AI technologies raises important questions about privacy, accountability, and the future of work. While some experts express concern about potential job displacement, others argue that AI will create new economic opportunities and enhance human capabilities. The ethical dimensions of AI development, including issues of bias in training data and decision-making transparency, remain significant challenges for researchers and policymakers alike.`,
    C1: `The inexorable progression of artificial intelligence technologies presents a multifaceted paradigm shift that transcends mere technological innovation, permeating socioeconomic structures and challenging established ethical frameworks. Contemporary machine learning architectures, particularly deep neural networks, demonstrate unprecedented capabilities in pattern recognition and predictive analytics, enabling applications that were hitherto confined to the realm of science fiction. The integration of these systems into critical domains such as healthcare diagnostics, financial risk assessment, and judicial decision-making processes necessitates rigorous scrutiny regarding algorithmic transparency, accountability mechanisms, and potential perpetuation of societal biases. Furthermore, the accelerating automation of cognitive tasks traditionally performed by human workers portends significant labor market disruptions, potentially exacerbating economic inequality while simultaneously creating novel professional opportunities in emerging technological sectors.`,
    C2: `The inexorable ascendancy of artificial superintelligence portends a watershed moment in human civilization, one that transcends conventional paradigms of technological advancement and necessitates a profound recalibration of our epistemological, ethical, and existential frameworks. The recursive self-improvement capabilities inherent in advanced machine learning architectures engender the possibility of an intelligence explosion—a hypothetical scenario wherein artificial general intelligence surpasses human cognitive capacities across all domains and subsequently accelerates its own development at an exponential rate. This prospective technological singularity presents both unprecedented opportunities for addressing intractable global challenges and existential risks that demand preemptive governance structures. The philosophical implications are equally profound, challenging fundamental assumptions about consciousness, autonomy, and the ontological status of synthetic intelligences. As we navigate this uncharted intellectual terrain, interdisciplinary collaboration becomes imperative, synthesizing insights from computer science, neuroscience, philosophy of mind, and complex systems theory to formulate robust ethical frameworks and technical safeguards that ensure artificial superintelligence remains aligned with human values and beneficial to our collective flourishing.`,
  }

  // 텍스트를 단어 배열로 변환
  const words = sampleText[currentLevel]
    .split(/\s+/)
    .map((word) => word.replace(/[.,!?;:()]/g, ""))
    .filter((word) => word.length > 0)

  const handleWordClick = (word: string) => {
    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter((w) => w !== word))
    } else {
      setSelectedWords([...selectedWords, word])
    }
  }

  const handleSubmit = () => {
    // 모르는 단어 비율 계산
    const unknownWordPercentage = (selectedWords.length / words.length) * 100

    // 현재 평가 결과 저장
    const currentAssessment = {
      level: currentLevel,
      percentage: Number.parseFloat(unknownWordPercentage.toFixed(1)),
      result: unknownWordPercentage < 3 ? "상향" : unknownWordPercentage > 5 ? "하향" : "적합",
    }

    setAssessmentHistory([...assessmentHistory, currentAssessment])
    setIsEvaluating(true)

    // 평가 결과에 따라 다음 단계 결정
    setTimeout(() => {
      setIsEvaluating(false)

      if (unknownWordPercentage < 3) {
        // 모르는 단어가 3% 미만이면 레벨 업
        if (currentLevelIndex < levels.length - 1) {
          // 더 높은 레벨이 있으면 레벨 업
          const nextLevelIndex = currentLevelIndex + 1
          setCurrentLevelIndex(nextLevelIndex)
          setCurrentLevel(levels[nextLevelIndex])
          setSelectedWords([])
          setIsMovingUp(true)
        } else {
          // 이미 최고 레벨이면 평가 완료
          setFinalLevel(currentLevel)
          setAssessmentComplete(true)
        }
      } else if (unknownWordPercentage > 5) {
        // 모르는 단어가 5% 초과면 레벨 다운
        if (currentLevelIndex > 0) {
          // 더 낮은 레벨이 있으면 레벨 다운
          const nextLevelIndex = currentLevelIndex - 1
          setCurrentLevelIndex(nextLevelIndex)
          setCurrentLevel(levels[nextLevelIndex])
          setSelectedWords([])
          setIsMovingUp(false)
        } else {
          // 이미 최저 레벨이면 평가 완료
          setFinalLevel(currentLevel)
          setAssessmentComplete(true)
        }
      } else {
        // 3-5% 사이면 적절한 레벨 찾음
        setFinalLevel(currentLevel)
        setAssessmentComplete(true)
      }
    }, 1500)
  }

  const handleStartLearning = () => {
    router.push(`/learning?topic=${topic}&level=${finalLevel}`)
  }

  if (assessmentComplete) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Card className="border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl">레벨 평가 완료</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center rounded-full bg-green-100 p-6 mb-4">
                <Check className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mt-4">평가가 완료되었습니다!</h3>
              <div className="mt-4 space-y-2">
                <p className="text-muted-foreground">
                  선택한 주제: <span className="font-medium text-foreground">{topic}</span>
                </p>
                <p className="text-muted-foreground">
                  당신의 영어 레벨은{" "}
                  <Badge variant="outline" className="ml-1 text-lg font-bold">
                    {finalLevel}
                  </Badge>{" "}
                  입니다
                </p>
              </div>
            </div>

            {assessmentHistory.length > 0 && (
              <div className="bg-muted p-4 rounded-md">
                <h4 className="font-medium mb-2">평가 과정:</h4>
                <div className="space-y-2">
                  {assessmentHistory.map((assessment, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span>
                        <Badge variant="outline" className="mr-2">
                          {assessment.level}
                        </Badge>
                        레벨 평가
                      </span>
                      <span>모르는 단어: {assessment.percentage}%</span>
                      <span
                        className={
                          assessment.result === "상향"
                            ? "text-green-600 flex items-center"
                            : assessment.result === "하향"
                              ? "text-red-600 flex items-center"
                              : "text-blue-600 flex items-center"
                        }
                      >
                        {assessment.result === "상향" && <ArrowUp className="h-4 w-4 mr-1" />}
                        {assessment.result === "하향" && <ArrowDown className="h-4 w-4 mr-1" />}
                        {assessment.result === "적합" && <Check className="h-4 w-4 mr-1" />}
                        {assessment.result}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col space-y-4">
              <p className="text-center">이제 선택한 주제와 레벨에 맞는 학습을 시작하시겠습니까?</p>
              <div className="flex justify-center pt-4">
                <Button onClick={handleStartLearning} size="lg">
                  학습 시작하기
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
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
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">영어 레벨 평가</CardTitle>
            <Badge variant="outline">{currentLevel} 레벨 평가 중</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {assessmentHistory.length > 0 && (
            <div className="bg-muted p-4 rounded-md mb-4">
              <h4 className="font-medium mb-2">이전 평가 결과:</h4>
              <div className="space-y-2">
                {assessmentHistory.map((assessment, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>
                      <Badge variant="outline" className="mr-2">
                        {assessment.level}
                      </Badge>
                      레벨 평가
                    </span>
                    <span>모르는 단어: {assessment.percentage}%</span>
                    <span
                      className={
                        assessment.result === "상향"
                          ? "text-green-600 flex items-center"
                          : assessment.result === "하향"
                            ? "text-red-600 flex items-center"
                            : "text-blue-600 flex items-center"
                      }
                    >
                      {assessment.result === "상향" && <ArrowUp className="h-4 w-4 mr-1" />}
                      {assessment.result === "하향" && <ArrowDown className="h-4 w-4 mr-1" />}
                      {assessment.result === "적합" && <Check className="h-4 w-4 mr-1" />}
                      {assessment.result}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isEvaluating ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center rounded-full bg-blue-100 p-6 mb-4">
                <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-xl font-medium mt-4">레벨 평가 중...</h3>
              <p className="text-muted-foreground mt-2">결과를 분석하고 있습니다.</p>
            </div>
          ) : isMovingUp !== null ? (
            <div className="text-center py-6 mb-2">
              <div
                className={`inline-flex items-center justify-center rounded-full p-4 mb-4 ${
                  isMovingUp ? "bg-green-100" : "bg-amber-100"
                }`}
              >
                {isMovingUp ? (
                  <ArrowUp className="h-6 w-6 text-green-600" />
                ) : (
                  <ArrowDown className="h-6 w-6 text-amber-600" />
                )}
              </div>
              <h3 className="text-lg font-medium">
                {isMovingUp ? "더 높은 레벨로 이동합니다" : "더 낮은 레벨로 이동합니다"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {isMovingUp
                  ? "모르는 단어가 3% 미만으로 더 높은 레벨을 평가합니다."
                  : "모르는 단어가 5% 초과로 더 낮은 레벨을 평가합니다."}
              </p>
            </div>
          ) : null}

          <div>
            <h3 className="font-medium mb-2">안내:</h3>
            <p className="text-muted-foreground mb-4">
              아래 텍스트에서 모르는 단어를 클릭하세요. 모르는 단어를 모두 선택한 후 '제출' 버튼을 클릭하세요.
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

          <div className="pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                선택한 단어: {selectedWords.length} / {words.length} (
                {((selectedWords.length / words.length) * 100).toFixed(1)}%)
              </p>
              <Button onClick={handleSubmit} disabled={isEvaluating}>
                제출
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
