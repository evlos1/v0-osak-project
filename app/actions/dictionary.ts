"use server"

export type WordMeaning = {
  definition: string
  example: string
  partOfSpeech?: string
  relationToOtherMeanings?: string
}

export type WordDefinition = {
  word: string
  meanings: WordMeaning[]
  loading?: boolean
  error?: string
  source?: "ai" | "local"
}

// 일반적인 영어 단어에 대한 기본 사전 (폴백용)
const basicDictionary: Record<string, { meanings: WordMeaning[] }> = {
  // A1-A2 레벨 단어
  a: {
    meanings: [
      {
        definition: "하나의, 어떤",
        example: "I saw a dog in the park.",
        partOfSpeech: "관사",
      },
    ],
  },
  about: {
    meanings: [
      {
        definition: "약, ~에 관하여",
        example: "The book is about animals.",
        partOfSpeech: "전치사",
      },
      {
        definition: "주변에, 이곳저곳에",
        example: "There were papers lying about.",
        partOfSpeech: "부사",
        relationToOtherMeanings: "전치사적 의미에서 확장되어 위치나 상태를 나타냄",
      },
    ],
  },
  run: {
    meanings: [
      {
        definition: "달리다, 뛰다",
        example: "She runs every morning.",
        partOfSpeech: "동사",
      },
      {
        definition: "운영하다, 경영하다",
        example: "He runs a small business.",
        partOfSpeech: "동사",
        relationToOtherMeanings: "물리적 움직임에서 비유적으로 확장된 의미로, 지속적인 활동을 나타냄",
      },
      {
        definition: "흐르다",
        example: "The river runs through the valley.",
        partOfSpeech: "동사",
        relationToOtherMeanings: "달리는 동작과 유사한 지속적인 움직임을 표현",
      },
    ],
  },
  set: {
    meanings: [
      {
        definition: "놓다, 설치하다",
        example: "She set the book on the table.",
        partOfSpeech: "동사",
      },
      {
        definition: "세트, 한 벌",
        example: "I bought a set of tools.",
        partOfSpeech: "명사",
        relationToOtherMeanings: "함께 속하는 물건들의 집합이라는 개념에서 파생",
      },
      {
        definition: "고정된, 정해진",
        example: "We have a set time for dinner.",
        partOfSpeech: "형용사",
        relationToOtherMeanings: "위치를 고정시킨다는 동사적 의미에서 확장됨",
      },
    ],
  },
  // 다른 기본 단어들...
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
  "meanings": [
    {
      "partOfSpeech": "품사 (명사, 동사, 형용사 등)",
      "definition": "단어의 ${targetLanguage} 의미",
      "example": "영어 예문",
      "relationToOtherMeanings": "다른 의미들과의 관계 설명 (선택적)"
    },
    {
      "partOfSpeech": "다른 품사 (있는 경우)",
      "definition": "다른 의미",
      "example": "다른 예문",
      "relationToOtherMeanings": "첫 번째 의미와의 관계 설명 (선택적)"
    }
  ]
}

중요: 단어에 여러 의미가 있는 경우, 각 의미 간의 관계나 의미 확장 과정을 relationToOtherMeanings 필드에 간략히 설명해주세요.`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 500,
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
        meanings: result.meanings || [],
        loading: false,
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
1. 품사: (명사, 동사, 형용사 등)
2. 의미: (한 줄로 간결하게)
3. 예문: (간단한 영어 예문 한 개)
4. 다른 의미: (있는 경우)
5. 의미 간 관계: (다른 의미가 있는 경우, 의미들 간의 관계 설명)

형식은 다음과 같이 해주세요:
품사1: (품사)
의미1: (단어의 의미)
예문1: (예문)
품사2: (다른 품사, 있는 경우)
의미2: (다른 의미)
예문2: (다른 예문)
의미 관계: (의미들 간의 관계 설명)`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 500,
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
    const meanings: WordMeaning[] = []

    // 첫 번째 의미 추출
    const pos1Match = textContent.match(/품사1?:\s*(.+)(\n|$)/)
    const meaning1Match = textContent.match(/의미1?:\s*(.+)(\n|$)/)
    const example1Match = textContent.match(/예문1?:\s*(.+)(\n|$)/)

    if (meaning1Match) {
      meanings.push({
        partOfSpeech: pos1Match ? pos1Match[1].trim() : undefined,
        definition: meaning1Match[1].trim(),
        example: example1Match ? example1Match[1].trim() : "예문이 없습니다.",
      })
    }

    // 두 번째 의미 추출 (있는 경우)
    const pos2Match = textContent.match(/품사2:\s*(.+)(\n|$)/)
    const meaning2Match = textContent.match(/의미2:\s*(.+)(\n|$)/)
    const example2Match = textContent.match(/예문2:\s*(.+)(\n|$)/)
    const relationMatch = textContent.match(/의미 관계:\s*(.+)(\n|$)/)

    if (meaning2Match) {
      meanings.push({
        partOfSpeech: pos2Match ? pos2Match[1].trim() : undefined,
        definition: meaning2Match[1].trim(),
        example: example2Match ? example2Match[1].trim() : "예문이 없습니다.",
        relationToOtherMeanings: relationMatch ? relationMatch[1].trim() : undefined,
      })
    }

    return {
      word,
      meanings:
        meanings.length > 0 ? meanings : [{ definition: "의미를 찾을 수 없습니다.", example: "예문이 없습니다." }],
      source: "ai",
    }
  } catch (error) {
    console.error("Gemini API 오류:", error)
    throw new Error(error instanceof Error ? error.message : "알 수 없는 오류")
  }
}

// 로컬 사전에서 단어 정의 가져오기
function getLocalDefinition(word: string): WordDefinition | null {
  // 단어를 소문자로 변환하여 검색
  const lowercaseWord = word.toLowerCase()

  // 사전에서 단어 찾기
  if (basicDictionary[lowercaseWord]) {
    return {
      word,
      meanings: basicDictionary[lowercaseWord].meanings,
      source: "local",
    }
  }

  return null
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
        meanings: [
          {
            definition:
              "이 단어는 현재 사전에 등록되어 있지 않습니다. API 키를 설정하면 더 많은 단어를 검색할 수 있습니다.",
            example: "예문이 준비되지 않았습니다.",
          },
        ],
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
      meanings: [
        {
          definition: "이 단어는 현재 사전에 등록되어 있지 않습니다.",
          example: "예문이 준비되지 않았습니다.",
        },
      ],
      error: error instanceof Error ? error.message : "알 수 없는 오류",
      source: "local",
    }
  }
}
