"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Volume2, Pause, HelpCircle, Check, BookOpen } from "lucide-react";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import { useTranslation } from "react-i18next";

// 타입 정의 (별도 파일로 분리 권장)
interface PassageExplanationData {
  theme: string;
  structure: string;
  translation: string;
}

interface PassageLearningDataForChild {
  passageText: string;
  explanation: PassageExplanationData;
}

// 학습 단계 타입
type LearningState = 
  | 'selectingUnknowns' 
  | 'wordLearning'      // 단어 학습 단계 추가
  | 'initialComprehension' 
  | 'showingExplanation' 
  | 'quizReady';

interface PassageLearningProps {
  passageData: PassageLearningDataForChild | null | undefined;
  onWordSelect?: (word: string) => void;
  selectedWords?: string[]; // 명확한 이름으로 변경
  onUnknownWordSelectionComplete?: (unknownWords: string[]) => void;
  onLearningComplete?: () => void; // 학습 완료 콜백 추가
}

export default function PassageLearning({
  passageData,
  onWordSelect,
  selectedWords = [],
  onUnknownWordSelectionComplete,
  onLearningComplete,
}: PassageLearningProps) {
  const { t } = useTranslation();
  const { speak, stop, speaking, supported: ttsSupported } = useTextToSpeech();

  const [understandingState, setUnderstandingState] = useState<LearningState>('selectingUnknowns');
  const [learnerSelectedUnknownWords, setLearnerSelectedUnknownWords] = useState<Set<string>>(new Set());
  const [selectedUnknownWordsList, setSelectedUnknownWordsList] = useState<string[]>([]);
  const [showFullExplanation, setShowFullExplanation] = useState(false);
  const [isSpeakingPassage, setIsSpeakingPassage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const ttsCleanupRef = useRef<(() => void) | null>(null);

  // TTS 상태 동기화
  useEffect(() => {
    if (!speaking && isSpeakingPassage) {
      setIsSpeakingPassage(false);
    }
  }, [speaking, isSpeakingPassage]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (ttsCleanupRef.current) {
        ttsCleanupRef.current();
      }
      stop();
    };
  }, [stop]);

  // 데이터 유효성 검사
  if (!passageData || !passageData.passageText || !passageData.explanation) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        {t('passage_data_not_available', "지문 정보를 불러올 수 없습니다.")}
      </div>
    );
  }

  const { passageText, explanation } = passageData;

  const getCleanedWord = (word: string): string => {
    return word.toLowerCase().replace(/[.,!?;:()""„"'']/g, "").trim();
  };

  const handleWordClick = (word: string) => {
    const cleanedWord = getCleanedWord(word);
    if (!cleanedWord) return;

    if (understandingState === 'selectingUnknowns') {
      setLearnerSelectedUnknownWords(prevSelected => {
        const newSelected = new Set(prevSelected);
        if (newSelected.has(cleanedWord)) {
          newSelected.delete(cleanedWord);
        } else {
          newSelected.add(cleanedWord);
        }
        return newSelected;
      });
    } else if (onWordSelect) {
      onWordSelect(cleanedWord);
    }
  };

  // 키보드 접근성 지원
  const handleKeyDown = (e: React.KeyboardEvent, word: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleWordClick(word);
    }
  };

  // 지문 렌더링 최적화
  const renderedPassage = useMemo(() => {
    const parts = passageText.split(/([a-zA-Z'-]+)/g);
    
    return parts.map((part, index) => {
      const isPotentialWord = /^[a-zA-Z'-]+$/.test(part);
      const cleanedWordForCheck = isPotentialWord ? getCleanedWord(part) : "";
      
      let isHighlighted = false;
      if (isPotentialWord) {
        if (understandingState === 'selectingUnknowns') {
          isHighlighted = learnerSelectedUnknownWords.has(cleanedWordForCheck);
        } else {
          isHighlighted = selectedWords.includes(cleanedWordForCheck);
        }
      }

      if (isPotentialWord && part.length > 0) {
        return (
          <span
            key={index}
            role="button"
            tabIndex={0}
            aria-pressed={isHighlighted}
            aria-label={isHighlighted ? `${part} - 선택됨` : part}
            onClick={() => handleWordClick(part)}
            onKeyDown={(e) => handleKeyDown(e, part)}
            className={`
              cursor-pointer hover:bg-yellow-200 dark:hover:bg-yellow-600/50 
              transition-colors p-0.5 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500
              ${isHighlighted ? "bg-yellow-300 dark:bg-yellow-700 font-bold text-black dark:text-white" : ""}
            `}
          >
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  }, [passageText, understandingState, learnerSelectedUnknownWords, selectedWords]);

  const handleSpeakPassage = async () => {
    if (!ttsSupported || !passageText) return;
    
    try {
      setError(null);
      
      if (isSpeakingPassage) {
        if (ttsCleanupRef.current) ttsCleanupRef.current();
        stop();
        setIsSpeakingPassage(false);
      } else {
        setIsLoading(true);
        setIsSpeakingPassage(true);
        const cleanup = speak(passageText, {
          rate: 0.8,
          onEnd: () => { 
            setIsSpeakingPassage(false); 
            ttsCleanupRef.current = null;
            setIsLoading(false);
          },
          onError: (error) => {
            setError('음성 읽기 중 오류가 발생했습니다.');
            setIsSpeakingPassage(false);
            setIsLoading(false);
          }
        });
        if (typeof cleanup === "function") ttsCleanupRef.current = cleanup;
        setIsLoading(false);
      }
    } catch (err) {
      setError('음성 읽기를 시작할 수 없습니다.');
      setIsSpeakingPassage(false);
      setIsLoading(false);
    }
  };

  const handleUnknownWordSelectionDone = () => {
    const selectedWordsArray = Array.from(learnerSelectedUnknownWords);
    setSelectedUnknownWordsList(selectedWordsArray);
    
    if (onUnknownWordSelectionComplete) {
      onUnknownWordSelectionComplete(selectedWordsArray);
    }
    
    if (selectedWordsArray.length > 0) {
      // 선택된 단어가 있으면 단어 학습으로 이동
      setUnderstandingState('wordLearning');
    } else {
      // 선택된 단어가 없으면 바로 지문 이해도 확인으로 이동
      setUnderstandingState('initialComprehension');
    }
  };

  const handleWordLearningComplete = (learnedWords: string[]) => {
    console.log("Word learning completed for words:", learnedWords);
    setUnderstandingState('initialComprehension');
  };

  const handleBackToPassage = () => {
    setUnderstandingState('selectingUnknowns');
  };

  const handleInitialComprehensionUnderstood = () => {
    setUnderstandingState('quizReady');
    setShowFullExplanation(false);
    console.log("User understood passage, ready for quiz");
    if (onLearningComplete) {
      onLearningComplete();
    }
  };

  const handleInitialComprehensionNeedExplanation = () => {
    setShowFullExplanation(true);
    setUnderstandingState('showingExplanation');
  };

  const handleRestart = () => {
    setUnderstandingState('selectingUnknowns');
    setLearnerSelectedUnknownWords(new Set());
    setSelectedUnknownWordsList([]);
    setShowFullExplanation(false);
    setError(null);
  };

  // 각 단계별 렌더링 함수들
  const renderSelectingUnknownsView = () => (
    <div className="mt-4 space-y-4">
      <p className="text-muted-foreground">
        {t('passage_select_unknown_prompt', "아래 지문을 읽고 모르는 단어를 모두 클릭하여 선택해주세요. 선택 후 '선택 완료' 버튼을 눌러주세요.")}
      </p>
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-muted-foreground">
          {learnerSelectedUnknownWords.size} {t('words_selected_count', "개 단어 선택됨")}
        </span>
        <Button 
          onClick={handleUnknownWordSelectionDone}
        >
          {learnerSelectedUnknownWords.size > 0 
            ? t('learn_selected_words', "선택한 단어 학습하기")
            : t('no_unknown_words_continue', "모르는 단어 없음 - 계속하기")
          }
        </Button>
      </div>
    </div>
  );

  const renderWordLearningView = () => {
    // 실제로는 별도의 WordLearning 컴포넌트를 import해서 사용
    return (
      <div className="mt-4 space-y-4">
        <div className="p-6 border-2 border-dashed border-blue-500 rounded-md bg-blue-50 dark:bg-blue-900/20">
          <div className="text-center">
            <BookOpen className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-2">
              {t('word_learning_in_progress', "단어 학습 중")}
            </h3>
            <p className="text-blue-600 dark:text-blue-400 mb-4">
              {t('selected_words_learning_message', `선택하신 ${selectedUnknownWordsList.length}개 단어를 학습하고 있습니다.`)}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button onClick={handleBackToPassage} variant="outline">
                {t('back_to_passage', "지문으로 돌아가기")}
              </Button>
              <Button onClick={handleWordLearningComplete}>
                {t('word_learning_complete', "단어 학습 완료")}
              </Button>
            </div>
          </div>
        </div>
        
        {/* 여기에 실제 WordLearning 컴포넌트가 들어갈 자리 */}
        {/* 
        <WordLearning 
          words={selectedUnknownWordsList}
          passageText={passageText}
          onWordLearningComplete={handleWordLearningComplete}
          onBackToPassage={handleBackToPassage}
        />
        */}
      </div>
    );
  };

  const renderInitialComprehensionView = () => (
    <div className="mt-4 space-y-4">
      <p className="text-muted-foreground">
        {selectedUnknownWordsList.length > 0 
          ? t('passage_post_word_learning_prompt', "단어 학습을 마쳤습니다. 이제 전체 지문을 얼마나 이해하셨는지 알려주세요.")
          : t('passage_initial_prompt', "아래 지문을 전체적으로 얼마나 이해하셨는지 알려주세요.")
        }
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={handleInitialComprehensionUnderstood} 
          className="bg-green-600 hover:bg-green-700 text-white flex-1"
        >
          <Check className="mr-2 h-4 w-4" /> 
          {t('understood_button', "이해했어요!")}
        </Button>
        <Button 
          variant="outline" 
          onClick={handleInitialComprehensionNeedExplanation}
          className="flex-1"
        >
          <HelpCircle className="mr-2 h-4 w-4" /> 
          {t('need_explanation_button', "설명이 필요해요")}
        </Button>
      </div>
    </div>
  );

  const renderShowingExplanationView = () => (
    <Card className="mt-6 border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20">
      <CardHeader>
        <CardTitle className="text-blue-700 dark:text-blue-300">
          {t('passage_explanation_title', "지문 해설")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
            {t('theme', "주제")}:
          </h4>
          <p className="text-sm text-muted-foreground">{explanation.theme}</p>
        </div>
        <div>
          <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
            {t('structure', "구조")}:
          </h4>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {explanation.structure}
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
            {t('korean_translation', "해석")}:
          </h4>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {explanation.translation}
          </p>
        </div>
        <Button 
          onClick={handleInitialComprehensionUnderstood} 
          className="mt-4 w-full"
        >
          {t('explanation_understood_proceed_to_quiz', "설명을 이해했습니다. 학습 완료!")}
        </Button>
      </CardContent>
    </Card>
  );

  const renderQuizReadyView = () => (
    <div className="mt-6 p-6 text-center border-2 border-dashed border-green-500 rounded-md bg-green-50 dark:bg-green-900/20">
      <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-2">
        🎉 {t('learning_complete', "학습 완료!")}
      </h3>
      <p className="text-green-600 dark:text-green-400 mb-4">
        {t('passage_learning_success', "지문 학습을 성공적으로 완료했습니다.")}
      </p>
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <Button onClick={handleRestart} variant="outline">
          {t('restart_learning', "다시 학습하기")}
        </Button>
        {onLearningComplete && (
          <Button onClick={onLearningComplete}>
            {t('go_to_next_step', "다음 단계로")}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-1">
      {/* 에러 표시 */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* 지문 표시는 단어 학습 단계가 아닐 때만 */}
      {understandingState !== 'wordLearning' && (
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-semibold">
                {t("passage_text_title_v2", "지문 내용")}
              </h3>
              {ttsSupported && passageText && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleSpeakPassage}
                  disabled={isLoading}
                  title={isSpeakingPassage ? t("stop_reading", "읽기 중지") : t("read_passage", "지문 읽기")} 
                  className={isSpeakingPassage ? "text-primary" : ""}
                >
                  {isSpeakingPassage ? 
                    <Pause className="h-5 w-5" /> : 
                    <Volume2 className="h-5 w-5" />
                  }
                </Button>
              )}
            </div>
            <div className="p-4 bg-muted/50 rounded-md prose dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap leading-relaxed text-base">
                {renderedPassage}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* 상태별 UI 렌더링 */}
      {understandingState === 'selectingUnknowns' && renderSelectingUnknownsView()}
      {understandingState === 'wordLearning' && renderWordLearningView()}
      {understandingState === 'initialComprehension' && renderInitialComprehensionView()}
      {understandingState === 'showingExplanation' && renderShowingExplanationView()}
      {understandingState === 'quizReady' && renderQuizReadyView()}
    </div>
  );
}