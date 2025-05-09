"use server"

export type WordMeaning = {
  definition: string
  koreanDefinition?: string // 한글 뜻 추가
  example: string
  partOfSpeech?: string
  relationToOtherMeanings?: string
}

export type EtymologyStage = {
  period?: string // 시대 (예: "고대 그리스어", "중세 라틴어" 등)
  year?: string // 대략적인 연도 (예: "기원전 5세기", "14세기" 등)
  word: string // 해당 시대의 단어 형태
  meaning?: string // 해당 시대의 의미
  language?: string // 언어 (예: "그리스어", "라틴어", "고대 영어" 등)
}

export type EtymologyTimeline = {
  stages: EtymologyStage[]
  connections?: string[] // 단계 간 연결 설명 (선택적)
}

export type WordDefinition = {
  word: string
  meanings: WordMeaning[]
  etymology?: string // 어원 정보
  etymologyTimeline?: EtymologyTimeline // 어원 타임라인 추가
  loading?: boolean
  error?: string
  source?: "ai" | "local"
}

// 일반적인 영어 단어에 대한 기본 사전 (폴백용)
const basicDictionary: Record<
  string,
  { meanings: WordMeaning[]; etymology?: string; etymologyTimeline?: EtymologyTimeline }
> = {
  // A1-A2 레벨 단어
  a: {
    meanings: [
      {
        definition: "하나의, 어떤",
        koreanDefinition: "하나의, 어떤",
        example: "I saw a dog in the park.",
        partOfSpeech: "관사",
      },
    ],
    etymology: "고대 영어 'ān'에서 유래, 숫자 'one'과 같은 어원을 가짐",
    etymologyTimeline: {
      stages: [
        {
          period: "원시 인도유럽어",
          year: "기원전 3500년경",
          word: "*oi-no-",
          meaning: "하나, 유일한",
          language: "원시 인도유럽어",
        },
        {
          period: "원시 게르만어",
          year: "기원전 500년경",
          word: "*ainaz",
          meaning: "하나",
          language: "원시 게르만어",
        },
        {
          period: "고대 영어",
          year: "450-1100년",
          word: "ān",
          meaning: "하나",
          language: "고대 영어",
        },
        {
          period: "중세 영어",
          year: "1100-1500년",
          word: "an/a",
          meaning: "하나의, 어떤",
          language: "중세 영어",
        },
        {
          period: "현대 영어",
          year: "1500년-현재",
          word: "a/an",
          meaning: "하나의, 어떤",
          language: "현대 영어",
        },
      ],
    },
  },
  about: {
    meanings: [
      {
        definition: "약, ~에 관하여",
        koreanDefinition: "약, ~에 관하여",
        example: "The book is about animals.",
        partOfSpeech: "전치사",
      },
      {
        definition: "주변에, 이곳저곳에",
        koreanDefinition: "주변에, 이곳저곳에",
        example: "There were papers lying about.",
        partOfSpeech: "부사",
        relationToOtherMeanings: "전치사적 의미에서 확장되어 위치나 상태를 나타냄",
      },
    ],
    etymology: "고대 영어 'onbūtan'에서 유래, 'on' (위에) + 'būtan' (바깥에)의 합성어",
    etymologyTimeline: {
      stages: [
        {
          period: "고대 영어",
          year: "700-1100년",
          word: "onbūtan",
          meaning: "주변에, 둘레에",
          language: "고대 영어",
        },
        {
          period: "중세 영어",
          year: "1100-1300년",
          word: "abouten",
          meaning: "주변에, ~에 관하여",
          language: "중세 영어",
        },
        {
          period: "중세 영어 후기",
          year: "1300-1500년",
          word: "about",
          meaning: "주변에, ~에 관하여",
          language: "중세 영어",
        },
        {
          period: "현대 영어",
          year: "1500년-현재",
          word: "about",
          meaning: "~에 관하여, 주변에",
          language: "현대 영어",
        },
      ],
    },
  },
  run: {
    meanings: [
      {
        definition: "달리다, 뛰다",
        koreanDefinition: "달리다, 뛰다",
        example: "She runs every morning.",
        partOfSpeech: "동사",
      },
      {
        definition: "운영하다, 경영하다",
        koreanDefinition: "운영하다, 경영하다",
        example: "He runs a small business.",
        partOfSpeech: "동사",
        relationToOtherMeanings: "물리적 움직임에서 비유적으로 확장된 의미로, 지속적인 활동을 나타냄",
      },
      {
        definition: "흐르다",
        koreanDefinition: "흐르다",
        example: "The river runs through the valley.",
        partOfSpeech: "동사",
        relationToOtherMeanings: "달리는 동작과 유사한 지속적인 움직임을 표현",
      },
    ],
    etymology: "고대 영어 'rinnan'에서 유래, 게르만어 어근 *ren- (빠르게 움직이다)에서 파생",
    etymologyTimeline: {
      stages: [
        {
          period: "원시 인도유럽어",
          year: "기원전 3000년경",
          word: "*reu-/*er-",
          meaning: "움직이다, 흐르다",
          language: "원시 인도유럽어",
        },
        {
          period: "원시 게르만어",
          year: "기원전 500년경",
          word: "*rinnan",
          meaning: "흐르다, 달리다",
          language: "원시 게르만어",
        },
        {
          period: "고대 영어",
          year: "700-1100년",
          word: "rinnan/iernan",
          meaning: "흐르다, 달리다",
          language: "고대 영어",
        },
        {
          period: "중세 영어",
          year: "1100-1500년",
          word: "rennen/runnen",
          meaning: "달리다, 흐르다",
          language: "중세 영어",
        },
        {
          period: "현대 영어",
          year: "1500년-현재",
          word: "run",
          meaning: "달리다, 운영하다, 흐르다",
          language: "현대 영어",
        },
      ],
    },
  },
  set: {
    meanings: [
      {
        definition: "놓다, 설치하다",
        koreanDefinition: "놓다, 설치하다",
        example: "She set the book on the table.",
        partOfSpeech: "동사",
      },
      {
        definition: "세트, 한 벌",
        koreanDefinition: "세트, 한 벌",
        example: "I bought a set of tools.",
        partOfSpeech: "명사",
        relationToOtherMeanings: "함께 속하는 물건들의 집합이라는 개념에서 파생",
      },
      {
        definition: "고정된, 정해진",
        koreanDefinition: "고정된, 정해진",
        example: "We have a set time for dinner.",
        partOfSpeech: "형용사",
        relationToOtherMeanings: "위치를 고정시킨다는 동사적 의미에서 확장됨",
      },
    ],
    etymology: "라틴어 'sedere' (앉다)에서 유래한 고대 영어 'settan'에서 파생",
    etymologyTimeline: {
      stages: [
        {
          period: "원시 인도유럽어",
          year: "기원전 3000년경",
          word: "*sed-",
          meaning: "앉다",
          language: "원시 인도유럽어",
        },
        {
          period: "라틴어",
          year: "기원전 100년경",
          word: "sedere",
          meaning: "앉다",
          language: "라틴어",
        },
        {
          period: "원시 게르만어",
          year: "기원전 500년경",
          word: "*setjanan",
          meaning: "앉히다, 놓다",
          language: "원시 게르만어",
        },
        {
          period: "고대 영어",
          year: "700-1100년",
          word: "settan",
          meaning: "놓다, 위치시키다",
          language: "고대 영어",
        },
        {
          period: "중세 영어",
          year: "1100-1500년",
          word: "setten",
          meaning: "놓다, 정하다",
          language: "중세 영어",
        },
        {
          period: "현대 영어",
          year: "1500년-현재",
          word: "set",
          meaning: "놓다, 세트, 고정된",
          language: "현대 영어",
        },
      ],
    },
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
      "koreanDefinition": "단어의 한국어 의미 (간결하게)",
      "example": "영어 예문"
    },
    {
      "partOfSpeech": "다른 품사 (있는 경우)",
      "definition": "다른 의미",
      "koreanDefinition": "다른 의미의 한국어 뜻 (간결하게)",
      "example": "다른 예문"
    }
  ],
  "etymology": "단어의 어원과 역사적 발전 과정에 대한 ${targetLanguage} 설명",
  "etymologyTimeline": {
    "stages": [
      {
        "period": "시대 또는 언어 단계 (예: 원시 인도유럽어, 고대 영어 등)",
        "year": "대략적인 연도 또는 시기 (예: 기원전 3000년경, 14세기 등)",
        "word": "해당 시대의 단어 형태",
        "meaning": "해당 시대의 의미",
        "language": "언어 (예: 그리스어, 라틴어, 고대 영어 등)"
      },
      {
        "period": "다음 시대 또는 언어 단계",
        "year": "대략적인 연도 또는 시기",
        "word": "해당 시대의 단어 형태",
        "meaning": "해당 시대의 의미",
        "language": "언어"
      }
    ]
  }
}

중요: 
1. 단어의 어원(etymology)과 함께 어원 타임라인(etymologyTimeline)을 반드시 포함해주세요. 
2. 어원 타임라인은 단어의 역사적 발전 과정을 시간순으로 정렬하여 최소 3단계 이상 포함해주세요. 
3. 각 단계는 시대/언어, 연도, 단어 형태, 의미, 언어를 포함해야 합니다.
4. 단어의 의미는 definition과 koreanDefinition 두 필드에 모두 제공해주세요. definition은 설명이 포함될 수 있고, koreanDefinition은 간결한 한국어 뜻만 제공해주세요.`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 800,
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
        etymology: result.etymology || "어원 정보가 제공되지 않았습니다.",
        etymologyTimeline: result.etymologyTimeline || undefined,
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
3. 한국어 뜻: (간결한 한국어 단어나 구)
4. 예문: (간단한 영어 예문 한 개)
5. 다른 의미: (있는 경우)
6. 어원: (단어의 기원과 역사적 발전)
7. 어원 타임라인: (단어의 역사적 발전 과정을 시간순으로 최소 3단계 이상)

형식은 다음과 같이 해주세요:
품사1: (품사)
의미1: (단어의 의미)
한국어 뜻1: (간결한 한국어 뜻)
예문1: (예문)
품사2: (다른 품사, 있는 경우)
의미2: (다른 의미)
한국어 뜻2: (다른 의미의 간결한 한국어 뜻)
예문2: (다른 예문)
어원: (단어의 어원과 역사적 발전)

어원 타임라인:
시대1 (연도): 단어형태1 - 의미1 (언어1)
시대2 (연도): 단어형태2 - 의미2 (언어2)
시대3 (연도): 단어형태3 - 의미3 (언어3)
...`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 800,
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
    const koreanMeaning1Match = textContent.match(/한국어 뜻1?:\s*(.+)(\n|$)/)
    const example1Match = textContent.match(/예문1?:\s*(.+)(\n|$)/)

    if (meaning1Match) {
      meanings.push({
        partOfSpeech: pos1Match ? pos1Match[1].trim() : undefined,
        definition: meaning1Match[1].trim(),
        koreanDefinition: koreanMeaning1Match ? koreanMeaning1Match[1].trim() : meaning1Match[1].trim(),
        example: example1Match ? example1Match[1].trim() : "예문이 없습니다.",
      })
    }

    // 두 번째 의미 추출 (있는 경우)
    const pos2Match = textContent.match(/품사2:\s*(.+)(\n|$)/)
    const meaning2Match = textContent.match(/의미2:\s*(.+)(\n|$)/)
    const koreanMeaning2Match = textContent.match(/한국어 뜻2:\s*(.+)(\n|$)/)
    const example2Match = textContent.match(/예문2:\s*(.+)(\n|$)/)

    if (meaning2Match) {
      meanings.push({
        partOfSpeech: pos2Match ? pos2Match[1].trim() : undefined,
        definition: meaning2Match[1].trim(),
        koreanDefinition: koreanMeaning2Match ? koreanMeaning2Match[1].trim() : meaning2Match[1].trim(),
        example: example2Match ? example2Match[1].trim() : "예문이 없습니다.",
      })
    }

    // 어원 추출
    const etymologyMatch = textContent.match(/어원:\s*(.+)(\n|$)/)
    const etymology = etymologyMatch ? etymologyMatch[1].trim() : "어원 정보가 제공되지 않았습니다."

    // 어원 타임라인 추출
    const timelineSection = textContent.match(/어원 타임라인:([\s\S]*?)(?:\n\n|$)/)
    let etymologyTimeline: EtymologyTimeline | undefined = undefined

    if (timelineSection) {
      const timelineText = timelineSection[1].trim()
      const timelineLines = timelineText.split("\n").filter((line) => line.trim() !== "")

      if (timelineLines.length > 0) {
        const stages: EtymologyStage[] = []

        for (const line of timelineLines) {
          // 예: "시대1 (연도): 단어형태1 - 의미1 (언어1)"
          const match = line.match(/([^(]+)\s*$$([^)]+)$$:\s*([^-]+)-\s*([^(]+)\s*$$([^)]+)$$/)
          if (match) {
            stages.push({
              period: match[1].trim(),
              year: match[2].trim(),
              word: match[3].trim(),
              meaning: match[4].trim(),
              language: match[5].trim(),
            })
          } else {
            // 다른 형식으로 시도
            const simplifiedMatch = line.match(/([^:]+):\s*(.+)/)
            if (simplifiedMatch) {
              const [period, rest] = [simplifiedMatch[1].trim(), simplifiedMatch[2].trim()]
              stages.push({
                period,
                word: rest,
                meaning: "의미 정보 없음",
                language: "언어 정보 없음",
              })
            }
          }
        }

        if (stages.length > 0) {
          etymologyTimeline = { stages }
        }
      }
    }

    return {
      word,
      meanings:
        meanings.length > 0 ? meanings : [{ definition: "의미를 찾을 수 없습니다.", example: "예문이 없습니다." }],
      etymology,
      etymologyTimeline,
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
      etymology: basicDictionary[lowercaseWord].etymology,
      etymologyTimeline: basicDictionary[lowercaseWord].etymologyTimeline,
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
            koreanDefinition: "API 키 필요",
            example: "예문이 준비되지 않았습니다.",
          },
        ],
        etymology: "API 키가 필요합니다.",
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
          koreanDefinition: "정보 없음",
          example: "예문이 준비되지 않았습니다.",
        },
      ],
      etymology: "어원 정보를 가져오지 못했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
      source: "local",
    }
  }
}
