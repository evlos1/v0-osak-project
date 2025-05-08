// 모든 카테고리 번역을 한 곳에서 관리하기 위한 새 파일

// 다국어 지원을 위한 카테고리 매핑
export const categoryTranslations: Record<string, Record<string, string>> = {
  // 주 카테고리 번역
  과학: { en: "Science", zh: "科学" },
  예술: { en: "Arts", zh: "艺术" },
  스포츠: { en: "Sports", zh: "体育" },
  기술: { en: "Technology", zh: "技术" },
  역사: { en: "History", zh: "历史" },
  문학: { en: "Literature", zh: "文学" },
  비즈니스: { en: "Business", zh: "商业" },
  여행: { en: "Travel", zh: "旅行" },
  일반: { en: "General", zh: "一般" },

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
  조각: { en: "Sculpture", zh: "雕塑" },

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

  // 음악 상세 카테고리
  클래식: { en: "Classical Music", zh: "古典音乐" },
  재즈: { en: "Jazz", zh: "爵士乐" },
  팝: { en: "Pop Music", zh: "流行音乐" },
  록: { en: "Rock Music", zh: "摇滚音乐" },
  힙합: { en: "Hip Hop", zh: "嘻哈音乐" },

  // 미술 상세 카테고리
  회화: { en: "Painting", zh: "绘画" },
  조각: { en: "Sculpture", zh: "雕塑" },
  현대미술: { en: "Contemporary Art", zh: "当代艺术" },
  디자인: { en: "Design", zh: "设计" },
  건축: { en: "Architecture", zh: "建筑" },

  // 영화 상세 카테고리
  액션: { en: "Action", zh: "动作片" },
  드라마: { en: "Drama", zh: "剧情片" },
  코미디: { en: "Comedy", zh: "喜剧片" },
  공포: { en: "Horror", zh: "恐怖片" },
  다큐멘터리: { en: "Documentary", zh: "纪录片" },

  // 연극 상세 카테고리
  뮤지컬: { en: "Musical", zh: "音乐剧" },
  셰익스피어: { en: "Shakespeare", zh: "莎士比亚" },
  현대극: { en: "Modern Drama", zh: "现代戏剧" },
  즉흥극: { en: "Improvisation", zh: "即兴戏剧" },
  아방가르드: { en: "Avant-garde", zh: "前卫戏剧" },

  // 사진 상세 카테고리
  풍경사진: { en: "Landscape Photography", zh: "风景摄影" },
  인물사진: { en: "Portrait Photography", zh: "人像摄影" },
  다큐멘터리사진: { en: "Documentary Photography", zh: "纪实摄影" },
  예술사진: { en: "Art Photography", zh: "艺术摄影" },
  상업사진: { en: "Commercial Photography", zh: "商业摄影" },

  // 축구 상세 카테고리
  프리미어리그: { en: "Premier League", zh: "英超" },
  라리가: { en: "La Liga", zh: "西甲" },
  분데스리가: { en: "Bundesliga", zh: "德甲" },
  세리에A: { en: "Serie A", zh: "意甲" },
  K리그: { en: "K League", zh: "韩国职业足球联赛" },

  // 농구 상세 카테고리
  NBA: { en: "NBA", zh: "NBA" },
  WNBA: { en: "WNBA", zh: "WNBA" },
  유로리그: { en: "EuroLeague", zh: "欧洲联赛" },
  KBL: { en: "KBL", zh: "韩国篮球联赛" },
  대학농구: { en: "College Basketball", zh: "大学篮球" },

  // 야구 상세 카테고리
  메이저리그: { en: "Major League Baseball", zh: "美国职业棒球大联盟" },
  일본프로야구: { en: "Nippon Professional Baseball", zh: "日本职业棒球" },
  KBO: { en: "KBO League", zh: "韩国职业棒球联赛" },
  대학야구: { en: "College Baseball", zh: "大学棒球" },
  "야구 기술": { en: "Baseball Techniques", zh: "棒球技术" },

  // 테니스 상세 카테고리
  그랜드슬램: { en: "Grand Slam", zh: "大满贯" },
  ATP투어: { en: "ATP Tour", zh: "ATP巡回赛" },
  WTA투어: { en: "WTA Tour", zh: "WTA巡回赛" },
  데이비스컵: { en: "Davis Cup", zh: "戴维斯杯" },
  "테니스 기술": { en: "Tennis Techniques", zh: "网球技术" },

  // 수영 상세 카테고리
  자유형: { en: "Freestyle", zh: "自由泳" },
  배영: { en: "Backstroke", zh: "仰泳" },
  평영: { en: "Breaststroke", zh: "蛙泳" },
  접영: { en: "Butterfly", zh: "蝶泳" },
  개인혼영: { en: "Individual Medley", zh: "个人混合泳" },

  // 프로그래밍 상세 카테고리
  자바스크립트: { en: "JavaScript", zh: "JavaScript" },
  파이썬: { en: "Python", zh: "Python" },
  자바: { en: "Java", zh: "Java" },
  "C++": { en: "C++", zh: "C++" },
  루비: { en: "Ruby", zh: "Ruby" },

  // 인공지능 상세 카테고리
  머신러닝: { en: "Machine Learning", zh: "机器学习" },
  딥러닝: { en: "Deep Learning", zh: "深度学习" },
  자연어처리: { en: "Natural Language Processing", zh: "自然语言处理" },
  컴퓨터비전: { en: "Computer Vision", zh: "计算机视觉" },
  강화학습: { en: "Reinforcement Learning", zh: "强化学习" },

  // 로봇공학 상세 카테고리
  "산업용 로봇": { en: "Industrial Robots", zh: "工业机器人" },
  "서비스 로봇": { en: "Service Robots", zh: "服务机器人" },
  드론: { en: "Drones", zh: "无人机" },
  자율주행: { en: "Autonomous Driving", zh: "自动驾驶" },
  "로봇 윤리": { en: "Robot Ethics", zh: "机器人伦理" },

  // 웹개발 상세 카테고리
  프론트엔드: { en: "Frontend", zh: "前端" },
  백엔드: { en: "Backend", zh: "后端" },
  풀스택: { en: "Full Stack", zh: "全栈" },
  웹디자인: { en: "Web Design", zh: "网页设计" },
  웹보안: { en: "Web Security", zh: "网络安全" },

  // 모바일앱 상세 카테고리
  "iOS 개발": { en: "iOS Development", zh: "iOS开发" },
  "안드로이드 개발": { en: "Android Development", zh: "安卓开发" },
  크로스플랫폼: { en: "Cross-platform", zh: "跨平台" },
  "앱 디자인": { en: "App Design", zh: "应用设计" },
  "앱 마케팅": { en: "App Marketing", zh: "应用营销" },

  // 고대사 상세 카테고리
  이집트: { en: "Egypt", zh: "埃及" },
  그리스: { en: "Greece", zh: "希腊" },
  로마: { en: "Rome", zh: "罗马" },
  중국: { en: "China", zh: "中国" },
  메소포타미아: { en: "Mesopotamia", zh: "美索不达米亚" },

  // 중세사 상세 카테고리
  "유럽 중세": { en: "Medieval Europe", zh: "中世纪欧洲" },
  비잔틴: { en: "Byzantine", zh: "拜占庭" },
  "이슬람 세계": { en: "Islamic World", zh: "伊斯兰世界" },
  동아시아: { en: "East Asia", zh: "东亚" },
  바이킹: { en: "Vikings", zh: "维京人" },

  // 근대사 상세 카테고리
  르네상스: { en: "Renaissance", zh: "文艺复兴" },
  산업혁명: { en: "Industrial Revolution", zh: "工业革命" },
  계몽주의: { en: "Enlightenment", zh: "启蒙运动" },
  제국주의: { en: "Imperialism", zh: "帝国主义" },
  민족주의: { en: "Nationalism", zh: "民族主义" },

  // 현대사 상세 카테고리
  세계대전: { en: "World Wars", zh: "世界大战" },
  냉전: { en: "Cold War", zh: "冷战" },
  탈식민지화: { en: "Decolonization", zh: "去殖民化" },
  "정보화 시대": { en: "Information Age", zh: "信息时代" },
  세계화: { en: "Globalization", zh: "全球化" },

  // 문화사 상세 카테고리
  예술사: { en: "Art History", zh: "艺术史" },
  과학사: { en: "History of Science", zh: "科学史" },
  종교사: { en: "Religious History", zh: "宗教史" },
  일상생활사: { en: "History of Everyday Life", zh: "日常生活史" },
  사상사: { en: "History of Ideas", zh: "思想史" },

  // 소설 상세 카테고리
  고전소설: { en: "Classic Novels", zh: "经典小说" },
  현대소설: { en: "Modern Novels", zh: "现代小说" },
  SF: { en: "Science Fiction", zh: "科幻小说" },
  판타지: { en: "Fantasy", zh: "奇幻小说" },
  추리소설: { en: "Mystery", zh: "推理小说" },

  // 시 상세 카테고리
  서정시: { en: "Lyric Poetry", zh: "抒情诗" },
  서사시: { en: "Epic Poetry", zh: "史诗" },
  현대시: { en: "Modern Poetry", zh: "现代诗" },
  자유시: { en: "Free Verse", zh: "自由诗" },
  실험시: { en: "Experimental Poetry", zh: "实验诗" },

  // 희곡 상세 카테고리
  비극: { en: "Tragedy", zh: "悲剧" },
  희극: { en: "Comedy", zh: "喜剧" },
  현대극: { en: "Modern Drama", zh: "现代戏剧" },
  음악극: { en: "Musical Drama", zh: "音乐剧" },
  실험극: { en: "Experimental Drama", zh: "实验戏剧" },

  // 에세이 상세 카테고리
  "개인적 에세이": { en: "Personal Essays", zh: "个人随笔" },
  "비평적 에세이": { en: "Critical Essays", zh: "批评随笔" },
  "여행 에세이": { en: "Travel Essays", zh: "旅行随笔" },
  "문화 에세이": { en: "Cultural Essays", zh: "文化随笔" },
  "철학적 에세이": { en: "Philosophical Essays", zh: "哲学随笔" },

  // 비평 상세 카테고리
  문학비평: { en: "Literary Criticism", zh: "文学批评" },
  영화비평: { en: "Film Criticism", zh: "电影批评" },
  예술비평: { en: "Art Criticism", zh: "艺术批评" },
  문화비평: { en: "Cultural Criticism", zh: "文化批评" },
  사회비평: { en: "Social Criticism", zh: "社会批评" },

  // 마케팅 상세 카테고리
  "디지털 마케팅": { en: "Digital Marketing", zh: "数字营销" },
  "브랜드 마케팅": { en: "Brand Marketing", zh: "品牌营销" },
  "콘텐츠 마케팅": { en: "Content Marketing", zh: "内容营销" },
  "소셜미디어 마케팅": { en: "Social Media Marketing", zh: "社交媒体营销" },
  "마케팅 전략": { en: "Marketing Strategy", zh: "营销策略" },

  // 재무 상세 카테고리
  투자: { en: "Investment", zh: "投资" },
  금융시장: { en: "Financial Markets", zh: "金融市场" },
  회계: { en: "Accounting", zh: "会计" },
  세무: { en: "Taxation", zh: "税务" },
  재무관리: { en: "Financial Management", zh: "财务管理" },

  // 창업 상세 카테고리
  스타트업: { en: "Startup", zh: "创业公司" },
  "비즈니스 모델": { en: "Business Model", zh: "商业模式" },
  "투자 유치": { en: "Fundraising", zh: "融资" },
  "창업 전략": { en: "Entrepreneurial Strategy", zh: "创业策略" },
  "성장 전략": { en: "Growth Strategy", zh: "增长策略" },

  // 경영 상세 카테고리
  리더십: { en: "Leadership", zh: "领导力" },
  조직관리: { en: "Organizational Management", zh: "组织管理" },
  전략경영: { en: "Strategic Management", zh: "战略管理" },
  인사관리: { en: "Human Resource Management", zh: "人力资源管理" },
  운영관리: { en: "Operations Management", zh: "运营管理" },

  // 경제학 상세 카테고리
  미시경제학: { en: "Microeconomics", zh: "微观经济学" },
  거시경제학: { en: "Macroeconomics", zh: "宏观经济学" },
  국제경제학: { en: "International Economics", zh: "国际经济学" },
  행동경제학: { en: "Behavioral Economics", zh: "行为经济学" },
  개발경제학: { en: "Development Economics", zh: "发展经济学" },

  // 유럽 상세 카테고리
  서유럽: { en: "Western Europe", zh: "西欧" },
  동유럽: { en: "Eastern Europe", zh: "东欧" },
  북유럽: { en: "Northern Europe", zh: "北欧" },
  남유럽: { en: "Southern Europe", zh: "南欧" },
  중부유럽: { en: "Central Europe", zh: "中欧" },

  // 아시아 상세 카테고리
  동아시아: { en: "East Asia", zh: "东亚" },
  동남아시아: { en: "Southeast Asia", zh: "东南亚" },
  남아시아: { en: "South Asia", zh: "南亚" },
  중앙아시아: { en: "Central Asia", zh: "中亚" },
  서아시아: { en: "West Asia", zh: "西亚" },

  // 북미 상세 카테고리
  "미국 동부": { en: "Eastern US", zh: "美国东部" },
  "미국 서부": { en: "Western US", zh: "美国西部" },
  캐나다: { en: "Canada", zh: "加拿大" },
  멕시코: { en: "Mexico", zh: "墨西哥" },
  카리브해: { en: "Caribbean", zh: "加勒比海" },

  // 남미 상세 카테고리
  브라질: { en: "Brazil", zh: "巴西" },
  아르헨티나: { en: "Argentina", zh: "阿根廷" },
  페루: { en: "Peru", zh: "秘鲁" },
  칠레: { en: "Chile", zh: "智利" },
  콜롬비아: { en: "Colombia", zh: "哥伦比亚" },

  // 아프리카 상세 카테고리
  북아프리카: { en: "North Africa", zh: "北非" },
  서아프리카: { en: "West Africa", zh: "西非" },
  동아프리카: { en: "East Africa", zh: "东非" },
  남아프리카: { en: "South Africa", zh: "南非" },
  중앙아프리카: { en: "Central Africa", zh: "中非" },
}

import i18n from "./i18n"

// 현재 언어에 맞는 카테고리 이름 가져오기
export function getLocalizedCategoryName(koreanName: string, language?: string) {
  const currentLang = language || (typeof i18n !== "undefined" ? i18n.language : "ko")
  if (currentLang === "ko") return koreanName

  const translation = categoryTranslations[koreanName]
  if (!translation) {
    // 번역이 없는 경우 원본 반환 전에 콘솔에 로그 남기기
    console.log(`Missing translation for: ${koreanName} in ${currentLang}`)
    return koreanName
  }

  return translation[currentLang as keyof typeof translation] || koreanName
}
