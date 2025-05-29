import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Google Gemini API 클라이언트 초기화
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { words, wordDetails, passageText } = await request.json();

    if (!words || !Array.isArray(words) || words.length === 0) {
      return NextResponse.json(
        { error: '단어 목록이 제공되지 않았습니다.' },
        { status: 400 }
      );
    }

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: 'Google API 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    // Google Gemini 모델 사용
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // 단어별 상세 정보 정리
    const wordDetailsText = words.map(word => {
      const detail = wordDetails[word];
      if (!detail || !detail.definitions) return `${word}: 정보 없음`;
      
      return `${word}:
- 발음: ${detail.pronunciation || '정보 없음'}  
- 의미들: ${detail.definitions.map((def: any) => `"${def.meaning}"`).join(', ')}
- 예문들: ${detail.definitions.map((def: any) => `"${def.example}"`).join(', ')}`;
    }).join('\n\n');

    const prompt = `
다음 영어 단어들에 대한 문맥 기반 퀴즈를 생성해주세요:

학습한 단어들:
${wordDetailsText}

지문 맥락:
"${passageText}"

퀴즈 생성 조건:
1. 각 단어마다 2개의 문제 생성 (총 ${words.length * 2}개 문제)
2. 문제 유형:
   - 문맥 의미 문제: 예문을 주고 단어의 한국어 의미 묻기
   - 지문 맥락 문제: 지문 속 문장에서 단어의 의미 묻기
3. 4지선다 형식
4. 정답은 학습한 실제 의미 사용
5. 오답은 그럴듯하지만 틀린 한국어 의미들

반드시 다음 JSON 형식으로만 응답해주세요:

{
  "questions": [
    {
      "word": "단어",
      "question": "문장을 주고 단어의 의미를 묻는 질문\\n\\n\\"예문이나 지문 문장\\"",
      "options": [
        "정답 - 실제 한국어 의미",
        "오답 1 - 그럴듯한 틀린 의미",
        "오답 2 - 그럴듯한 틀린 의미", 
        "오답 3 - 그럴듯한 틀린 의미"
      ],
      "correctAnswer": 0,
      "type": "contextMeaning"
    }
  ]
}

중요: 
- 오답들은 완전히 관련 없는 것이 아니라 해당 단어와 연관성이 있어 보이지만 틀린 의미여야 합니다
- 예문과 지문 문장은 실제 제공된 내용을 사용하세요
- 질문은 명확하고 이해하기 쉽게 작성하세요
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    if (!responseText) {
      throw new Error('Google AI 응답이 비어있습니다.');
    }

    // JSON 파싱 시도
    let parsedResponse;
    try {
      // 응답에서 JSON 부분만 추출
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : responseText;
      parsedResponse = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('퀴즈 JSON 파싱 실패:', parseError);
      console.log('원본 응답:', responseText);
      
      // 파싱 실패 시 기본 퀴즈 생성
      throw new Error('AI 퀴즈 응답을 파싱할 수 없습니다.');
    }

    // 응답 검증
    if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
      throw new Error('퀴즈 형식이 올바르지 않습니다.');
    }

    // 퀴즈 문제 검증 및 보완
    const validQuestions = parsedResponse.questions.filter((q: any) => 
      q.word && q.question && q.options && Array.isArray(q.options) && q.options.length === 4
    );

    if (validQuestions.length === 0) {
      throw new Error('유효한 퀴즈 문제가 생성되지 않았습니다.');
    }

    // 문제 순서 랜덤화
    const shuffledQuestions = validQuestions.sort(() => Math.random() - 0.5);

    return NextResponse.json({
      questions: shuffledQuestions,
      totalQuestions: shuffledQuestions.length,
      wordsCount: words.length,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI 퀴즈 생성 오류:', error);
    
    return NextResponse.json(
      { 
        error: '퀴즈 생성 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}

// GET 요청 처리 (테스트용)
export async function GET() {
  return NextResponse.json({
    message: 'Google AI 기반 단어 퀴즈 생성 서비스입니다.',
    usage: {
      method: 'POST',
      body: {
        words: ['단어1', '단어2'],
        wordDetails: {
          '단어1': {
            pronunciation: '발음',
            definitions: [
              {
                meaning: '한국어 의미',
                example: '영어 예문',
                exampleTranslation: '한국어 번역'
              }
            ]
          }
        },
        passageText: '전체 지문 내용'
      }
    },
    features: [
      '문맥 기반 퀴즈 생성',
      '실제 학습한 의미 활용',
      '그럴듯한 오답 생성', 
      '4지선다 형식',
      '자동 랜덤화'
    ]
  });
}