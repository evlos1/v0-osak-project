"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Clock, BookOpen, Target, FileText } from "lucide-react";
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

// 학습 단계 타입
type LearningStep = 'words' | 'sentences' | 'passage' | 'completed';

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
  const [activeTab, setActiveTab] = useState<LearningStep>("words"); // 단어 학습부터 시작
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  
  // 학습 진행 상태 추적
  const [completedSteps, setCompletedSteps] = useState<Set<LearningStep>>(new Set());
  const [currentStep, setCurrentStep] = useState<LearningStep>("words");
  
  // 단어 관련 상태
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [learnedWords, setLearnedWords] = useState<string[]>([]);
  const [wordDetailsCache, setWordDetailsCache] = useState<Record<string, WordDefinition | null>>({});

  // 무한 루프 방지를 위한 ref
  const loadingRef = useRef(false);
  const topicRef = useRef<string>('');
  const levelRef = useRef<string>('');

  // 학습 단계 진행 함수
  const proceedToNextStep = useCallback((currentStepName: LearningStep) => {
    setCompletedSteps(prev => new Set([...prev, currentStepName]));
    
    const stepOrder: LearningStep[] = ['words', 'sentences', 'passage'];
    const currentIndex = stepOrder.indexOf(currentStepName);
    
    if (currentIndex < stepOrder.length - 1) {
      const nextStep = stepOrder[currentIndex + 1];
      setCurrentStep(nextStep);
      setActiveTab(nextStep);
    } else {
      // 모든 학습 완료
      setCurrentStep('completed');
      setCompletedSteps(prev => new Set([...prev, 'completed']));
    }
  }, []);

  // 단어 상세 정보 가져오기
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

  // 초기 단어 추출 및 캐싱 (더 이상 필요 없음 - WordLearning에서 처리)
  const extractAndCacheWords = useCallback(async (content: ApiReceivedContent) => {
    // WordLearning 컴포넌트에서 직접 단어 선택을 처리하므로 
    // 여기서는 기본 단어만 설정 (선택사항)
    if (content.vocabulary && content.vocabulary.length > 0) {
      const wordsToLearn = content.vocabulary.map(v => v.word.toLowerCase().trim());
      setSelectedWords(wordsToLearn);
    }
  }, []);

  // 학습 콘텐츠 로드 함수
  const loadLearningContent = useCallback(async () => {
    if (loadingRef.current) return;
    
    const topic = searchParams.get("topic") || "일반";
    const level = searchParams.get("level") || "B1";
    
    if (topicRef.current === topic && levelRef.current === level && content) {
      return;
    }
    
    loadingRef.current = true;
    topicRef.current = topic;
    levelRef.current = level;
    
    setLoading(true);
    setError(null);
    setApiKeyMissing(false);
    
    // 상태 초기화
    setActiveTab("words");
    setCurrentStep("words");
    setCompletedSteps(new Set());
    setSelectedWords([]);
    setLearnedWords([]);
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
            await extractAndCacheWords(parsedContent);
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
      await extractAndCacheWords(newContent);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
      console.error("콘텐츠 로드 오류:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [searchParams, router, content, extractAndCacheWords]);

  // 초기 로드
  useEffect(() => {
    loadLearningContent();
  }, [searchParams.get("topic"), searchParams.get("level")]);

  // 단어 학습 완료 핸들러
  const handleWordLearningComplete = useCallback((words: string[]) => {
    setLearnedWords(words);
    proceedToNextStep('words');
  }, [proceedToNextStep]);

  // 문장 학습 완료 핸들러
  const handleSentenceLearningComplete = useCallback(() => {
    proceedToNextStep('sentences');
  }, [proceedToNextStep]);

  // 새로운 학습 시작 핸들러
  const handleStartNewLearning = useCallback(() => {
    // 현재 상태 초기화
    setActiveTab("words");
    setCurrentStep("words");
    setCompletedSteps(new Set());
    setSelectedWords([]);
    setLearnedWords([]);
    
    // 새로운 콘텐츠 로드를 위해 기존 캐시 제거
    loadingRef.current = false;
    topicRef.current = '';
    levelRef.current = '';
    
    // 새로운 콘텐츠 로드
    loadLearningContent();
  }, [loadLearningContent]);

  // 학습 완전 종료 핸들러
  const handleFinishLearning = useCallback(() => {
    // 주제 선택 페이지로 이동
    router.push("/topic-selection");
  }, [router]);

  // 탭 클릭 제한 (순서대로만 진행 가능)
  const canAccessTab = useCallback((tabName: LearningStep) => {
    const stepOrder: LearningStep[] = ['words', 'sentences', 'passage'];
    const tabIndex = stepOrder.indexOf(tabName);
    const currentIndex = stepOrder.indexOf(currentStep);
    
    return tabIndex <= currentIndex || completedSteps.has(tabName);
  }, [currentStep, completedSteps]);

  // 진행 상태 아이콘
  const getStepIcon = (stepName: LearningStep) => {
    if (completedSteps.has(stepName)) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    } else if (stepName === currentStep) {
      return <Clock className="h-4 w-4 text-blue-600" />;
    } else {
      return <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />;
    }
  };

  // 진행 상태 배지
  const getStepBadge = (stepName: LearningStep) => {
    if (completedSteps.has(stepName)) {
      return <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">완료</Badge>;
    } else if (stepName === currentStep) {
      return <Badge variant="default" className="ml-2">진행 중</Badge>;
    } else if (!canAccessTab(stepName)) {
      return <Badge variant="outline" className="ml-2">대기</Badge>;
    }
    return null;
  };

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

  // 학습 완료 상태
  if (currentStep === 'completed') {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Target className="h-20 w-20 text-green-600 mx-auto" />
              <h2 className="text-3xl font-bold text-green-700 dark:text-green-300">
                🎉 모든 학습 완료!
              </h2>
              <p className="text-green-600 dark:text-green-400 text-lg">
                단어 학습, 문장 학습, 지문 학습을 모두 완료했습니다.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                <Button onClick={() => router.push("/topic-selection")} size="lg">
                  새로운 주제 선택하기
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setCurrentStep("words");
                    setActiveTab("words");
                    setCompletedSteps(new Set());
                  }}
                  size="lg"
                >
                  다시 학습하기
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">{content.title}</h1>
          
          {/* 학습 진행 상황 표시 */}
          <Card className="mb-4">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getStepIcon('words')}
                    <span className={completedSteps.has('words') ? 'text-green-600' : ''}>
                      1. 단어 학습
                    </span>
                  </div>
                  <div className="text-muted-foreground">→</div>
                  <div className="flex items-center gap-2">
                    {getStepIcon('sentences')}
                    <span className={completedSteps.has('sentences') ? 'text-green-600' : ''}>
                      2. 문장 학습
                    </span>
                  </div>
                  <div className="text-muted-foreground">→</div>
                  <div className="flex items-center gap-2">
                    {getStepIcon('passage')}
                    <span className={completedSteps.has('passage') ? 'text-green-600' : ''}>
                      3. 지문 학습
                    </span>
                  </div>
                </div>
                <div className="text-muted-foreground">
                  {completedSteps.size}/3 단계 완료
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs value={activeTab} onValueChange={(value) => {
          const step = value as LearningStep;
          if (canAccessTab(step)) {
            setActiveTab(step);
          }
        }} className="w-full">
          
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger 
              value="words" 
              disabled={!canAccessTab('words')}
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              단어 학습
              {getStepBadge('words')}
            </TabsTrigger>
            
            <TabsTrigger 
              value="sentences" 
              disabled={!canAccessTab('sentences')}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              문장 학습
              {getStepBadge('sentences')}
            </TabsTrigger>
            
            <TabsTrigger 
              value="passage" 
              disabled={!canAccessTab('passage')}
              className="flex items-center gap-2"
            >
              <Target className="h-4 w-4" />
              지문 학습
              {getStepBadge('passage')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="words">
            {/* 디버깅을 위한 로그 */}
            {console.log('Passage text being passed to WordLearning:', content?.passage?.substring(0, 100))}
            <WordLearning
              words={selectedWords} // 선택사항: 미리 선택된 단어들
              passageText={content?.passage || ''} // 안전한 접근
              onWordLearningComplete={handleWordLearningComplete}
            />
          </TabsContent>
          
          <TabsContent value="sentences">
            <SentenceLearning 
              passageText={content.passage} // 필수: 지문 텍스트
              sentences={sentencesForDisplay.map(s => s.sentence)} // 선택사항: 미리 분할된 문장들
              onSentenceLearningComplete={handleSentenceLearningComplete}
            />
          </TabsContent>
          
          <TabsContent value="passage">
            <PassageLearning
              passageData={passageDataForChild}
              onLearningComplete={handleFinishLearning} // 학습 완전 종료
              onStartNewLearning={handleStartNewLearning} // 새로운 학습 시작
              learnedWords={learnedWords} // 학습 완료된 단어들 전달
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