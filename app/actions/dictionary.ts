"use server"

export type WordDefinition = {
  word: string
  meaning: string
  example: string
  loading?: boolean
  error?: string
  source?: "ai" | "local"
}

// 일반적인 영어 단어에 대한 기본 사전 (폴백용)
const basicDictionary: Record<string, { meaning: string; example: string }> = {
  // A1-A2 레벨 단어
  a: { meaning: "하나의, 어떤", example: "I saw a dog in the park." },
  about: { meaning: "약, ~에 관하여", example: "The book is about animals." },
  artificial: { meaning: "인공적인, 인위적인", example: "The flowers in the vase are artificial, not real." },
  intelligence: { meaning: "지능, 정보", example: "She has a high level of intelligence and learns quickly." },
  smart: { meaning: "똑똑한, 영리한", example: "He is a smart student who learns quickly." },
  computer: { meaning: "컴퓨터", example: "I use my computer to send emails." },
  help: { meaning: "돕다, 도움", example: "Can you help me with this problem?" },
  learn: { meaning: "배우다, 학습하다", example: "I want to learn English." },
  data: { meaning: "데이터, 자료", example: "We need more data to make a decision." },
  technology: { meaning: "기술", example: "New technology is changing how we live." },

  // B1-B2 레벨 단어
  algorithms: {
    meaning: "알고리즘, 계산 절차",
    example: "The search engine uses complex algorithms to find relevant results.",
  },
  predictions: { meaning: "예측, 예보", example: "Weather predictions are not always accurate." },
  systems: { meaning: "시스템, 체계", example: "The company has good management systems." },
  investing: { meaning: "투자하다", example: "They are investing money in new technology." },
  efficient: { meaning: "효율적인", example: "This is a more efficient way to solve the problem." },
  impact: { meaning: "영향, 충격", example: "The new law will have a big impact on small businesses." },
  opportunity: { meaning: "기회", example: "This job is a great opportunity to gain experience." },
  powerful: { meaning: "강력한, 힘있는", example: "The new computer has a powerful processor." },
  advancement: { meaning: "발전, 진보", example: "There have been many advancements in medicine." },
  profound: { meaning: "심오한, 깊은", example: "The book had a profound effect on my thinking." },

  // C1-C2 레벨 단어
  inexorable: { meaning: "막을 수 없는, 피할 수 없는", example: "The inexorable march of time affects us all." },
  paradigm: {
    meaning: "패러다임, 사고방식",
    example: "This discovery represents a paradigm shift in our understanding.",
  },
  multifaceted: {
    meaning: "다면적인, 여러 측면을 가진",
    example: "Climate change is a multifaceted problem with no simple solution.",
  },
  permeating: { meaning: "스며들다, 침투하다", example: "The smell of cooking was permeating throughout the house." },
  unprecedented: {
    meaning: "전례 없는",
    example: "The speed of technological change is unprecedented in human history.",
  },
  capabilities: { meaning: "능력, 역량", example: "The new software has impressive capabilities." },
  superintelligence: {
    meaning: "초지능",
    example: "Some researchers worry about the development of superintelligence.",
  },
  epistemological: {
    meaning: "인식론적인",
    example: "The philosopher discussed epistemological questions about knowledge.",
  },
  recursive: { meaning: "재귀적인, 반복적인", example: "The program uses a recursive function to solve the problem." },
  exponential: { meaning: "기하급수적인", example: "The company has experienced exponential growth since last year." },
}

// 로컬 사전에서 단어 정의 가져오기
function getLocalDefinition(word: string): WordDefinition | null {
  // 단어를 소문자로 변환하여 검색
  const lowercaseWord = word.toLowerCase()

  // 사전에서 단어 찾기
  if (basicDictionary[lowercaseWord]) {
    return {
      word,
      meaning: basicDictionary[lowercaseWord].meaning,
      example: basicDictionary[lowercaseWord].example,
      source: "local",
    }
  }

  return null
}

// Google Gemini API를 사용하여 단어 정의 가져오기
async function fetchGeminiDefinition(word: string, apiKey: string, targetLanguage = "한국어"): Promise<WordDefinition> {
  try {
    // 수정된 API 엔드포인트 - 모델명 확인
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `단어: "${word}"

위 영어 단어에 대한 다음 정보를 ${targetLanguage}로 제공해주세요.
reasoning 과정 없이 바로 결과만 JSON 형식으로 제공해주세요.

{
  "meaning": "단어의 ${targetLanguage} 의미",
  "example": "영어 예문"
}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 200,
      },
    }

    console.log("Gemini API 요청:", url)

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
    console.log("Gemini API 응답:", JSON.stringify(data))

    // 응답 구조 확인 및 텍스트 추출
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!textContent) {
      console.error("API 응답에 텍스트 없음:", data)
      throw new Error("API 응답에서 텍스트를 찾을 수 없습니다.")
    }

    // JSON 형식 추출 (중괄호 사이의 내용)
    const jsonMatch = textContent.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error("JSON 형식 찾을 수 없음:", textContent)
      throw new Error("API 응답에서 JSON 형식을 찾을 수 없습니다.")
    }

    try {
      const result = JSON.parse(jsonMatch[0])
      return {
        word,
        meaning: result.meaning || "의미를 찾을 수 없습니다.",
        example: result.example || "예문을 찾을 수 없습니다.",
        source: "ai",
      }
    } catch (parseError) {
      console.error("JSON 파싱 오류:", parseError, jsonMatch[0])
      throw new Error("API 응답을 파싱할 수 없습니다.")
    }
  } catch (error) {
    console.error("Gemini API 오류:", error)
    throw new Error(error instanceof Error ? error.message : "알 수 없는 오류")
  }
}

// 대체 방법: 단순 텍스트 처리
async function fetchGeminiDefinitionSimple(
  word: string,
  apiKey: string,
  targetLanguage = "한국어",
): Promise<WordDefinition> {
  try {
    // 수정된 API 엔드포인트 - 모델명 확인
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `단어: "${word}"

위 영어 단어에 대한 다음 정보를 ${targetLanguage}로 제공해주세요:
1. 의미: (한 줄로 간결하게)
2. 예문: (간단한 영어 예문 한 개)

형식은 다음과 같이 해주세요:
의미: (단어의 의미)
예문: (예문)`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 200,
      },
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!textContent) {
      throw new Error("API 응답에서 텍스트를 찾을 수 없습니다.")
    }

    // 텍스트에서 의미와 예문 추출
    const meaningMatch = textContent.match(/의미:\s*(.+)(\n|$)/)
    const exampleMatch = textContent.match(/예문:\s*(.+)(\n|$)/)

    return {
      word,
      meaning: meaningMatch ? meaningMatch[1].trim() : "의미를 찾을 수 없습니다.",
      example: exampleMatch ? exampleMatch[1].trim() : "예문을 찾을 수 없습니다.",
      source: "ai",
    }
  } catch (error) {
    console.error("Gemini API 오류:", error)
    throw new Error(error instanceof Error ? error.message : "알 수 없는 오류")
  }
}

// AI를 통해 단어 정의 가져오기
export async function getWordDefinition(
  word: string,
  apiKey?: string,
  targetLanguage = "한국어",
): Promise<WordDefinition> {
  try {
    // 먼저 로컬 사전에서 단어 찾기
    const localDefinition = getLocalDefinition(word)
    if (localDefinition) {
      return localDefinition
    }

    // API 키가 없으면 로컬 사전 결과 반환
    if (!apiKey) {
      return {
        word,
        meaning: "이 단어는 현재 사전에 등록되어 있지 않습니다. API 키를 설정하면 더 많은 단어를 검색할 수 있습니다.",
        example: "예문이 준비되지 않았습니다.",
        source: "local",
      }
    }

    // Google Gemini API를 통해 단어 정의 가져오기
    try {
      // 먼저 JSON 형식으로 시도
      return await fetchGeminiDefinition(word, apiKey, targetLanguage)
    } catch (jsonError) {
      console.log("JSON 형식 실패, 단순 텍스트 형식으로 재시도:", jsonError)
      // JSON 형식이 실패하면 단순 텍스트 형식으로 시도
      return await fetchGeminiDefinitionSimple(word, apiKey, targetLanguage)
    }
  } catch (error) {
    console.error("Error in getWordDefinition:", error)

    // 모든 방법이 실패한 경우 기본 응답
    return {
      word,
      meaning: "이 단어는 현재 사전에 등록되어 있지 않습니다.",
      example: "예문이 준비되지 않았습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
      source: "local",
    }
  }
}
