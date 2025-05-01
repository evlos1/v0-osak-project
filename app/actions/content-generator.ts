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
    }[]
    sentences: {
      relatedSentence?: string
      question: string
      options: string[]
      answer: number
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
export async function generateLearningContent(topic: string, level: string, apiKey: string): Promise<GeneratedContent> {
  // 캐시 키 생성 (타임스탬프 파라미터가 있으면 제거하여 캐시 무시)
  const cleanTopic = topic.split("?")[0]
  const cacheKey = `${cleanTopic}-${level}`

  // 타임스탬프 파라미터가 있으면 캐시를 무시하고 새로 생성
  const shouldIgnoreCache = topic.includes("?t=")

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

    const prompt = `
주제: "${cleanTopic}"
영어 레벨: "${level}" (CEFR 기준)

당신은 영어 교육 전문가입니다. 위 주제와 레벨에 맞는 영어 학습 콘텐츠를 생성해주세요.
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
      "structure": "첫 번째 문장의 문법 구조 설명",
      "explanation": "첫 번째 문장의 의미와 해석"
    },
    "1": {
      "structure": "두 번째 문장의 문법 구조 설명",
      "explanation": "두 번째 문장의 의미와 해석"
    }
  },
  "passageExplanation": {
    "theme": "지문의 주제 (한글로 작성)",
    "structure": "지문의 구조적 패턴 (서론-본론-결론, 비교-대조, 원인-결과, 문제-해결 등의 organizing pattern을 한글로 설명)",
    "translation": "지문 전체의 한글 해석 (문장별로 번역하지 말고 자연스러운 한국어로 전체 내용을 번역)"
  },
  "quizzes": {
    "words": [
      {
        "question": "지문에 나온 단어에 관한 질문",
        "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
        "answer": 정답 인덱스(0-3)
      },
      {
        "question": "지문에 나온 다른 단어에 관한 질문",
        "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
        "answer": 정답 인덱스(0-3)
      }
    ],
    "sentences": [
      {
        "relatedSentence": "문제와 관련된 원문 영어 문장",
        "question": "지문에 나온 문장에 관한 질문",
        "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
        "answer": 정답 인덱스(0-3)
      },
      {
        "relatedSentence": "문제와 관련된 원문 영어 문장",
        "question": "지문에 나온 다른 문장에 관한 질문",
        "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
        "answer": 정답 인덱스(0-3)
      }
    ],
    "passage": [
      {
        "question": "지문 전체 내용에 관한 질문",
        "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
        "answer": 정답 인덱스(0-3)
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
7. passageExplanation의 theme과 structure는 한글로 작성하고, translation은 지문 전체를 자연스러운 한국어로 번역해주세요.
8. 지문 퀴즈는 한 개만 생성해주세요.
9. 매번 새로운 내용으로 생성해주세요. 이전에 생성한 내용과 중복되지 않도록 해주세요.
`

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
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      },
    }

    console.log("콘텐츠 생성 요청:", cleanTopic, level)

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
      throw new Error("API 응답에서 JSON 형식을 찾을 수 없습니다.")
    }

    try {
      const result = JSON.parse(jsonMatch[0]) as GeneratedContent

      // 캐시에 저장 (타임스탬프 파라미터가 있어도 캐시는 함)
      contentCache[cacheKey] = result

      return result
    } catch (parseError) {
      console.error("JSON 파싱 오류:", parseError)
      throw new Error("API 응답을 파싱할 수 없습니다.")
    }
  } catch (error) {
    console.error("콘텐츠 생성 오류:", error)

    // 오류 발생 시 기본 콘텐츠 반환
    return getDefaultContent(cleanTopic, level, error instanceof Error ? error.message : "알 수 없는 오류")
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
function getDefaultContent(topic: string, level: string, errorMessage: string): GeneratedContent {
  return {
    title: `${topic} (${level} 레벨)`,
    passage: "AI가 지문을 생성하는 중 오류가 발생했습니다. 다시 시도하거나 다른 주제를 선택해보세요.",
    sentences: ["AI가 문장을 생성하는 중 오류가 발생했습니다."],
    sentenceExplanations: {
      0: {
        structure: "문장 구조를 불러올 수 없습니다.",
        explanation: "문장 설명을 불러올 수 없습니다.",
      },
    },
    passageExplanation: {
      theme: topic,
      structure: "지문 구조를 불러올 수 없습니다.",
      translation: "지문 해석을 불러올 수 없습니다.",
    },
    quizzes: {
      words: [
        {
          question: "퀴즈를 불러올 수 없습니다.",
          options: ["오류 발생", "다시 시도", "API 키 확인", "다른 주제 선택"],
          answer: 1,
        },
      ],
      sentences: [
        {
          question: "퀴즈를 불러올 수 없습니다.",
          options: ["오류 발생", "다시 시도", "API 키 확인", "다른 주제 선택"],
          answer: 1,
        },
      ],
      passage: [
        {
          question: "퀴즈를 불러올 수 없습니다.",
          options: ["오류 발생", "다시 시도", "API 키 확인", "다른 주제 선택"],
          answer: 1,
        },
      ],
    },
    error: errorMessage,
  }
}
