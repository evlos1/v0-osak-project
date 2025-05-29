"use client";

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Book, BookOpen, Target } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Volume2, Pause, ChevronLeft, ChevronRight, Check, X, HelpCircle } from "lucide-react";

// 타입 정의
interface WordDefinition {
  meaning: string;
  partOfSpeech: string;
  example?: string;
  exampleTranslation?: string;
}

interface WordData {
  word: string;
  pronunciation?: string;
  definitions: WordDefinition[];
}

// WordLearning 컴포넌트 (완전한 구현)
const WordLearning = ({ 
  words, 
  passageText, 
  onWordLearningComplete, 
  onBackToPassage 
}: {
  words: string[];
  passageText?: string;
  onWordLearningComplete: (learnedWords: string[]) => void;
  onBackToPassage: () => void;
}) => {
  const { t } = useTranslation();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [wordDataList, setWordDataList] = useState<WordData[]>([]);
  const [learnedWords, setLearnedWords] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentWord = words[currentWordIndex];
  const currentWordData = wordDataList[currentWordIndex];
  const isLastWord = currentWordIndex === words.length - 1;
  const isFirstWord = currentWordIndex === 0;

  // 단어 데이터 로드
  React.useEffect(() => {
    if (words.length > 0) {
      loadWordData();
    }
  }, [words]);

  const loadWordData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 더미 데이터로 대체 (실제로는 API 호출)
      await new Promise(resolve => setTimeout(resolve, 1000)); // 로딩 시뮬레이션
      
      const dummyWordData: WordData[] = words.map(word => ({
        word,
        pronunciation: `/${word}/`,
        definitions: [
          {
            meaning: `${word}의 주요 의미`,
            partOfSpeech: "noun",
            example: `This is an example sentence with ${word}.`,
            exampleTranslation: `이것은 ${word}가 포함된 예문입니다.`
          },
          {
            meaning: `${word}의 다른 의미`,
            partOfSpeech: "verb",
            example: `You can ${word} in this context.`,
            exampleTranslation: `이런 맥락에서 ${word}할 수 있습니다.`
          }
        ]
      }));
      
      setWordDataList(dummyWordData);
    } catch (err) {
      setError('단어 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsLearned = () => {
    const newLearnedWords = new Set([...learnedWords, currentWord]);
    setLearnedWords(newLearnedWords);
    
    if (isLastWord) {
      onWordLearningComplete(Array.from(newLearnedWords));
    } else {
      setCurrentWordIndex(prev => prev + 1);
    }
  };

  const handleSkipWord = () => {
    if (isLastWord) {
      onWordLearningComplete(Array.from(learnedWords));
    } else {
      setCurrentWordIndex(prev => prev + 1);
    }
  };

  const handlePreviousWord = () => {
    if (!isFirstWord) {
      setCurrentWordIndex(prev => prev - 1);
    }
  };

  const handleNextWord = () => {
    if (!isLastWord) {
      setCurrentWordIndex(prev => prev + 1);
    }
  };

  if (words.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        학습할 단어가 없습니다.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">단어 데이터를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md mb-4">
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
        <Button onClick={loadWordData}>다시 시도</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      {/* 진행률 표시 */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={onBackToPassage}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          지문으로 돌아가기
        </Button>
        <div className="text-sm text-muted-foreground">
          {currentWordIndex + 1} / {words.length} 단어
        </div>
      </div>

      {/* 진행률 바 */}
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentWordIndex + 1) / words.length) * 100}%` }}
        />
      </div>

      {currentWordData && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              {currentWordData.word}
              {currentWordData.pronunciation && (
                <span className="text-base text-muted-foreground font-normal">
                  {currentWordData.pronunciation}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 단어 의미들 */}
            {currentWordData.definitions.map((definition, index) => (
              <div key={index} className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start gap-2 mb-2">
                  <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                    {definition.partOfSpeech}
                  </span>
                  <p className="font-medium text-foreground">
                    {definition.meaning}
                  </p>
                </div>
                
                {definition.example && (
                  <div className="mt-3 p-3 bg-background border-l-4 border-primary/30 rounded-r-md">
                    <p className="text-sm italic text-foreground mb-1">
                      "{definition.example}"
                    </p>
                    {definition.exampleTranslation && (
                      <p className="text-xs text-muted-foreground">
                        {definition.exampleTranslation}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* 지문 맥락 */}
            {passageText && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
                  지문에서의 맥락
                </h4>
                <p className="text-sm text-muted-foreground">
                  {passageText.split('.').find(sentence => 
                    sentence.toLowerCase().includes(currentWord.toLowerCase())
                  )?.trim() || "이 단어가 지문에 포함되어 있습니다."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 네비게이션 및 액션 버튼 */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handlePreviousWord}
            disabled={isFirstWord}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            이전
          </Button>
          <Button 
            variant="outline" 
            onClick={handleNextWord}
            disabled={isLastWord}
          >
            다음
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleSkipWord}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            건너뛰기
          </Button>
          <Button 
            onClick={handleMarkAsLearned}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            {isLastWord ? "학습 완료" : "학습했어요"}
          </Button>
        </div>
      </div>

      {/* 학습 완료 상태 표시 */}
      {learnedWords.size > 0 && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          <p className="text-green-700 dark:text-green-300 text-sm">
            {learnedWords.size}개 단어를 학습했습니다.
          </p>
        </div>
      )}
    </div>
  );
};

// PassageLearning 컴포넌트 (단순화된 버전)
const PassageLearning = ({ 
  passageData, 
  onUnknownWordSelectionComplete, 
  onLearningComplete 
}: {
  passageData: PassageLearningDataForChild | null;
  onUnknownWordSelectionComplete: (words: string[]) => void;
  onLearningComplete: () => void;
}) => {
  const { t } = useTranslation();
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());
  const [currentStep, setCurrentStep] = useState<'selecting' | 'comprehension' | 'explanation'>('selecting');

  if (!passageData) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        지문 정보를 불러올 수 없습니다.
      </div>
    );
  }

  const { passageText, explanation } = passageData;

  const getCleanedWord = (word: string): string => {
    return word.toLowerCase().replace(/[.,!?;:()""„"'']/g, "").trim();
  };

  const handleWordClick = (word: string) => {
    if (currentStep !== 'selecting') return;
    
    const cleanedWord = getCleanedWord(word);
    if (!cleanedWord) return;

    setSelectedWords(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(cleanedWord)) {
        newSelected.delete(cleanedWord);
      } else {
        newSelected.add(cleanedWord);
      }
      return newSelected;
    });
  };

  const handleSelectionComplete = () => {
    const wordsArray = Array.from(selectedWords);
    onUnknownWordSelectionComplete(wordsArray);
    if (wordsArray.length === 0) {
      setCurrentStep('comprehension');
    }
  };

  const renderPassageWithHighlights = () => {
    const parts = passageText.split(/([a-zA-Z'-]+)/g);
    
    return parts.map((part, index) => {
      const isPotentialWord = /^[a-zA-Z'-]+$/.test(part);
      const cleanedWord = isPotentialWord ? getCleanedWord(part) : "";
      const isHighlighted = isPotentialWord && selectedWords.has(cleanedWord);

      if (isPotentialWord && part.length > 0) {
        return (
          <span
            key={index}
            onClick={() => handleWordClick(part)}
            className={`
              cursor-pointer hover:bg-yellow-200 dark:hover:bg-yellow-600/50 
              transition-colors p-0.5 rounded-sm
              ${isHighlighted ? "bg-yellow-300 dark:bg-yellow-700 font-bold" : ""}
            `}
          >
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="space-y-6 p-1">
      <Card className="shadow-md">
        <CardContent className="pt-6">
          <h3 className="text-xl font-semibold mb-3">지문 내용</h3>
          <div className="p-4 bg-muted/50 rounded-md prose dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap leading-relaxed text-base">
              {renderPassageWithHighlights()}
            </p>
          </div>
        </CardContent>
      </Card>

      {currentStep === 'selecting' && (
        <div className="mt-4 space-y-4">
          <p className="text-muted-foreground">
            아래 지문을 읽고 모르는 단어를 모두 클릭하여 선택해주세요.
          </p>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {selectedWords.size}개 단어 선택됨
            </span>
            <Button onClick={handleSelectionComplete}>
              {selectedWords.size > 0 ? "선택한 단어 학습하기" : "모르는 단어 없음 - 계속하기"}
            </Button>
          </div>
        </div>
      )}

      {currentStep === 'comprehension' && (
        <div className="mt-4 space-y-4">
          <p className="text-muted-foreground">
            지문을 전체적으로 얼마나 이해하셨는지 알려주세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={onLearningComplete}
              className="bg-green-600 hover:bg-green-700 text-white flex-1"
            >
              <Check className="mr-2 h-4 w-4" />
              이해했어요!
            </Button>
            <Button 
              variant="outline"
              onClick={() => setCurrentStep('explanation')}
              className="flex-1"
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              설명이 필요해요
            </Button>
          </div>
        </div>
      )}

      {currentStep === 'explanation' && (
        <Card className="mt-6 border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20">
          <CardHeader>
            <CardTitle className="text-blue-700 dark:text-blue-300">지문 해설</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">주제:</h4>
              <p className="text-sm text-muted-foreground">{explanation.theme}</p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">구조:</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{explanation.structure}</p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">해석:</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{explanation.translation}</p>
            </div>
            <Button onClick={onLearningComplete} className="mt-4 w-full">
              설명을 이해했습니다. 학습 완료!
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

interface PassageExplanationData {
  theme: string;
  structure: string;
  translation: string;
}

interface PassageLearningDataForChild {
  passageText: string;
  explanation: PassageExplanationData;
}

type LearningStep = 'passage' | 'words' | 'quiz';
  passageData: PassageLearningDataForChild | null;
  onLearningComplete?: () => void;
}

export default function IntegratedLearningSystem({
  passageData,
  onLearningComplete,
}: IntegratedLearningSystemProps) {
  const { t } = useTranslation();
  
  const [currentStep, setCurrentStep] = useState<LearningStep>('passage');
  const [selectedUnknownWords, setSelectedUnknownWords] = useState<string[]>([]);
  const [learnedWords, setLearnedWords] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>('passage');

  // 지문 학습에서 모르는 단어 선택 완료 시
  const handleUnknownWordSelectionComplete = (unknownWords: string[]) => {
    setSelectedUnknownWords(unknownWords);
    if (unknownWords.length > 0) {
      setCurrentStep('words');
      setActiveTab('words'); // 단어 학습 탭으로 자동 전환
    }
  };

  // 단어 학습 완료 시
  const handleWordLearningComplete = (learned: string[]) => {
    setLearnedWords(learned);
    setCurrentStep('passage'); // 지문 학습으로 돌아가기
    setActiveTab('passage'); // 지문 학습 탭으로 전환
  };

  // 지문으로 돌아가기
  const handleBackToPassage = () => {
    setCurrentStep('passage');
    setActiveTab('passage');
  };

  // 전체 학습 완료 시
  const handlePassageLearningComplete = () => {
    setCurrentStep('quiz');
    if (onLearningComplete) {
      onLearningComplete();
    }
  };

  const getStepStatus = (step: LearningStep) => {
    if (step === 'passage') {
      return currentStep === 'passage' ? 'current' : 
             (currentStep === 'words' || currentStep === 'quiz') ? 'completed' : 'pending';
    }
    if (step === 'words') {
      return selectedUnknownWords.length === 0 ? 'skipped' :
             currentStep === 'words' ? 'current' :
             currentStep === 'quiz' ? 'completed' : 'pending';
    }
    if (step === 'quiz') {
      return currentStep === 'quiz' ? 'completed' : 'pending';
    }
    return 'pending';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'current':
        return <Badge variant="default" className="ml-2">진행 중</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">완료</Badge>;
      case 'skipped':
        return <Badge variant="outline" className="ml-2">건너뜀</Badge>;
      default:
        return <Badge variant="outline" className="ml-2">대기</Badge>;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      {/* 학습 진행 상태 표시 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="h-5 w-5" />
            {t('learning_progress', '학습 진행 상황')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center">
              <Book className="h-4 w-4 mr-2" />
              <span>지문 학습</span>
              {getStatusBadge(getStepStatus('passage'))}
            </div>
            
            {selectedUnknownWords.length > 0 && (
              <>
                <div className="hidden sm:block text-muted-foreground">→</div>
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  <span>단어 학습 ({selectedUnknownWords.length}개)</span>
                  {getStatusBadge(getStepStatus('words'))}
                </div>
              </>
            )}
            
            <div className="hidden sm:block text-muted-foreground">→</div>
            <div className="flex items-center">
              <Target className="h-4 w-4 mr-2" />
              <span>퀴즈 준비</span>
              {getStatusBadge(getStepStatus('quiz'))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 탭 기반 학습 인터페이스 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="passage" className="flex items-center gap-2">
            <Book className="h-4 w-4" />
            지문 학습
            {getStepStatus('passage') === 'completed' && (
              <Badge variant="secondary" className="ml-1 bg-green-100 text-green-800 text-xs">✓</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="words" 
            disabled={selectedUnknownWords.length === 0}
            className="flex items-center gap-2"
          >
            <BookOpen className="h-4 w-4" />
            단어 학습
            {selectedUnknownWords.length > 0 && (
              <Badge variant="outline" className="ml-1 text-xs">
                {selectedUnknownWords.length}개
              </Badge>
            )}
            {getStepStatus('words') === 'completed' && (
              <Badge variant="secondary" className="ml-1 bg-green-100 text-green-800 text-xs">✓</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="passage" className="mt-4">
          <PassageLearning
            passageData={passageData}
            onUnknownWordSelectionComplete={handleUnknownWordSelectionComplete}
            onLearningComplete={handlePassageLearningComplete}
          />
        </TabsContent>

        <TabsContent value="words" className="mt-4">
          {selectedUnknownWords.length > 0 ? (
            <WordLearning
              words={selectedUnknownWords}
              passageText={passageData?.passageText}
              onWordLearningComplete={handleWordLearningComplete}
              onBackToPassage={handleBackToPassage}
            />
          ) : (
            <div className="p-6 text-center text-muted-foreground border-2 border-dashed rounded-lg">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>학습할 단어가 선택되지 않았습니다.</p>
              <p className="text-sm mt-2">지문 학습에서 모르는 단어를 선택해주세요.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* 학습 완료 상태 */}
      {currentStep === 'quiz' && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <Target className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-2">
                🎉 학습 완료!
              </h3>
              <p className="text-green-600 dark:text-green-400 mb-4">
                지문 학습과 단어 학습을 모두 완료했습니다.
              </p>
              {learnedWords.length > 0 && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  학습한 단어: {learnedWords.join(', ')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}