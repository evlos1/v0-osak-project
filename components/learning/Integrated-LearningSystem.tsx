"use client";

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Book, BookOpen, Target } from "lucide-react";
import { useTranslation } from "react-i18next";

// WordLearning과 PassageLearning 컴포넌트를 import (위에서 만든 컴포넌트들)
// import WordLearning from './WordLearning';
// import PassageLearning from './PassageLearning';

// 임시로 컴포넌트들을 여기에 정의 (실제로는 별도 파일에서 import)
const WordLearning = ({ words, passageText, onWordLearningComplete, onBackToPassage }: any) => (
  <div className="p-6 border rounded-lg">
    <h3 className="text-lg font-semibold mb-4">단어 학습</h3>
    <p className="text-muted-foreground mb-4">
      {words.length}개의 단어를 학습하고 있습니다: {words.join(', ')}
    </p>
    <div className="flex gap-2">
      <button 
        onClick={() => onWordLearningComplete(words)}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        학습 완료
      </button>
      <button 
        onClick={onBackToPassage}
        className="px-4 py-2 border rounded hover:bg-gray-50"
      >
        지문으로 돌아가기
      </button>
    </div>
  </div>
);

const PassageLearning = ({ passageData, onUnknownWordSelectionComplete, onLearningComplete }: any) => (
  <div className="p-6 border rounded-lg">
    <h3 className="text-lg font-semibold mb-4">지문 학습</h3>
    <div className="p-4 bg-muted/50 rounded-md mb-4">
      <p>{passageData?.passageText || "지문 내용이 없습니다."}</p>
    </div>
    <div className="flex gap-2">
      <button 
        onClick={() => onUnknownWordSelectionComplete(['example', 'word', 'test'])}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        모르는 단어 선택 완료
      </button>
      <button 
        onClick={onLearningComplete}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        지문 학습 완료
      </button>
    </div>
  </div>
);

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

interface IntegratedLearningSystemProps {
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