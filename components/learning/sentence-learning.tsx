"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Volume2, Check, RotateCcw, FileText, Lightbulb, Languages } from "lucide-react";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import { useTranslation } from "react-i18next";

// 타입 정의
interface SentenceAnalysis {
  sentence: string;
  structure: string;
  translation: string;
  grammarPoints: string[];
}

interface QuizQuestion {
  sentence: string;
  question: string;
  options: string[];
  correctAnswer: number;
  type: 'structure' | 'translation' | 'grammar';
}

interface SentenceLearningProps {
  passageText: string; // 지문 텍스트 (필수)
  sentences?: string[]; // 미리 분할된 문장들 (선택사항)
  onSentenceLearningComplete?: () => void;
  onBackToWords?: () => void;
}

type LearningPhase = 'selection' | 'testing' | 'completed';

export default function SentenceLearning({
  passageText,
  sentences = [],
  onSentenceLearningComplete,
  onBackToWords,
}: SentenceLearningProps) {
  const { t } = useTranslation();
  const { speak, stop, speaking, supported: ttsSupported } = useTextToSpeech();

  // 학습 단계 상태
  const [currentPhase, setCurrentPhase] = useState<LearningPhase>('selection');
  
  // 문장 선택 단계 상태
  const [allSentences, setAllSentences] = useState<string[]>([]);
  const [selectedSentences, setSelectedSentences] = useState<Set<string>>(new Set());
  const [sentenceAnalyses, setSentenceAnalyses] = useState<Record<string, SentenceAnalysis>>({});
  const [loadingAnalyses, setLoadingAnalyses] = useState<Set<string>>(new Set());

  // 퀴즈 단계 상태
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [incorrectSentences, setIncorrectSentences] = useState<string[]>([]);

  // 현재 퀴즈 질문
  const currentQuestion = quizQuestions[currentQuizIndex];
  const isLastQuestion = currentQuizIndex === quizQuestions.length - 1;

  // 컴포넌트 마운트 시 지문을 문장 단위로 분할
  useEffect(() => {
    if (sentences.length > 0) {
      setAllSentences(sentences);
    } else if (passageText) {
      // 지문을 문장 단위로 분할 (마침표, 느낌표, 물음표 기준)
      const splitSentences = passageText
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 10); // 너무 짧은 문장 제외
      
      setAllSentences(splitSentences);
    }
  }, [passageText, sentences]);

  // TTS 상태 동기화
  useEffect(() => {
    if (!speaking) {
      // TTS 정리 로직
    }
  }, [speaking]);

  // 지문이 없는 경우
  if (!passageText) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        {t('no_passage_available', "지문 정보를 불러올 수 없습니다.")}
      </div>
    );
  }

  // 문장 선택 단계
  if (currentPhase === 'selection') {
    // 문장 클릭 핸들러
    const handleSentenceClick = (sentence: string) => {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) return;

      setSelectedSentences(prev => {
        const newSelected = new Set(prev);
        if (newSelected.has(trimmedSentence)) {
          newSelected.delete(trimmedSentence);
          // 문장 선택 해제 시 분석 정보도 제거
          setSentenceAnalyses(prevAnalyses => {
            const newAnalyses = { ...prevAnalyses };
            delete newAnalyses[trimmedSentence];
            return newAnalyses;
          });
        } else {
          newSelected.add(trimmedSentence);
          // 새로 선택된 문장 분석 시작
          analyzeSentence(trimmedSentence);
        }
        return newSelected;
      });
    };

    // 문장 분석 API 호출 (시뮬레이션)
    const analyzeSentence = async (sentence: string) => {
      setLoadingAnalyses(prev => new Set([...prev, sentence]));
      
      try {
        // 실제로는 AI API 호출
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const analysis: SentenceAnalysis = {
          sentence,
          structure: `이 문장은 [주어 + 동사 + 목적어] 구조로 이루어져 있습니다. 주어는 "${sentence.split(' ')[0]}"이고, 동사구는 "${sentence.split(' ').slice(1, 3).join(' ')}"입니다.`,
          translation: `"${sentence}"는 한국어로 "${sentence}을/를 한국어로 번역한 내용입니다."라는 의미입니다.`,
          grammarPoints: [
            `주요 문법 포인트 1: ${sentence.split(' ')[0]}의 용법`,
            `주요 문법 포인트 2: 동사 시제와 활용`,
            `주요 문법 포인트 3: 문장 구조의 특징`
          ]
        };

        setSentenceAnalyses(prev => ({
          ...prev,
          [sentence]: analysis
        }));
      } catch (error) {
        console.error(`문장 '${sentence}' 분석 실패:`, error);
        setSentenceAnalyses(prev => ({
          ...prev,
          [sentence]: {
            sentence,
            structure: '문장 구조 분석을 가져올 수 없습니다.',
            translation: '번역을 가져올 수 없습니다.',
            grammarPoints: ['분석 정보를 불러오는 중 오류가 발생했습니다.']
          }
        }));
      } finally {
        setLoadingAnalyses(prev => {
          const newSet = new Set(prev);
          newSet.delete(sentence);
          return newSet;
        });
      }
    };

    // 학습 완료 처리
    const handleSelectionComplete = () => {
      const sentencesArray = Array.from(selectedSentences);
      
      if (sentencesArray.length > 0) {
        generateQuizQuestionsFromSentences(sentencesArray);
        setCurrentPhase('testing');
      } else {
        // 선택된 문장이 없으면 바로 완료
        if (onSentenceLearningComplete) {
          onSentenceLearningComplete();
        }
      }
    };

    // 퀴즈 문제 생성
    const generateQuizQuestionsFromSentences = (sentencesArray: string[]) => {
      const questions: QuizQuestion[] = [];
      
      sentencesArray.forEach(sentence => {
        const analysis = sentenceAnalyses[sentence];
        if (!analysis) return;

        // 구조 분석 문제
        questions.push({
          sentence,
          question: `다음 문장의 구조적 특징은 무엇인가요?\n"${sentence.substring(0, 50)}..."`,
          options: [
            analysis.structure.substring(0, 80) + '...',
            '주어 + 보어 + 동사 구조의 도치 문장입니다.',
            '복합 관계절이 포함된 복문 구조입니다.',
            '수동태 구조로 이루어진 문장입니다.'
          ],
          correctAnswer: 0,
          type: 'structure'
        });

        // 번역 문제
        questions.push({
          sentence,
          question: `다음 문장의 올바른 의미는 무엇인가요?\n"${sentence.substring(0, 50)}..."`,
          options: [
            analysis.translation.substring(0, 80) + '...',
            '완전히 다른 의미의 번역 1',
            '완전히 다른 의미의 번역 2',
            '완전히 다른 의미의 번역 3'
          ],
          correctAnswer: 0,
          type: 'translation'
        });
      });

      const shuffledQuestions = questions.sort(() => Math.random() - 0.5);
      setQuizQuestions(shuffledQuestions);
      setCurrentQuizIndex(0);
      setQuizAnswers([]);
    };

    // 지문을 문장별로 하이라이트하여 렌더링
    const renderPassageWithSentences = () => {
      if (allSentences.length === 0) {
        return <p className="whitespace-pre-wrap leading-relaxed text-base">{passageText}</p>;
      }

      return (
        <div className="space-y-2">
          {allSentences.map((sentence, index) => {
            const isSelected = selectedSentences.has(sentence.trim());
            return (
              <p
                key={index}
                onClick={() => handleSentenceClick(sentence)}
                className={`
                  cursor-pointer p-3 rounded-lg transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/30
                  ${isSelected ? 'bg-blue-100 dark:bg-blue-900/50 border-l-4 border-blue-500 font-medium' : 'hover:border-l-4 hover:border-blue-200'}
                `}
              >
                {sentence.trim()}.
              </p>
            );
          })}
        </div>
      );
    };

    return (
      <div className="space-y-6 p-1">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              문장 선택하기
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              아래 지문을 읽고 이해가 어려운 문장을 클릭하여 선택해주세요.
            </p>
            
            <div className="p-4 bg-muted/50 rounded-md prose dark:prose-invert max-w-none mb-4">
              {renderPassageWithSentences()}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {selectedSentences.size}개 문장 선택됨
              </span>
              <div className="flex gap-2">
                {onBackToWords && (
                  <Button variant="outline" onClick={onBackToWords}>
                    단어 학습으로 돌아가기
                  </Button>
                )}
                <Button onClick={handleSelectionComplete}>
                  {selectedSentences.size > 0 ? "선택 완료 - 퀴즈 시작" : "건너뛰기"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 선택된 문장들의 실시간 분석 표시 */}
        {selectedSentences.size > 0 && (
          <Card className="shadow-md border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/20">
            <CardHeader>
              <CardTitle className="text-lg text-green-700 dark:text-green-300 flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                선택된 문장 분석
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Array.from(selectedSentences).map(sentence => {
                const analysis = sentenceAnalyses[sentence];
                const isLoading = loadingAnalyses.has(sentence);

                return (
                  <div key={sentence} className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="text-lg font-semibold text-primary pr-4">
                        "{sentence.substring(0, 80)}{sentence.length > 80 ? '...' : ''}"
                      </h4>
                      {ttsSupported && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => speak(sentence, { rate: 0.8 })}
                          className="text-green-600 hover:text-green-700 flex-shrink-0"
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {isLoading ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-green-600">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                          <span className="text-sm">AI가 문장 구조를 분석하고 있습니다...</span>
                        </div>
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    ) : analysis ? (
                      <div className="space-y-4">
                        {/* 문장 구조 분석 */}
                        <div className="border-l-4 border-blue-300 pl-4">
                          <h5 className="font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            문장 구조 분석
                          </h5>
                          <p className="text-sm text-foreground bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                            {analysis.structure}
                          </p>
                        </div>

                        {/* 번역 */}
                        <div className="border-l-4 border-purple-300 pl-4">
                          <h5 className="font-semibold text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-2">
                            <Languages className="h-4 w-4" />
                            번역 및 의미
                          </h5>
                          <p className="text-sm text-foreground bg-purple-50 dark:bg-purple-900/20 p-3 rounded-md">
                            {analysis.translation}
                          </p>
                        </div>

                        {/* 문법 포인트 */}
                        <div className="border-l-4 border-orange-300 pl-4">
                          <h5 className="font-semibold text-orange-700 dark:text-orange-300 mb-2 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4" />
                            주요 문법 포인트
                          </h5>
                          <ul className="space-y-1">
                            {analysis.grammarPoints.map((point, index) => (
                              <li key={index} className="text-sm text-foreground bg-orange-50 dark:bg-orange-900/20 p-2 rounded-md">
                                • {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        문장 분석 정보를 불러오는 중입니다...
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-green-700 dark:text-green-300 text-sm">
                    💡 <strong>학습 팁:</strong> 각 문장의 구조와 의미를 충분히 이해했나요?
                  </p>
                  <Button 
                    onClick={handleSelectionComplete}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    학습 완료 - 퀴즈 시작
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // 퀴즈 결과 화면
  if (currentPhase === 'testing' && showQuizResult) {
    return (
      <div className="space-y-6 p-1">
        <Card className={`${quizScore >= 70 ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' : 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'}`}>
          <CardHeader>
            <CardTitle className={`text-center ${quizScore >= 70 ? 'text-green-700 dark:text-green-300' : 'text-yellow-700 dark:text-yellow-300'}`}>
              문장 학습 퀴즈 결과
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
                  🎉 축하합니다! 문장 학습을 성공적으로 완료했습니다.
                </p>
                <p className="text-sm text-muted-foreground">
                  잠시 후 지문 학습으로 자동 이동합니다...
                </p>
              </div>
            ) : (
              <div>
                <p className="text-yellow-600 dark:text-yellow-400 mb-4">
                  조금 더 연습이 필요합니다. (70% 이상 필요)
                </p>
                {incorrectSentences.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      다시 학습할 문장: {incorrectSentences.length}개
                    </p>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button onClick={() => {
                    // 틀린 문장들 다시 선택하여 재학습
                    setSelectedSentences(new Set(incorrectSentences));
                    setCurrentPhase('selection');
                    setShowQuizResult(false);
                  }} variant="outline">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    틀린 문장 다시 학습
                  </Button>
                  <Button onClick={() => {
                    if (onSentenceLearningComplete) {
                      onSentenceLearningComplete();
                    }
                  }}>
                    그래도 계속하기
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // 퀴즈 진행 중
  if (currentPhase === 'testing' && currentQuestion) {
    // 퀴즈 답변 처리
    const handleQuizAnswer = (selectedAnswer: number) => {
      const newAnswers = [...quizAnswers, selectedAnswer];
      setQuizAnswers(newAnswers);

      if (isLastQuestion) {
        // 퀴즈 완료 - 결과 계산
        calculateQuizResult(newAnswers);
      } else {
        setCurrentQuizIndex(prev => prev + 1);
      }
    };

    // 퀴즈 결과 계산
    const calculateQuizResult = (answers: number[]) => {
      let correct = 0;
      const incorrect: string[] = [];

      answers.forEach((answer, index) => {
        if (answer === quizQuestions[index].correctAnswer) {
          correct++;
        } else {
          const sentence = quizQuestions[index].sentence;
          if (!incorrect.includes(sentence)) {
            incorrect.push(sentence);
          }
        }
      });

      const score = Math.round((correct / quizQuestions.length) * 100);
      setQuizScore(score);
      setIncorrectSentences(incorrect);
      setShowQuizResult(true);

      // 퀴즈 완료 후 자동으로 지문 학습으로 진행
      setTimeout(() => {
        if (score >= 70) {
          if (onSentenceLearningComplete) {
            onSentenceLearningComplete();
          }
        }
      }, 3000); // 3초 후 자동 진행
    };

    return (
      <div className="space-y-6 p-1">
        {/* 진행률 표시 */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">문장 학습 퀴즈</h3>
          <div className="text-sm text-muted-foreground">
            {currentQuizIndex + 1} / {quizQuestions.length} 문제
          </div>
        </div>

        {/* 진행률 바 */}
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuizIndex + 1) / quizQuestions.length) * 100}%` }}
          />
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">
              문장 분석 퀴즈
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-base font-medium whitespace-pre-line">
              {currentQuestion.question}
            </p>
            
            <div className="grid gap-3 mt-6">
              {currentQuestion.options.map((option, index) => (
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
  }

  // 완료 상태
  return (
    <div className="space-y-6 p-1">
      <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
        <CardContent className="pt-6">
          <div className="text-center">
            <FileText className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2">
              🎉 문장 학습 완료!
            </h3>
            <p className="text-green-600 dark:text-green-400 mb-4">
              선택하신 {Array.from(selectedSentences).length}개 문장의 학습을 완료했습니다.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              이제 지문 학습으로 진행됩니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              {onBackToWords && (
                <Button onClick={onBackToWords} variant="outline">
                  단어 학습으로 돌아가기
                </Button>
              )}
              <Button onClick={() => setCurrentPhase('selection')}>
                다시 학습하기
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}