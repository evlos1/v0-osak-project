"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n"; // app/i18n.ts를 가져옵니다.

export default function TopicSelectionPage() {
  const router = useRouter();
  const { t } = useTranslation(); // 이 t 함수를 사용합니다.
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedDetailCategory, setSelectedDetailCategory] = useState("");

  // categories, subCategories, detailCategories의 키 값들은 i18n.ts의 번역 키와 일치해야 합니다.
  // 예: "과학", "물리학" 등
  const categories = ["과학", "예술", "스포츠", "기술", "역사", "문학", "비즈니스", "여행"];

  const subCategories: { [key: string]: string[] } = {
    과학: ["물리학", "화학", "생물학", "천문학", "지구과학"],
    예술: ["음악", "미술", "영화", "연극", "사진"],
    스포츠: ["축구", "농구", "야구", "테니스", "수영"],
    기술: ["프로그래밍", "인공지능", "로봇공학", "웹개발", "모바일앱"],
    역사: ["고대사", "중세사", "근대사", "현대사", "문화사"],
    문학: ["소설", "시", "희곡", "에세이", "비평"],
    비즈니스: ["마케팅", "재무", "창업", "경영", "경제학"],
    여행: ["유럽", "아시아", "북미", "남미", "아프리카"],
  };

  const detailCategories: { [key: string]: string[] } = {
    // 과학 카테고리
    물리학: ["역학", "양자역학", "상대성이론", "열역학", "전자기학"],
    화학: ["유기화학", "무기화학", "분석화학", "생화학", "물리화학"],
    생물학: ["분자생물학", "유전학", "생태학", "진화론", "세포생물학"],
    천문학: ["태양계", "별과은하", "우주론", "천체물리학", "행성과학"],
    지구과학: ["지질학", "대기과학", "해양학", "환경과학", "기후학"],

    // 예술 카테고리
    음악: ["클래식", "재즈", "팝", "록", "힙합"],
    미술: ["회화", "조각", "현대미술", "디자인", "건축"],
    영화: ["액션", "드라마", "코미디", "공포", "다큐멘터리"],
    연극: ["뮤지컬", "셰익스피어", "현대극", "즉흥극", "아방가르드"],
    사진: ["풍경사진", "인물사진", "다큐멘터리사진", "예술사진", "상업사진"], // '다큐멘터리 사진' -> '다큐멘터리사진'으로 변경 (일관성)

    // 스포츠 카테고리
    축구: ["프리미어리그", "라리가", "분데스리가", "세리에A", "K리그"],
    농구: ["NBA", "WNBA", "유로리그", "KBL", "대학농구"],
    야구: ["메이저리그", "일본프로야구", "KBO", "대학야구", "야구 기술"],
    테니스: ["그랜드슬램", "ATP투어", "WTA투어", "데이비스컵", "테니스 기술"],
    수영: ["자유형", "배영", "평영", "접영", "개인혼영"],

    // 기술 카테고리
    프로그래밍: ["자바스크립트", "파이썬", "자바", "C++", "루비"],
    인공지능: ["머신러닝", "딥러닝", "자연어처리", "컴퓨터비전", "강화학습"],
    로봇공학: ["산업용 로봇", "서비스 로봇", "드론", "자율주행", "로봇 윤리"],
    웹개발: ["프론트엔드", "백엔드", "풀스택", "웹디자인", "웹보안"],
    모바일앱: ["iOS 개발", "안드로이드 개발", "크로스플랫폼", "앱 디자인", "앱 마케팅"],

    // 역사 카테고리
    고대사: ["이집트", "그리스", "로마", "중국", "메소포타미아"],
    중세사: ["유럽 중세", "비잔틴", "이슬람 세계", "동아시아", "바이킹"],
    근대사: ["르네상스", "산업혁명", "계몽주의", "제국주의", "민족주의"],
    현대사: ["세계대전", "냉전", "탈식민지화", "정보화 시대", "세계화"],
    문화사: ["예술사", "과학사", "종교사", "일상생활사", "사상사"],

    // 문학 카테고리
    소설: ["고전소설", "현대소설", "SF", "판타지", "추리소설"],
    시: ["서정시", "서사시", "현대시", "자유시", "실험시"],
    희곡: ["비극", "희극", "현대극", "음악극", "실험극"], // 현대극은 예술>연극>현대극과 중복될 수 있으나, 문학>희곡 하위에도 있을 수 있음
    에세이: ["개인적 에세이", "비평적 에세이", "여행 에세이", "문화 에세이", "철학적 에세이"],
    비평: ["문학비평", "영화비평", "예술비평", "문화비평", "사회비평"],

    // 비즈니스 카테고리
    마케팅: ["디지털 마케팅", "브랜드 마케팅", "콘텐츠 마케팅", "소셜미디어 마케팅", "마케팅 전략"],
    재무: ["투자", "금융시장", "회계", "세무", "재무관리"],
    창업: ["스타트업", "비즈니스 모델", "투자 유치", "창업 전략", "성장 전략"],
    경영: ["리더십", "조직관리", "전략경영", "인사관리", "운영관리"],
    경제학: ["미시경제학", "거시경제학", "국제경제학", "행동경제학", "개발경제학"],

    // 여행 카테고리
    유럽: ["서유럽", "동유럽", "북유럽", "남유럽", "중부유럽"],
    아시아: ["동아시아", "동남아시아", "남아시아", "중앙아시아", "서아시아"],
    북미: ["미국 동부", "미국 서부", "캐나다", "멕시코", "카리브해"],
    남미: ["브라질", "아르헨티나", "페루", "칠레", "콜롬비아"],
    아프리카: ["북아프리카", "서아프리카", "동아프리카", "남아프리카", "중앙아프리카"],
  };

  // 라우터 이동 시 원래 선택한 한국어 카테고리 이름을 사용 (URL에는 한국어 원본 또는 고유 ID 사용 권장)
  const handleNext = () => {
    if (step === 3) {
      // URL 파라미터에는 일관된 식별자(예: 한국어 원본 또는 영어 키)를 사용하는 것이 좋습니다.
      // 여기서는 selectedDetailCategory (한국어)를 그대로 사용합니다.
      router.push(`/level-assessment?topic=${encodeURIComponent(selectedDetailCategory)}`);
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      // 뒤로 갈 때 선택 초기화 (선택사항)
      if (step === 3) setSelectedDetailCategory("");
      if (step === 2) setSelectedSubCategory("");
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h2 className="text-2xl font-bold mb-6">{t("select_topic")}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((categoryKey) => (
                <Card
                  key={categoryKey}
                  className={`cursor-pointer transition-all ${
                    selectedCategory === categoryKey ? "border-primary bg-primary/10" : "hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedCategory(categoryKey)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <span>{t(categoryKey)}</span> {/* 변경됨 */}
                    <ChevronRight className="h-4 w-4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        );
      case 2:
        if (!selectedCategory || !subCategories[selectedCategory]) return null; // 선택된 카테고리가 없거나 하위 카테고리가 없으면 렌더링 안함
        return (
          <>
            <h2 className="text-2xl font-bold mb-6">
              {/* 한국어 제목은 page.tsx의 selectedCategory 값을 그대로 사용하고, 그 외 언어는 t 함수와 번역된 카테고리 명 사용 */}
              {i18n.language === "ko"
                ? `${selectedCategory}의 세부 분야를 선택하세요`
                : t("select_subcategory_of", { category: t(selectedCategory) })} {/* 변경됨 */}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {subCategories[selectedCategory]?.map((subCategoryKey) => (
                <Card
                  key={subCategoryKey}
                  className={`cursor-pointer transition-all ${
                    selectedSubCategory === subCategoryKey ? "border-primary bg-primary/10" : "hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedSubCategory(subCategoryKey)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <span>{t(subCategoryKey)}</span> {/* 변경됨 */}
                    <ChevronRight className="h-4 w-4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        );
      case 3:
        if (!selectedSubCategory || !detailCategories[selectedSubCategory]) return null; // 선택된 하위 카테고리가 없거나 상세 카테고리가 없으면 렌더링 안함
        return (
          <>
            <h2 className="text-2xl font-bold mb-6">
              {i18n.language === "ko"
                ? `${selectedSubCategory}의 구체적인 주제를 선택하세요`
                : t("select_detail_of", { category: t(selectedSubCategory) })} {/* 변경됨 */}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {detailCategories[selectedSubCategory]?.map((detailCategoryKey) => (
                <Card
                  key={detailCategoryKey}
                  className={`cursor-pointer transition-all ${
                    selectedDetailCategory === detailCategoryKey
                      ? "border-primary bg-primary/10"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedDetailCategory(detailCategoryKey)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <span>{t(detailCategoryKey)}</span> {/* 변경됨 */}
                    <ChevronRight className="h-4 w-4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const isNextDisabled = () => {
    if (step === 1 && !selectedCategory) return true;
    if (step === 2 && !selectedSubCategory) return true;
    if (step === 3 && !selectedDetailCategory) return true;
    return false;
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Button variant="ghost" onClick={handleBack} disabled={step === 1}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("back")}
        </Button>
        <div className="ml-auto flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            {t("step")} {step}/3
          </span>
          <div className="flex space-x-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`h-2 w-8 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-background rounded-lg p-6 shadow-sm border"> {/* 일반적으로 테마를 따르도록 bg-white 대신 bg-background 사용 */}
        {renderStepContent()}

        <div className="mt-8 flex justify-end">
          <Button onClick={handleNext} disabled={isNextDisabled()}>
            {step === 3 ? t("start_assessment") : t("next")}
            {step < 3 && <ChevronRight className="ml-2 h-4 w-4" />} {/* 마지막 단계에서는 Next 아이콘 숨김 (선택사항) */}
          </Button>
        </div>
      </div>
    </div>
  );
}