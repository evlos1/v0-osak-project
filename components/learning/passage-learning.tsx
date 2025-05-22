// components/learning/passage-learning.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card"; // Card 사용 예시를 위해 남겨둠
import { Volume2, Pause } from "lucide-react";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next"; // 또는 "@/app/i18n" 사용

// learning/page.tsx에서 정의한 PassageDisplayData 타입과 일치해야 합니다.
// 필요하다면 공유 타입 파일에서 import 하세요.
interface PassageDisplayData {
  text: string;        // 영어 지문
  translation: string; // 한국어 번역
  // 여기에 주제(theme)나 구조(structure)도 포함시켜 전달할 수 있습니다.
  // theme?: string;
  // structure?: string;
}

interface PassageLearningProps {
  passage: PassageDisplayData | null | undefined; // learning/page.tsx에서 전달하는 prop 이름과 일치
  // 퀴즈/리뷰 관련 props는 일단 제거하고 기본 표시에 집중합니다.
  // 이 기능들을 다시 추가하려면 props와 로직을 재구성해야 합니다.
}

export default function PassageLearning({ passage }: PassageLearningProps) {
  const { t } = useTranslation();
  const { speak, stop, speaking, supported } = useTextToSpeech();
  const [isSpeakingPassage, setIsSpeakingPassage] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!speaking && isSpeakingPassage) {
      setIsSpeakingPassage(false);
    }
  }, [speaking, isSpeakingPassage]);

  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      stop(); // 컴포넌트 언마운트 시 TTS 중지
    };
  }, [stop]);

  // 전달받은 passage prop 확인
  if (!passage || typeof passage.text !== 'string' || typeof passage.translation !== 'string') {
    return (
      <div className="p-4 text-center text-muted-foreground">
        {t('passage_data_not_available_or_invalid') || "지문 정보를 불러올 수 없거나 형식이 올바르지 않습니다."}
      </div>
    );
  }

  const handleSpeakPassage = () => {
    if (!supported || !passage?.text) return;

    if (isSpeakingPassage) {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      stop();
      setIsSpeakingPassage(false);
    } else {
      setIsSpeakingPassage(true);
      const cleanup = speak(passage.text, { // passage.text 사용
        rate: 0.8, // 적절한 읽기 속도
        onEnd: () => {
          setIsSpeakingPassage(false);
          cleanupRef.current = null;
        },
      });
      if (typeof cleanup === "function") {
        cleanupRef.current = cleanup;
      }
    }
  };

  // 이 return 문이 일반적인 지문 학습 내용을 표시합니다.
  // 퀴즈 모드, 리뷰 모드 등의 복잡한 조건부 렌더링은 일단 제외하고
  // 지문과 번역 표시에 집중합니다.
  return (
    <div className="space-y-6 p-1">
      <Card>
        <CardContent className="pt-6"> {/* CardContent에 패딩을 주려면 pt-6 등 사용 */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-semibold">
              {t("passage_text_title") || "본문 (Passage)"}
            </h3>
            {supported && passage.text && (
              <Button
                variant="outline"
                size="icon" // 아이콘 버튼으로 변경
                onClick={handleSpeakPassage}
                title={isSpeakingPassage ? t("stop_reading") : t("read_passage")}
                className={isSpeakingPassage ? "text-primary" : ""}
              >
                {isSpeakingPassage ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>
            )}
          </div>
          <div className="p-4 bg-muted rounded-md shadow-sm">
            <p className="whitespace-pre-wrap leading-relaxed">
              {passage.text}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-xl font-semibold mb-3">
            {t("translation_title") || "해석 (Translation)"}
          </h3>
          <div className="p-4 bg-muted rounded-md shadow-sm">
            <p className="whitespace-pre-wrap leading-relaxed">
              {passage.translation}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* TODO: 지문의 주제(theme)나 구조(structure)를 표시하려면,
        learning/page.tsx의 PassageDisplayData 타입에 해당 필드를 추가하고,
        데이터 가공 시 passageExplanation에서 값을 가져와 채워준 뒤,
        여기서 passage.theme, passage.structure 등으로 접근하여 표시합니다.
        예:
        {passage.theme && (
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-3">{t("theme")}</h3>
              <p>{passage.theme}</p>
            </CardContent>
          </Card>
        )}
      */}
    </div>
  );
}