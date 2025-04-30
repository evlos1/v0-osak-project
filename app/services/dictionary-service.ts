export type WordDefinition = {
  word: string
  meaning: string
  example: string
  loading?: boolean
  error?: string
}

// 일반적인 영어 단어에 대한 기본 사전
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
    meaning: "다면적인, the many",
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

export async function getWordDefinition(word: string): Promise<WordDefinition> {
  // 단어를 소문자로 변환하여 검색
  const lowercaseWord = word.toLowerCase()

  // 사전에서 단어 찾기
  if (basicDictionary[lowercaseWord]) {
    return {
      word,
      meaning: basicDictionary[lowercaseWord].meaning,
      example: basicDictionary[lowercaseWord].example,
    }
  }

  // 사전에 없는 단어일 경우 기본 응답
  return {
    word,
    meaning: "이 단어는 현재 사전에 등록되어 있지 않습니다.",
    example: "예문이 준비되지 않았습니다.",
    error: "단어를 찾을 수 없습니다.",
  }
}

// 모든 단어 목록 반환
export function getAllWords(): string[] {
  return Object.keys(basicDictionary)
}
