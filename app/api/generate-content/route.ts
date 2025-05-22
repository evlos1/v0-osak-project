// app/api/generate-content/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateLearningContent, GeneratedContent } from '@/app/actions/content-generator';
// import { getApiKey } from '@/lib/api-key-utils'; // 서버에서 직접 호출하지 않으므로 이 import는 필요 없을 수 있습니다. (아래 참고)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // 클라이언트에서 보낸 topic, level, language, 그리고 apiKey를 추출합니다.
    const { topic, level, language, apiKey: clientProvidedApiKey } = body;

    if (!topic || !level) {
      return NextResponse.json({ error: 'Topic and level are required parameters.' }, { status: 400 });
    }

    // 클라이언트에서 API 키를 제공하지 않은 경우 에러 처리
    if (!clientProvidedApiKey) {
      console.error('[API /api/generate-content] API Key was not provided in the request body.');
      return NextResponse.json({ error: 'API Key is required in the request body.' }, { status: 400 });
    }

    console.log(`[API /api/generate-content] Request for topic: "${topic}", level: "${level}", lang: "${language || 'ko'}", using client-provided API key.`);

    // Call your content generation logic with the API key from the client
    const learningContent: GeneratedContent = await generateLearningContent(
      topic,
      level,
      clientProvidedApiKey, // 클라이언트에서 받은 API 키 사용
      language || 'ko' // Default to Korean if language is not provided
    );

    return NextResponse.json(learningContent);

  } catch (error: any) {
    console.error('[API Error /api/generate-content] Failed to process request:', error);
    return NextResponse.json(
      { error: 'Failed to generate learning content.', details: error.message || 'An unknown error occurred' },
      { status: 500 }
    );
  }
}