import { NextRequest, NextResponse } from 'next/server';

async function analyzeWord(word: string, passageContext: string, apiKey: string) {
  const prompt = `영어 단어 "${word}"에 대한 한국 학습자를 위한 상세 분석을 요청합니다.

지문 맥락: "${passageContext}"

분석 요구사항:
1. 정확한 IPA 발음 기호
2. 가장 중요한 3가지 한국어 의미 (일반적 → 구체적 순서)
3. 각 의미별로 자연스럽고 실용적인 영어 예문
4. 예문의 정확하고 자연스러운 한국어 번역
5. 지문 맥락에서의 특별한 의미나 용법 고려

반드시 아래 JSON 형식으로만 응답하고, 다른 설명은 추가하지 마세요:

{
  "pronunciation": "/정확한IPA발음기호/",
  "meanings": [
    {
      "koreanMeaning": "가장 일반적이고 중요한 한국어 의미",
      "category": "주요 의미",
      "exampleSentence": "자연스럽고 실용적인 영어 예문",
      "exampleTranslation": "자연스러운 한국어 번역"
    },
    {
      "koreanMeaning": "두 번째로 중요한 한국어 의미",
      "category": "부가 의미",
      "exampleSentence": "다른 맥락의 자연스러운 영어 예문",
      "exampleTranslation": "두 번째 예문의 자연스러운 한국어 번역"
    },
    {
      "koreanMeaning": "지문이나 특정 맥락에서의 구체적 의미",
      "category": "맥락적 의미",
      "exampleSentence": "지문과 유사한 상황의 영어 예문",
      "exampleTranslation": "맥락적 예문의 한국어 번역"
    }
  ]
}`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    })
  });

  if (!response.ok) {
    throw new Error(`Google API 호출 실패: ${response.status}`);
  }

  const data = await response.json();
  const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  let parsedResponse;
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    parsedResponse = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
  } catch {
    parsedResponse = {
      pronunciation: `/${word}/`,
      meanings: [{
        koreanMeaning: `${word}의 의미`,
        category: "주요 의미",
        exampleSentence: `Example with ${word}.`,
        exampleTranslation: `${word} 예문입니다.`
      }]
    };
  }

  if (!parsedResponse.meanings || !Array.isArray(parsedResponse.meanings)) {
    parsedResponse.meanings = [{
      koreanMeaning: `${word}의 의미`,
      category: "주요 의미",
      exampleSentence: `Example with ${word}.`,
      exampleTranslation: `${word} 예문입니다.`
    }];
  }

  return parsedResponse;
}

export async function POST(request: NextRequest) {
  try {
    const { word, passageContext, apiKey } = await request.json();

    if (!word) {
      return NextResponse.json({ error: 'Word is required' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'API Key is required' }, { status: 400 });
    }

    const result = await analyzeWord(word, passageContext || '', apiKey);
    return NextResponse.json(result);

  } catch (error) {
    console.error('단어 분석 오류:', error);
    return NextResponse.json({ error: '단어 분석 실패' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: '단어 분석 API' });
}