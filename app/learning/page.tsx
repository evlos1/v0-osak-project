"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import WordLearning from "@/components/learning/word-learning";
import SentenceLearning from "@/components/learning/sentence-learning";
import PassageLearning from "@/components/learning/passage-learning";
import { useTranslation } from "@/app/i18n"; // 경로 확인 필요
import { getApiKey } from "@/lib/api-key-utils";

export type SentenceDisplayData = { /* ... */ };

// 1. API가 실제로 반환하는 데이터 구조에 맞춘 타입 정의
type ApiReceivedContent = {
  title: string;
  passage: string;
  sentences: string[];
  sentenceExplanations: Record<string, {
    structure: string;
    explanation: string;
  }>;
  passageExplanation: {
    theme: string;
    structure: string;
    translation: string;
  };
  quizzes: {
    words: Array<{
      questionType?: "fill-in-blank" | "meaning";
      question: string;
      options: string[];
      answer: number;
    }>;
    sentences: Array<{
      questionType?: "comprehension" | "structure";
      relatedSentence?: string;
      question: string;
      options: string[];
      answer: number;
    }>;
    passage: Array<{
      question: string;
      options: string[];
      answer: number;
    }>;
  };
};

// 2. 각 학습 컴포넌트에 전달하기 위한 데이터 형태 정의
export type WordDisplayData = {
  word: string;
  meaning: string;
};

export type SentenceDisplayData = {
  sentence: string;
  translationOrExplanation: string;
  structure?: string;
};

export type PassageDisplayData = {
  text: string;
  translation: string;
};

export default function LearningPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [content, setContent] = useState<ApiReceivedContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("passage"); // 초기 탭을 지문으로 변경해볼 수 있음
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  console.log("LearningPage RENDER - loading:", loading, "error:", error, "content set:", !!content, "apiKeyMissing:", apiKeyMissing);

  const loadLearningContent = useCallback(async () => {
    console.log("loadLearningContent CALLED - Start");
    setLoading(true);
    setError(null); // 이전 오류 초기화
    setApiKeyMissing(false);

    try {
      const storedApiKey = getApiKey();
      console.log("학습 페이지 - API 키 확인:", storedApiKey ? "존재함" : "없음");

      if (!storedApiKey) {
        console.warn("학습 페이지 - API 키가 없어 설정 페이지로 이동합니다.");
        setApiKeyMissing(true);
        setLoading(false); // 여기서 로딩 상태를 false로 설정해야 apiKeyMissing UI가 보임
        router.replace("/settings");
        return;
      }

      const topic = searchParams.get("topic") || "일반";
      const level = searchParams.get("level") || "B1";
      const storageKey = `learning-content-${topic}-${level}`;
      const storedContentData = localStorage.getItem(storageKey);

      if (storedContentData) {
        try {
          const parsedContent: ApiReceivedContent = JSON.parse(storedContentData);
          if (parsedContent && parsedContent.passage && parsedContent.sentences && parsedContent.quizzes) {
            setContent(parsedContent);
            setLoading(false);
            console.log("학습 페이지 - 저장된 콘텐츠 로드 성공. Loading set to false.");
            return;
          } else {
            console.warn("저장된 콘텐츠 형식이 유효하지 않아 새로 로드합니다.");
            localStorage.removeItem(storageKey);
          }
        } catch (parseError) {
          console.error("저장된 콘텐츠 파싱 오류:", parseError);
          localStorage.removeItem(storageKey);
        }
      }

      console.log(`학습 페이지 - 새 콘텐츠 생성 시작 (주제: ${topic}, 레벨: ${level})`);
      const response = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, level, apiKey: storedApiKey }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "서버 응답 오류 (JSON 아님)" }));
        throw new Error(errorData.message || `콘텐츠 생성 실패: ${response.status} ${response.statusText}`);
      }

      const newContent: ApiReceivedContent = await response.json();
      console.log("API로부터 받은 실제 데이터 (learning/page.tsx):", JSON.stringify(newContent, null, 2));

      if (!newContent || !newContent.passage || !newContent.sentences || !newContent.quizzes || !newContent.passageExplanation || !newContent.sentenceExplanations) {
        console.error("API 응답 콘텐츠 유효성 검사 실패. 받은 데이터:", newContent);
        throw new Error("생성된 콘텐츠의 주요 필드가 누락되었습니다.");
      }

      localStorage.setItem(storageKey, JSON.stringify(newContent));
      setContent(newContent);
      console.log("학습 페이지 - 새 콘텐츠 생성 및 저장 성공");

    } catch (err: any) {
      console.error("콘텐츠 로드 중 오류 발생 (catch block):", err);
      setError(err.message || String(err) || (t("unknown_error_occurred") as string));
    } finally {
      console.log("FINALLY block - Before setLoading(false). Current loading state:", loading);
      setLoading(false);
      console.log("FINALLY block - After setLoading(false). Current loading state should be false now.");
      console.log("loadLearningContent END - In finally block.");
    }
  }, [searchParams, router, t]);

  useEffect(() => {
    console.log("useEffect for loadLearningContent TRIGGERED");
    loadLearningContent();
  }, [loadLearningContent]);

  const goToSettings = () => {
    router.push("/settings");
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-8 w-2/3" />
            </div>
            <p className="text-center mt-4 text-muted-foreground">{t("loading_learning_content") || "학습 콘텐츠 로딩 중..."}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (apiKeyMissing) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("api_key_required")}</AlertTitle>
          <AlertDescription>{t("api_key_description")}</AlertDescription>
        </Alert>
        <Button onClick={goToSettings}>{t("go_to_settings")}</Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("error_occurred")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={loadLearningContent} className="mr-2">{t("retry")}</Button>
        <Button variant="outline" onClick={() => router.back()}>{t("back")}</Button>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="warning" className="mb-4"> {/* 에러가 아닌 경고로 표시 */}
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("content_not_yet_available") || "콘텐츠 준비 중"}</AlertTitle>
          <AlertDescription>{t("content_not_yet_available_description") || "콘텐츠가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요."}</AlertDescription>
        </Alert>
        <Button onClick={loadLearningContent}>{t("retry")}</Button>
        <Button variant="outline" className="ml-2" onClick={() => router.push("/topic-selection")}>{t("select_new_topic")}</Button>
      </div>
    );
  }

  // --- 실제 콘텐츠 UI 렌더링 시작 (try...catch로 감싸기) ---
    // app/learning/page.tsx 의 try { ... } 블록 내부
// app/learning/page.tsx

// ... (파일 상단의 import 구문, 타입 정의, LearningPage 함수 선언, useState, useEffect, loadLearningContent 등은 모두 그대로 둡니다) ...

  // if (loading) { ... }
  // if (apiKeyMissing) { ... }
  // if (error) { ... }
  // if (!content) { ... } // 이 조건문 블록 바로 다음에 아래 try...catch를 넣습니다.

  try {
    console.log("TRY_BLOCK_ENTERED for rendering. Content title:", content.title);

    // 1. passageForDisplay 가공 (안전하게)
    const passageForDisplay: PassageDisplayData = {
      text: content.passage || "지문 텍스트 없음",
      translation: content.passageExplanation?.translation || "지문 번역 없음",
    };
    console.log("passageForDisplay created:", passageForDisplay.text.substring(0, 50) + "...");

    // 2. sentencesForDisplay 가공 (안전하게)
    const sentencesForDisplay: SentenceDisplayData[] = Array.isArray(content.sentences)
      ? content.sentences.map((engSentence, index) => {
          const explanationData = content.sentenceExplanations?.[index.toString()];
          return {
            sentence: engSentence,
            translationOrExplanation: explanationData?.explanation || (t("no_explanation_available") as string) || "설명/번역 없음",
            structure: explanationData?.structure,
          };
        })
      : [];
    console.log("sentencesForDisplay created. Count:", sentencesForDisplay.length);

    // 3. wordsForDisplay 가공 (오류 방지를 위해 매우 단순화 및 확실한 초기화)
    let wordsForDisplay: WordDisplayData[] = []; // 먼저 빈 배열로 확실히 선언 및 초기화
    console.log("Initialized empty wordsForDisplay. Length:", wordsForDisplay.length);

    // (선택적) 임시 테스트 데이터 추가 - API 의존 없이 테스트
    wordsForDisplay.push({ word: "TestWord1", meaning: "테스트 단어 의미 1 (고정값)" });
    wordsForDisplay.push({ word: "ExampleWord2", meaning: "다른 테스트 단어 (고정값)" });
    
    // 또는, 이전의 첫 단어 추출 로직 (더 안전하게)
    // if (content.passage && typeof content.passage === 'string') {
    //   const firstWordMatch = content.passage.match(/[a-zA-Z']+/);
    //   if (firstWordMatch && firstWordMatch[0]) {
    //     wordsForDisplay.push({
    //       word: firstWordMatch[0],
    //       meaning: `(지문 첫 단어: ${firstWordMatch[0]})`
    //     });
    //   }
    // }
    console.log("Final wordsForDisplay for test render. Length:", wordsForDisplay.length, "Content:", JSON.stringify(wordsForDisplay));

    // 4. 화면에 표시될 최종 로그
    console.log(
      "Data transformation successful. Passage ready. Sentences count:",
      sentencesForDisplay.length,
      "Words count (test):",
      wordsForDisplay.length
    );

    // --- 500 오류 디버깅을 위한 매우 단순화된 return 문 ---
    // 실제 Tabs UI는 잠시 주석 처리하고, 가공된 데이터가 정상인지 화면에 직접 표시해봅니다.
    return (
      <div className="container mx-auto py-8 px-4" style={{ border: "2px solid green", padding: "10px" }}>
        <h1 className="text-2xl font-bold mb-4" style={{ color: "green" }}>
          {content.title} (디버그용 단순 렌더링)
        </h1>
        <hr />

        <h2 className="text-xl mt-3 font-semibold">지문 (Passage)</h2>
        <div style={{ border: "1px dashed blue", padding: "5px", whiteSpace: "pre-wrap" }}>
          <p><strong>원문:</strong> {passageForDisplay.text}</p>
          <p><strong>번역:</strong> {passageForDisplay.translation}</p>
        </div>
        <hr className="my-3" />

        <h2 className="text-xl mt-3 font-semibold">문장 (Sentences) - 총 {sentencesForDisplay.length}개</h2>
        {/* 모든 문장을 다 표시하면 너무 길어질 수 있으니, 첫 번째 문장만 테스트로 표시하거나 개수만 표시 */}
        {sentencesForDisplay.length > 0 && (
          <div style={{ border: "1px dashed purple", padding: "5px" }}>
            <p><strong>첫 문장:</strong> {sentencesForDisplay[0].sentence}</p>
            <p><strong>설명/번역:</strong> {sentencesForDisplay[0].translationOrExplanation}</p>
          </div>
        )}
        <hr className="my-3" />

        <h2 className="text-xl mt-3 font-semibold">단어 (Words) - 총 {wordsForDisplay.length}개</h2>
        <div style={{ border: "1px dashed orange", padding: "5px" }}>
          {wordsForDisplay.map((w, i) => (
            <div key={i}>{w.word}: {w.meaning}</div>
          ))}
          {wordsForDisplay.length === 0 && <p>(표시할 단어가 없습니다 - wordsForDisplay가 비어있음)</p>}
        </div>
        
        {/* <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="words">{t("words_learning")}</TabsTrigger>
            <TabsTrigger value="sentences">{t("sentences_learning")}</TabsTrigger>
            <TabsTrigger value="passage">{t("passage_learning")}</TabsTrigger>
          </TabsList>
          <TabsContent value="words">
            <WordLearning words={wordsForDisplay} />
          </TabsContent>
          <TabsContent value="sentences">
            <SentenceLearning sentences={sentencesForDisplay} />
          </TabsContent>
          <TabsContent value="passage">
            <PassageLearning passage={passageForDisplay} />
          </TabsContent>
        </Tabs>
        */}
      </div>
    );

  } catch (renderError: any) {
    console.error("LEARNING_PAGE_RENDER_ERROR (콘텐츠 렌더링 중 오류):", renderError);
    // 에러 상태를 설정하여 사용자에게 피드백을 줄 수 있습니다.
    // 다만, 이 catch 블록이 실행되면 이미 렌더링 단계이므로,
    // setError를 호출하면 추가적인 리렌더링이 발생할 수 있습니다.
    // 이미 if (error) 블록이 위쪽에 있으므로, 상태를 업데이트하면 그쪽에서 처리될 것입니다.
    // 하지만 여기서 직접 에러 UI를 반환하는 것이 더 즉각적일 수 있습니다.
    if (!error) { // 무한 루프를 피하기 위해, 아직 에러 상태가 아닐 때만 설정
        setError("콘텐츠를 화면에 표시하는 중 심각한 내부 오류가 발생했습니다: " + renderError.message);
    }
    return ( // 여기서 직접적인 오류 UI 반환
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("render_error_title") || "화면 표시 오류"}</AlertTitle>
          <AlertDescription>
            {t("render_error_description") || "콘텐츠를 화면에 표시하는 중 문제가 발생했습니다. "}
            {renderError.message}
          </AlertDescription>
        </Alert>
        <Button onClick={loadLearningContent} className="mt-4">{t("retry")}</Button>
      </div>
    );
  }
} // LearningPage 컴포넌트의 끝