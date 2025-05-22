"use client";

import { useState } from "react"; // 상세 정보 표시 등을 위해 필요할 수 있음
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge"; // 필요시 사용
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // 이 컴포넌트 내에서는 Tabs 불필요
// import { Checkbox } from "@/components/ui/checkbox"; // 필요시 사용
import { Loader2, History } from "lucide-react"; // 필요시 사용
import { useTranslation } from "react-i18next"; // 또는 "@/app/i18n"

// learning/page.tsx와 동일한 타입 정의 또는 import
// export type WordDisplayData = { word: string; meaning: string; };
// import type { WordDisplayData } from '@/app/learning/page'; // 실제 경로로 수정 필요
interface WordDisplayData {
  word: string;
  meaning: string; // 현재 learning/page.tsx에서 임시 가공된 '뜻' (원래는 퀴즈 질문 전체일 수 있음)
}

interface WordLearningProps {
  words: WordDisplayData[]; // learning/page.tsx에서 전달하는 'wordsForDisplay' 데이터
  // --- 아래 props들은 일단 주석 처리 또는 제거 ---
  // learningContent: GeneratedContent | null; // 더 이상 전체 learningContent를 받지 않음
  // selectedWords: string[];
  // setSelectedWords: (words: string[]) => void;
  // wordDefinitions: Record<string, WordDefinition>;
  // handleWordClick: (word: string) => void;
  // quizMode: boolean;
  // quizCompleted: boolean;
  // showResults: boolean;
  // wordQuizAnswers: number[];
  // setWordQuizAnswers: (answers: number[]) => void;
  // quizResults: boolean[];
  // handleCompleteSection: () => void;
  // apiKey: string;
  // isGeneratingQuiz: boolean;
  // quizError: string | null;
  // customWordQuizzes: Quiz[];
  // filteredWordQuizzes: Quiz[];
  // knowAllWords: boolean;
  // setKnowAllWords: (value: boolean) => void;
  // learningMode: "review" | "quiz";
  // reviewCompleted: boolean;
  // incorrectIndices: number[];
}

export default function WordLearning({ words }: WordLearningProps) {
  const { t } = useTranslation();
  // const [activeDefinitionTab, setActiveDefinitionTab] = useState("meanings"); // 상세 정의용 탭 상태 (나중에 추가)

  console.log("--- WordLearning Component (Simplified) RENDERED ---");
  console.log("Received props (words):", JSON.stringify(words, null, 2));

  if (!words || words.length === 0) {
    // learning/page.tsx에서 wordsForDisplay가 비어있더라도 최소 1개의 예시를 넣어주므로,
    // 이 조건은 거의 발생하지 않거나, API에서 아예 단어 관련 정보를 못 받았을 때 해당될 수 있습니다.
    return (
      <div className="p-4 text-center text-muted-foreground">
        {t('no_words_to_display', "표시할 단어 데이터가 없습니다. API 응답에 단어 정보가 부족할 수 있습니다.")}
      </div>
    );
  }

  // TODO: 아래는 전달받은 'words' (WordDisplayData[])를 사용하여 기본적인 단어 목록을 표시하는 예시입니다.
  //       원래 WordLearning.tsx에 있던 복잡한 UI(단어 클릭 시 정의/어원 표시, 퀴즈 모드 등)는
  //       이 기본 표시가 작동한 후, 새로운 props 구조에 맞춰 단계적으로 다시 구현해야 합니다.

  return (
    <div className="space-y-4">
      {/* <div className="flex items-center space-x-2 mb-4">
        <Checkbox id="know-all-words" />
        <label htmlFor="know-all-words">모든 단어를 알고 있습니다</label>
      </div> */}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {words.map((item, index) => (
          <Card key={index} className="shadow-sm">
            <CardContent className="p-3 text-center">
              <div className="font-bold text-lg text-primary dark:text-primary-foreground">{item.word}</div>
              {/* 'meaning'은 현재 API 응답과 learning/page.tsx의 가공 방식에 따라
                  단순한 뜻이 아닐 수 있습니다 (예: 퀴즈 질문 전체).
                  API 응답을 개선하여 명확한 '뜻'을 제공하는 것이 가장 좋습니다. */}
              <div className="text-xs text-muted-foreground mt-1 truncate" title={item.meaning}>
                ({item.meaning})
              </div>
              {/* TODO: 단어 클릭 시 상세 정보(정의, 어원 등) 표시 로직 추가 */}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* TODO: 퀴즈 시작 버튼 등의 UI도 필요하다면 여기에 다시 추가 */}
      {/* <div className="flex justify-end mt-6">
        <Button>퀴즈 시작</Button>
      </div> */}
    </div>
  );
}