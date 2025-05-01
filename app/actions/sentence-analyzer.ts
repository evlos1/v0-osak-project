"use server"

export type SentenceAnalysis = {
  structure: string
  explanation: string
  loading?: boolean
  error?: string
}

// 캐싱을 위한 저장소
const analysisCache: Record<string, SentenceAnalysis> = {}

// Google Gemini API를 사용하여 문장 분석
export async function analyzeSentence(sentence: string, apiKey: string): Promise<SentenceAnalysis> {
  // 캐시 키 생성 (문장 자체를 키로 사용)
  const cacheKey = sentence

  // 캐시된 분석이 있으면 반환
  if (analysisCache[cacheKey]) {
    return analysisCache[cacheKey]
  }

  try {
    // API 엔드포인트
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`

    const prompt = `
다음 영어 문장의 문법적 구조를 간단하게 분석하고 한국어로 해석해주세요:

"${sentence}"

다음 JSON 형식으로 응답해주세요:

{
  "structure": "문장의 기본 문법적 구조 (주어, 동사, 목적어 등의 기본 구조만 간략하게)",
  "explanation": "문장의 한국어 해석"
}

중요 사항:
1. 문법적 구조는 최대한 간단하게 설명해주세요. 복잡한 문법 용어는 피하고 기본적인 구조만 설명해주세요.
2. 한국어 해석은 자연스러운 한국어로 제공해주세요.
3. 응답은 반드시 유효한 JSON 형식이어야 합니다.
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

    console.log("문장 분석 요청:", sentence.substring(0, 30) + "...")

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
      const result = JSON.parse(jsonMatch[0]) as SentenceAnalysis

      // 캐시에 저장
      analysisCache[cacheKey] = result

      return result
    } catch (parseError) {
      console.error("JSON 파싱 오류:", parseError)
      throw new Error("API 응답을 파싱할 수 없습니다.")
    }
  } catch (error) {
    console.error("문장 분석 오류:", error)

    // 오류 발생 시 기본 응답 반환
    return {
      structure: "문장 구조를 분석하는 중 오류가 발생했습니다.",
      explanation: "문장 해석을 제공할 수 없습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    }
  }
}
