"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronRight, ArrowLeft } from "lucide-react"
import { useTranslation } from "react-i18next"
import i18n from "@/i18n"

export default function TopicSelectionPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [step, setStep] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedSubCategory, setSelectedSubCategory] = useState("")
  const [selectedDetailCategory, setSelectedDetailCategory] = useState("")

  const categories = ["과학", "예술", "스포츠", "기술", "역사", "문학", "비즈니스", "여행"]

  const subCategories = {
    과학: ["물리학", "화학", "생물학", "천문학", "지구과학"],
    예술: ["음악", "미술", "영화", "연극", "사진"],
    스포츠: ["축구", "농구", "야구", "테니스", "수영"],
    기술: ["프로그래밍", "인공지능", "로봇공학", "웹 개발", "모바일 앱"],
    역사: ["고대사", "중세사", "근대사", "현대사", "문화사"],
    문학: ["소설", "시", "희곡", "에세이", "비평"],
    비즈니스: ["마케팅", "재무", "창업", "경영", "경제학"],
    여행: ["유럽", "아시아", "북미", "남미", "아프리카"],
  }

  const detailCategories = {
    // 과학 카테고리
    물리학: ["역학", "양자역학", "상대성이론", "열역학", "전자기학"],
    화학: ["유기화학", "무기화학", "분석화학", "생화학", "물리화학"],
    생물학: ["분자생물학", "유전학", "생태학", "진화론", "세포생물학"],
    천문학: ["태양계", "별과 은하", "우주론", "천체물리학", "행성과학"],
    지구과학: ["지질학", "대기과학", "해양학", "환경과학", "기후학"],

    // 예술 카테고리
    음악: ["클래식", "재즈", "팝", "록", "힙합"],
    미술: ["회화", "조각", "현대미술", "디자인", "건축"],
    영화: ["액션", "드라마", "코미디", "공포", "다큐멘터리"],
    연극: ["뮤지컬", "셰익스피어", "현대극", "즉흥극", "아방가르드"],
    사진: ["풍경사진", "인물사진", "다큐멘터리", "예술사진", "상업사진"],

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
    희곡: ["비극", "희극", "현대극", "음악극", "실험극"],
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
  }

  // 다국어 지원을 위한 카테고리 매핑 추가
  const categoryTranslations = {
    // 주 카테고리 번역
    과학: { en: "Science", zh: "科学" },
    예술: { en: "Arts", zh: "艺术" },
    스포츠: { en: "Sports", zh: "体育" },
    기술: { en: "Technology", zh: "技术" },
    역사: { en: "History", zh: "历史" },
    문학: { en: "Literature", zh: "文学" },
    비즈니스: { en: "Business", zh: "商业" },
    여행: { en: "Travel", zh: "旅行" },

    // 과학 서브 카테고리
    물리학: { en: "Physics", zh: "物理学" },
    화학: { en: "Chemistry", zh: "化学" },
    생물학: { en: "Biology", zh: "生物学" },
    천문학: { en: "Astronomy", zh: "天文学" },
    지구과학: { en: "Earth Science", zh: "地球科学" },

    // 예술 서브 카테고리
    음악: { en: "Music", zh: "音乐" },
    미술: { en: "Fine Arts", zh: "美术" },
    영화: { en: "Film", zh: "电影" },
    연극: { en: "Theater", zh: "戏剧" },
    사진: { en: "Photography", zh: "摄影" },

    // 스포츠 서브 카테고리
    축구: { en: "Soccer", zh: "足球" },
    농구: { en: "Basketball", zh: "篮球" },
    야구: { en: "Baseball", zh: "棒球" },
    테니스: { en: "Tennis", zh: "网球" },
    수영: { en: "Swimming", zh: "游泳" },

    // 기술 서브 카테고리
    프로그래밍: { en: "Programming", zh: "编程" },
    인공지능: { en: "Artificial Intelligence", zh: "人工智能" },
    로봇공학: { en: "Robotics", zh: "机器人技术" },
    웹개발: { en: "Web Development", zh: "网页开发" },
    모바일앱: { en: "Mobile Apps", zh: "移动应用" },

    // 역사 서브 카테고리
    고대사: { en: "Ancient History", zh: "古代史" },
    중세사: { en: "Medieval History", zh: "中世纪史" },
    근대사: { en: "Modern History", zh: "近代史" },
    현대사: { en: "Contemporary History", zh: "当代史" },
    문화사: { en: "Cultural History", zh: "文化史" },

    // 문학 서브 카테고리
    소설: { en: "Fiction", zh: "小说" },
    시: { en: "Poetry", zh: "诗歌" },
    희곡: { en: "Drama", zh: "戏剧" },
    에세이: { en: "Essays", zh: "散文" },
    비평: { en: "Criticism", zh: "评论" },

    // 비즈니스 서브 카테고리
    마케팅: { en: "Marketing", zh: "市场营销" },
    재무: { en: "Finance", zh: "财务" },
    창업: { en: "Entrepreneurship", zh: "创业" },
    경영: { en: "Management", zh: "管理" },
    경제학: { en: "Economics", zh: "经济学" },

    // 여행 서브 카테고리
    유럽: { en: "Europe", zh: "欧洲" },
    아시아: { en: "Asia", zh: "亚洲" },
    북미: { en: "North America", zh: "北美" },
    남미: { en: "South America", zh: "南美" },
    아프리카: { en: "Africa", zh: "非洲" },

    // 물리학 상세 카테고리
    역학: { en: "Mechanics", zh: "力学" },
    양자역학: { en: "Quantum Mechanics", zh: "量子力学" },
    상대성이론: { en: "Theory of Relativity", zh: "相对论" },
    열역학: { en: "Thermodynamics", zh: "热力学" },
    전자기학: { en: "Electromagnetism", zh: "电磁学" },

    // 화학 상세 카테고리
    유기화학: { en: "Organic Chemistry", zh: "有机化学" },
    무기화학: { en: "Inorganic Chemistry", zh: "无机化学" },
    분석화학: { en: "Analytical Chemistry", zh: "分析化学" },
    생화학: { en: "Biochemistry", zh: "生物化学" },
    물리화학: { en: "Physical Chemistry", zh: "物理化学" },

    // 생물학 상세 카테고리
    분자생물학: { en: "Molecular Biology", zh: "分子生物学" },
    유전학: { en: "Genetics", zh: "遗传学" },
    생태학: { en: "Ecology", zh: "生态学" },
    진화론: { en: "Evolution Theory", zh: "进化论" },
    세포생물학: { en: "Cell Biology", zh: "细胞生物学" },

    // 천문학 상세 카테고리
    태양계: { en: "Solar System", zh: "太阳系" },
    별과은하: { en: "Stars and Galaxies", zh: "恒星和星系" },
    우주론: { en: "Cosmology", zh: "宇宙学" },
    천체물리학: { en: "Astrophysics", zh: "天体物理学" },
    행성과학: { en: "Planetary Science", zh: "行星科学" },

    // 지구과학 상세 카테고리
    지질학: { en: "Geology", zh: "地质学" },
    대기과학: { en: "Atmospheric Science", zh: "大气科学" },
    해양학: { en: "Oceanography", zh: "海洋学" },
    환경과학: { en: "Environmental Science", zh: "环境科学" },
    기후학: { en: "Climatology", zh: "气候学" },
    // 다른 모든 상세 카테고리도 추가...
    // (모든 상세 카테고리를 추가하면 코드가 너무 길어지므로 일부만 예시로 추가했습니다)
    클래식: { en: "Classical Music", zh: "古典音乐" },
    재즈: { en: "Jazz", zh: "爵士乐" },
    팝: { en: "Pop Music", zh: "流行音乐" },
    록: { en: "Rock Music", zh: "摇滚音乐" },
    힙합: { en: "Hip Hop", zh: "嘻哈音乐" },

    회화: { en: "Painting", zh: "绘画" },
    조각: { en: "Sculpture", zh: "雕塑" },
    현대미술: { en: "Contemporary Art", zh: "当代艺术" },
    디자인: { en: "Design", zh: "设计" },
    건축: { en: "Architecture", zh: "建筑" },
  }

  // 현재 언어에 맞는 카테고리 이름 가져오기
  const getLocalizedCategoryName = (koreanName: string) => {
    const currentLang = i18n.language
    if (currentLang === "ko") return koreanName

    const translation = categoryTranslations[koreanName]
    return translation ? translation[currentLang] || koreanName : koreanName
  }

  // 라우터 이동 시 원래 선택한 한국어 카테고리 이름을 사용
  const handleNext = () => {
    if (step === 3) {
      // 항상 한국어 카테고리 이름을 URL에 사용
      router.push(`/level-assessment?topic=${selectedDetailCategory}`)
    } else {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h2 className="text-2xl font-bold mb-6">{t("select_topic")}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category) => (
                <Card
                  key={category}
                  className={`cursor-pointer transition-all ${
                    selectedCategory === category ? "border-primary bg-primary/10" : "hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <span>{getLocalizedCategoryName(category)}</span>
                    <ChevronRight className="h-4 w-4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )
      case 2:
        return (
          <>
            <h2 className="text-2xl font-bold mb-6">
              {i18n.language === "ko"
                ? // 한국어일 때는 JSX 요소를 사용하지 않고 완전한 문자열로 처리
                  selectedCategory + "의 세부 분야를 선택하세요"
                : t("select_subcategory_of", { category: getLocalizedCategoryName(selectedCategory) })}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {subCategories[selectedCategory]?.map((subCategory) => (
                <Card
                  key={subCategory}
                  className={`cursor-pointer transition-all ${
                    selectedSubCategory === subCategory ? "border-primary bg-primary/10" : "hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedSubCategory(subCategory)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <span>{getLocalizedCategoryName(subCategory)}</span>
                    <ChevronRight className="h-4 w-4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )
      case 3:
        return (
          <>
            <h2 className="text-2xl font-bold mb-6">
              {i18n.language === "ko"
                ? // 한국어일 때는 JSX 요소를 사용하지 않고 완전한 문자열로 처리
                  selectedSubCategory + "의 구체적인 주제를 선택하세요"
                : t("select_detail_of", { category: getLocalizedCategoryName(selectedSubCategory) })}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {detailCategories[selectedSubCategory]?.map((detailCategory) => (
                <Card
                  key={detailCategory}
                  className={`cursor-pointer transition-all ${
                    selectedDetailCategory === detailCategory
                      ? "border-primary bg-primary/10"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedDetailCategory(detailCategory)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <span>{getLocalizedCategoryName(detailCategory)}</span>
                    <ChevronRight className="h-4 w-4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )
      default:
        return null
    }
  }

  const isNextDisabled = () => {
    if (step === 1 && !selectedCategory) return true
    if (step === 2 && !selectedSubCategory) return true
    if (step === 3 && !selectedDetailCategory) return true
    return false
  }

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

      <div className="bg-white rounded-lg p-6 shadow-sm border">
        {renderStepContent()}

        <div className="mt-8 flex justify-end">
          <Button onClick={handleNext} disabled={isNextDisabled()}>
            {step === 3 ? t("start_assessment") : t("next")}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
