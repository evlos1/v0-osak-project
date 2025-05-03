"use server"

export type Quiz = {
  question: string
  options: string[]
  answer: number
  relatedSentence?: string // 관련 문장 필드 추가
  questionType?: "fill-in-blank" | "meaning" | "structure" | "comprehension" // 문제 유형 추가
  difficulty?: "easy" | "medium" | "hard" // 난이도 필드 추가
}

export type QuizSet = {
  quizzes: Quiz[]
  loading?: boolean
  error?: string
}

// 캐싱을 위한 저장소
const quizCache: Record<string, QuizSet> = {}

// 선택된 단어들을 기반으로 단어 퀴즈 생성
export async function generateWordQuizzes(
  words: string[],
  wordDefinitions: Record<string, { meaning: string; example: string }>,
  apiKey: string,
  targetLanguage = "한국어",
  userLevel = "B1", // 사용자 레벨 매개변수 추가 (기본값: B1)
): Promise<QuizSet> {
  if (words.length === 0) {
    return {
      quizzes: [],
      error: "선택된 단어가 없습니다.",
    }
  }

  // 캐시 키 생성 (선택된 단어들을 정렬하여 문자열로 결합)
  const cacheKey = `word-${words.sort().join("-")}-${targetLanguage}-${userLevel}` // 레벨을 캐시 키에 추가

  // 캐시된 퀴즈가 있으면 반환
  if (quizCache[cacheKey]) {
    return quizCache[cacheKey]
  }

  try {
    // API 엔드포인트
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`

    // 단어와 정의 목록 생성
    const wordsList = words
      .map((word) => {
        const definition = wordDefinitions[word]
        if (definition) {
          return `단어: ${word}\n의미: ${definition.meaning}\n예문: ${definition.example}`
        }
        return `단어: ${word}`
      })
      .join("\n\n")

    // 레벨에 따른 난이도 설명 추가
    const levelGuidance = getLevelGuidance(userLevel)

    const prompt = `
다음은 영어 학습자가 선택한 단어와 그 의미입니다:

${wordsList}

위 단어들에 대한 퀴즈를 생성해주세요. 각 단어에 대해 다음 두 가지 유형의 문제를 만들어주세요:
1. 빈칸 채우기 문제: 영어 문장 속에서 해당 단어가 들어갈 적절한 위치를 찾는 문제 (반드시 영어 문장을 사용해야 함)
2. 단어 의미 문제: 단어의 의미를 정확히 이해했는지 확인하는 문제

퀴즈는 다음 JSON 형식으로 응답해주세요:

{
  "quizzes": [
    {
      "questionType": "fill-in-blank",
      "question": "다음 영어 문장에서 빈칸에 들어갈 가장 적절한 단어는 무엇인가요? 'The scientist conducted an _____ to test the new theory.'",
      "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
      "answer": 정답 인덱스(0-3),
      "difficulty": "medium" // 난이도: "easy", "medium", "hard" 중 하나
    },
    {
      "questionType": "meaning",
      "question": "단어 'experiment'의 의미로 가장 적절한 것은?",
      "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
      "answer": 정답 인덱스(0-3),
      "difficulty": "medium" // 난이도: "easy", "medium", "hard" 중 하나
    }
    // 각 단어당 두 가지 유형의 문제를 생성하되, 총 문제 수는 최대 10개로 제한
  ]
}

중요 사항:
1. 각 단어에 대해 두 가지 유형의 문제를 만들어주세요.
2. 빈칸 채우기 문제는 반드시 영어 문장을 사용해야 합니다. 문제 설명은 ${targetLanguage}로 하되, 예시 문장 자체는 반드시 영어여야 합니다.
3. 빈칸 채우기 문제의 예시: "다음 영어 문장에서 빈칸에 들어갈 가장 적절한 단어는 무엇인가요? 'The scientist conducted an _____ to test the new theory.'"
4. 단어 의미 문제는 단어의 정확한 의미를 묻는 문제를 만들어주세요.
5. 문제는 ${targetLanguage}로 작성해주세요.
6. 선택지는 충분히 구분되고 명확해야 합니다.
7. 정답은 반드시 선택지 중 하나여야 합니다.
8. 응답은 반드시 유효한 JSON 형식이어야 합니다.
9. 단어가 많을 경우 중요하거나 어려운 단어 위주로 최대 10개의 퀴즈를 생성해주세요.
10. 각 문제에 난이도를 표시해주세요: "easy", "medium", "hard" 중 하나로 지정합니다.

사용자 레벨 정보: ${userLevel}
${levelGuidance}
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
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      },
    }

    console.log("단어 퀴즈 생성 요청:", words.length, "개의 단어, 레벨:", userLevel)

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
      const result = JSON.parse(jsonMatch[0]) as QuizSet

      // 캐시에 저장
      quizCache[cacheKey] = result

      return result
    } catch (parseError) {
      console.error("JSON 파싱 오류:", parseError)
      throw new Error("API 응답을 파싱할 수 없습니다.")
    }
  } catch (error) {
    console.error("단어 퀴즈 생성 오류:", error)

    // 오류 발생 시 기본 퀴즈 반환
    return {
      quizzes: [
        {
          question: "퀴즈를 생성하는 중 오류가 발생했습니다. 다시 시도해주세요.",
          options: ["다시 시도", "API 키 확인", "단어 다시 선택", "나중에 시도"],
          answer: 0,
        },
      ],
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    }
  }
}

// 선택된 문장들을 기반으로 문장 퀴즈 생성
export async function generateSentenceQuizzes(
  sentences: string[],
  sentenceAnalyses: Record<number, { structure: string; explanation: string }>,
  apiKey: string,
  targetLanguage = "한국어",
  userLevel = "B1", // 사용자 레벨 매개변수 추가 (기본값: B1)
): Promise<QuizSet> {
  if (sentences.length === 0) {
    return {
      quizzes: [],
      error: "선택된 문장이 없습니다.",
    }
  }

  // 캐시 키 생성 (선택된 문장들의 첫 20자를 결합)
  const cacheKey = `sentence-${sentences.map((s) => s.substring(0, 20)).join("-")}-${targetLanguage}-${userLevel}` // 레벨을 캐시 키에 추가

  // 캐시된 퀴즈가 있으면 반환
  if (quizCache[cacheKey]) {
    return quizCache[cacheKey]
  }

  try {
    // API 엔드포인트
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`

    // 문장과 분석 목록 생성
    const sentencesList = sentences
      .map((sentence, index) => {
        const analysis = sentenceAnalyses[index]
        if (analysis) {
          return `문장: ${sentence}\n구조: ${analysis.structure}\n해석: ${analysis.explanation}`
        }
        return `문장: ${sentence}`
      })
      .join("\n\n")

    // 레벨에 따른 난이도 설명 추가
    const levelGuidance = getLevelGuidance(userLevel)

    const prompt = `
다음은 영어 학습자가 선택한 문장과 그 분석입니다:

${sentencesList}

위 문장들에 대한 퀴즈를 생성해주세요. 각 문장에 대해 다음 유형의 문제를 만들어주세요:

1. 모든 문장에 대해: 문장의 의미를 이해했는지 확인하는 문제 (comprehension)
2. 복잡한 문장에 대해서만: 문장의 구조를 이해했는지 확인하는 문제 (structure)
   (복잡한 문장이란: 종속절이 있거나, 구문이 복잡하거나, 특별한 문법 구조를 가진 문장)

퀴즈는 다음 JSON 형식으로 응답해주세요:

{
  "quizzes": [
    {
      "questionType": "comprehension",
      "relatedSentence": "문제와 관련된 원문 영어 문장",
      "question": "위 영어 문장의 의미로 가장 적절한 것은?",
      "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
      "answer": 정답 인덱스(0-3),
      "difficulty": "medium" // 난이도: "easy", "medium", "hard" 중 하나
    },
    {
      "questionType": "structure",
      "relatedSentence": "문제와 관련된 원문 영어 문장",
      "question": "위 영어 문장의 구조에 대한 설명으로 옳은 것은?",
      "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
      "answer": 정답 인덱스(0-3),
      "difficulty": "hard" // 난이도: "easy", "medium", "hard" 중 하나
    }
    // 각 문장에 대해 1-2개의 문제를 생성하되, 총 문제 수는 최대 10개로 제한
  ]
}

중요 사항:
1. 각 문제에는 반드시 관련된 원문 영어 문장을 포함해야 합니다. relatedSentence 필드에는 반드시 영어 문장이 들어가야 합니다.
2. 모든 문장에 대해 의미 이해 문제를 만들어주세요.
3. 복잡한 문장에 대해서만 구조 이해 문제를 추가로 만들어주세요.
4. 문제 설명은 ${targetLanguage}로 작성하되, 예시 문장 자체는 반드시 영어여야 합니다.
5. 문제 예시: "위 영어 문장의 의미로 가장 적절한 것은?" 또는 "위 영어 문장의 구조에 대한 설명으로 옳은 것은?"
6. 선택지는 충분히 구분되고 명확해야 합니다.
7. 정답은 반드시 선택지 중 하나여야 합니다.
8. 응답은 반드시 유효한 JSON 형식이어야 합니다.
9. 문장이 많을 경우 중요하거나 어려운 문장 위주로 최대 10개의 퀴즈를 생성해주세요.
10. 각 문제에 난이도를 표시해주세요: "easy", "medium", "hard" 중 하나로 지정합니다.

사용자 레벨 정보: ${userLevel}
${levelGuidance}
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
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      },
    }

    console.log("문장 퀴즈 생성 요청:", sentences.length, "개의 문장, 레벨:", userLevel)

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
      const result = JSON.parse(jsonMatch[0]) as QuizSet

      // 캐시에 저장
      quizCache[cacheKey] = result

      return result
    } catch (parseError) {
      console.error("JSON 파싱 오류:", parseError)
      throw new Error("API 응답을 파싱할 수 없습니다.")
    }
  } catch (error) {
    console.error("문장 퀴즈 생성 오류:", error)

    // 오류 발생 시 기본 퀴즈 반환
    return {
      quizzes: [
        {
          question: "퀴즈를 생성하는 중 오류가 발생했습니다. 다시 시도해주세요.",
          options: ["다시 시도", "API 키 확인", "문장 다시 선택", "나중에 시도"],
          answer: 0,
        },
      ],
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    }
  }
}

// 사용자 레벨에 따른 난이도 가이드라인 생성 함수
function getLevelGuidance(level: string): string {
  switch (level) {
    case "A1":
      return `
난이도 가이드라인:
- 초보자 레벨(A1)에 맞는 퀴즈를 생성해주세요.
- 문장은 매우 간단하고 기본적인 구조를 사용해야 합니다.
- 사용되는 어휘는 일상생활에서 자주 사용되는 기초적인 단어로 제한해주세요.
- 선택지는 명확하게 구분되어야 하며, 너무 헷갈리지 않게 해주세요.
- 대부분의 문제는 "easy" 난이도로 설정하고, 일부만 "medium" 난이도로 설정해주세요.
- "hard" 난이도의 문제는 생성하지 마세요.
`
    case "A2":
      return `
난이도 가이드라인:
- 초급 레벨(A2)에 맞는 퀴즈를 생성해주세요.
- 문장은 간단하지만 약간의 복합 구조를 포함할 수 있습니다.
- 사용되는 어휘는 일상적인 상황에서 사용되는 기본 단어들로 구성해주세요.
- 선택지는 적절한 난이도로 구분되어야 합니다.
- 문제의 60%는 "easy", 40%는 "medium" 난이도로 설정해주세요.
- "hard" 난이도의 문제는 생성하지 마세요.
`
    case "B1":
      return `
난이도 가이드라인:
- 중급 레벨(B1)에 맞는 퀴즈를 생성해주세요.
- 문장은 복합 구조를 포함할 수 있으며, 다양한 시제와 구문을 사용할 수 있습니다.
- 사용되는 어휘는 일상적인 주제뿐만 아니라 약간의 전문적인 주제도 포함할 수 있습니다.
- 선택지는 적절한 난이도로 구분되어야 하며, 약간의 도전적인 요소를 포함할 수 있습니다.
- 문제의 30%는 "easy", 50%는 "medium", 20%는 "hard" 난이도로 설정해주세요.
`
    case "B2":
      return `
난이도 가이드라인:
- 중상급 레벨(B2)에 맞는 퀴즈를 생성해주세요.
- 문장은 복잡한 구조와 다양한 문법 요소를 포함할 수 있습니다.
- 사용되는 어휘는 다양한 주제에 걸쳐 폭넓게 사용될 수 있으며, 일부 전문 용어도 포함할 수 있습니다.
- 선택지는 도전적이어야 하며, 미묘한 차이를 구분할 수 있어야 합니다.
- 문제의 20%는 "easy", 50%는 "medium", 30%는 "hard" 난이도로 설정해주세요.
`
    case "C1":
      return `
난이도 가이드라인:
- 고급 레벨(C1)에 맞는 퀴즈를 생성해주세요.
- 문장은 복잡하고 정교한 구조를 가질 수 있으며, 다양한 문법적 요소와 표현을 포함해야 합니다.
- 사용되는 어휘는 학술적, 전문적 주제를 포함한 광범위한 영역에서 선택될 수 있습니다.
- 선택지는 매우 도전적이어야 하며, 미묘한 의미 차이를 구분할 수 있어야 합니다.
- 문제의 10%는 "easy", 40%는 "medium", 50%는 "hard" 난이도로 설정해주세요.
`
    case "C2":
      return `
난이도 가이드라인:
- 최상급 레벨(C2)에 맞는 퀴즈를 생성해주세요.
- 문장은 매우 복잡하고 정교한 구조를 가질 수 있으며, 고급 문법과 표현을 포함해야 합니다.
- 사용되는 어휘는 학술적, 전문적, 문학적 표현을 포함한 가장 광범위한 영역에서 선택될 수 있습니다.
- 선택지는 극도로 도전적이어야 하며, 매우 미묘한 의미와 뉘앙스 차이를 구분할 수 있어야 합니다.
- 문제의 5%는 "easy", 35%는 "medium", 60%는 "hard" 난이도로 설정해주세요.
`
    default:
      return `
난이도 가이드라인:
- 중급 레벨(B1)에 맞는 퀴즈를 생성해주세요.
- 문장은 복합 구조를 포함할 수 있으며, 다양한 시제와 구문을 사용할 수 있습니다.
- 사용되는 어휘는 일상적인 주제뿐만 아니라 약간의 전문적인 주제도 포함할 수 있습니다.
- 선택지는 적절한 난이도로 구분되어야 하며, 약간의 도전적인 요소를 포함할 수 있습니다.
- 문제의 30%는 "easy", 50%는 "medium", 20%는 "hard" 난이도로 설정해주세요.
`
  }
}
