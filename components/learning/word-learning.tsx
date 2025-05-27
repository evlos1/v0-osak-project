"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Volume2, Pause, ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import { useTranslation } from "react-i18next";

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

interface WordLearningProps {
  words: string[]; // 학습할 단어 목록
  passageText?: string; // 지문 텍스트 (맥락 제공용)
  onWordLearningComplete?: (learnedWords: string[]) => void;
  onBackToPassage?: () => void;
}

export default function WordLearning({
  words,
  passageText,
  onWordLearningComplete,
  onBackToPassage,
}: WordLearningProps) {
  const { t } = useTranslation();
  const { speak, stop, speaking, supported: ttsSupported } = useTextToSpeech();

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [wordDataList, setWordDataList] = useState<WordData[]>([]);
  const [learnedWords, setLearnedWords] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpeakingWord, setIsSpeakingWord] = useState(false);

  // 현재 단어
  const currentWord = words[currentWordIndex];
  const currentWordData = wordDataList[currentWordIndex];
  const isLastWord = currentWordIndex === words.length - 1;
  const isFirstWord = currentWordIndex === 0;

  // 단어 데이터 로드 (실제로는 API 호출)
  useEffect(() => {
    loadWordData();
  }, [words]);

  // TTS 상태 동기화
  useEffect(() => {
    if (!speaking && isSpeakingWord) {
      setIsSpeakingWord(false);
    }
  }, [speaking, isSpeakingWord]);

  const loadWordData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 실제로는 API를 호출하여 단어 데이터를 가져옴
      // 여기서는 더미 데이터로 대체
      const dummyWordData: WordData[] = words.map(word => ({
        word,
        pronunciation: `/${word}/`, // 실제로는 발음 기호
        definitions: [
          {
            meaning: `${word}의 의미 1`,
            partOfSpeech: "noun",
            example: `This is an example sentence with ${word}.`,
            exampleTranslation: `이것은 ${word}가 포함된 예문입니다.`
          },
          {
            meaning: `${word}의 의미 2`,
            partOfSpeech: "verb",
            example: `You can ${word} in this context.`,
            exampleTranslation: `이런 맥락에서 ${word}할 수 있습니다.`
          }
        ]
      }));
      
      setWordDataList(dummyWordData);
    } catch (err) {
      setError('단어 데이터를 불러오는 중 오류가 발생했습니다.');
      console.error('Word data loading error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeakWord = async () => {
    if (!ttsSupported || !currentWord) return;
    
    try {
      setError(null);
      
      if (isSpeakingWord) {
        stop();
        setIsSpeakingWord(false);
      } else {
        setIsSpeakingWord(true);
        speak(currentWord, {
          rate: 0.7,
          onEnd: () => setIsSpeakingWord(false),
          onError: () => {
            setError('음성 읽기 중 오류가 발생했습니다.');
            setIsSpeakingWord(false);
          }
        });
      }
    } catch (err) {
      setError('음성 읽기를 시작할 수 없습니다.');
      setIsSpeakingWord(false);
    }
  };

  const handleMarkAsLearned = () => {
    setLearnedWords(prev => new Set([...prev, currentWord]));
    
    if (isLastWord) {
      // 모든 단어 학습 완료
      if (onWordLearningComplete) {
        onWordLearningComplete(Array.from(learnedWords).concat(currentWord));
      }
    } else {
      setCurrentWordIndex(prev => prev + 1);
    }
  };

  const handleSkipWord = () => {
    if (isLastWord) {
      // 마지막 단어인 경우 학습 완료 처리
      if (onWordLearningComplete) {
        onWordLearningComplete(Array.from(learnedWords));
      }
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
        {t('no_words_to_learn', "학습할 단어가 없습니다.")}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">{t('loading_word_data', "단어 데이터를 불러오는 중...")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
        <Button onClick={loadWordData} className="mt-4">
          {t('retry', "다시 시도")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      {/* 진행률 표시 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {onBackToPassage && (
            <Button variant="ghost" size="sm" onClick={onBackToPassage}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t('back_to_passage', "지문으로 돌아가기")}
            </Button>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {currentWordIndex + 1} / {words.length} {t('words', "단어")}
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
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                {currentWordData.word}
                {currentWordData.pronunciation && (
                  <span className="text-base text-muted-foreground font-normal">
                    {currentWordData.pronunciation}
                  </span>
                )}
              </CardTitle>
              {ttsSupported && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleSpeakWord}
                  title={isSpeakingWord ? t("stop_pronunciation", "발음 중지") : t("play_pronunciation", "발음 듣기")}
                  className={isSpeakingWord ? "text-primary" : ""}
                >
                  {isSpeakingWord ? 
                    <Pause className="h-5 w-5" /> : 
                    <Volume2 className="h-5 w-5" />
                  }
                </Button>
              )}
            </div>
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

            {/* 지문 맥락 (선택사항) */}
            {passageText && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
                  {t('context_from_passage', "지문에서의 맥락")}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {/* 지문에서 현재 단어가 포함된 문장 추출 로직 */}
                  {passageText.split('.').find(sentence => 
                    sentence.toLowerCase().includes(currentWord.toLowerCase())
                  )?.trim() || t('word_found_in_passage', "이 단어가 지문에 포함되어 있습니다.")}
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
            {t('previous', "이전")}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleNextWord}
            disabled={isLastWord}
          >
            {t('next', "다음")}
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
            {t('skip', "건너뛰기")}
          </Button>
          <Button 
            onClick={handleMarkAsLearned}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            {isLastWord ? t('complete_learning', "학습 완료") : t('learned', "학습했어요")}
          </Button>
        </div>
      </div>

      {/* 학습 완료 상태 표시 */}
      {learnedWords.size > 0 && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          <p className="text-green-700 dark:text-green-300 text-sm">
            {t('words_learned_count', `${learnedWords.size}개 단어를 학습했습니다.`)}
          </p>
        </div>
      )}
    </div>
  );
}