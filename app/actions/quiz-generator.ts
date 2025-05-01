"use server"

export type Quiz = {
  question: string
  options: string[]
  answer: number
  relatedSentence?: string // 관련 문장 필드 추가
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
): Promise<QuizSet> {
  if (words.length === 0) {
    return {
      quizzes: [],
      error: "선택된 단어가 없습니다.",
    }
  }

  // 캐시 키 생성 (선택된 단어들을 정렬하여 문자열로 결합)
  const cacheKey = `word-${words.sort().join("-")}`

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

    const prompt = `
다음은 영어 학습자가 선택한 단어와 그 의미입니다:

${wordsList}

위 단어들에 대한 퀴즈를 생성해주세요. 각 단어에 대해 의미를 이해했는지 확인하는 문제를 만들어주세요.
퀴즈는 다음 JSON 형식으로 응답해주세요:

{
  "quizzes": [
    {
      "question": "문제 내용 (단어의 의미, 용법, 예문 등에 관한 질문)",
      "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
      "answer": 정답 인덱스(0-3)
    },
    {
      "question": "문제 내용",
      "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
      "answer": 정답 인덱스(0-3)
    }
    // 최대 5개의 퀴즈 생성
  ]
}

중요 사항:
1. 단어의 의미를 정확히 이해했는지 확인하는 문제를 출제해주세요.
2. 문제는 한국어로 작성해주세요.
3. 선택지는 충분히 구분되고 명확해야 합니다.
4. 정답은 반드시 선택지 중 하나여야 합니다.
5. 응답은 반드시 유효한 JSON 형식이어야 합니다.
6. 단어가 많을 경우 중요하거나 어려운 단어 위주로 최대 5개의 퀴즈를 생성해주세요.
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

    console.log("단어 퀴즈 생성 요청:", words.length, "개의 단어")

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
): Promise<QuizSet> {
  if (sentences.length === 0) {
    return {
      quizzes: [],
      error: "선택된 문장이 없습니다.",
    }
  }

  // 캐시 키 생성 (선택된 문장들의 첫 20자를 결합)
  const cacheKey = `sentence-${sentences.map((s) => s.substring(0, 20)).join("-")}`

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

    const prompt = `
다음은 영어 학습자가 선택한 문장과 그 분석입니다:

${sentencesList}

위 문장들에 대한 퀴즈를 생성해주세요. 각 문장에 대해 문법 구조나 해석을 정확히 이해했는지 확인하는 문제를 만들어주세요.
퀴즈는 다음 JSON 형식으로 응답해주세요:

{
  "quizzes": [
    {
      "relatedSentence": "문제와 관련된 원문 영어 문장",
      "question": "문제 내용 (문장의 구조, 해석, 문법 요소 등에 관한 질문)",
      "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
      "answer": 정답 인덱스(0-3)
    },
    {
      "relatedSentence": "문제와 관련된 원문 영어 문장",
      "question": "문제 내용",
      "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
      "answer": 정답 인덱스(0-3)
    }
    // 최대 5개의 퀴즈 생성
  ]
}

중요 사항:
1. 각 퀴즈에는 반드시 관련된 원문 영어 문장을 포함해주세요.
2. 문장의 구조와 해석을 정확히 이해했는지 확인하는 문제를 출제해주세요.
3. 문제는 한국어로 작성해주세요.
4. 선택지는 충분히 구분되고 명확해야 합니다.
5. 정답은 반드시 선택지 중 하나여야 합니다.
6. 응답은 반드시 유효한 JSON 형식이어야 합니다.
7. 문장이 많을 경우 중요하거나 어려운 문장 위주로 최대 5개의 퀴즈를 생성해주세요.
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

    console.log("문장 퀴즈 생성 요청:", sentences.length, "개의 문장")

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
