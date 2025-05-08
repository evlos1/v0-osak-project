"use server"

export type GeneratedContent = {
  title: string
  passage: string
  sentences: string[]
  sentenceExplanations: Record<number, { structure: string; explanation: string }>
  passageExplanation: {
    theme: string
    structure: string
    translation: string // summary를 translation으로 변경
  }
  quizzes: {
    words: {
      question: string
      options: string[]
      answer: number
      questionType?: "fill-in-blank" | "meaning" // 문제 유형 추가
    }[]
    sentences: {
      relatedSentence?: string
      question: string
      options: string[]
      answer: number
      questionType?: "comprehension" | "structure" // 문제 유형 추가
    }[]
    passage: {
      question: string
      options: string[]
      answer: number
    }[]
  }
  loading?: boolean
  error?: string
}

// 캐싱을 위한 저장소
const contentCache: Record<string, GeneratedContent> = {}

// Google Gemini API를 사용하여 학습 콘텐츠 생성
export async function generateLearningContent(
  topic: string,
  level: string,
  apiKey: string,
  language = "ko", // 기본값은 한국어
): Promise<GeneratedContent> {
  // 콘텐츠 생성 함수를 수정하여 새로운 지문이 확실히 생성되도록 합니다.

  // generateLearningContent 함수의 캐시 키 생성 부분을 수정합니다:
  // 캐시 키 생성 (타임스탬프와 카운트 파라미터가 있으면 제거하여 캐시 무시)
  const cleanTopic = topic.split("?")[0]
  const cacheKey = `${cleanTopic}-${level}-${language}` // 언어를 캐시 키에 추가

  // 타임스탬프 또는 카운트 파라미터가 있으면 캐시를 무시하고 새로 생성
  const shouldIgnoreCache = topic.includes("?t=") || topic.includes("&count=")

  // 캐시된 콘텐츠가 있고 캐시를 무시하지 않으면 반환
  if (!shouldIgnoreCache && contentCache[cacheKey]) {
    return contentCache[cacheKey]
  }

  try {
    // 레벨에 따른 지문 길이와 복잡성 조정
    const wordCount = getWordCountByLevel(level)
    const complexity = getComplexityByLevel(level)

    // API 엔드포인트
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`

    // 언어에 따른 프롬프트 조정
    let promptLanguage = "한국어" // 기본값
    if (language === "en") promptLanguage = "영어"
    else if (language === "zh") promptLanguage = "중국어"

    // 프롬프트 부분에 다음 내용을 추가합니다:
    const prompt = `
주제: "${cleanTopic}"
영어 레벨: "${level}" (CEFR 기준)
출력 언어: "${promptLanguage}" (사용자 인터페이스 언어)

당신은 영어 교육 전문가입니다. 위 주제와 레벨에 맞는 영어 학습 콘텐츠를 생성해주세요.
중요: 모든 설명, 해석, 문제, 선택지 등은 "${promptLanguage}"로 작성해주세요.

다음 JSON 형식으로 응답해주세요:

{
  "title": "${cleanTopic}에 관한 ${level} 레벨 지문 제목",
  "passage": "${wordCount}단어 내외의 ${level} 레벨에 맞는 영어 지문",
  "sentences": [
    "지문에서 추출한 중요 문장 1",
    "지문에서 추출한 중요 문장 2",
    "지문에서 추출한 중요 문장 3",
    "지문에서 추출한 중요 문장 4",
    "지문에서 추출한 중요 문장 5"
  ],
  "sentenceExplanations": {
    "0": {
      "structure": "첫 번째 문장의 문법 구조 설명 (${promptLanguage}로 작성)",
      "explanation": "첫 번째 문장의 의미와 해석 (${promptLanguage}로 작성)"
    },
    "1": {
      "structure": "두 번째 문장의 문법 구조 설명 (${promptLanguage}로 작성)",
      "explanation": "두 번째 문장의 의미와 해석 (${promptLanguage}로 작성)"
    }
  },
  "passageExplanation": {
    "theme": "지문의 주제 (${promptLanguage}로 작성)",
    "structure": "지문의 구조적 패턴 (서론-본론-결론, 비교-대조, 원인-결과, 문제-해결 등의 organizing pattern을 ${promptLanguage}로 설명)",
    "translation": "지문 전체의 ${promptLanguage} 해석 (문장별로 번역하지 말고 자연스러운 ${promptLanguage}로 전체 내용을 번역)"
  },
  "quizzes": {
    "words": [
      {
        "questionType": "fill-in-blank",
        "question": "다음 문장에서 빈칸에 들어갈 가장 적절한 단어는 무엇인가요? 'The scientist conducted an _____ to test the new theory.' (${promptLanguage}로 작성)",
        "options": ["선택지1 (${promptLanguage}로 작성)", "선택지2 (${promptLanguage}로 작성)", "선택지3 (${promptLanguage}로 작성)", "선택지4 (${promptLanguage}로 작성)"],
        "answer": 0
      },
      {
        "questionType": "meaning",
        "question": "단어 'experiment'의 의미로 가장 적절한 것은? (${promptLanguage}로 작성)",
        "options": ["선택지1 (${promptLanguage}로 작성)", "선택지2 (${promptLanguage}로 작성)", "선택지3 (${promptLanguage}로 작성)", "선택지4 (${promptLanguage}로 작성)"],
        "answer": 0
      }
    ],
    "sentences": [
      {
        "questionType": "comprehension",
        "relatedSentence": "문제와 관련된 원문 영어 문장",
        "question": "위 문장의 의미로 가장 적절한 것은? (${promptLanguage}로 작성)",
        "options": ["선택지1 (${promptLanguage}로 작성)", "선택지2 (${promptLanguage}로 작성)", "선택지3 (${promptLanguage}로 작성)", "선택지4 (${promptLanguage}로 작성)"],
        "answer": 0
      },
      {
        "questionType": "structure",
        "relatedSentence": "문제와 관련된 원문 영어 문장",
        "question": "위 문장의 구조에 대한 설명으로 옳은 것은? (${promptLanguage}로 작성)",
        "options": ["선택지1 (${promptLanguage}로 작성)", "선택지2 (${promptLanguage}로 작성)", "선택지3 (${promptLanguage}로 작성)", "선택지4 (${promptLanguage}로 작성)"],
        "answer": 0
      }
    ],
    "passage": [
      {
        "question": "지문 전체 내용에 관한 질문 (${promptLanguage}로 작성)",
        "options": ["선택지1 (${promptLanguage}로 작성)", "선택지2 (${promptLanguage}로 작성)", "선택지3 (${promptLanguage}로 작성)", "선택지4 (${promptLanguage}로 작성)"],
        "answer": 0
      }
    ]
  }
}

중요 사항:
1. ${level} 레벨에 맞는 어휘와 문법을 사용하세요.
2. 지문은 ${cleanTopic}에 관한 내용이어야 합니다.
3. 문장은 지문에서 실제로 추출한 것이어야 합니다.
4. 퀴즈 문제는 실제 지문 내용을 기반으로 해야 합니다.
5. 모든 필드를 빠짐없이 채워주세요.
6. 응답은 반드시 유효한 JSON 형식이어야 합니다.
7. passageExplanation의 theme과 structure는 ${promptLanguage}로 작성하고, translation은 지문 전체를 자연스러운 ${promptLanguage}로 번역해주세요.
8. 지문 퀴즈는 한 개만 생성해주세요.
9. 매번 새로운 내용으로 생성해주세요. 이전에 생성한 내용과 중복되지 않도록 해주세요.
10. 완전히 새로운 지문과 문장, 퀴즈를 생성해주세요. 이전에 생성된 내용과 유사하지 않도록 주제 내에서 다른 관점이나 측면을 다루세요.
11. 타임스탬프: ${Date.now()} - 이 값을 참고하여 매번 다른 내용을 생성해주세요.
12. 단어 퀴즈는 다음 두 가지 유형으로 생성해주세요:
    - fill-in-blank: 지문 속에서 어떤 단어가 들어가야 하는지를 묻는 문제
    - meaning: 단어의 의미를 구별하는 문제
13. 문장 퀴즈는 다음 두 가지 유형으로 생성해주세요:
    - comprehension: 문장의 의미를 이해했는지를 묻는 문제 (모든 문장에 대해)
    - structure: 복잡한 문장일 때만 문장의 구조를 묻는 문제
14. 모든 설명, 문제, 선택지는 반드시 ${promptLanguage}로 작성해주세요.
15. 정답 인덱스는 반드시 0, 1, 2, 3 중 하나의 숫자로 작성해주세요.
16. 모든 JSON 속성 이름과 값은 반드시 큰따옴표(")로 감싸주세요.
17. 특수 문자나 이스케이프 문자를 사용할 때는 올바른 JSON 형식을 유지해주세요.
18. 따옴표 안에 따옴표를 사용할 때는 반드시 이스케이프 처리를 해주세요. 예: "He said \\"Hello\\""
`

    // 생성 설정에서 temperature를 높여 더 다양한 결과가 나오도록 합니다:
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.9, // 0.7에서 0.9로 증가
        topP: 0.9, // 0.8에서 0.9로 증가
        topK: 40,
        maxOutputTokens: 2048,
      },
    }

    console.log("콘텐츠 생성 요청:", cleanTopic, level, language)

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("API 응답 오류:", response.status, errorText)
      throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!textContent) {
      throw new Error("API 응답에서 텍스트를 찾을 수 없습니다.")
    }

    // JSON 형식 추출 (중괄호 사이의 내용)
    const jsonMatch = textContent.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error("JSON 형식을 찾을 수 없음:", textContent)
      throw new Error("API 응답에서 JSON 형식을 찾을 수 없습니다.")
    }

    try {
      // 여러 단계의 JSON 정리 시도
      let parsedContent: GeneratedContent | null = null
      let errorMessage = ""

      // 1. 첫 번째 시도: 직접 파싱
      try {
        parsedContent = JSON.parse(jsonMatch[0]) as GeneratedContent
        console.log("직접 파싱 성공")
      } catch (error) {
        errorMessage = error instanceof Error ? error.message : "JSON 파싱 오류"
        console.log("직접 파싱 실패:", errorMessage)
      }

      // 2. 두 번째 시도: 기본 정리 후 파싱
      if (!parsedContent) {
        try {
          const basicCleaned = basicJsonCleaning(jsonMatch[0])
          parsedContent = JSON.parse(basicCleaned) as GeneratedContent
          console.log("기본 정리 후 파싱 성공")
        } catch (error) {
          errorMessage = error instanceof Error ? error.message : "JSON 파싱 오류"
          console.log("기본 정리 후 파싱 실패:", errorMessage)
        }
      }

      // 3. 세 번째 시도: 고급 정리 후 파싱
      if (!parsedContent) {
        try {
          const advancedCleaned = advancedJsonCleaning(jsonMatch[0])
          parsedContent = JSON.parse(advancedCleaned) as GeneratedContent
          console.log("고급 정리 후 파싱 성공")
        } catch (error) {
          errorMessage = error instanceof Error ? error.message : "JSON 파싱 오류"
          console.log("고급 정리 후 파싱 실패:", errorMessage)
        }
      }

      // 4. 네 번째 시도: 정규식 기반 파싱
      if (!parsedContent) {
        try {
          parsedContent = regexBasedParsing(jsonMatch[0])
          console.log("정규식 기반 파싱 성공")
        } catch (error) {
          errorMessage = error instanceof Error ? error.message : "JSON 파싱 오류"
          console.log("정규식 기반 파싱 실패:", errorMessage)
        }
      }

      // 5. 마지막 시도: 기본 템플릿 사용
      if (!parsedContent) {
        console.log("모든 파싱 시도 실패, 기본 템플릿 사용")
        parsedContent = getDefaultContent(cleanTopic, level, errorMessage, language)
      }

      // 필수 필드 검증
      validateGeneratedContent(parsedContent)

      // 캐시에 저장
      contentCache[cacheKey] = parsedContent

      return parsedContent
    } catch (parseError) {
      console.error("JSON 파싱 오류:", parseError)
      console.error("원본 JSON 문자열:", jsonMatch[0].substring(0, 100) + "...")

      // 오류 발생 시 기본 콘텐츠 반환
      return getDefaultContent(
        cleanTopic,
        level,
        parseError instanceof Error ? parseError.message : "JSON 파싱 오류",
        language,
      )
    }
  } catch (error) {
    console.error("콘텐츠 생성 오류:", error)

    // 오류 발생 시 기본 콘텐츠 반환
    return getDefaultContent(cleanTopic, level, error instanceof Error ? error.message : "알 수 없는 오류", language)
  }
}

// 기본 JSON 정리 함수
function basicJsonCleaning(jsonString: string): string {
  // 1. 문자열 앞뒤의 공백 제거
  let cleaned = jsonString.trim()

  // 2. 문자열이 '{' 로 시작하고 '}' 로 끝나는지 확인
  if (!cleaned.startsWith("{") || !cleaned.endsWith("}")) {
    // 중괄호 찾기
    const startIndex = cleaned.indexOf("{")
    const endIndex = cleaned.lastIndexOf("}")

    if (startIndex >= 0 && endIndex >= 0) {
      cleaned = cleaned.substring(startIndex, endIndex + 1)
    } else {
      throw new Error("JSON 형식이 아닙니다.")
    }
  }

  // 3. 줄바꿈 문자 처리
  cleaned = cleaned.replace(/\n/g, "\\n")

  // 4. 탭 문자 처리
  cleaned = cleaned.replace(/\t/g, "\\t")

  // 5. 콤마 처리 (마지막 속성 뒤의 콤마 제거)
  cleaned = cleaned.replace(/,\s*}/g, "}")
  cleaned = cleaned.replace(/,\s*]/g, "]")

  return cleaned
}

// 고급 JSON 정리 함수
function advancedJsonCleaning(jsonString: string): string {
  // 1. 기본 정리 적용
  let cleaned = basicJsonCleaning(jsonString)

  // 2. 따옴표 일관성 처리
  // 먼저 이스케이프된 따옴표를 임시 마커로 변환
  cleaned = cleaned.replace(/\\"/g, "ESCAPED_QUOTE")

  // 속성 이름 주변의 따옴표 처리
  cleaned = cleaned.replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3')

  // 속성 값 주변의 따옴표 처리 (문자열인 경우)
  cleaned = cleaned.replace(/:(\s*)([^{}[\],\s]+)(\s*[,}])/g, ':"$2"$3')

  // 임시 마커를 다시 이스케이프된 따옴표로 변환
  cleaned = cleaned.replace(/ESCAPED_QUOTE/g, '\\"')

  // 3. 중복 따옴표 제거
  cleaned = cleaned.replace(/""+/g, '"')

  // 4. 이스케이프되지 않은 따옴표 처리
  let result = ""
  let inString = false
  let escapeNext = false

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i]

    if (char === "\\" && !escapeNext) {
      escapeNext = true
      result += char
      continue
    }

    if (char === '"' && !escapeNext) {
      inString = !inString
    }

    result += char
    escapeNext = false
  }

  return result
}

// 정규식 기반 파싱 함수
function regexBasedParsing(jsonString: string): GeneratedContent {
  const content: GeneratedContent = {
    title: "",
    passage: "",
    sentences: [],
    sentenceExplanations: {},
    passageExplanation: {
      theme: "",
      structure: "",
      translation: "",
    },
    quizzes: {
      words: [],
      sentences: [],
      passage: [],
    },
  }

  try {
    // 제목 추출
    const titleMatch = jsonString.match(/"title"?\s*:?\s*"([^"]+)"/i)
    if (titleMatch && titleMatch[1]) {
      content.title = titleMatch[1]
    }

    // 지문 추출
    const passageMatch = jsonString.match(/"passage"?\s*:?\s*"([^"]+)"/i)
    if (passageMatch && passageMatch[1]) {
      content.passage = passageMatch[1]
    }

    // 문장 추출 (배열 형태)
    const sentencesMatch = jsonString.match(/"sentences"?\s*:?\s*\[([\s\S]*?)\]/i)
    if (sentencesMatch && sentencesMatch[1]) {
      const sentenceItems = sentencesMatch[1].match(/"([^"]+)"/g)
      if (sentenceItems) {
        content.sentences = sentenceItems.map((item) => item.replace(/"/g, ""))
      }
    }

    // 지문 설명 추출
    const themeMatch = jsonString.match(/"theme"?\s*:?\s*"([^"]+)"/i)
    if (themeMatch && themeMatch[1]) {
      content.passageExplanation.theme = themeMatch[1]
    }

    const structureMatch = jsonString.match(/"structure"?\s*:?\s*"([^"]+)"/i)
    if (structureMatch && structureMatch[1]) {
      content.passageExplanation.structure = structureMatch[1]
    }

    const translationMatch = jsonString.match(/"translation"?\s*:?\s*"([^"]+)"/i)
    if (translationMatch && translationMatch[1]) {
      content.passageExplanation.translation = translationMatch[1]
    }

    // 기본 퀴즈 추가
    content.quizzes.words.push({
      questionType: "meaning",
      question: "단어의 의미는?",
      options: ["선택지1", "선택지2", "선택지3", "선택지4"],
      answer: 0,
    })

    content.quizzes.sentences.push({
      questionType: "comprehension",
      question: "문장의 의미는?",
      options: ["선택지1", "선택지2", "선택지3", "선택지4"],
      answer: 0,
    })

    content.quizzes.passage.push({
      question: "지문의 주제는?",
      options: ["선택지1", "선택지2", "선택지3", "선택지4"],
      answer: 0,
    })

    return content
  } catch (error) {
    console.error("정규식 기반 파싱 오류:", error)
    throw error
  }
}

// JSON 유효성 검사 함수
function isValidJSON(jsonString: string): boolean {
  try {
    JSON.parse(jsonString)
    return true
  } catch (error) {
    return false
  }
}

// 생성된 콘텐츠 유효성 검사 함수
function validateGeneratedContent(content: GeneratedContent): void {
  // 필수 필드 확인
  if (!content.title) content.title = "제목 없음"
  if (!content.passage) content.passage = "내용 없음"
  if (!Array.isArray(content.sentences)) content.sentences = []
  if (!content.sentenceExplanations) content.sentenceExplanations = {}
  if (!content.passageExplanation) {
    content.passageExplanation = {
      theme: "주제 정보 없음",
      structure: "구조 정보 없음",
      translation: "번역 정보 없음",
    }
  }
  if (!content.quizzes) {
    content.quizzes = {
      words: [],
      sentences: [],
      passage: [],
    }
  }

  // 퀴즈 배열 확인
  if (!Array.isArray(content.quizzes.words)) content.quizzes.words = []
  if (!Array.isArray(content.quizzes.sentences)) content.quizzes.sentences = []
  if (!Array.isArray(content.quizzes.passage)) content.quizzes.passage = []

  // 최소한 하나의 지문 퀴즈 추가
  if (content.quizzes.passage.length === 0) {
    content.quizzes.passage.push({
      question: "지문에 관한 질문",
      options: ["선택지1", "선택지2", "선택지3", "선택지4"],
      answer: 0,
    })
  }
}

// 레벨에 따른 단어 수 결정
function getWordCountByLevel(level: string): number {
  switch (level) {
    case "A1":
      return 50
    case "A2":
      return 80
    case "B1":
      return 120
    case "B2":
      return 180
    case "C1":
      return 250
    case "C2":
      return 350
    default:
      return 120
  }
}

// 레벨에 따른 복잡성 결정
function getComplexityByLevel(level: string): string {
  switch (level) {
    case "A1":
      return "매우 간단한 어휘와 문법 구조를 사용하세요. 현재 시제 위주로 작성하세요."
    case "A2":
      return "기본적인 어휘와 간단한 문법 구조를 사용하세요. 현재와 과거 시제를 사용하세요."
    case "B1":
      return "중급 수준의 어휘와 다양한 시제를 사용하세요. 복합 문장을 포함하세요."
    case "B2":
      return "다양한 어휘와 복잡한 문법 구조를 사용하세요. 가정법과 다양한 연결사를 포함하세요."
    case "C1":
      return "고급 어휘와 복잡한 문법 구조를 사용하세요. 관용구와 숙어를 포함하세요."
    case "C2":
      return "학술적이고 전문적인 어휘와 매우 복잡한 문법 구조를 사용하세요. 다양한 수사적 표현을 포함하세요."
    default:
      return "중급 수준의 어휘와 문법을 사용하세요."
  }
}

// 오류 발생 시 기본 콘텐츠 제공
function getDefaultContent(topic: string, level: string, errorMessage: string, language = "ko"): GeneratedContent {
  // 언어에 따른 기본 메시지
  let errorText = "AI가 지문을 생성하는 중 오류가 발생했습니다. 다시 시도하거나 다른 주제를 선택해보세요."
  let notFoundText = "이 단어는 현재 사전에 등록되어 있지 않습니다."
  let noExampleText = "예문이 준비되지 않았습니다."
  let structureNotFound = "문장 구조를 불러올 수 없습니다."
  let explanationNotFound = "문장 설명을 불러올 수 없습니다."
  let translationNotFound = "지문 해석을 불러올 수 없습니다."
  let quizNotFound = "퀴즈를 불러올 수 없습니다."
  let errorOccurred = "오류 발생"
  let tryAgain = "다시 시도"
  let checkApiKey = "API 키 확인"
  let selectOtherTopic = "다른 주제 선택"

  if (language === "en") {
    errorText = "An error occurred while generating content. Please try again or select a different topic."
    notFoundText = "This word is not currently in the dictionary."
    noExampleText = "No example is available."
    structureNotFound = "Unable to load sentence structure."
    explanationNotFound = "Unable to load sentence explanation."
    translationNotFound = "Unable to load passage translation."
    quizNotFound = "Unable to load quiz."
    errorOccurred = "Error occurred"
    tryAgain = "Try again"
    checkApiKey = "Check API key"
    selectOtherTopic = "Select another topic"
  } else if (language === "zh") {
    errorText = "生成内容时发生错误。请重试或选择其他主题。"
    notFoundText = "此单词当前不在词典中。"
    noExampleText = "没有可用的例句。"
    structureNotFound = "无法加载句子结构。"
    explanationNotFound = "无法加载句子解释。"
    translationNotFound = "无法加载段落翻译。"
    quizNotFound = "无法加载测验。"
    errorOccurred = "发生错误"
    tryAgain = "重试"
    checkApiKey = "检查API密钥"
    selectOtherTopic = "选择其他主题"
  }

  return {
    title: `${topic} (${level} 레벨)`,
    passage: errorText,
    sentences: [errorText],
    sentenceExplanations: {
      0: {
        structure: structureNotFound,
        explanation: explanationNotFound,
      },
    },
    passageExplanation: {
      theme: topic,
      structure: structureNotFound,
      translation: translationNotFound,
    },
    quizzes: {
      words: [
        {
          question: quizNotFound,
          options: [errorOccurred, tryAgain, checkApiKey, selectOtherTopic],
          answer: 1,
          questionType: "meaning",
        },
      ],
      sentences: [
        {
          question: quizNotFound,
          options: [errorOccurred, tryAgain, checkApiKey, selectOtherTopic],
          answer: 1,
          questionType: "comprehension",
        },
      ],
      passage: [
        {
          question: quizNotFound,
          options: [errorOccurred, tryAgain, checkApiKey, selectOtherTopic],
          answer: 1,
        },
      ],
    },
    error: errorMessage,
  }
}
