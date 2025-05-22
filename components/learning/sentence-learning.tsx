// components/learning/sentence-learning.tsx
"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card"; // Card, CardContent import
import { useTranslation } from "react-i18next"; // 또는 "@/app/i18n" (프로젝트 설정에 맞게)

// learning/page.tsx와 동일한 타입 정의 또는 import
interface SentenceDisplayData {
  sentence: string;
  translationOrExplanation: string;
  structure?: string;
}

interface SentenceLearningProps {
  sentences: SentenceDisplayData[];
}

export default function SentenceLearning({ sentences }: SentenceLearningProps) {
  const { t } = useTranslation();

  console.log("--- SentenceLearning with Cards RENDERED ---"); // 로그 메시지 변경
  console.log("Received props (sentences):", JSON.stringify(sentences, null, 2));

  if (!sentences || sentences.length === 0) {
    console.log("SentenceLearning with Cards: No sentences data to display.");
    return (
      <div className="p-4 text-center text-muted-foreground">
        {t('no_sentences_to_display', "표시할 문장 데이터가 없습니다.")}
      </div>
    );
  }

  console.log(`SentenceLearning with Cards: Rendering ${sentences.length} sentences.`);
  return (
    <div className="space-y-4">
      {/* 필요하다면 여기에 전체 문장 학습 섹션 제목을 추가할 수 있습니다. */}
      {/* <h2 className="text-xl font-semibold mb-3">{t('sentences_for_learning', "학습할 문장들")}</h2> */}
      {sentences.map((item, index) => (
        <Card key={index} className="overflow-hidden shadow-sm">
          <CardContent className="p-4 space-y-2"> {/* CardContent에 패딩 추가 */}
            <p className="text-lg font-medium text-primary dark:text-primary-foreground">
              {index + 1}. {item.sentence}
            </p>
            <div className="mt-1"> {/* 약간의 상단 마진 추가 */}
              <p className="text-sm text-muted-foreground">
                <strong className="font-semibold text-foreground/90">{t('explanation_translation_label', "해석/설명")}:</strong> {item.translationOrExplanation}
              </p>
              {item.structure && (
                <p className="text-xs text-muted-foreground/80 mt-1">
                  <strong className="font-semibold text-foreground/90">{t('structure_label', "구조")}:</strong> {item.structure}
                </p>
              )}
            </div>
            {/* TODO: 문장별 TTS 버튼, 선택 기능 등을 여기에 점진적으로 추가할 수 있습니다. */}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}