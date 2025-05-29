"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Volume2, Pause, ChevronLeft, ChevronRight, Check, X, RotateCcw, Target, BookOpen } from "lucide-react";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import { useTranslation } from "react-i18next";
import { getApiKey } from "@/lib/api-key-utils"; // 기존 시스템과 동일한 방식

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

interface QuizQuestion {
  word: string;
  question: string;
  options: string[];
  correctAnswer: number;
  type: 'meaning' | 'usage' | 'example';
}

interface WordLearningProps {
  words?: string[]; // 미리 선택된 단어 목록 (선택사항)
  passageText: string; // 지문 텍스트 (필수)
  onWordLearningComplete?: (learnedWords: string[]) => void;
  onBackToPassage?: () => void;
}

type LearningPhase = 'selection' | 'learning' | 'testing' | 'completed';

export default function WordLearning({
  words = [], // 기본값으로 빈 배열
  passageText,
  onWordLearningComplete,
  onBackToPassage,
}: WordLearningProps) {
  const { t } = useTranslation();
  const { speak, stop, speaking, supported: ttsSupported } = useTextToSpeech();

  // 디버깅을 위한 로그
  console.log('WordLearning received passageText:', passageText?.substring(0, 100) + '...');
  console.log('PassageText length:', passageText?.length || 0);

  // 학습 단계 상태
  const [currentPhase, setCurrentPhase] = useState<LearningPhase>('selection');
  
  // 단어 선택 단계 상태
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set(words.map(w => w.toLowerCase())));
  const [wordsToLearn, setWordsToLearn] = useState<string[]>(words);
  const [selectedWordDetails, setSelectedWordDetails] = useState<Record<string, WordData>>({});
  const [loadingWordDetails, setLoadingWordDetails] = useState<Set<string>>(new Set());
  
  // 학습 단계 상태
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [wordDataList, setWordDataList] = useState<WordData[]>([]);
  const [learnedWords, setLearnedWords] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpeakingWord, setIsSpeakingWord] = useState(false);

  // 테스트 단계 상태
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [incorrectWords, setIncorrectWords] = useState<string[]>([]);

  // 안전한 배열 접근
  const currentWord = wordsToLearn && wordsToLearn.length > 0 ? wordsToLearn[currentWordIndex] : null;
  const currentWordData = wordDataList && wordDataList.length > 0 ? wordDataList[currentWordIndex] : null;
  const isLastWord = wordsToLearn ? currentWordIndex === wordsToLearn.length - 1 : false;
  const isFirstWord = currentWordIndex === 0;

  // 현재 퀴즈 질문
  const currentQuestion = quizQuestions[currentQuizIndex];
  const isLastQuestion = currentQuizIndex === quizQuestions.length - 1;

  // 단어 데이터 로드
  useEffect(() => {
    if (words && words.length > 0) {
      setCurrentWordIndex(0);
      loadWordData();
    } else {
      setIsLoading(false);
    }
  }, [words]);

  // TTS 상태 동기화
  useEffect(() => {
    if (!speaking && isSpeakingWord) {
      setIsSpeakingWord(false);
    }
  }, [speaking, isSpeakingWord]);

  const loadWordData = async () => {
    if (!words || words.length === 0) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // 실제로는 API를 호출하여 단어 데이터를 가져옴
      // 여기서는 더미 데이터로 대체
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
      console.error('Word data loading error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateQuizQuestions = () => {
    const questions: QuizQuestion[] = [];
    
    wordsToLearn.forEach(word => {
      const wordData = wordDataList.find(w => w.word === word);
      if (!wordData) return;

      // 의미 문제
      questions.push({
        word,
        question: `"${word}"의 의미는 무엇인가요?`,
        options: [
          `${word}의 주요 의미`,
          "관련 없는 의미 1",
          "관련 없는 의미 2", 
          "관련 없는 의미 3"
        ],
        correctAnswer: 0,
        type: 'meaning'
      });

      // 예문 문제
      questions.push({
        word,
        question: `다음 중 "${word}"를 올바르게 사용한 문장은?`,
        options: [
          `This is an example sentence with ${word}.`,
          `${word} is not used correctly here.`,
          `Wrong usage of ${word} in sentence.`,
          `Incorrect ${word} example sentence.`
        ],
        correctAnswer: 0,
        type: 'example'
      });
    });

    // 문제를 섞어서 설정
    const shuffledQuestions = questions.sort(() => Math.random() - 0.5);
    setQuizQuestions(shuffledQuestions);
    setCurrentQuizIndex(0);
    setQuizAnswers([]);
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
    if (!currentWord) return;
    
    const newLearnedWords = new Set([...learnedWords, currentWord]);
    setLearnedWords(newLearnedWords);
    
    if (isLastWord) {
      // 모든 단어 학습 완료 - 테스트 단계로 이동
      generateQuizQuestions();
      setCurrentPhase('testing');
    } else {
      setCurrentWordIndex(prev => prev + 1);
    }
  };

  const handleSkipWord = () => {
    if (isLastWord) {
      // 마지막 단어 건너뛰기 - 테스트 단계로 이동
      generateQuizQuestions();
      setCurrentPhase('testing');
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

  const calculateQuizResult = (answers: number[]) => {
    let correct = 0;
    const incorrect: string[] = [];

    answers.forEach((answer, index) => {
      if (answer === quizQuestions[index].correctAnswer) {
        correct++;
      } else {
        const word = quizQuestions[index].word;
        if (!incorrect.includes(word)) {
          incorrect.push(word);
        }
      }
    });

    const score = Math.round((correct / quizQuestions.length) * 100);
    setQuizScore(score);
    setIncorrectWords(incorrect);
    setShowQuizResult(true);

    // 퀴즈 완료 후 자동으로 문장 학습으로 진행
    setTimeout(() => {
      if (score >= 70) { // 70% 이상이면 성공
        setCurrentPhase('completed');
        if (onWordLearningComplete) {
          // 학습한 단어들을 전달하며 완료
          onWordLearningComplete(Array.from(selectedWords));
        }
      } else {
        // 점수가 낮으면 재학습 옵션 제공
        // (기존 로직 유지)
      }
    }, 2500); // 2.5초 후 자동 진행
  };

  const handleRetryIncorrectWords = () => {
    // 틀린 단어들만 다시 학습
    const incorrectWordData = wordDataList.filter(w => incorrectWords.includes(w.word));
    setWordDataList(incorrectWordData);
    setWordsToLearn(incorrectWords);
    setLearnedWords(new Set());
    setCurrentWordIndex(0);
    setCurrentPhase('learning');
    setShowQuizResult(false);
  };

  const handleCompleteAnyway = () => {
    setCurrentPhase('completed');
    if (onWordLearningComplete) {
      onWordLearningComplete(Array.from(learnedWords));
    }
  };

  // 조건부 렌더링 - 지문이 없는 경우
  if (!passageText) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        {t('no_passage_available', "지문 정보를 불러올 수 없습니다.")}
      </div>
    );
  }

  // 단어 선택 단계 렌더링
  if (currentPhase === 'selection') {
    const getCleanedWord = (word: string): string => {
      return word.toLowerCase().replace(/[.,!?;:()""„"'']/g, "").trim();
    };

    const handleWordClick = (word: string) => {
      const cleanedWord = getCleanedWord(word);
      if (!cleanedWord) return;

      setSelectedWords(prev => {
        const newSelected = new Set(prev);
        if (newSelected.has(cleanedWord)) {
          newSelected.delete(cleanedWord);
          // 단어 선택 해제 시 상세 정보도 제거
          setSelectedWordDetails(prevDetails => {
            const newDetails = { ...prevDetails };
            delete newDetails[cleanedWord];
            return newDetails;
          });
        } else {
          newSelected.add(cleanedWord);
          // 새로 선택된 단어의 상세 정보 가져오기
          fetchWordDetailsForSelection(cleanedWord);
        }
        return newSelected;
      });
    };

    // 선택된 단어의 상세 정보 가져오기 (기존 시스템과 동일한 방식)
    const fetchWordDetailsForSelection = async (word: string) => {
      setLoadingWordDetails(prev => new Set([...prev, word]));
      
      try {
        // 기존 시스템과 동일한 방식으로 API 키 가져오기
        const storedApiKey = getApiKey();
        console.log('API 키 상태:', storedApiKey ? '존재함' : '없음');
        
        if (!storedApiKey) {
          throw new Error('API 키가 설정되지 않았습니다. 설정 페이지에서 Google API 키를 입력해주세요.');
        }
        
        const requestData = {
          word: word,
          passageContext: passageText,
          apiKey: storedApiKey
        };
        
        console.log('API 요청 데이터:', { word, passageContext: passageText?.substring(0, 50) + '...', apiKey: '***' });
        
        // 기존 시스템과 동일한 방식으로 API 호출
        const response = await fetch('/api/word-analysis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        });

        console.log('API 응답 상태:', response.status);
        
        if (!response.ok) {
          const errorData = await response.text();
          console.error('API 오류 응답:', errorData);
          throw new Error(`API 호출 실패: ${response.status}`);
        }

        const aiAnalysis = await response.json();
        console.log('AI 분석 성공:', aiAnalysis.meanings?.length || 0, '개 의미');
        
        const wordDetail: WordData = {
          word,
          pronunciation: aiAnalysis.pronunciation || `/${word}/`,
          definitions: aiAnalysis.meanings.map((meaning: any, index: number) => ({
            meaning: meaning.koreanMeaning,
            partOfSpeech: meaning.category || `의미${index + 1}`,
            example: meaning.exampleSentence,
            exampleTranslation: meaning.exampleTranslation
          }))
        };

        setSelectedWordDetails(prev => ({
          ...prev,
          [word]: wordDetail
        }));
      } catch (error) {
        console.error(`단어 '${word}' AI 분석 실패:`, error);
        
        // API 실패 시 기본 응답
        setSelectedWordDetails(prev => ({
          ...prev,
          [word]: {
            word,
            pronunciation: `/${word}/`,
            definitions: [{
              meaning: error instanceof Error ? error.message : '단어 분석 서비스에 일시적인 문제가 발생했습니다.',
              partOfSpeech: 'error',
              example: '예문을 불러올 수 없습니다.',
              exampleTranslation: '번역을 제공할 수 없습니다.'
            }]
          }
        }));
      } finally {
        setLoadingWordDetails(prev => {
          const newSet = new Set(prev);
          newSet.delete(word);
          return newSet;
        });
      }
    };

    const handleSelectionComplete = async () => {
      const wordsArray = Array.from(selectedWords);
      setWordsToLearn(wordsArray);
      
      if (wordsArray.length > 0) {
        // 선택된 단어가 있으면 AI 퀴즈 생성으로 진행
        await generateQuizQuestionsFromSelection(wordsArray);
        setCurrentPhase('testing');
      } else {
        // 선택된 단어가 없으면 바로 완료
        if (onWordLearningComplete) {
          onWordLearningComplete([]);
        }
      }
    };

    // 선택 단계에서 AI 기반 퀴즈 생성
    const generateQuizQuestionsFromSelection = async (selectedWordsArray: string[]) => {
      try {
        setIsLoading(true);
        
        // AI API를 호출하여 퀴즈 생성
        const response = await fetch('/api/generate-word-quiz', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            words: selectedWordsArray,
            wordDetails: selectedWordDetails,
            passageText: passageText
          }),
        });

        if (!response.ok) {
          throw new Error(`퀴즈 생성 API 호출 실패: ${response.status}`);
        }

        const quizData = await response.json();
        
        if (quizData.questions && Array.isArray(quizData.questions)) {
          setQuizQuestions(quizData.questions);
          setCurrentQuizIndex(0);
          setQuizAnswers([]);
        } else {
          throw new Error('퀴즈 데이터 형식이 올바르지 않습니다.');
        }
        
      } catch (error) {
        console.error('AI 퀴즈 생성 실패:', error);
        
        // AI 퀴즈 생성 실패 시 기본 퀴즈 생성
        const fallbackQuestions: QuizQuestion[] = [];
        
        selectedWordsArray.forEach(word => {
          const wordDetail = selectedWordDetails[word];
          if (!wordDetail || !wordDetail.definitions) return;

          // 기본 의미 문제
          const correctMeaning = wordDetail.definitions[0]?.meaning || `${word}의 의미`;
          const contextSentence = wordDetail.definitions[0]?.example || `This sentence contains ${word}.`;
          
          fallbackQuestions.push({
            word,
            question: `다음 문장에서 "${word}"의 한국어 의미는 무엇인가요?\n\n"${contextSentence}"`,
            options: [
              correctMeaning,
              '관련 없는 의미 1',
              '관련 없는 의미 2',
              '관련 없는 의미 3'
            ],
            correctAnswer: 0,
            type: 'contextMeaning'
          });
        });

        setQuizQuestions(fallbackQuestions);
        setCurrentQuizIndex(0);
        setQuizAnswers([]);
      } finally {
        setIsLoading(false);
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
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              단어 선택하기
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              아래 지문을 읽고 모르는 단어를 클릭하여 선택해주세요.
            </p>
            
            <div className="p-4 bg-muted/50 rounded-md prose dark:prose-invert max-w-none mb-4">
              <p className="whitespace-pre-wrap leading-relaxed text-base">
                {renderPassageWithHighlights()}
              </p>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {selectedWords.size}개 단어 선택됨
              </span>
              <div className="flex gap-2">
                {onBackToPassage && (
                  <Button variant="outline" onClick={onBackToPassage}>
                    뒤로 가기
                  </Button>
                )}
                <Button onClick={handleSelectionComplete}>
                  {selectedWords.size > 0 ? "선택 완료 - 단어 학습하기" : "건너뛰기"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 선택된 단어들의 실시간 상세 정보 표시 */}
        {selectedWords.size > 0 && (
          <Card className="shadow-md border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/20">
            <CardHeader>
              <CardTitle className="text-lg text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                선택된 단어 학습
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from(selectedWords).map(word => {
                const wordDetail = selectedWordDetails[word];
                const isLoading = loadingWordDetails.has(word);

                return (
                  <div key={word} className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xl font-bold text-primary">
                        {word}
                        {wordDetail?.pronunciation && (
                          <span className="text-sm text-muted-foreground ml-2 font-normal">
                            {wordDetail.pronunciation}
                          </span>
                        )}
                      </h4>
                      {ttsSupported && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => speak(word, { rate: 0.7 })}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {isLoading ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-blue-600">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-sm">AI가 단어 의미를 분석하고 있습니다...</span>
                        </div>
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    ) : wordDetail ? (
                      <div className="space-y-4">
                        {wordDetail.definitions.map((definition, index) => (
                          <div key={index} className="border-l-4 border-primary/30 pl-4 mb-6">
                            <div className="flex items-start gap-2 mb-3">
                              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                                {definition.partOfSpeech}
                              </span>
                              <div className="flex-1">
                                <p className="font-semibold text-foreground text-lg mb-2">
                                  {definition.meaning}
                                </p>
                              </div>
                            </div>
                            
                            {definition.example && (
                              <div className="space-y-3">
                                {/* AI 생성 예문 */}
                                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                  <div className="flex items-start gap-2 mb-2">
                                    <span className="text-blue-600 font-medium text-sm">🤖 AI 생성 예문:</span>
                                  </div>
                                  <p className="text-foreground font-medium mb-2 text-base">
                                    "{definition.example}"
                                  </p>
                                  {definition.exampleTranslation && (
                                    <p className="text-muted-foreground text-sm border-l-2 border-blue-300 pl-3">
                                      <span className="text-blue-600">💬 해석:</span> {definition.exampleTranslation}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}

                        {/* 지문에서의 실제 사용 맥락 */}
                        <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <h5 className="text-sm font-semibold text-yellow-700 dark:text-yellow-300 mb-2 flex items-center gap-2">
                            <span className="text-lg">📖</span>
                            지문에서의 실제 사용:
                          </h5>
                          <p className="text-sm text-yellow-600 dark:text-yellow-400 italic">
                            "{passageText.split(/[.!?]/).find(sentence => 
                              sentence.toLowerCase().includes(word.toLowerCase())
                            )?.trim() || "이 단어가 지문에 포함되어 있습니다."}"
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        단어 정보를 불러오는 중입니다...
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <p className="text-green-700 dark:text-green-300 text-sm mb-1">
                      💡 <strong>학습 완료 확인:</strong> 
                    </p>
                    <p className="text-green-600 dark:text-green-400 text-sm">
                      각 단어의 한국어 의미와 AI 생성 예문을 충분히 학습하셨나요?
                    </p>
                  </div>
                  <Button 
                    onClick={handleSelectionComplete}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    학습 완료 - 문맥 퀴즈 시작
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">{t('loading_word_data', "단어 데이터를 불러오는 중...")}</p>
      </div>
    );
  }

  // 에러 상태
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

  // 학습 완료 상태
  if (currentPhase === 'completed') {
    return (
      <div className="space-y-6 p-1">
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <Target className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2">
                🎉 단어 학습 완료!
              </h3>
              <p className="text-green-600 dark:text-green-400 mb-4">
                선택하신 {Array.from(selectedWords).length}개 단어의 학습을 완료했습니다.
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                이제 문장 학습으로 진행됩니다.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                {onBackToPassage && (
                  <Button onClick={onBackToPassage} variant="outline">
                    지문으로 돌아가기
                  </Button>
                )}
                <Button onClick={() => setCurrentPhase('learning')}>
                  다시 학습하기
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 테스트 단계
  if (currentPhase === 'testing') {
    if (showQuizResult) {
      return (
        <div className="space-y-6 p-1">
          <Card className={`${quizScore >= 70 ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' : 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'}`}>
            <CardHeader>
              <CardTitle className={`text-center ${quizScore >= 70 ? 'text-green-700 dark:text-green-300' : 'text-yellow-700 dark:text-yellow-300'}`}>
                단어 퀴즈 결과
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
                    🎉 축하합니다! 단어 학습을 성공적으로 완료했습니다.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    잠시 후 문장 학습으로 자동 이동합니다...
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-yellow-600 dark:text-yellow-400 mb-4">
                    조금 더 연습이 필요합니다. (70% 이상 필요)
                  </p>
                  {incorrectWords.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        다시 학습할 단어: {incorrectWords.join(', ')}
                      </p>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button onClick={() => {
                      // 틀린 단어들 다시 선택하여 재학습
                      setSelectedWords(new Set(incorrectWords));
                      setCurrentPhase('selection');
                      setShowQuizResult(false);
                    }} variant="outline">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      틀린 단어 다시 학습
                    </Button>
                    <Button onClick={() => {
                      setCurrentPhase('completed');
                      if (onWordLearningComplete) {
                        onWordLearningComplete(Array.from(selectedWords));
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
    if (currentQuestion) {
      return (
        <div className="space-y-6 p-1">
          {/* 진행률 표시 */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">단어 테스트</h3>
            <div className="text-sm text-muted-foreground">
              {currentQuizIndex + 1} / {quizQuestions.length} 문제
            </div>
          </div>

          {/* 진행률 바 */}
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuizIndex + 1) / quizQuestions.length) * 100}%` }}
            />
          </div>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">
                {currentQuestion.word}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg font-medium">
                {currentQuestion.question}
              </p>
              
              <div className="grid gap-3">
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
                    {option}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  // 학습 단계 (기존 코드)
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
          {wordsToLearn && wordsToLearn.length > 0 ? `${currentWordIndex + 1} / ${wordsToLearn.length} 단어` : '0 / 0 단어'}
        </div>
      </div>

      {/* 진행률 바 */}
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ 
            width: wordsToLearn && wordsToLearn.length > 0 
              ? `${((currentWordIndex + 1) / wordsToLearn.length) * 100}%` 
              : '0%' 
          }}
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

            {/* 지문 맥락 */}
            {passageText && currentWord && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
                  {t('context_from_passage', "지문에서의 맥락")}
                </h4>
                <p className="text-sm text-muted-foreground">
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
            {isLastWord ? "테스트 시작" : t('learned', "학습했어요")}
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