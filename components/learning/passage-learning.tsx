"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Volume2, Pause, HelpCircle, Check, Target, FileText, Languages, BookOpen } from "lucide-react";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import { useTranslation } from "react-i18next";

// 타입 정의
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
  | 'comprehensionCheck'  // 지문 이해도 확인
  | 'explanation'         // 지문 설명 제공
  | 'comprehensionQuiz'   // 독해 퀴즈
  | 'completed';          // 학습 완료

interface PassageLearningProps {
  passageData: PassageLearningDataForChild | null | undefined;
  onLearningComplete?: () => void; // 학습 완료 콜백
  onStartNewLearning?: () => void; // 새로운 학습 시작 콜백
  learnedWords?: string[]; // 이전 단계에서 학습한 단어들
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  type: string;
}

export default function PassageLearning({
  passageData,
  onLearningComplete,
  onStartNewLearning,
  learnedWords = [],
}: PassageLearningProps) {
  const { t } = useTranslation();
  const { speak, stop, speaking, supported: ttsSupported } = useTextToSpeech();

  const [understandingState, setUnderstandingState] = useState<LearningState>('comprehensionCheck');
  const [showFullExplanation, setShowFullExplanation] = useState(false);
  const [isSpeakingPassage, setIsSpeakingPassage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // 독해 퀴즈 관련 상태
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  
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

  // 독해 퀴즈 생성
  const generateComprehensionQuiz = () => {
    const questions: QuizQuestion[] = [
      {
        question: `이 지문의 주요 주제는 무엇인가요?`,
        options: [
          explanation.theme,
          "지문과 관련 없는 주제 1",
          "지문과 관련 없는 주제 2", 
          "지문과 관련 없는 주제 3"
        ],
        correctAnswer: 0,
        type: 'theme'
      },
      {
        question: `이 지문의 전체적인 의미는 무엇인가요?`,
        options: [
          explanation.translation.substring(0, 100) + "...",
          "완전히 다른 의미 1",
          "완전히 다른 의미 2",
          "완전히 다른 의미 3"
        ],
        correctAnswer: 0,
        type: 'meaning'
      },
      {
        question: `이 지문의 구조적 특징은 무엇인가요?`,
        options: [
          explanation.structure.substring(0, 100) + "...",
          "다른 구조적 특징 1",
          "다른 구조적 특징 2", 
          "다른 구조적 특징 3"
        ],
        correctAnswer: 0,
        type: 'structure'
      }
    ];

    setQuizQuestions(questions);
    setCurrentQuizIndex(0);
    setQuizAnswers([]);
  };

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

  // 지문 이해도 확인 - 이해했다고 응답
  const handleComprehensionUnderstood = () => {
    generateComprehensionQuiz();
    setUnderstandingState('comprehensionQuiz');
  };

  // 지문 이해도 확인 - 설명이 필요하다고 응답
  const handleNeedExplanation = () => {
    setShowFullExplanation(true);
    setUnderstandingState('explanation');
  };

  // 설명을 본 후 이해했다고 응답
  const handleExplanationUnderstood = () => {
    generateComprehensionQuiz();
    setUnderstandingState('comprehensionQuiz');
  };

  // 퀴즈 답변 처리
  const handleQuizAnswer = (selectedAnswer: number) => {
    const newAnswers = [...quizAnswers, selectedAnswer];
    setQuizAnswers(newAnswers);

    if (currentQuizIndex === quizQuestions.length - 1) {
      // 퀴즈 완료 - 결과 계산
      calculateQuizResult(newAnswers);
    } else {
      setCurrentQuizIndex(prev => prev + 1);
    }
  };

  // 퀴즈 결과 계산
  const calculateQuizResult = (answers: number[]) => {
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === quizQuestions[index].correctAnswer) {
        correct++;
      }
    });

    const score = Math.round((correct / quizQuestions.length) * 100);
    setQuizScore(score);
    setShowQuizResult(true);

    // 3초 후 완료 상태로 이동
    setTimeout(() => {
      setUnderstandingState('completed');
    }, 3000);
  };

  // 새로운 학습 시작
  const handleStartNewLearning = () => {
    if (onStartNewLearning) {
      onStartNewLearning();
    }
  };

  // 학습 종료
  const handleFinishLearning = () => {
    if (onLearningComplete) {
      onLearningComplete();
    }
  };

  // 각 단계별 렌더링 함수들
  const renderComprehensionCheckView = () => (
    <div className="mt-4 space-y-4">
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-3 text-center">
          📖 지문 이해도 확인
        </h4>
        <p className="text-blue-600 dark:text-blue-400 text-center mb-4">
          위의 지문을 읽어보셨나요? 전체적인 내용을 이해하셨는지 알려주세요.
        </p>
        {learnedWords.length > 0 && (
          <p className="text-sm text-blue-500 dark:text-blue-300 text-center mb-4">
            💡 이전에 학습한 단어들: {learnedWords.join(', ')}
          </p>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={handleComprehensionUnderstood} 
          className="bg-green-600 hover:bg-green-700 text-white flex-1"
        >
          <Check className="mr-2 h-4 w-4" /> 
          {t('understood_button', "네, 이해했어요!")}
        </Button>
        <Button 
          variant="outline" 
          onClick={handleNeedExplanation}
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
          {t('passage_explanation_title', "지문 상세 해설")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 border-l-4 border-green-400 bg-green-50 dark:bg-green-900/20">
          <h4 className="font-semibold text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
            <Target className="h-4 w-4" />
            {t('theme', "주제 (Theme)")}:
          </h4>
          <p className="text-green-600 dark:text-green-300">{explanation.theme}</p>
        </div>
        
        <div className="p-4 border-l-4 border-purple-400 bg-purple-50 dark:bg-purple-900/20">
          <h4 className="font-semibold text-purple-700 dark:text-purple-400 mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {t('organizing_pattern', "구성 패턴 (Organizing Pattern)")}:
          </h4>
          <p className="text-purple-600 dark:text-purple-300 whitespace-pre-wrap">
            {explanation.structure}
          </p>
        </div>
        
        <div className="p-4 border-l-4 border-orange-400 bg-orange-50 dark:bg-orange-900/20">
          <h4 className="font-semibold text-orange-700 dark:text-orange-400 mb-3 flex items-center gap-2">
            <Languages className="h-4 w-4" />
            {t('korean_translation', "전체 해석")}:
          </h4>
          <p className="text-orange-600 dark:text-orange-300 whitespace-pre-wrap">
            {explanation.translation}
          </p>
        </div>
        
        <Button 
          onClick={handleExplanationUnderstood} 
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Check className="mr-2 h-4 w-4" />
          {t('explanation_understood_proceed_to_quiz', "설명을 이해했습니다. 독해 퀴즈 시작!")}
        </Button>
      </CardContent>
    </Card>
  );

  // 독해 퀴즈 렌더링
  const renderComprehensionQuizView = () => {
    if (showQuizResult) {
      return (
        <Card className={`mt-6 ${quizScore >= 70 ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' : 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'}`}>
          <CardHeader>
            <CardTitle className={`text-center ${quizScore >= 70 ? 'text-green-700 dark:text-green-300' : 'text-yellow-700 dark:text-yellow-300'}`}>
              독해 퀴즈 결과
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-4xl font-bold">
              {quizScore}점
            </div>
            <p className="text-muted-foreground">
              {quizQuestions.length}문제 중 {Math.round((quizScore / 100) * quizQuestions.length)}문제 정답
            </p>
            
            {quizScore >= 70 ? (
              <div>
                <p className="text-green-600 dark:text-green-400 mb-4">
                  🎉 축하합니다! 지문을 잘 이해하셨습니다.
                </p>
                <p className="text-sm text-muted-foreground">
                  잠시 후 학습 완료 화면으로 이동합니다...
                </p>
              </div>
            ) : (
              <div>
                <p className="text-yellow-600 dark:text-yellow-400 mb-4">
                  조금 더 연습이 필요합니다. 지문을 다시 읽어보세요.
                </p>
                <Button onClick={() => {
                  setUnderstandingState('comprehensionCheck');
                  setShowQuizResult(false);
                }} variant="outline">
                  지문 다시 학습하기
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    const currentQuestion = quizQuestions[currentQuizIndex];
    if (!currentQuestion) return null;

    return (
      <div className="mt-6 space-y-4">
        {/* 진행률 표시 */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">독해 확인 퀴즈</h3>
          <div className="text-sm text-muted-foreground">
            {currentQuizIndex + 1} / {quizQuestions.length} 문제
          </div>
        </div>

        {/* 진행률 바 */}
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuizIndex + 1) / quizQuestions.length) * 100}%` }}
          />
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">
              지문 이해도 확인
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg font-medium">
              {currentQuestion.question}
            </p>
            
            <div className="grid gap-3 mt-6">
              {currentQuestion.options.map((option: string, index: number) => (
                <Button
                  key={index}
                  variant="outline"
                  className="text-left justify-start h-auto p-4 whitespace-normal"
                  onClick={() => handleQuizAnswer(index)}
                >
                  <span className="font-medium mr-3">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <span className="text-sm">{option}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCompletedView = () => (
    <div className="mt-6 space-y-6">
      <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Target className="h-20 w-20 text-green-600 mx-auto" />
            <h3 className="text-3xl font-bold text-green-700 dark:text-green-300">
              🎉 학습 완료!
            </h3>
            <p className="text-green-600 dark:text-green-400 text-lg">
              단어 학습, 문장 학습, 지문 학습을 모두 완료했습니다.
            </p>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
              <p className="text-muted-foreground mb-4">
                다음 중 어떻게 하시겠습니까?
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={handleStartNewLearning}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <BookOpen className="h-5 w-5 mr-2" />
                  새로운 학습 시작하기
                </Button>
                <Button 
                  onClick={handleFinishLearning}
                  variant="outline"
                  size="lg"
                >
                  <Check className="h-5 w-5 mr-2" />
                  학습 종료하기
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
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

      {/* 지문 표시 (완료 상태가 아닐 때만) */}
      {understandingState !== 'completed' && (
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
                {passageText}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* 상태별 UI 렌더링 */}
      {understandingState === 'comprehensionCheck' && renderComprehensionCheckView()}
      {understandingState === 'explanation' && renderShowingExplanationView()}
      {understandingState === 'comprehensionQuiz' && renderComprehensionQuizView()}
      {understandingState === 'completed' && renderCompletedView()}
    </div>
  );
}