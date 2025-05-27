"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import { useTranslation } from "@/app/i18n";
import { getApiKey } from "@/lib/api-key-utils";
import { getWordDefinition, type WordDefinition } from "@/app/actions/dictionary";

// 완전한 타입 정의
interface ApiReceivedContent {
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
    [key: string]: any;
  };
  vocabulary?: Array<{ 
    word: string; 
    koreanMeaning: string; 
    englishDefinition?: string; 
    exampleSentence?: string; 
  }>;
}

// 하위 컴포넌트 props 타입
export interface WordDisplayData {
  word: string;
  koreanMeaning: string;
  englishDefinition?: string;
  exampleSentence?: string;
}

export interface SentenceDisplayData {
  sentence: string;
  translationOrExplanation: string;
  structure?: string;
}

export interface PassageExplanationData {
  theme: string;
  structure: string;
  translation: string;
}

export interface PassageLearningDataForChild {
  passageText: string;
  explanation: PassageExplanationData;
}

// localStorage 안전 사용 유틸리티
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('localStorage getItem 실패:', error);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('localStorage setItem 실패:', error);
    }
  },
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('localStorage removeItem 실패:', error);
    }
  }
};

// 콘텐츠 유효성 검사 함수
const validateContent = (content: any): content is ApiReceivedContent => {
  if (!content || typeof content !== 'object') return false;
  
  const requiredFields = ['title', 'passage', 'sentences', 'passageExplanation'];
  const hasRequiredFields = requiredFields.every(field => 
    content[field] !== undefined && content[field] !== null
  );
  
  if (!hasRequiredFields) return false;
  
  if (!Array.isArray(content.sentences) || content.sentences.length === 0) {
    return false;
  }
  
  const explanation = content.passageExplanation;
  if (!explanation || !explanation.theme || !explanation.structure || !explanation.translation) {
    return false;
  }
  
  return true;
};

export default function LearningPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [content, setContent] = useState<ApiReceivedContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("passage");
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [userSelectedWords, setUserSelectedWords] = useState<string[]>([]);
  const [wordDetailsCache, setWordDetailsCache] = useState<Record<string, WordDefinition | null>>({});

  // 무한 루프 방지를 위한 ref
  const loadingRef = useRef(false);
  const topicRef = useRef<string>('');
  const levelRef = useRef<string>('');

  // 단어 상세 정보 가져오기 (최적화된 버전)
  const fetchWordDetails = useCallback(async (word: string) => {
    const apiKey = getApiKey();
    if (!apiKey) return;

    try {
      const wordData = await getWordDefinition(word, apiKey, i18n.language);
      setWordDetailsCache(prev => ({
        ...prev,
        [word]: wordData
      }));
    } catch (error) {
      console.error(`단어 '${word}' 정의 가져오기 실패:`, error);
      setWordDetailsCache(prev => ({
        ...prev,
        [word]: {
          word,
          meanings: [{
            koreanDefinition: '단어 정의를 가져올 수 없습니다',
            definition: '',
            example: ''
          }],
          error: true
        }
      }));
    }
  }, [i18n.language]);

  // 단어 선택/해제 처리
  const handleToggleWordSelection = useCallback((word: string) => {
    const cleanWord = word.toLowerCase().trim();
    
    setUserSelectedWords(prev => {
      const isSelected = prev.includes(cleanWord);
      const newSelection = isSelected 
        ? prev.filter(w => w !== cleanWord)
        : [...prev, cleanWord];
      
      // 새로 선택된 단어의 상세 정보 가져오기
      if (!isSelected && !wordDetailsCache[cleanWord]) {
        // 로딩 상태 먼저 설정
        setWordDetailsCache(current => ({
          ...current,
          [cleanWord]: { word: cleanWord, meanings: [], loading: true }
        }));
        
        // 비동기로 데이터 가져오기
        fetchWordDetails(cleanWord);
      }
      
      return newSelection;
    });
  }, [fetchWordDetails, wordDetailsCache]);

  // 학습 콘텐츠 로드 함수
  const loadLearningContent = useCallback(async () => {
    // 이미 로딩 중이면 중복 실행 방지
    if (loadingRef.current) return;
    
    const topic = searchParams.get("topic") || "일반";
    const level = searchParams.get("level") || "B1";
    
    // 같은 토픽/레벨이면 재로딩하지 않음
    if (topicRef.current === topic && levelRef.current === level && content) {
      return;
    }
    
    loadingRef.current = true;
    topicRef.current = topic;
    levelRef.current = level;
    
    setLoading(true);
    setError(null);
    setApiKeyMissing(false);
    setUserSelectedWords([]);
    setWordDetailsCache({});

    try {
      const storedApiKey = getApiKey();
      
      if (!storedApiKey) {
        setApiKeyMissing(true);
        router.replace("/settings");
        return;
      }

      const storageKey = `learning-content-${topic}-${level}`;
      const storedContentData = safeLocalStorage.getItem(storageKey);
      
      if (storedContentData) {
        try {
          const parsedContent = JSON.parse(storedContentData);
          
          if (validateContent(parsedContent)) {
            setContent(parsedContent);
            return;
          } else {
            safeLocalStorage.removeItem(storageKey);
          }
        } catch (parseError) {
          console.error("저장된 콘텐츠 파싱 오류:", parseError);
          safeLocalStorage.removeItem(storageKey);
        }
      }

      // 새 콘텐츠 생성
      const response = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, level, apiKey: storedApiKey }),
      });

      if (!response.ok) {
        let errorMessage = `콘텐츠 생성 실패: ${response.status}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // JSON 파싱 실패 시 기본 메시지 사용
        }
        
        throw new Error(errorMessage);
      }

      const newContent = await response.json();
      
      if (!validateContent(newContent)) {
        throw new Error("생성된 콘텐츠가 유효하지 않습니다.");
      }

      safeLocalStorage.setItem(storageKey, JSON.stringify(newContent));
      setContent(newContent);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
      console.error("콘텐츠 로드 오류:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [searchParams, router, content]);

  // 초기 로드 및 URL 파라미터 변경 감지
  useEffect(() => {
    loadLearningContent();
  }, [searchParams.get("topic"), searchParams.get("level")]); // 특정 파라미터만 감지

  const goToSettings = () => router.push("/settings");

  // 로딩 상태
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
            <p className="text-center mt-4 text-muted-foreground">
              {t("loading_learning_content") || "학습 콘텐츠 로딩 중..."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // API 키 누락
  if (apiKeyMissing) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("api_key_required") || "API 키 필요"}</AlertTitle>
          <AlertDescription>
            {t("api_key_description") || "API 키를 설정해주세요."}
          </AlertDescription>
        </Alert>
        <Button onClick={goToSettings}>
          {t("go_to_settings") || "설정으로 이동"}
        </Button>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("error_occurred") || "오류 발생"}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="space-x-2">
          <Button onClick={() => {
            // 강제 재로딩을 위해 ref 리셋
            loadingRef.current = false;
            topicRef.current = '';
            levelRef.current = '';
            loadLearningContent();
          }}>
            {t("retry") || "다시 시도"}
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            {t("back") || "뒤로"}
          </Button>
        </div>
      </div>
    );
  }

  // 콘텐츠 없음
  if (!content) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("content_not_available") || "콘텐츠 준비 중"}</AlertTitle>
          <AlertDescription>
            {t("content_not_available_description") || 
             "콘텐츠가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요."}
          </AlertDescription>
        </Alert>
        <div className="space-x-2">
          <Button onClick={() => {
            loadingRef.current = false;
            topicRef.current = '';
            levelRef.current = '';
            loadLearningContent();
          }}>
            {t("retry") || "다시 시도"}
          </Button>
          <Button variant="outline" onClick={() => router.push("/topic-selection")}>
            {t("select_new_topic") || "새 주제 선택"}
          </Button>
        </div>
      </div>
    );
  }

  // 메인 콘텐츠 렌더링
  try {
    const passageDataForChild: PassageLearningDataForChild = {
      passageText: content.passage || "",
      explanation: {
        theme: content.passageExplanation?.theme || "",
        structure: content.passageExplanation?.structure || "",
        translation: content.passageExplanation?.translation || "",
      }
    };

    const sentencesForDisplay: SentenceDisplayData[] = Array.isArray(content.sentences) 
      ? content.sentences.map((sentence, index) => ({
          sentence,
          translationOrExplanation: content.sentenceExplanations?.[index.toString()]?.explanation || "설명 없음",
          structure: content.sentenceExplanations?.[index.toString()]?.structure
        }))
      : [];

    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-4">{content.title}</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="words">{t("words_learning") || "단어 학습"}</TabsTrigger>
            <TabsTrigger value="sentences">{t("sentences_learning") || "문장 학습"}</TabsTrigger>
            <TabsTrigger value="passage">{t("passage_learning") || "지문 학습"}</TabsTrigger>
          </TabsList>

          <TabsContent value="words">
            <WordLearning
              selectedWords={userSelectedWords}
              wordDetails={wordDetailsCache}
              onRetryWordDetailFetch={(wordToRetry) => {
                fetchWordDetails(wordToRetry);
              }}
            />
          </TabsContent>
          
          <TabsContent value="sentences">
            <SentenceLearning sentences={sentencesForDisplay} />
          </TabsContent>
          
          <TabsContent value="passage">
            <PassageLearning
              passageData={passageDataForChild}
              onWordSelect={handleToggleWordSelection}
              selectedWords={userSelectedWords}
            />
          </TabsContent>
        </Tabs>
      </div>
    );

  } catch (renderError) {
    console.error("렌더링 오류:", renderError);
    
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("render_error_title") || "화면 표시 오류"}</AlertTitle>
          <AlertDescription>
            {t("render_error_description") || "콘텐츠를 화면에 표시하는 중 문제가 발생했습니다."} 
            {renderError instanceof Error ? renderError.message : String(renderError)}
          </AlertDescription>
        </Alert>
        <div className="space-x-2">
          <Button onClick={() => {
            loadingRef.current = false;
            topicRef.current = '';
            levelRef.current = '';
            loadLearningContent();
          }}>
            {t("retry") || "다시 시도"}
          </Button>
          <Button variant="outline" onClick={() => router.push("/topic-selection")}>
            {t("select_new_topic") || "새 주제 선택"}
          </Button>
        </div>
      </div>
    );
  }
}