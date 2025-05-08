"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ArrowLeft, Loader2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

// 카테고리 번역 관련 import 부분
import { getLocalizedCategoryName } from "@/app/i18n/category-translations"

// 기존 LevelAssessmentPage 함수 내부에서 topic 변수 사용 부분 수정
export default function LevelAssessmentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawTopic = searchParams.get("topic") || "일반"
  // 현재 언어에 맞게 토픽 이름 변환
  const topic = getLocalizedCategoryName(rawTopic)
  const { t } = useTranslation()
  const { toast } = useToast()

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
  const [randomSeed, setRandomSeed] = useState(Math.random()) // 랜덤 시드 추가
  const [learningUrl, setLearningUrl] = useState("") // 학습 URL 상태 추가
  const [isLoading, setIsLoading] = useState(true) // 로딩 상태 추가
  const [error, setError] = useState<string | null>(null) // 오류 상태 추가

  // 레벨이나 주제가 변경될 때마다 랜덤 시드 초기화
  useEffect(() => {
    setRandomSeed(Math.random())
  }, [currentLevel, currentTopicIndex])

  // 초기 데이터 로드
  useEffect(() => {
    // 로컬 스토리지에서 API 키 확인
    const savedApiKey = localStorage.getItem("google_api_key") || ""
    if (!savedApiKey) {
      setIsLoading(false)
      setError("API 키가 필요합니다. 설정 페이지에서 API 키를 입력해주세요.")
      toast({
        title: t("api_key_required"),
        description: t("api_key_description"),
        variant: "destructive",
      })
      return
    }

    // 이전 평가 결과 확인
    try {
      const lastAssessment = localStorage.getItem("lastAssessment")
      if (lastAssessment) {
        const assessment = JSON.parse(lastAssessment)
        // 최근 평가가 현재 주제와 일치하는지 확인
        if (assessment && assessment.topic === rawTopic) {
          // 이미 평가된 레벨이 있으면 바로 학습 페이지로 이동할지 물어보기
          toast({
            title: t("previous_assessment_found"),
            description: t("previous_assessment_description", { level: assessment.level }),
            action: (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  router.push(`/learning?topic=${encodeURIComponent(rawTopic)}&level=${assessment.level}`)
                }}
              >
                {t("use_previous_assessment")}
              </Button>
            ),
          })
        }
      }
    } catch (error) {
      console.error("Failed to load assessment data:", error)
    }

    setIsLoading(false)
  }, [rawTopic, router, t, toast])

  // 샘플 텍스트 (각 주제별로 여러 지문 제공)
  const sampleTexts = {
    technology: {
      A1: [
        `Computers are useful tools. They help us work and play. We use them every day. Phones are small computers. They let us talk to friends. The internet connects computers. We can find information online. Email helps us send messages. Games are fun on computers. Technology changes fast. New devices come out each year.`,
        `Technology is all around us. We use it every day. Phones help us talk to friends. Computers help us work. The internet gives us information. We can watch videos online. We can listen to music too. Email is a fast way to send messages. Apps make our phones smart. Technology makes life easier.`,
        `I have a computer at home. It is very useful. I use it to write emails. I also use it to watch videos. My phone is small but smart. I can take photos with it. I can play games on it too. The internet helps me learn new things. Technology is changing our world. New things come every year.`,
      ],
      A2: [
        `AI is a new technology. It helps people do many things. Computers can learn from data. They can find patterns and make choices. Many apps use AI today. Your phone has AI in it. AI can understand your voice. It can show you things you might like. Some jobs might change because of AI. But new jobs will also come. AI is getting better every year.`,
        `Smart homes are becoming popular. They use technology to make life easier. Lights turn on when you enter a room. The temperature stays just right. You can lock doors with your phone. Smart speakers can play music for you. They can also answer questions. You can control everything with your voice. Smart homes save energy too. They turn off things when not needed. Technology is making our homes smarter.`,
        `Social media connects people around the world. We can share photos and videos easily. We can talk to friends far away. Many people use social media every day. It helps us stay in touch. We can follow news and events. Companies use it to reach customers. Some people spend too much time online. It's important to use social media wisely. Real connections matter too.`,
      ],
      B1: [
        `Artificial Intelligence is changing the way we live and work. Machine learning algorithms can analyze large amounts of data and make predictions. These systems are becoming more common in our daily lives. From voice assistants to recommendation systems, AI is everywhere. Companies are investing heavily in this technology. Researchers are working to make AI more efficient and accurate. Some people worry about the impact of AI on jobs. Others see it as an opportunity for new types of work. The future of AI depends on how we choose to use this powerful technology.`,
        `The rise of remote work has transformed how businesses operate. Digital tools allow teams to collaborate from anywhere in the world. Video conferencing platforms connect colleagues across different time zones. Cloud storage solutions make sharing documents simple and secure. Companies are rethinking their office spaces and work policies. Many employees enjoy the flexibility of working from home. However, remote work also presents challenges for team building and communication. Finding the right balance between remote and in-person work is crucial. Technology continues to evolve to support this new way of working.`,
        `Renewable energy technologies are advancing rapidly. Solar panels are becoming more efficient and affordable. Wind turbines can generate more power than ever before. Battery storage systems help manage energy when the sun isn't shining or the wind isn't blowing. Many countries are investing in clean energy infrastructure. Homeowners can now install solar panels on their roofs. Electric vehicles are becoming more common on our roads. These technologies help reduce carbon emissions and fight climate change. The transition to renewable energy creates new jobs and economic opportunities.`,
      ],
      B2: [
        `The rapid advancement of artificial intelligence has profound implications for society. Machine learning algorithms, which form the backbone of modern AI systems, can process vast datasets to identify patterns imperceptible to humans. These sophisticated systems are increasingly being integrated into critical infrastructure, healthcare diagnostics, and financial services. The proliferation of AI technologies raises important questions about privacy, accountability, and the future of work. While some experts express concern about potential job displacement, others argue that AI will create new economic opportunities and enhance human capabilities. The ethical dimensions of AI development, including issues of bias in training data and decision-making transparency, remain significant challenges for researchers and policymakers alike.`,
        `The evolution of blockchain technology extends far beyond its initial application in cryptocurrencies. This distributed ledger system offers unprecedented transparency, security, and efficiency for recording transactions across multiple industries. Smart contracts—self-executing agreements with terms directly written into code—are revolutionizing legal frameworks and business operations. Supply chain management benefits from blockchain's ability to track products from origin to consumer, reducing fraud and ensuring ethical sourcing. Financial institutions are exploring blockchain for faster, more secure transactions without intermediaries. Despite its potential, blockchain faces challenges including scalability issues, regulatory uncertainty, and significant energy consumption. As the technology matures, finding solutions to these limitations will determine its long-term impact.`,
        `The convergence of augmented reality (AR) and virtual reality (VR) technologies is transforming how we interact with digital information and each other. AR overlays digital content onto the physical world, enhancing our perception and enabling new forms of interaction with our environment. VR creates immersive simulated experiences that transport users to entirely different realities. These technologies are finding applications beyond gaming and entertainment, revolutionizing fields such as education, healthcare, architecture, and remote collaboration. Medical students can practice complex procedures in virtual environments, while architects can walk clients through buildings before construction begins. As hardware becomes more affordable and software more sophisticated, these immersive technologies will increasingly blur the boundaries between physical and digital realms.`,
      ],
      C1: [
        `The inexorable progression of artificial intelligence technologies presents a multifaceted paradigm shift that transcends mere technological innovation, permeating socioeconomic structures and challenging established ethical frameworks. Contemporary machine learning architectures, particularly deep neural networks, demonstrate unprecedented capabilities in pattern recognition and predictive analytics, enabling applications that were hitherto confined to the realm of science fiction. The integration of these systems into critical domains such as healthcare diagnostics, financial risk assessment, and judicial decision-making processes necessitates rigorous scrutiny regarding algorithmic transparency, accountability mechanisms, and potential perpetuation of societal biases. Furthermore, the accelerating automation of cognitive tasks traditionally performed by human workers portends significant labor market disruptions, potentially exacerbating economic inequality while simultaneously creating novel professional opportunities in emerging technological sectors.`,
        `The proliferation of quantum computing research heralds a computational revolution with far-reaching implications across scientific disciplines and information security paradigms. Unlike classical computers that process binary digits (bits) representing either 0 or 1, quantum computers leverage quantum bits (qubits) that can exist in superpositions of states, enabling parallel processing capabilities that grow exponentially with each additional qubit. This computational advantage promises to transform fields such as cryptography, material science, and pharmaceutical development by solving previously intractable problems. However, the same quantum algorithms that could accelerate scientific discovery also threaten to undermine current encryption standards that safeguard digital communications and financial transactions. The race to achieve quantum supremacy—the point at which quantum computers outperform classical supercomputers—has intensified global competition among research institutions and technology corporations, with significant geopolitical implications for technological sovereignty.`,
        `The burgeoning field of synthetic biology represents the convergence of genetic engineering, computational modeling, and nanoscale fabrication techniques, enabling unprecedented manipulation of biological systems with transformative potential for medicine, agriculture, and environmental remediation. By applying engineering principles to biological components, researchers can design novel proteins, engineer metabolic pathways, and even create synthetic organisms with customized functions. These capabilities offer promising solutions to pressing global challenges, from developing targeted therapeutics and sustainable biofuels to creating drought-resistant crops and biodegradable materials. Nevertheless, the capacity to fundamentally alter living systems raises profound ethical considerations regarding biosafety, ecological impact, and the appropriate governance of technologies that could irreversibly transform our relationship with nature. The democratization of biotechnology tools further complicates regulatory frameworks, as sophisticated genetic engineering techniques become increasingly accessible beyond traditional institutional settings.`,
      ],
      C2: [
        `The inexorable ascendancy of artificial superintelligence portends a watershed moment in human civilization, one that transcends conventional paradigms of technological advancement and necessitates a profound recalibration of our epistemological, ethical, and existential frameworks. The recursive self-improvement capabilities inherent in advanced machine learning architectures engender the possibility of an intelligence explosion—a hypothetical scenario wherein artificial general intelligence surpasses human cognitive capacities across all domains and subsequently accelerates its own development at an exponential rate. This prospective technological singularity presents both unprecedented opportunities for addressing intractable global challenges and existential risks that demand preemptive governance structures. The philosophical implications are equally profound, challenging fundamental assumptions about consciousness, autonomy, and the ontological status of synthetic intelligences. As we navigate this uncharted intellectual terrain, interdisciplinary collaboration becomes imperative, synthesizing insights from computer science, neuroscience, philosophy of mind, and complex systems theory to formulate robust ethical frameworks and technical safeguards that ensure artificial superintelligence remains aligned with human values and beneficial to our collective flourishing.`,
        `The emergent paradigm of neuromorphic computing represents a radical departure from conventional von Neumann architectures, drawing inspiration from the structural and functional principles of biological neural systems to create computational substrates that more efficiently emulate cognitive processes. By integrating memory and processing functions within the same physical components—mirroring the distributed, parallel, and event-driven nature of biological neural networks—these systems transcend the bottlenecks inherent in traditional computing architectures. The implementation of spike-based information processing and synaptic plasticity mechanisms facilitates unsupervised learning and adaptive behavior, enabling more sophisticated pattern recognition and decision-making capabilities while consuming orders of magnitude less power than conventional approaches. Beyond mere technical innovation, neuromorphic computing prompts a fundamental reconceptualization of artificial intelligence, potentially bridging the longstanding divide between symbolic and connectionist approaches through embodied cognition frameworks that situate intelligence within sensorimotor interactions rather than abstract manipulation of representations. This convergence of neuroscience, materials science, and computer engineering may ultimately yield not only more efficient computational systems but also deeper insights into the nature of intelligence itself, both biological and artificial.`,
        `The inexorable convergence of nanotechnology, biotechnology, information technology, and cognitive science—collectively termed the NBIC technologies—heralds a transformative era characterized by unprecedented manipulation of matter, life, information, and consciousness across previously distinct domains of human inquiry. This technological confluence enables interventions at fundamental levels of physical and biological reality, from atomic-scale manufacturing and molecular medicine to brain-computer interfaces and cognitive enhancement. The accelerating cross-pollination between these fields generates emergent capabilities that transcend disciplinary boundaries, potentially reshaping the human condition through radical life extension, cognitive augmentation, and even the speculative prospect of substrate-independent minds. Such profound technological possibilities necessitate commensurate advances in our ethical frameworks and governance structures, challenging conventional notions of human identity, agency, and social organization. The democratization of these powerful technologies further complicates regulatory approaches, as capabilities once confined to sophisticated research institutions become increasingly accessible to non-institutional actors, creating complex risk landscapes that span biosecurity, information security, and existential considerations. Navigating this technological inflection point requires not only technical expertise but also philosophical wisdom and inclusive deliberation about the future we collectively wish to create.`,
      ],
    },
    environment: {
      A1: [
        `The Earth is our home. It has water, land, and air. Plants grow on Earth. Animals live here too. We need clean water. We need fresh air. Trees give us oxygen. The sun gives us light. We must take care of Earth. It is the only planet we have.`,
        `Nature is all around us. We see trees and flowers. Birds fly in the sky. Fish swim in water. The sun makes plants grow. Rain helps too. Animals need food and water. People need clean air. We should not throw trash. We must keep nature clean.`,
        `Our planet is beautiful. It has big oceans. It has tall mountains. Many animals live here. Many plants grow here. We need to protect them. Pollution is bad for Earth. We should use less plastic. We should plant more trees. Everyone can help our planet.`,
      ],
      A2: [
        `Climate change is a big problem. The Earth is getting warmer. Ice in cold places is melting. Sea levels are rising. Some animals are losing their homes. Weather is becoming more extreme. We see more storms and floods. People can help by using less energy. We can recycle things we use. Planting trees is also good. Everyone needs to work together to protect our planet.`,
        `Recycling helps our environment. We can recycle paper, plastic, and glass. This saves trees and reduces waste. Many things can be made from recycled materials. Recycling centers sort the materials. Then factories use them to make new products. Some cities collect recycling from homes. Schools teach children about recycling. It's easy to start recycling at home. Small actions can make a big difference.`,
        `Water is precious for all life. We need clean water to drink. Plants need water to grow. Animals need water to survive. But many places don't have enough water. Some water is polluted. We should not waste water. Turn off taps when not using them. Fix leaking pipes quickly. Use water carefully in gardens. We can collect rainwater for plants. Everyone should help save water.`,
      ],
      B1: [
        `Environmental conservation is becoming increasingly important as we face global challenges like climate change and biodiversity loss. Human activities such as deforestation, pollution, and burning fossil fuels are having significant impacts on our planet. Scientists are monitoring these changes and warning about their consequences. Governments around the world are creating policies to reduce carbon emissions and protect natural habitats. Many individuals are also making changes in their daily lives, such as reducing waste, conserving water, and using renewable energy. Education about environmental issues is crucial for future generations. By working together, we can find sustainable solutions to protect our planet for years to come.`,
        `Sustainable agriculture practices are essential for feeding a growing global population while protecting our environment. Traditional farming methods often rely heavily on chemical fertilizers and pesticides, which can harm soil health and water quality. In contrast, sustainable farming focuses on maintaining ecosystem balance and minimizing environmental impact. Techniques such as crop rotation, composting, and integrated pest management help preserve soil fertility and reduce pollution. Many farmers are also adopting precision agriculture technologies that optimize water and resource use. Consumers can support sustainable agriculture by choosing locally grown, organic products. These practices not only protect the environment but also often produce healthier food and support rural communities.`,
        `Marine conservation efforts are critical for protecting the health of our oceans and the countless species that depend on them. Oceans cover more than 70% of Earth's surface and play a vital role in regulating our climate and providing food for billions of people. However, problems such as overfishing, plastic pollution, and ocean acidification threaten marine ecosystems worldwide. Marine protected areas help preserve biodiversity hotspots and allow fish populations to recover. International agreements aim to reduce plastic waste entering the oceans and limit harmful fishing practices. Scientists are also working to restore damaged coral reefs and seagrass meadows, which provide essential habitat for marine life. Everyone can contribute to ocean conservation through responsible seafood choices and reducing plastic use.`,
      ],
      B2: [
        `The escalating environmental crisis demands immediate and comprehensive action from governments, corporations, and individuals alike. Climate scientists have documented alarming trends in global temperature rise, extreme weather events, and ecosystem degradation that threaten both human societies and natural systems. The interconnected nature of environmental challenges—from ocean acidification to desertification—requires holistic approaches that address root causes rather than merely treating symptoms. While technological innovations in renewable energy and sustainable agriculture offer promising pathways forward, they must be accompanied by fundamental shifts in consumption patterns and economic models. Indigenous knowledge systems, which have maintained ecological balance for millennia, provide valuable insights for developing more harmonious relationships with the natural world. The concept of environmental justice further emphasizes that solutions must address the disproportionate impacts of environmental degradation on marginalized communities.`,
        `The circular economy paradigm represents a systemic shift from the traditional linear model of production and consumption toward regenerative design principles that minimize waste and pollution. Unlike the conventional "take-make-dispose" approach, circular systems keep products and materials in use through strategies such as remanufacturing, refurbishment, and recycling. This transition requires rethinking product design to facilitate disassembly and material recovery, developing innovative business models that emphasize access over ownership, and creating robust reverse logistics networks. The benefits extend beyond environmental protection to include economic opportunities through resource efficiency and new service-based business models. However, implementing circular economy principles faces challenges including entrenched consumer behaviors, complex global supply chains, and regulatory frameworks that often incentivize linear practices. Overcoming these barriers requires coordinated efforts across sectors and scales, from local initiatives to international policy alignment.`,
        `Biodiversity conservation strategies must evolve beyond traditional protected area approaches to address the complex drivers of ecosystem degradation in the Anthropocene. While national parks and reserves remain essential, they are insufficient alone to halt biodiversity loss in an era of climate change and widespread human influence on landscapes. Contemporary conservation science emphasizes connectivity between protected habitats, restoration of degraded ecosystems, and sustainable management of working landscapes such as farms and managed forests. The concept of "nature-based solutions" recognizes that healthy ecosystems provide essential services including carbon sequestration, flood protection, and water purification. Effective conservation increasingly depends on engaging local communities as stewards rather than excluding them from resource management decisions. Emerging technologies such as environmental DNA monitoring and satellite tracking enable more precise understanding of species distributions and movements, informing targeted conservation interventions.`,
      ],
      C1: [
        `The anthropogenic perturbation of Earth's biogeochemical cycles represents an unprecedented experiment with our planet's life-support systems, the ramifications of which extend far beyond simplistic narratives of environmental degradation. The complex interplay between atmospheric composition, oceanic circulation patterns, terrestrial ecosystems, and cryospheric dynamics creates feedback mechanisms that can amplify or attenuate human-induced changes in ways that challenge our predictive capabilities. Contemporary environmental science increasingly recognizes that we have entered the Anthropocene—a geological epoch characterized by humanity's dominant influence on planetary processes. This paradigm shift necessitates transdisciplinary approaches that integrate natural sciences with social, economic, and ethical dimensions of environmental stewardship. The concept of planetary boundaries provides a framework for identifying safe operating spaces for human development, while acknowledging that certain thresholds, once crossed, may trigger non-linear and potentially irreversible changes in Earth systems.`,
        `The emergent field of ecological economics challenges fundamental assumptions underlying conventional economic theory by reconceptualizing the economy as a subsystem of the finite biosphere rather than an independent entity capable of indefinite growth. This perspective rejects the artificial separation between economic and ecological systems, recognizing that all economic activity ultimately depends on natural resources and ecosystem services that cannot be fully substituted by manufactured capital. Ecological economists advocate for alternative metrics beyond Gross Domestic Product that account for natural capital depreciation and distribution of wealth, while questioning the primacy of efficiency over resilience in economic systems. The discipline's normative dimension explicitly addresses intergenerational equity and the rights of non-human species, contending that economic decisions should reflect ecological limits and ethical considerations rather than merely aggregating individual preferences expressed through markets. Implementation of ecological economics principles would fundamentally transform institutions governing production, consumption, and investment to align human economic activities with biophysical realities and normative commitments to sustainability.`,
        `The burgeoning field of restoration ecology offers promising approaches for rehabilitating degraded ecosystems, yet faces profound conceptual and practical challenges in an era of rapid environmental change. Traditional restoration paradigms that aim to return ecosystems to historical reference conditions have been problematized by recognition that climate change and other anthropogenic drivers are creating novel environmental conditions without historical analogues. Contemporary restoration science increasingly embraces the concept of functional restoration—focusing on ecosystem processes and services rather than specific compositional targets—and forward-looking approaches that consider future environmental conditions rather than past baselines. The practice of ecological restoration spans scales from local interventions such as reintroducing keystone species to landscape-level initiatives reconnecting fragmented habitats and watershed-scale hydrological restoration. Successful implementation requires integrating scientific understanding with socioeconomic considerations and indigenous ecological knowledge, recognizing that restored ecosystems must be compatible with human livelihoods and cultural values to ensure long-term sustainability.`,
      ],
      C2: [
        `The inexorable anthropogenic reconfiguration of Earth's biophysical systems constitutes not merely an environmental crisis but an ontological rupture in the relationship between humanity and the more-than-human world—a profound disruption that transcends conventional disciplinary boundaries and challenges the fundamental epistemological frameworks through which we apprehend ecological phenomena. The reductionist paradigms that have historically dominated environmental science prove increasingly inadequate for comprehending the emergent properties of complex adaptive systems characterized by non-linear dynamics, cross-scale interactions, and teleconnections between seemingly disparate processes. Contemporary scholarship on socio-ecological resilience emphasizes the need to conceptualize human societies as embedded within, rather than separate from, the biogeochemical cycles and evolutionary processes that sustain planetary habitability. This reconceptualization necessitates a radical transformation of governance structures, economic systems, and cultural narratives—moving beyond anthropocentric models of environmental management toward biocentric approaches that recognize the intrinsic value and agency of non-human entities and ecological communities.`,
        `The Anthropocene epoch engenders a profound reconsideration of temporality in environmental thought, as human activities inscribe signatures in geological strata that will persist for millennia while simultaneously accelerating ecological processes that previously unfolded over evolutionary timescales. This temporal disjunction—between the ephemeral horizons of political and economic decision-making and the multi-generational consequences of contemporary environmental perturbations—presents formidable challenges for governance institutions predicated on short-term electoral or financial cycles. The concept of intergenerational environmental justice acquires heightened salience in this context, problematizing conventional ethical frameworks that privilege present interests and discount future outcomes. Concurrently, the compression of evolutionary timescales through anthropogenic selection pressures—from antibiotic resistance to climate-driven adaptation—disrupts ecological communities and tests the adaptive capacity of species with longer generation times. Navigating this reconfigured temporal landscape requires novel institutional architectures capable of representing future generations and non-human interests, alongside epistemological approaches that integrate paleoenvironmental insights with anticipatory modeling of unprecedented future conditions.`,
        `The philosophical underpinnings of contemporary environmental ethics reveal profound tensions between anthropocentric, biocentric, and ecocentric value paradigms—tensions that manifest concretely in divergent approaches to conservation policy, resource management, and technological assessment. Anthropocentric frameworks, whether grounded in utilitarian calculations of ecosystem services or deontological conceptions of intergenerational justice, ultimately subordinate non-human interests to human flourishing. In contrast, biocentric perspectives extend moral consideration to all living entities based on their intrinsic value independent of human interests, while ecocentric approaches privilege the integrity and resilience of ecological systems over individual organisms. These competing normative frameworks yield markedly different prescriptions regarding wilderness preservation, wildlife management, and acceptable levels of environmental risk. The emerging field of multispecies ethics further complicates this landscape by challenging the very possibility of disentangling human and non-human interests in deeply interconnected ecological communities. Resolving these philosophical tensions—or developing governance mechanisms that accommodate irreducible normative pluralism—represents a prerequisite for coherent environmental policy in an era of unprecedented anthropogenic influence on planetary systems.`,
      ],
    },
    health: {
      A1: [
        `Health is important for everyone. We need to eat good food. Fruits and vegetables are healthy. We should drink water every day. Sleep helps our body rest. Exercise makes us strong. Doctors help when we are sick. Washing hands stops germs. Teeth need brushing twice a day. Being healthy makes us happy.`,
        `Our body needs good care. We must eat healthy food. Apples and carrots are good for us. We need to sleep well at night. Playing sports makes us strong. Walking is good exercise too. We should wash our hands often. Clean hands stop sickness. Doctors check our health. They help us feel better.`,
        `Staying healthy is important. We should eat good meals. Vegetables help us grow. Fruit gives us vitamins. Water is better than soda. We need to sleep eight hours. Exercise helps our heart. Running and jumping are fun. We should take baths. Clean bodies are healthy bodies.`,
      ],
      A2: [
        `Staying healthy requires good habits. A balanced diet gives us energy and nutrients. We should eat different types of food. Exercise is important for our heart and muscles. Adults need about 30 minutes of activity each day. Sleep helps our body and mind recover. Most people need 7-8 hours of sleep. Stress can make us sick. Talking about problems helps reduce stress. Regular check-ups can find health issues early. Prevention is better than treatment.`,
        `Mental health is as important as physical health. Everyone feels sad or worried sometimes. Talking about feelings helps us feel better. Friends and family can support us. Some people need help from doctors for mental health. Getting enough sleep improves our mood. Exercise can reduce stress and anxiety. Hobbies and activities we enjoy are good for mental health. It's important to take breaks from work and study. Being kind to ourselves helps our mental wellbeing.`,
        `Good nutrition is the foundation of health. Our bodies need different nutrients to work properly. Proteins help build and repair muscles. Carbohydrates give us energy for daily activities. Fruits and vegetables contain important vitamins and minerals. Drinking enough water keeps our bodies working well. Too much sugar and salt can cause health problems. Whole foods are better than processed foods. Reading food labels helps us make better choices. Small changes in diet can make a big difference to our health.`,
      ],
      B1: [
        `Maintaining good health involves multiple aspects of our lifestyle, including nutrition, physical activity, and mental wellbeing. Nutritionists recommend eating a variety of foods to ensure we get all necessary vitamins and minerals. Regular exercise has been shown to reduce the risk of many chronic diseases, including heart disease and diabetes. It also improves mood and energy levels. Mental health is equally important, with stress management techniques such as meditation becoming increasingly popular. Healthcare professionals emphasize the importance of preventive measures like vaccinations and regular screenings. With increasing life expectancy, many people are focusing not just on living longer, but maintaining quality of life as they age. Public health initiatives aim to educate communities about these important health factors.`,
        `The relationship between diet and health has become a major focus of medical research in recent years. Studies have shown that what we eat affects not only our physical health but also our mental wellbeing. The Mediterranean diet, rich in fruits, vegetables, whole grains, and olive oil, has been associated with lower rates of heart disease and certain cancers. Meanwhile, excessive consumption of processed foods high in sugar and unhealthy fats has been linked to obesity, type 2 diabetes, and other chronic conditions. Nutritional needs vary throughout life, with children, pregnant women, and older adults having specific requirements. Food allergies and intolerances also affect dietary choices for many people. Personalized nutrition, based on individual genetic factors and health status, is an emerging field that may transform dietary recommendations in the future.`,
        `Sleep plays a crucial role in overall health, yet many people struggle with sleep disorders or simply don't prioritize getting enough rest. During sleep, the body performs essential functions including tissue repair, memory consolidation, and immune system strengthening. Chronic sleep deprivation has been linked to serious health problems including increased risk of heart disease, diabetes, and depression. The quality of sleep is as important as the quantity, with deep sleep and REM (rapid eye movement) sleep phases being particularly important for cognitive function. Common sleep disruptors include stress, caffeine, alcohol, and electronic devices used before bedtime. Establishing a regular sleep schedule and creating a restful environment can significantly improve sleep quality. For those with persistent sleep problems, medical treatments and therapies are available to address specific sleep disorders.`,
      ],
      B2: [
        `The multifaceted nature of human health encompasses physiological, psychological, and social dimensions that interact in complex ways throughout the lifespan. Contemporary medical research has shifted from a predominantly disease-focused model toward a more holistic understanding of wellbeing that acknowledges the bidirectional relationship between physical and mental health. Emerging evidence in psychoneuroimmunology demonstrates how psychological states influence immune function, while the gut-brain axis reveals intricate connections between digestive health and cognitive processes. Preventive healthcare strategies increasingly incorporate behavioral economics and social psychology to address the challenges of lifestyle modification, recognizing that knowledge alone rarely translates to sustained behavioral change. The social determinants of health—including economic stability, education access, neighborhood characteristics, and social support networks—often exert more profound influences on population health outcomes than medical interventions, highlighting the need for interdisciplinary approaches to public health challenges.`,
        `The exponential advancement of medical technologies is transforming healthcare delivery while simultaneously raising profound ethical and societal questions. Precision medicine approaches, which tailor treatments based on individual genetic profiles, microbiomes, and environmental exposures, promise unprecedented therapeutic efficacy but challenge traditional clinical trial methodologies and exacerbate concerns about healthcare disparities. Artificial intelligence applications in diagnostic imaging and clinical decision support demonstrate remarkable accuracy in specific domains yet raise questions about algorithmic transparency, practitioner deskilling, and appropriate human oversight. Telemedicine and remote monitoring technologies expand healthcare access for underserved populations but potentially compromise the therapeutic relationship and patient privacy. CRISPR and related gene-editing technologies offer revolutionary potential for addressing genetic disorders while simultaneously raising concerns about unintended consequences and equitable access. Navigating these technological frontiers requires robust bioethical frameworks that balance innovation with precaution and individual benefit with societal implications.`,
        `The global burden of non-communicable diseases presents unprecedented challenges for healthcare systems designed primarily to address acute conditions rather than manage chronic illnesses across decades. Cardiovascular disease, cancer, diabetes, and chronic respiratory conditions collectively account for the majority of mortality worldwide, with prevalence increasing in low and middle-income countries undergoing epidemiological transition. These conditions share common risk factors—including tobacco use, physical inactivity, unhealthy diet, and harmful alcohol consumption—that are deeply embedded in social and economic contexts. Prevention strategies require policy interventions across multiple sectors, from urban planning that facilitates physical activity to agricultural policies that improve food affordability and nutritional quality. For those already living with chronic conditions, healthcare delivery models are evolving toward integrated, patient-centered approaches that emphasize self-management support, care coordination, and leveraging community resources. Digital health tools offer promising avenues for personalized chronic disease management while raising questions about the digital divide and data governance.`,
      ],
      C1: [
        `The paradigmatic evolution in health sciences from reductionist models toward systems-based approaches reflects a growing recognition of the emergent properties that characterize human physiological and pathological states. Contemporary precision medicine endeavors to integrate multi-omic data streams—genomic, proteomic, metabolomic, and exposomic profiles—with sophisticated computational methods to elucidate the idiosyncratic mechanisms underlying individual health trajectories. This personalized framework challenges the conventional categorization of diseases based on phenomenological similarities, instead reconceptualizing pathological conditions as perturbations in molecular networks with heterogeneous manifestations. Concurrently, population health researchers increasingly employ complex adaptive systems theory to model the non-linear interactions between biological vulnerabilities, behavioral patterns, and socioeconomic contexts that collectively determine health disparities across demographic groups. The epigenetic embedding of early life experiences further illuminates how social and environmental factors become biologically incorporated, influencing physiological regulation and disease susceptibility through mechanisms that may persist across generations.`,
        `The emergent field of planetary health conceptualizes human wellbeing as inextricably linked to the integrity of Earth's natural systems, transcending traditional boundaries between environmental science and public health. This transdisciplinary framework examines how anthropogenic environmental changes—including climate disruption, biodiversity loss, land use transformation, and chemical pollution—impact human health through multiple pathways, from direct physiological effects to cascading ecological disruptions that undermine food security and water availability. The planetary health perspective necessitates expanding temporal and spatial scales of analysis beyond conventional epidemiological approaches, considering intergenerational health implications and global teleconnections between local actions and distant outcomes. Implementation of this paradigm requires novel governance structures that integrate health considerations into environmental decision-making across sectors and scales, while acknowledging the differential vulnerability of populations to environmental health threats based on geographic location, socioeconomic status, and adaptive capacity.`,
        `The microbiome revolution has fundamentally transformed our understanding of human physiology, revealing the profound influence of commensal microbial communities on virtually all aspects of health and disease. The trillions of microorganisms inhabiting the human gut, skin, and mucosal surfaces constitute a dynamic ecosystem that interacts continuously with host cells through metabolic exchanges, immune system modulation, and neurological signaling pathways. Perturbations in microbial community composition and function—termed dysbiosis—have been implicated in conditions ranging from inflammatory bowel disease and metabolic disorders to neuropsychiatric conditions, challenging traditional notions of disease etiology. Emerging therapeutic approaches targeting the microbiome include precision probiotics, prebiotics tailored to promote beneficial microbial metabolites, fecal microbiota transplantation, and phage therapy to selectively modulate bacterial populations. The microbiome perspective necessitates reconceptualizing humans as composite organisms comprising both human and microbial cells, with important implications for personalized medicine, public health interventions, and even definitions of self and identity.`,
      ],
      C2: [
        `The epistemological foundations of contemporary health sciences are undergoing a profound reconfiguration as the limitations of Cartesian dualism and mechanistic reductionism become increasingly apparent in addressing the multidimensional complexities of human wellbeing. The artificial bifurcation between somatic and psychological domains—a conceptual artifact of biomedical history rather than an ontological reality—has gradually yielded to more integrative paradigms that recognize the recursive causality between phenomenological experience and physiological processes. Advances in systems biology, network medicine, and computational modeling have facilitated the conceptualization of health as an emergent property arising from dynamic interactions across multiple biological scales, from molecular signaling pathways to cellular networks, organ systems, and ultimately the embodied person embedded within particular sociocultural contexts. This ontological reframing necessitates methodological pluralism that transcends the limitations of randomized controlled trials—designed to isolate singular causal mechanisms—toward approaches capable of capturing the contextual contingencies and non-linear dynamics characteristic of complex adaptive systems. The nascent field of implementation science further illuminates the chasm between efficacy in controlled research environments and effectiveness in real-world settings, highlighting how intervention outcomes are inextricably shaped by the sociotechnical ecosystems in which they are deployed.`,
        `The evolving discourse on health equity reveals fundamental tensions between competing philosophical frameworks regarding the nature of justice in healthcare resource allocation and the appropriate scope of societal obligations toward collective wellbeing. Utilitarian approaches that prioritize maximizing aggregate health outcomes frequently conflict with egalitarian perspectives emphasizing the reduction of health disparities between demographic groups, while libertarian frameworks privilege individual autonomy and market mechanisms over distributive concerns. These theoretical divergences manifest concretely in policy debates regarding universal healthcare access, priority-setting in resource-constrained environments, and the permissible extent of paternalistic public health interventions. Contemporary health justice scholarship increasingly incorporates capabilities approaches that conceptualize health not merely as the absence of disease but as the substantive freedom to achieve valued functionings, recognizing that identical healthcare services may yield disparate outcomes across populations with different conversion capacities. The COVID-19 pandemic has foregrounded these ethical tensions, revealing how ostensibly neutral triage protocols and vaccination distribution strategies often reproduce and amplify existing social inequities through their failure to account for differential vulnerability, exposure risk, and structural constraints on individual health behaviors.`,
        `The ontological status of psychiatric categories presents profound epistemological challenges that transcend conventional biomedical frameworks, problematizing the very distinction between normal variation and pathological states in the domain of mental phenomena. Unlike many somatic conditions with identifiable physiological markers, psychiatric diagnoses remain largely constituted through phenomenological descriptions of subjective experience and observable behavior, raising fundamental questions about their construct validity and the appropriate criteria for differentiating clinical entities. The tension between categorical and dimensional conceptualizations of psychopathology reflects deeper philosophical questions regarding the nature of mental kinds—whether they represent natural categories with discrete boundaries or pragmatic constructions imposed upon continuous spectra of human experience. Neuroscientific advances have further complicated this landscape by revealing transdiagnostic patterns of neural circuit dysfunction that cut across traditional diagnostic boundaries, suggesting the need for alternative nosological frameworks grounded in underlying biological mechanisms rather than symptom clusters. These conceptual challenges have profound implications for clinical practice, research methodology, and the lived experience of individuals navigating psychiatric diagnosis and treatment within healthcare systems and broader sociocultural contexts that continue to stigmatize mental distress through implicit mind-body dualism and assumptions of volitional control.`,
      ],
    },
  }

  // 현재 주제에 따른 샘플 텍스트 선택
  const topicKeys = Object.keys(sampleTexts) as Array<keyof typeof sampleTexts>
  const currentTopic = topicKeys[currentTopicIndex % topicKeys.length] // 범위를 벗어나지 않도록 수정
  const sampleText = getRandomSampleText(currentTopic, currentLevel)

  // 샘플 텍스트를 선택하는 함수 - 랜덤 요소 추가
  function getRandomSampleText(category: keyof typeof sampleTexts, level: string) {
    const textsForLevel = sampleTexts[category][level]
    if (!textsForLevel || textsForLevel.length === 0) {
      return "Sample text not available for this level."
    }

    // 랜덤 인덱스 생성 (랜덤 시드 사용)
    const randomIndex = Math.floor(randomSeed * textsForLevel.length)
    return textsForLevel[randomIndex]
  }

  // 텍스트를 단어 배열로 변환
  const words = sampleText
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
          // 새로운 랜덤 시드 생성
          setRandomSeed(Math.random())
        } else {
          // 이미 최고 레벨이면 평가 완료
          setFinalLevel(currentLevel)
          setAssessmentComplete(true)
          // 학습 URL 생성
          setLearningUrl(`/learning?topic=${encodeURIComponent(rawTopic)}&level=${currentLevel}`)
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
          // 새로운 랜덤 시드 생성
          setRandomSeed(Math.random())
        } else {
          // 이미 최저 레벨이면 평가 완료
          setFinalLevel(currentLevel)
          setAssessmentComplete(true)
          // 학습 URL 생성
          setLearningUrl(`/learning?topic=${encodeURIComponent(rawTopic)}&level=${currentLevel}`)
        }
      } else {
        // 3-5% 사이면 적절한 레벨 찾음
        setFinalLevel(currentLevel)
        setAssessmentComplete(true)
        // 학습 URL 생성
        setLearningUrl(`/learning?topic=${encodeURIComponent(rawTopic)}&level=${currentLevel}`)
      }
    }, 1500)
  }

  // 학습 시작 함수 - 직접 링크 사용
  const handleStartLearning = () => {
    // 로컬 스토리지에 평가 결과 저장
    try {
      localStorage.setItem(
        "lastAssessment",
        JSON.stringify({
          topic: rawTopic,
          level: finalLevel,
          timestamp: new Date().toISOString(),
        }),
      )
    } catch (error) {
      console.error("Failed to save assessment to local storage:", error)
    }

    // 학습 페이지로 이동
    router.push(learningUrl)
  }

  // 오류 화면 렌더링
  if (error) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Card className="border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl">{t("error")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
              <p className="text-red-700">{error}</p>
            </div>
            <div className="flex justify-center">
              <Button onClick={() => router.push("/settings")}>{t("go_to_settings")}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 로딩 화면 렌더링
  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-lg font-medium">{t("loading")}</p>
          <p className="text-sm text-muted-foreground">{t("please_wait")}</p>
        </div>
      </div>
    )
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
                  {t("topic")}: <span className="font-medium text-foreground">{t(topic) || topic}</span>
                </p>
                <p className="text-muted-foreground">
                  {t("level_assessment_title")}:{" "}
                  <Badge variant="outline" className="ml-1 text-lg font-bold">
                    {finalLevel}
                  </Badge>
                </p>
              </div>
            </div>
            {/* 직접 링크 사용 */}
            <Link href={learningUrl} onClick={handleStartLearning} passHref>
              <Button className="w-full" asChild>
                <a>{t("start_learning")}</a>
              </Button>
            </Link>
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
              <p className="text-sm mt-2 text-muted-foreground">
                {t("unknown_words_percentage")}: {((selectedWords.length / words.length) * 100).toFixed(1)}%
              </p>
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <Button onClick={handleSubmit}>{t("submit")}</Button>
          </div>

          {assessmentHistory.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-medium mb-2">{t("level_assessment_history")}:</h3>
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
