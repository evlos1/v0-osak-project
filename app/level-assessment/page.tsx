"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ArrowLeft, Loader2 } from "lucide-react"
import { useTranslation } from "react-i18next"

export default function LevelAssessmentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const topic = searchParams.get("topic") || "일반"
  const { t } = useTranslation()

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
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0)

  // 샘플 텍스트 (3가지 다른 주제로 구성)
  const sampleTexts = {
    technology: {
      A1: `Computers are useful tools. They help us work and play. We use them every day. Phones are small computers. They let us talk to friends. The internet connects computers. We can find information online. Email helps us send messages. Games are fun on computers. Technology changes fast. New devices come out each year.`,
      A2: `AI is a new technology. It helps people do many things. Computers can learn from data. They can find patterns and make choices. Many apps use AI today. Your phone has AI in it. AI can understand your voice. It can show you things you might like. Some jobs might change because of AI. But new jobs will also come. AI is getting better every year.`,
      B1: `Artificial Intelligence is changing the way we live and work. Machine learning algorithms can analyze large amounts of data and make predictions. These systems are becoming more common in our daily lives. From voice assistants to recommendation systems, AI is everywhere. Companies are investing heavily in this technology. Researchers are working to make AI more efficient and accurate. Some people worry about the impact of AI on jobs. Others see it as an opportunity for new types of work. The future of AI depends on how we choose to use this powerful technology.`,
      B2: `The rapid advancement of artificial intelligence has profound implications for society. Machine learning algorithms, which form the backbone of modern AI systems, can process vast datasets to identify patterns imperceptible to humans. These sophisticated systems are increasingly being integrated into critical infrastructure, healthcare diagnostics, and financial services. The proliferation of AI technologies raises important questions about privacy, accountability, and the future of work. While some experts express concern about potential job displacement, others argue that AI will create new economic opportunities and enhance human capabilities. The ethical dimensions of AI development, including issues of bias in training data and decision-making transparency, remain significant challenges for researchers and policymakers alike.`,
      C1: `The inexorable progression of artificial intelligence technologies presents a multifaceted paradigm shift that transcends mere technological innovation, permeating socioeconomic structures and challenging established ethical frameworks. Contemporary machine learning architectures, particularly deep neural networks, demonstrate unprecedented capabilities in pattern recognition and predictive analytics, enabling applications that were hitherto confined to the realm of science fiction. The integration of these systems into critical domains such as healthcare diagnostics, financial risk assessment, and judicial decision-making processes necessitates rigorous scrutiny regarding algorithmic transparency, accountability mechanisms, and potential perpetuation of societal biases. Furthermore, the accelerating automation of cognitive tasks traditionally performed by human workers portends significant labor market disruptions, potentially exacerbating economic inequality while simultaneously creating novel professional opportunities in emerging technological sectors.`,
      C2: `The inexorable ascendancy of artificial superintelligence portends a watershed moment in human civilization, one that transcends conventional paradigms of technological advancement and necessitates a profound recalibration of our epistemological, ethical, and existential frameworks. The recursive self-improvement capabilities inherent in advanced machine learning architectures engender the possibility of an intelligence explosion—a hypothetical scenario wherein artificial general intelligence surpasses human cognitive capacities across all domains and subsequently accelerates its own development at an exponential rate. This prospective technological singularity presents both unprecedented opportunities for addressing intractable global challenges and existential risks that demand preemptive governance structures. The philosophical implications are equally profound, challenging fundamental assumptions about consciousness, autonomy, and the ontological status of synthetic intelligences. As we navigate this uncharted intellectual terrain, interdisciplinary collaboration becomes imperative, synthesizing insights from computer science, neuroscience, philosophy of mind, and complex systems theory to formulate robust ethical frameworks and technical safeguards that ensure artificial superintelligence remains aligned with human values and beneficial to our collective flourishing.`,
    },
    environment: {
      A1: `The Earth is our home. It has water, land, and air. Plants grow on Earth. Animals live here too. We need clean water. We need fresh air. Trees give us oxygen. The sun gives us light. We must take care of Earth. It is the only planet we have.`,
      A2: `Climate change is a big problem. The Earth is getting warmer. Ice in cold places is melting. Sea levels are rising. Some animals are losing their homes. Weather is becoming more extreme. We see more storms and floods. People can help by using less energy. We can recycle things we use. Planting trees is also good. Everyone needs to work together to protect our planet.`,
      B1: `Environmental conservation is becoming increasingly important as we face global challenges like climate change and biodiversity loss. Human activities such as deforestation, pollution, and burning fossil fuels are having significant impacts on our planet. Scientists are monitoring these changes and warning about their consequences. Governments around the world are creating policies to reduce carbon emissions and protect natural habitats. Many individuals are also making changes in their daily lives, such as reducing waste, conserving water, and using renewable energy. Education about environmental issues is crucial for future generations. By working together, we can find sustainable solutions to protect our planet for years to come.`,
      B2: `The escalating environmental crisis demands immediate and comprehensive action from governments, corporations, and individuals alike. Climate scientists have documented alarming trends in global temperature rise, extreme weather events, and ecosystem degradation that threaten both human societies and natural systems. The interconnected nature of environmental challenges—from ocean acidification to desertification—requires holistic approaches that address root causes rather than merely treating symptoms. While technological innovations in renewable energy and sustainable agriculture offer promising pathways forward, they must be accompanied by fundamental shifts in consumption patterns and economic models. Indigenous knowledge systems, which have maintained ecological balance for millennia, provide valuable insights for developing more harmonious relationships with the natural world. The concept of environmental justice further emphasizes that solutions must address the disproportionate impacts of environmental degradation on marginalized communities.`,
      C1: `The anthropogenic perturbation of Earth's biogeochemical cycles represents an unprecedented experiment with our planet's life-support systems, the ramifications of which extend far beyond simplistic narratives of environmental degradation. The complex interplay between atmospheric composition, oceanic circulation patterns, terrestrial ecosystems, and cryospheric dynamics creates feedback mechanisms that can amplify or attenuate human-induced changes in ways that challenge our predictive capabilities. Contemporary environmental science increasingly recognizes that we have entered the Anthropocene—a geological epoch characterized by humanity's dominant influence on planetary processes. This paradigm shift necessitates transdisciplinary approaches that integrate natural sciences with social, economic, and ethical dimensions of environmental stewardship. The concept of planetary boundaries provides a framework for identifying safe operating spaces for human development, while acknowledging that certain thresholds, once crossed, may trigger non-linear and potentially irreversible changes in Earth systems.`,
      C2: `The inexorable anthropogenic reconfiguration of Earth's biophysical systems constitutes not merely an environmental crisis but an ontological rupture in the relationship between humanity and the more-than-human world—a profound disruption that transcends conventional disciplinary boundaries and challenges the fundamental epistemological frameworks through which we apprehend ecological phenomena. The reductionist paradigms that have historically dominated environmental science prove increasingly inadequate for comprehending the emergent properties of complex adaptive systems characterized by non-linear dynamics, cross-scale interactions, and teleconnections between seemingly disparate processes. Contemporary scholarship on socio-ecological resilience emphasizes the need to conceptualize human societies as embedded within, rather than separate from, the biogeochemical cycles and evolutionary processes that sustain planetary habitability. This reconceptualization necessitates a radical transformation of governance structures, economic systems, and cultural narratives—moving beyond anthropocentric models of environmental management toward biocentric approaches that recognize the intrinsic value and agency of non-human entities and ecological communities.`,
    },
    health: {
      A1: `Health is important for everyone. We need to eat good food. Fruits and vegetables are healthy. We should drink water every day. Sleep helps our body rest. Exercise makes us strong. Doctors help when we are sick. Washing hands stops germs. Teeth need brushing twice a day. Being healthy makes us happy.`,
      A2: `Staying healthy requires good habits. A balanced diet gives us energy and nutrients. We should eat different types of food. Exercise is important for our heart and muscles. Adults need about 30 minutes of activity each day. Sleep helps our body and mind recover. Most people need 7-8 hours of sleep. Stress can make us sick. Talking about problems helps reduce stress. Regular check-ups can find health issues early. Prevention is better than treatment.`,
      B1: `Maintaining good health involves multiple aspects of our lifestyle, including nutrition, physical activity, and mental wellbeing. Nutritionists recommend eating a variety of foods to ensure we get all necessary vitamins and minerals. Regular exercise has been shown to reduce the risk of many chronic diseases, including heart disease and diabetes. It also improves mood and energy levels. Mental health is equally important, with stress management techniques such as meditation becoming increasingly popular. Healthcare professionals emphasize the importance of preventive measures like vaccinations and regular screenings. With increasing life expectancy, many people are focusing on not just living longer, but maintaining quality of life as they age. Public health initiatives aim to educate communities about these important health factors.`,
      B2: `The multifaceted nature of human health encompasses physiological, psychological, and social dimensions that interact in complex ways throughout the lifespan. Contemporary medical research has shifted from a predominantly disease-focused model toward a more holistic understanding of wellbeing that acknowledges the bidirectional relationship between physical and mental health. Emerging evidence in psychoneuroimmunology demonstrates how psychological states influence immune function, while the gut-brain axis reveals intricate connections between digestive health and cognitive processes. Preventive healthcare strategies increasingly incorporate behavioral economics and social psychology to address the challenges of lifestyle modification, recognizing that knowledge alone rarely translates to sustained behavioral change. The social determinants of health—including economic stability, education access, neighborhood characteristics, and social support networks—often exert more profound influences on population health outcomes than medical interventions, highlighting the need for interdisciplinary approaches to public health challenges.`,
      C1: `The paradigmatic evolution in health sciences from reductionist models toward systems-based approaches reflects a growing recognition of the emergent properties that characterize human physiological and pathological states. Contemporary precision medicine endeavors to integrate multi-omic data streams—genomic, proteomic, metabolomic, and exposomic profiles—with sophisticated computational methods to elucidate the idiosyncratic mechanisms underlying individual health trajectories. This personalized framework challenges the conventional categorization of diseases based on phenomenological similarities, instead reconceptualizing pathological conditions as perturbations in molecular networks with heterogeneous manifestations. Concurrently, population health researchers increasingly employ complex adaptive systems theory to model the non-linear interactions between biological vulnerabilities, behavioral patterns, and socioeconomic contexts that collectively determine health disparities across demographic groups. The epigenetic embedding of early life experiences further illuminates how social and environmental factors become biologically incorporated, influencing physiological regulation and disease susceptibility through mechanisms that may persist across generations.`,
      C2: `The epistemological foundations of contemporary health sciences are undergoing a profound reconfiguration as the limitations of Cartesian dualism and mechanistic reductionism become increasingly apparent in addressing the multidimensional complexities of human wellbeing. The artificial bifurcation between somatic and psychological domains—a conceptual artifact of biomedical history rather than an ontological reality—has gradually yielded to more integrative paradigms that recognize the recursive causality between phenomenological experience and physiological processes. Advances in systems biology, network medicine, and computational modeling have facilitated the conceptualization of health as an emergent property arising from dynamic interactions across multiple biological scales, from molecular signaling pathways to cellular networks, organ systems, and ultimately the embodied person embedded within particular sociocultural contexts. This ontological reframing necessitates methodological pluralism that transcends the limitations of randomized controlled trials—designed to isolate singular causal mechanisms—toward approaches capable of capturing the contextual contingencies and non-linear dynamics characteristic of complex adaptive systems. The nascent field of implementation science further illuminates the chasm between efficacy in controlled research environments and effectiveness in real-world settings, highlighting how intervention outcomes are inextricably shaped by the sociotechnical ecosystems in which they are deployed.`,
    },
  }

  // 현재 주제에 따른 샘플 텍스트 선택
  const topicKeys = Object.keys(sampleTexts) as Array<keyof typeof sampleTexts>
  const currentTopic = topicKeys[currentTopicIndex]
  const sampleText = sampleTexts[currentTopic]

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

          // 주제 변경 (순환)
          setCurrentTopicIndex((currentTopicIndex + 1) % topicKeys.length)
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

          // 주제 변경 (순환)
          setCurrentTopicIndex((currentTopicIndex + 1) % topicKeys.length)
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
            <CardTitle className="text-2xl">{t("level_assessment_title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center rounded-full bg-green-100 p-6 mb-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mt-4">{t("congratulations")}</h3>
              <div className="mt-4 space-y-2">
                <p className="text-muted-foreground">
                  {t("topic")}: <span className="font-medium text-foreground">{topic}</span>
                </p>
                <p className="text-muted-foreground">
                  {t("level_assessment_title")}:{" "}
                  <Badge variant="outline" className="ml-1 text-lg font-bold">
                    {finalLevel}
                  </Badge>
                </p>
              </div>
            </div>
            <Button onClick={handleStartLearning} className="w-full">
              {t("start_learning")}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isEvaluating) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Card className="border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl">{t("level_assessment_title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-medium">{t("evaluating")}</h3>
              <p className="text-muted-foreground mt-2">{t("analyzing_results")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center mb-4">
        <Button variant="ghost" onClick={() => router.push("/topic-selection")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("back")}
        </Button>
        <div className="ml-auto">
          <Badge variant="outline" className="text-lg font-bold">
            {currentLevel}
          </Badge>
        </div>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">{t("level_assessment_title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isMovingUp !== null && (
            <div
              className={`p-3 mb-4 rounded-md ${
                isMovingUp ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"
              }`}
            >
              <p className={isMovingUp ? "text-green-700" : "text-amber-700"}>
                {isMovingUp ? t("moving_higher") : t("moving_lower")}
              </p>
              <p className="text-sm mt-1">{isMovingUp ? t("unknown_words_less") : t("unknown_words_more")}</p>
            </div>
          )}

          <div>
            <p className="mb-4">{t("level_assessment_guide")}</p>
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
            <div>
              <h3 className="font-medium mb-2">{t("selected_words")}:</h3>
              <div className="flex flex-wrap gap-2">
                {selectedWords.map((word, index) => (
                  <Badge key={index} variant="secondary" className="px-2 py-1">
                    {word}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <Button onClick={handleSubmit}>{t("submit")}</Button>
          </div>

          {assessmentHistory.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-medium mb-2">
                {t("level_assessment_title")} {t("history")}:
              </h3>
              <div className="space-y-2">
                {assessmentHistory.map((assessment, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded-md text-sm ${
                      assessment.result === "적합"
                        ? "bg-green-50"
                        : assessment.result === "상향"
                          ? "bg-blue-50"
                          : "bg-amber-50"
                    }`}
                  >
                    <span className="font-medium">{assessment.level}:</span> {assessment.percentage}%{" "}
                    {t("unknown_words")} (
                    {assessment.result === "적합"
                      ? t("appropriate")
                      : assessment.result === "상향"
                        ? t("moving_higher")
                        : t("moving_lower")}
                    )
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
