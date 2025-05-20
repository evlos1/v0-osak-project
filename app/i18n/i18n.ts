// app/i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// 모든 번역 리소스를 한 곳에서 관리합니다.
// categoryTranslations 데이터가 이 resources 객체 안에 통합됩니다.
const resources = {
  en: {
    translation: {
      // --- Common ---
      app_name: "English Learning Master",
      settings: "Settings",
      back: "Back",
      save: "Save",
      cancel: "Cancel",
      complete: "Complete",
      next: "Next",
      retry: "Retry",
      error: "Error",
      loading: "Loading...",
      navigating: "Navigating...",
      please_wait: "Please wait",
      api_key_required: "API Key Required",
      api_key_description: "A Google API key is required to generate learning content.",
      api_key: "API Key",
      enter_api_key: "Enter your API key",
      saving: "Saving...",
      error_occurred: "An error occurred",
      try_again: "Try Again",
      content_loaded_successfully: "Content loaded successfully",
      settings_saved: "Settings Saved",
      api_key_saved: "API key has been saved",
      save_error: "Error occurred while saving",
      go_to_settings: "Go to Settings",
      api_key_required_redirect_settings: "API key is required. Redirecting to settings page.",
      api_key_cannot_be_empty: "API Key cannot be empty.",
      error_loading_api_key: "Error loading API key.",
      error_saving_api_key: "Error saving API key.",
      error_saving_api_key_generic: "An error occurred while saving API key.",
      settings_saved_redirecting: "Settings saved! Redirecting...",
      test_mode: "Test Mode",
      test_mode_on: "Test Mode On",
      test_mode_off: "Test Mode Off",
      test_mode_description: "When test mode is on, a dummy API key is used, and no actual API calls are made.",

      // --- Home page ---
      home_title: "Personalized English Learning",
      home_description: "Providing the optimal learning experience tailored to your interests and English proficiency.",
      start_learning: "Start Learning",
      topic_selection: "Topic Selection",
      level_assessment: "Level Assessment",
      step_learning: "Step-by-Step Learning",
      footer_copyright: "© 2024 English Learning Master. All rights reserved.",

      // --- Topic selection ---
      select_topic: "Select a topic you're interested in",
      select_subcategory: "Select a subcategory of",
      select_detail: "Select a specific topic of",
      step: "Step",
      start_assessment: "Start Level Assessment",
      select_subcategory_of: "Select a subcategory of {{category}}",
      select_detail_of: "Select a specific topic of {{category}}",

      // --- Level assessment ---
      level_assessment_title: "English Level Assessment",
      level_assessment_guide:
        "Click on words you don't know in the text below. After selecting all unknown words, click the 'Submit' button.",
      selected_words: "Selected words",
      submit: "Submit",
      evaluating: "Evaluating level...",
      analyzing_results: "Analyzing results.",
      moving_higher: "Moving to a higher level",
      moving_lower: "Moving to a lower level",
      unknown_words_less: "Unknown words are less than 3%, evaluating a higher level.",
      unknown_words_more: "Unknown words are more than 5%, evaluating a lower level.",
      topic: "Topic",
      unknown_words_percentage: "Unknown words percentage",
      unknown_words: "unknown words",
      appropriate: "Appropriate",
      level_assessment_history: "Level Assessment History",

      // --- Level complete ---
      level_complete: "Learning Module Complete!",
      congratulations: "Congratulations!",
      completed_topic: "You have successfully completed the",
      level: "level",
      successfully_completed: "learning for the topic.",
      learning_stats: "Learning Statistics",
      learned_words: "Words Learned",
      learned_sentences: "Sentences Learned",
      learned_passages: "Passages Learned",
      select_next: "Select your next step:",
      continue_to_level: "Continue to level",
      select_new_topic: "Select a new topic",

      // --- Learning page ---
      learning_page_title: "Learning Content",
      loading_learning_content: "Loading learning content...",
      learning_for_topic_level: "Topic:",
      learning_content_placeholder: "Your learning content will appear here.",
      this_is_where_you_learn: "This page will guide you through word, sentence, and passage learning based on your selected topic and level.",
      go_home: "Go to Home",
      content_not_available: "Content not available.",
      content_not_available_description: "Failed to generate learning content or content format is invalid.",

      words_learning: "Word Learning",
      sentences_learning: "Sentence Learning",
      passage_learning: "Passage Learning",
      word_guide:
        "Click on words you don't know in the text below. You can check the meaning and example of the selected words.",
      selected_words: "Selected Words:",
      loading_meaning: "Loading word meaning...",
      meaning_error: "Failed to get word meaning.",
      ai_definition: "AI-provided definition",
      dict_definition: "Dictionary definition",
      generate_quiz: "Generate Quiz with Selected Words",
      generating_quiz: "Generating quiz...",
      word_quiz: "Word Quiz",
      wrong_problems: "Retry Wrong Problems",
      wrong_problems_display: "(Only showing {count} wrong problems)",
      fill_in_blank: "Fill in the Blank",
      word_meaning: "Word Meaning",
      check_answer: "Check Answer",
      correct_answer: "Correct!",
      wrong_answer: "Incorrect. Please try again.",
      retry_wrong: "Retry Wrong Problems",
      word_learning_complete: "Word Learning Complete!",
      word_learning_success: "You have successfully completed word learning.",

      // Sentence learning
      sentence_guide:
        "Click on sentences that are difficult to understand. You can check the structure and interpretation of the selected sentences. Click the speaker icon to listen to the pronunciation.",
      selected_sentences: "Selected Sentences:",
      analyzing_sentence: "Analyzing sentence...",
      sentence_analysis_error: "Failed to get sentence analysis.",
      sentence_structure: "Sentence Structure:",
      interpretation: "Interpretation:",
      generate_sentence_quiz: "Generate Quiz with Selected Sentences",
      sentence_quiz: "Sentence Quiz",
      related_sentence: "Related Sentence:",
      sentence_structure_quiz: "Sentence Structure",
      sentence_comprehension: "Sentence Comprehension",
      sentence_learning_complete: "Sentence Learning Complete!",
      sentence_learning_success: "You have successfully completed sentence learning.",

      // Passage learning
      passage: "Passage:",
      read_passage: "Read Passage",
      stop_reading: "Stop Reading",
      difficult_to_understand: "Difficult to Understand",
      hide_explanation: "Hide Explanation",
      complete_and_start_quiz: "Complete Learning and Start Quiz",
      theme: "Theme:",
      structural_pattern: "Structural Pattern:",
      korean_translation: "Translation:",
      passage_quiz: "Passage Comprehension Quiz",
      passage_learning_complete: "Passage Learning Complete!",
      passage_learning_success: "You have successfully completed passage learning.",

      // --- Contextual/Category Translations (from category-translations.ts) ---
      // Primary Categories
      "과학": "Science",
      "예술": "Arts",
      "스포츠": "Sports",
      "기술": "Technology",
      "역사": "History",
      "문학": "Literature",
      "비즈니스": "Business",
      "여행": "Travel",
      "일반": "General", // Default topic

      // Science Subcategories
      "물리학": "Physics",
      "화학": "Chemistry",
      "생물학": "Biology",
      "천문학": "Astronomy",
      "지구과학": "Earth Science",

      // Arts Subcategories
      "음악": "Music",
      "미술": "Fine Arts",
      "영화": "Film",
      "연극": "Theater",
      "사진": "Photography",
      "조각": "Sculpture",

      // Sports Subcategories
      "축구": "Soccer",
      "농구": "Basketball",
      "야구": "Baseball",
      "테니스": "Tennis",
      "수영": "Swimming",

      // Technology Subcategories
      "프로그래밍": "Programming",
      "인공지능": "Artificial Intelligence",
      "로봇공학": "Robotics",
      "웹개발": "Web Development",
      "모바일앱": "Mobile Apps",

      // History Subcategories
      "고대사": "Ancient History",
      "중세사": "Medieval History",
      "근대사": "Modern History",
      "현대사": "Contemporary History",
      "문화사": "Cultural History",

      // Literature Subcategories
      "소설": "Fiction",
      "시": "Poetry",
      "희곡": "Drama",
      "에세이": "Essays",
      "비평": "Criticism",

      // Business Subcategories
      "마케팅": "Marketing",
      "재무": "Finance",
      "창업": "Entrepreneurship",
      "경영": "Management",
      "경제학": "Economics",

      // Travel Subcategories
      "유럽": "Europe",
      "아시아": "Asia",
      "북미": "North America",
      "남미": "South America",
      "아프리카": "Africa",

      // Physics Detail Categories
      "역학": "Mechanics",
      "양자역학": "Quantum Mechanics",
      "상대성이론": "Theory of Relativity",
      "열역학": "Thermodynamics",
      "전자기학": "Electromagnetism",

      // Chemistry Detail Categories
      "유기화학": "Organic Chemistry",
      "무기화학": "Inorganic Chemistry",
      "분석화학": "Analytical Chemistry",
      "생화학": "Biochemistry",
      "물리화학": "Physical Chemistry",

      // Biology Detail Categories
      "분자생물학": "Molecular Biology",
      "유전학": "Genetics",
      "생태학": "Ecology",
      "진화론": "Evolution Theory",
      "세포생물학": "Cell Biology",

      // Astronomy Detail Categories
      "태양계": "Solar System",
      "별과은하": "Stars and Galaxies",
      "우주론": "Cosmology",
      "천체물리학": "Astrophysics",
      "행성과학": "Planetary Science",

      // Earth Science Detail Categories
      "지질학": "Geology",
      "대기과학": "Atmospheric Science",
      "해양학": "Oceanography",
      "환경과학": "Environmental Science",
      "기후학": "Climatology",

      // Music Detail Categories
      "클래식": "Classical Music",
      "재즈": "Jazz",
      "팝": "Pop Music",
      "록": "Rock Music",
      "힙합": "Hip Hop",

      // Fine Arts Detail Categories
      "회화": "Painting",
      "현대미술": "Contemporary Art",
      "디자인": "Design",
      "건축": "Architecture",
      // "조각" is duplicated as primary and sub, handled by single key

      // Film Detail Categories
      "액션": "Action",
      "드라마": "Drama",
      "코미디": "Comedy",
      "공포": "Horror",
      "다큐멘터리": "Documentary",

      // Theater Detail Categories
      "뮤지컬": "Musical",
      "셰익스피어": "Shakespeare",
      "현대극": "Modern Drama",
      "즉흥극": "Improvisation",
      "아방가르드": "Avant-garde",

      // Photography Detail Categories
      "풍경사진": "Landscape Photography",
      "인물사진": "Portrait Photography",
      "다큐멘터리사진": "Documentary Photography",
      "예술사진": "Art Photography",
      "상업사진": "Commercial Photography",

      // Soccer Detail Categories
      "프리미어리그": "Premier League",
      "라리가": "La Liga",
      "분데스리가": "Bundesliga",
      "세리에A": "Serie A",
      "K리그": "K League",

      // Basketball Detail Categories
      "NBA": "NBA",
      "WNBA": "WNBA",
      "유로리그": "EuroLeague",
      "KBL": "KBL",
      "대학농구": "College Basketball",

      // Baseball Detail Categories
      "메이저리그": "Major League Baseball",
      "일본프로야구": "Nippon Professional Baseball",
      "KBO": "KBO League",
      "대학야구": "College Baseball",
      "야구 기술": "Baseball Techniques",

      // Tennis Detail Categories
      "그랜드슬램": "Grand Slam",
      "ATP투어": "ATP Tour",
      "WTA투어": "WTA Tour",
      "데이비스컵": "Davis Cup",
      "테니스 기술": "Tennis Techniques",

      // Swimming Detail Categories
      "자유형": "Freestyle",
      "배영": "Backstroke",
      "평영": "Breaststroke",
      "접영": "Butterfly",
      "개인혼영": "Individual Medley",

      // Programming Detail Categories
      "자바스크립트": "JavaScript",
      "파이썬": "Python",
      "자바": "Java",
      "C++": "C++",
      "루비": "Ruby",

      // AI Detail Categories
      "머신러닝": "Machine Learning",
      "딥러닝": "Deep Learning",
      "자연어처리": "Natural Language Processing",
      "컴퓨터비전": "Computer Vision",
      "강화학습": "Reinforcement Learning",

      // Robotics Detail Categories
      "산업용 로봇": "Industrial Robots",
      "서비스 로봇": "Service Robots",
      "드론": "Drones",
      "자율주행": "Autonomous Driving",
      "로봇 윤리": "Robot Ethics",

      // Web Development Detail Categories
      "프론트엔드": "Frontend",
      "백엔드": "Backend",
      "풀스택": "Full Stack",
      "웹디자인": "Web Design",
      "웹보안": "Web Security",

      // Mobile Apps Detail Categories
      "iOS 개발": "iOS Development",
      "안드로이드 개발": "Android Development",
      "크로스플랫폼": "Cross-platform",
      "앱 디자인": "App Design",
      "앱 마케팅": "App Marketing",

      // Ancient History Detail Categories
      "이집트": "Egypt",
      "그리스": "Greece",
      "로마": "Rome",
      "중국": "China",
      "메소포타미아": "Mesopotamia",

      // Medieval History Detail Categories
      "유럽 중세": "Medieval Europe",
      "비잔틴": "Byzantine",
      "이슬람 세계": "Islamic World",
      "동아시아": "East Asia",
      "바이킹": "Vikings",

      // Modern History Detail Categories
      "르네상스": "Renaissance",
      "산업혁명": "Industrial Revolution",
      "계몽주의": "Enlightenment",
      "제국주의": "Imperialism",
      "민족주의": "Nationalism",

      // Contemporary History Detail Categories
      "세계대전": "World Wars",
      "냉전": "Cold War",
      "탈식민지화": "Decolonization",
      "정보화 시대": "Information Age",
      "세계화": "Globalization",

      // Cultural History Detail Categories
      "예술사": "Art History",
      "과학사": "History of Science",
      "종교사": "Religious History",
      "일상생활사": "History of Everyday Life",
      "사상사": "History of Ideas",

      // Fiction Detail Categories
      "고전소설": "Classic Novels",
      "현대소설": "Modern Novels",
      "SF": "Science Fiction",
      "판타지": "Fantasy",
      "추리소설": "Mystery",

      // Poetry Detail Categories
      "서정시": "Lyric Poetry",
      "서사시": "Epic Poetry",
      "현대시": "Modern Poetry",
      "자유시": "Free Verse",
      "실험시": "Experimental Poetry",

      // Drama Detail Categories
      "비극": "Tragedy",
      "희극": "Comedy",
      // "현대극" is duplicated, handled by single key
      "음악극": "Musical Drama",
      "실험극": "Experimental Drama",

      // Essays Detail Categories
      "개인적 에세이": "Personal Essays",
      "비평적 에세이": "Critical Essays",
      "여행 에세이": "Travel Essays",
      "문화 에세이": "Cultural Essays",
      "철학적 에세이": "Philosophical Essays",

      // Criticism Detail Categories
      "문학비평": "Literary Criticism",
      "영화비평": "Film Criticism",
      "예술비평": "Art Criticism",
      "문화비평": "Cultural Criticism",
      "사회비평": "Social Criticism",

      // Marketing Detail Categories
      "디지털 마케팅": "Digital Marketing",
      "브랜드 마케팅": "Brand Marketing",
      "콘텐츠 마케팅": "Content Marketing",
      "소셜미디어 마케팅": "Social Media Marketing",
      "마케팅 전략": "Marketing Strategy",

      // Finance Detail Categories
      "투자": "Investment",
      "금융시장": "Financial Markets",
      "회계": "Accounting",
      "세무": "Taxation",
      "재무관리": "Financial Management",

      // Entrepreneurship Detail Categories
      "스타트업": "Startup",
      "비즈니스 모델": "Business Model",
      "투자 유치": "Fundraising",
      "창업 전략": "Entrepreneurial Strategy",
      "성장 전략": "Growth Strategy",

      // Management Detail Categories
      "리더십": "Leadership",
      "조직관리": "Organizational Management",
      "전략경영": "Strategic Management",
      "인사관리": "Human Resource Management",
      "운영관리": "Operations Management",

      // Economics Detail Categories
      "미시경제학": "Microeconomics",
      "거시경제학": "Macroeconomics",
      "국제경제학": "International Economics",
      "행동경제학": "Behavioral Economics",
      "개발경제학": "Development Economics",

      // Europe Detail Categories
      "서유럽": "Western Europe",
      "동유럽": "Eastern Europe",
      "북유럽": "Northern Europe",
      "남유럽": "Southern Europe",
      "중부유럽": "Central Europe",

      // Asia Detail Categories
      "동아시아": "East Asia",
      "동남아시아": "Southeast Asia",
      "남아시아": "South Asia",
      "중앙아시아": "Central Asia",
      "서아시아": "West Asia",

      // North America Detail Categories
      "미국 동부": "Eastern US",
      "미국 서부": "Western US",
      "캐나다": "Canada",
      "멕시코": "Mexico",
      "카리브해": "Caribbean",

      // South America Detail Categories
      "브라질": "Brazil",
      "아르헨티나": "Argentina",
      "페루": "Peru",
      "칠레": "Chile",
      "콜롬비아": "Colombia",

      // Africa Detail Categories
      "북아프리카": "North Africa",
      "서아프리카": "West Africa",
      "동아프리카": "East Africa",
      "남아프리카": "South Africa",
      "중앙아프리카": "Central Africa",

      // Word Meaning & Review Mode (already included)
      "meanings": "Meanings",
      "meaning_relations": "Meaning Relations",
      "meaning_relations_explanation": "Check the relationships between different meanings of the word.",
      "view_meaning_relation": "View meaning relation",
      "no_meaning_relations": "No meaning relation information available for this word.",
      "single_meaning_word": "This word has only one meaning.",
      "meaning": "Meaning",
      "review_mode": "Review Mode",
      "review_instructions": "Review the questions you got wrong",
      "review_instructions_detail": "After reviewing the questions you got wrong, click the 'Review Completed' button to retry them.",
      "review_completed": "Review Completed",
      "review_completed_button": "Review Completed",
      "retry_wrong_questions": "Retry Wrong Questions",
      "complete_review": "Complete Review",
      "review_needed": "Review Needed",
      "continue_to_next": "Continue to Next",

      // Etymology (already included)
      "etymology": "Etymology",
      "etymology_explanation": "Check the origin and historical development of the word.",
      "no_etymology": "No etymology information available for this word.",
      "etymology_timeline": "Etymology Timeline",
      "etymology_timeline_explanation": "Check the historical development of the word in chronological order.",
      "no_etymology_timeline": "No etymology timeline information available for this word.",
      "unknown_period": "Unknown Period",
      "word_evolution": "Word Evolution",
      "historical_development": "Historical Development",
      "korean_meaning": "Korean Meaning",
    },
  },
  ko: {
    translation: {
      // --- Common ---
      app_name: "영어 학습 마스터",
      settings: "설정",
      back: "뒤로",
      save: "저장",
      cancel: "취소",
      complete: "완료",
      next: "다음",
      retry: "다시 시도",
      error: "오류",
      loading: "로딩 중...",
      navigating: "이동 중...",
      please_wait: "잠시만 기다려주세요",
      api_key_required: "API 키가 필요합니다",
      api_key_description: "학습 콘텐츠를 생성하려면 Google API 키가 필요합니다.",
      api_key: "API 키",
      enter_api_key: "API 키를 입력하세요",
      saving: "저장 중...",
      // save: "저장", // 중복 제거 (common 아래에 있는 save 사용)
      error_occurred: "오류가 발생했습니다",
      try_again: "다시 시도",
      content_loaded_successfully: "콘텐츠가 성공적으로 로드되었습니다",
      settings_saved: "설정이 저장되었습니다",
      api_key_saved: "API 키가 저장되었습니다",
      save_error: "저장 중 오류가 발생했습니다",
      // error: "오류", // 중복 제거 (common 아래에 있는 error 사용)
      go_to_settings: "설정으로 이동",
      api_key_required_redirect_settings: "API 키가 필요합니다. 설정 페이지로 이동합니다.",
      api_key_cannot_be_empty: "API 키는 비워둘 수 없습니다.",
      error_loading_api_key: "API 키 로드 중 오류가 발생했습니다.",
      error_saving_api_key: "API 키 저장 중 오류가 발생했습니다.",
      error_saving_api_key_generic: "API 키 저장 중 일반적인 오류가 발생했습니다.",
      settings_saved_redirecting: "설정이 저장되었습니다! 이동 중...",
      test_mode: "테스트 모드",
      test_mode_on: "테스트 모드 켜짐",
      test_mode_off: "테스트 모드 꺼짐",
      test_mode_description: "테스트 모드가 켜지면 더미 API 키가 사용되며, 실제 API 호출은 이루어지지 않습니다.",

      // --- Home page ---
      home_title: "개인 맞춤형 영어 학습",
      home_description: "당신의 관심사와 영어 실력에 맞춘 최적의 학습 경험을 제공합니다.",
      start_learning: "학습 시작하기",
      topic_selection: "관심 주제 선택",
      level_assessment: "레벨 평가",
      step_learning: "단계별 학습",
      footer_copyright: "© 2024 영어 학습 마스터. 모든 권리 보유.",

      // --- Topic selection ---
      select_topic: "관심 있는 주제를 선택하세요",
      select_subcategory: "의 세부 분야를 선택하세요",
      select_detail: "의 구체적인 주제를 선택하세요",
      step: "단계",
      start_assessment: "레벨 평가 시작",
      select_subcategory_of: "{{category}} 의 세부 분야를 선택하세요",
      select_detail_of: "{{category}} 의 구체적인 주제를 선택하세요",

      // --- Level assessment ---
      level_assessment_title: "영어 레벨 평가",
      level_assessment_guide:
        "아래 텍스트에서 모르는 단어를 클릭하세요. 모르는 단어를 모두 선택한 후 '제출' 버튼을 클릭하세요.",
      selected_words: "선택한 단어",
      submit: "제출",
      evaluating: "레벨 평가 중...",
      analyzing_results: "결과를 분석하고 있습니다.",
      moving_higher: "더 높은 레벨로 이동합니다",
      moving_lower: "더 낮은 레벨로 이동합니다",
      unknown_words_less: "모르는 단어가 3% 미만으로 더 높은 레벨을 평가합니다.",
      unknown_words_more: "모르는 단어가 5% 초과로 더 낮은 레벨을 평가합니다.",
      topic: "주제",
      unknown_words_percentage: "모르는 단어 비율",
      unknown_words: "모르는 단어",
      appropriate: "적합",
      level_assessment_history: "레벨 평가 기록",

      // --- Level complete ---
      level_complete: "학습 모듈 완료!",
      congratulations: "축하합니다!",
      completed_topic: "주제의",
      level: "레벨",
      successfully_completed: "학습을 성공적으로 완료했습니다.",
      learning_stats: "학습 통계",
      learned_words: "학습한 단어",
      learned_sentences: "학습한 문장",
      learned_passages: "학습한 지문",
      select_next: "다음 단계를 선택하세요:",
      continue_to_level: "레벨로 계속하기",
      select_new_topic: "새로운 주제 선택하기",

      // --- Learning page ---
      learning_page_title: "학습 콘텐츠",
      loading_learning_content: "학습 콘텐츠 로딩 중...",
      learning_for_topic_level: "주제:",
      learning_content_placeholder: "여기에 학습 내용이 표시됩니다.",
      this_is_where_you_learn: "이 페이지에서 선택한 주제와 레벨에 맞는 단어, 문장, 지문 학습이 진행됩니다.",
      go_home: "홈으로 돌아가기",
      content_not_available: "콘텐츠를 불러올 수 없습니다.",
      content_not_available_description: "학습 콘텐츠를 생성하지 못했거나 형식이 올바르지 않습니다.",

      words_learning: "단어 학습",
      sentences_learning: "문장 학습",
      passage_learning: "지문 학습",
      word_guide: "아래 텍스트에서 모르는 단어를 클릭하세요. 선택한 단어의 의미와 예문을 확인할 수 있습니다.",
      selected_words: "선택한 단어:",
      loading_meaning: "단어 의미를 가져오는 중...",
      meaning_error: "단어 의미를 가져오지 못했습니다.",
      ai_definition: "AI 제공 정의",
      dict_definition: "사전 제공 정의",
      generate_quiz: "선택한 단어로 퀴즈 생성",
      generating_quiz: "퀴즈 생성 중...",
      word_quiz: "단어 퀴즈",
      wrong_problems: "틀린 문제 다시 풀기",
      wrong_problems_display: "(틀린 {count}문제만 표시됩니다)",
      fill_in_blank: "빈칸 채우기",
      word_meaning: "단어 의미",
      check_answer: "정답 확인",
      correct_answer: "정답입니다!",
      wrong_answer: "오답입니다. 다시 시도해보세요.",
      retry_wrong: "틀린 문제 다시 풀기",
      word_learning_complete: "단어 학습 완료!",
      word_learning_success: "단어 학습을 성공적으로 마쳤습니다.",

      // Sentence learning
      sentence_guide:
        "아래 문장 중 이해하기 어려운 문장을 클릭하세요. 선택한 문장의 구조와 해석을 확인할 수 있습니다. 스피커 아이콘을 클릭하면 문장 발음을 들을 수 있습니다.",
      selected_sentences: "선택한 문장:",
      analyzing_sentence: "문장을 분석하는 중...",
      sentence_analysis_error: "문장 분석을 가져오지 못했습니다.",
      sentence_structure: "문장 구조:",
      interpretation: "해석:",
      generate_sentence_quiz: "선택한 문장으로 퀴즈 생성",
      sentence_quiz: "문장 퀴즈",
      related_sentence: "관련 문장:",
      sentence_structure_quiz: "문장 구조",
      sentence_comprehension: "문장 이해",
      sentence_learning_complete: "문장 학습 완료!",
      sentence_learning_success: "문장 학습을 성공적으로 마쳤습니다.",

      // Passage learning
      passage: "지문:",
      read_passage: "지문 읽기",
      stop_reading: "읽기 중지",
      difficult_to_understand: "지문 이해가 어려워요",
      hide_explanation: "설명 숨기기",
      complete_and_start_quiz: "학습 완료 및 퀴즈 시작",
      theme: "주제:",
      structural_pattern: "구조적 패턴:",
      korean_translation: "한글 해석:",
      passage_quiz: "지문 이해 퀴즈",
      passage_learning_complete: "지문 학습 완료!",
      passage_learning_success: "지문 학습을 성공적으로 마쳤습니다.",

      // --- Contextual/Category Translations (from category-translations.ts) ---
      // Primary Categories
      "과학": "과학",
      "예술": "예술",
      "스포츠": "스포츠",
      "기술": "기술",
      "역사": "역사",
      "문학": "문학",
      "비즈니스": "비즈니스",
      "여행": "여행",
      "일반": "일반",

      // Science Subcategories
      "물리학": "물리학",
      "화학": "화학",
      "생물학": "생물학",
      "천문학": "천문학",
      "지구과학": "지구과학",

      // Arts Subcategories
      "음악": "음악",
      "미술": "미술",
      "영화": "영화",
      "연극": "연극",
      "사진": "사진",
      "조각": "조각",

      // Sports Subcategories
      "축구": "축구",
      "농구": "농구",
      "야구": "야구",
      "테니스": "테니스",
      "수영": "수영",

      // Technology Subcategories
      "프로그래밍": "프로그래밍",
      "인공지능": "인공지능",
      "로봇공학": "로봇공학",
      "웹개발": "웹개발",
      "모바일앱": "모바일앱",

      // History Subcategories
      "고대사": "고대사",
      "중세사": "중세사",
      "근대사": "근대사",
      "현대사": "현대사",
      "문화사": "문화사",

      // Literature Subcategories
      "소설": "소설",
      "시": "시",
      "희곡": "희곡",
      "에세이": "에세이",
      "비평": "비평",

      // Business Subcategories
      "마케팅": "마케팅",
      "재무": "재무",
      "창업": "창업",
      "경영": "경영",
      "경제학": "경제학",

      // Travel Subcategories
      "유럽": "유럽",
      "아시아": "아시아",
      "북미": "북미",
      "남미": "남미",
      "아프리카": "아프리카",

      // Physics Detail Categories
      "역학": "역학",
      "양자역학": "양자역학",
      "상대성이론": "상대성이론",
      "열역학": "열역학",
      "전자기학": "전자기학",

      // Chemistry Detail Categories
      "유기화학": "유기화학",
      "무기화학": "무기화학",
      "분석화학": "분석화학",
      "생화학": "생화학",
      "물리화학": "물리화학",

      // Biology Detail Categories
      "분자생물학": "분자생물학",
      "유전학": "유전학",
      "생태학": "생태학",
      "진화론": "진화론",
      "세포생물학": "세포생물학",

      // Astronomy Detail Categories
      "태양계": "태양계",
      "별과은하": "별과은하",
      "우주론": "우주론",
      "천체물리학": "천체물리학",
      "행성과학": "행성과학",

      // Earth Science Detail Categories
      "지질학": "지질학",
      "대기과학": "대기과학",
      "해양학": "해양학",
      "환경과학": "환경과학",
      "기후학": "기후학",

      // Music Detail Categories
      "클래식": "클래식",
      "재즈": "재즈",
      "팝": "팝",
      "록": "록",
      "힙합": "힙합",

      // Fine Arts Detail Categories
      "회화": "회화",
      // "조각" is duplicated as primary and sub, handled by single key
      "현대미술": "현대미술",
      "디자인": "디자인",
      "건축": "건축",

      // Film Detail Categories
      "액션": "액션",
      "드라마": "드라마",
      "코미디": "코미디",
      "공포": "공포",
      "다큐멘터리": "다큐멘터리",

      // Theater Detail Categories
      "뮤지컬": "뮤지컬",
      "셰익스피어": "셰익스피어",
      "현대극": "현대극",
      "즉흥극": "즉흥극",
      "아방가르드": "아방가르드",

      // Photography Detail Categories
      "풍경사진": "풍경사진",
      "인물사진": "인물사진",
      "다큐멘터리사진": "다큐멘터리사진",
      "예술사진": "예술사진",
      "상업사진": "상업사진",

      // Soccer Detail Categories
      "프리미어리그": "프리미어리그",
      "라리가": "라리가",
      "분데스리가": "분데스리가",
      "세리에A": "세리에A",
      "K리그": "K리그",

      // Basketball Detail Categories
      "NBA": "NBA",
      "WNBA": "WNBA",
      "유로리그": "유로리그",
      "KBL": "KBL",
      "대학농구": "대학농구",

      // Baseball Detail Categories
      "메이저리그": "메이저리그",
      "일본프로야구": "일본프로야구",
      "KBO": "KBO",
      "대학야구": "대학야구",
      "야구 기술": "야구 기술",

      // Tennis Detail Categories
      "그랜드슬램": "그랜드슬램",
      "ATP투어": "ATP투어",
      "WTA투어": "WTA투어",
      "데이비스컵": "데이비스컵",
      "테니스 기술": "테니스 기술",

      // Swimming Detail Categories
      "자유형": "자유형",
      "배영": "배영",
      "평영": "평영",
      "접영": "접영",
      "개인혼영": "개인혼영",

      // Programming Detail Categories
      "자바스크립트": "자바스크립트",
      "파이썬": "파이썬",
      "자바": "자바",
      "C++": "C++",
      "루비": "루비",

      // AI Detail Categories
      "머신러닝": "머신러닝",
      "딥러닝": "딥러닝",
      "자연어처리": "자연어처리",
      "컴퓨터비전": "컴퓨터비전",
      "강화학습": "강화학습",

      // Robotics Detail Categories
      "산업용 로봇": "산업용 로봇",
      "서비스 로봇": "서비스 로봇",
      "드론": "드론",
      "자율주행": "자율주행",
      "로봇 윤리": "로봇 윤리",

      // Web Development Detail Categories
      "프론트엔드": "프론트엔드",
      "백엔드": "백엔드",
      "풀스택": "풀스택",
      "웹디자인": "웹디자인",
      "웹보안": "웹보안",

      // Mobile Apps Detail Categories
      "iOS 개발": "iOS 개발",
      "안드로이드 개발": "안드로이드 개발",
      "크로스플랫폼": "크로스플랫폼",
      "앱 디자인": "앱 디자인",
      "앱 마케팅": "앱 마케팅",

      // Ancient History Detail Categories
      "이집트": "이집트",
      "그리스": "그리스",
      "로마": "로마",
      "중국": "중국",
      "메소포타미아": "메소포타미아",

      // Medieval History Detail Categories
      "유럽 중세": "유럽 중세",
      "비잔틴": "비잔틴",
      "이슬람 세계": "이슬람 세계",
      "동아시아": "동아시아",
      "바이킹": "바이킹",

      // Modern History Detail Categories
      "르네상스": "르네상스",
      "산업혁명": "산업혁명",
      "계몽주의": "계몽주의",
      "제국주의": "제국주의",
      "민족주의": "민족주의",

      // Contemporary History Detail Categories
      "세계대전": "세계대전",
      "냉전": "냉전",
      "탈식민지화": "탈식민지화",
      "정보화 시대": "정보화 시대",
      "세계화": "세계화",

      // Cultural History Detail Categories
      "예술사": "예술사",
      "과학사": "과학사",
      "종교사": "종교사",
      "일상생활사": "일상생활사",
      "사상사": "사상사",

      // Fiction Detail Categories
      "고전소설": "고전소설",
      "현대소설": "현대소설",
      "SF": "SF",
      "판타지": "판타지",
      "추리소설": "추리소설",

      // Poetry Detail Categories
      "서정시": "서정시",
      "서사시": "서사시",
      "현대시": "현대시",
      "자유시": "자유시",
      "실험시": "실험시",

      // Drama Detail Categories
      "비극": "비극",
      "희극": "희극",
      "현대극": "현대극",
      "음악극": "음악극",
      "실험극": "실험극",

      // Essays Detail Categories
      "개인적 에세이": "개인적 에세이",
      "비평적 에세이": "비평적 에세이",
      "여행 에세이": "여행 에세이",
      "문화 에세이": "문화 에세이",
      "철학적 에세이": "철학적 에세이",

      // Criticism Detail Categories
      "문학비평": "문학비평",
      "영화비평": "영화비평",
      "예술비평": "예술비평",
      "문화비평": "문화비평",
      "사회비평": "사회비평",

      // Marketing Detail Categories
      "디지털 마케팅": "디지털 마케팅",
      "브랜드 마케팅": "브랜드 마케팅",
      "콘텐츠 마케팅": "콘텐츠 마케팅",
      "소셜미디어 마케팅": "소셜미디어 마케팅",
      "마케팅 전략": "마케팅 전략",

      // Finance Detail Categories
      "투자": "투자",
      "금융시장": "금융시장",
      "회계": "회계",
      "세무": "세무",
      "재무관리": "재무관리",

      // Entrepreneurship Detail Categories
      "스타트업": "스타트업",
      "비즈니스 모델": "비즈니스 모델",
      "투자 유치": "투자 유치",
      "창업 전략": "창업 전략",
      "성장 전략": "성장 전략",

      // Management Detail Categories
      "리더십": "리더십",
      "조직관리": "조직관리",
      "전략경영": "전략경영",
      "인사관리": "인사관리",
      "운영관리": "운영관리",

      // Economics Detail Categories
      "미시경제학": "미시경제학",
      "거시경제학": "거시경제학",
      "국제경제학": "국제경제학",
      "행동경제학": "행동경제학",
      "개발경제학": "개발경제학",

      // Europe Detail Categories
      "서유럽": "서유럽",
      "동유럽": "동유럽",
      "북유럽": "북유럽",
      "남유럽": "남유럽",
      "중부유럽": "중부유럽",

      // Asia Detail Categories
      "동아시아": "동아시아",
      "동남아시아": "동남아시아",
      "남아시아": "남아시아",
      "중앙아시아": "중앙아시아",
      "서아시아": "서아시아",

      // North America Detail Categories
      "미국 동부": "미국 동부",
      "미국 서부": "미국 서부",
      "캐나다": "캐나다",
      "멕시코": "멕시코",
      "카리브해": "카리브해",

      // South America Detail Categories
      "브라질": "브라질",
      "아르헨티나": "아르헨티나",
      "페루": "페루",
      "칠레": "칠레",
      "콜롬비아": "콜롬비아",

      // Africa Detail Categories
      "북아프리카": "북아프리카",
      "서아프리카": "서아프리카",
      "동아프리카": "동아프리카",
      "남아프리카": "남아프리카",
      "중앙아프리카": "중앙아프리카",

      // Word Meaning & Review Mode (already included)
      "meanings": "의미",
      "meaning_relations": "의미 관계",
      "meaning_relations_explanation": "단어의 여러 의미들 간의 관계를 확인하세요.",
      "view_meaning_relation": "의미 관계 보기",
      "no_meaning_relations": "이 단어의 의미 관계 정보가 없습니다.",
      "single_meaning_word": "이 단어는 하나의 의미만 가지고 있습니다.",
      "meaning": "의미",
      "review_mode": "복습 모드",
      "review_instructions": "틀린 문제를 복습하세요",
      "review_instructions_detail": "틀린 문제를 복습한 후 '복습 완료' 버튼을 클릭하면 틀린 문제를 다시 풀 수 있습니다.",
      "review_completed": "복습 완료",
      "review_completed_button": "복습 완료",
      "retry_wrong_questions": "틀린 문제 다시 풀기",
      "complete_review": "복습 완료하기",
      "review_needed": "복습이 필요합니다",
      "continue_to_next": "다음으로 계속하기",

      // Etymology (already included)
      "etymology": "어원",
      "etymology_explanation": "단어의 기원과 역사적 발전 과정을 확인하세요.",
      "no_etymology": "이 단어의 어원 정보가 없습니다.",
      "etymology_timeline": "어원 타임라인",
      "etymology_timeline_explanation": "단어의 역사적 발전 과정을 시간순으로 확인하세요.",
      "no_etymology_timeline": "이 단어의 어원 타임라인 정보가 없습니다.",
      "unknown_period": "알 수 없는 시대",
      "word_evolution": "단어 변천사",
      "historical_development": "역사적 발전",
      "korean_meaning": "한국어 뜻",
    },
  },
  zh: {
    translation: {
      // --- Common ---
      app_name: "英语学习大师",
      settings: "设置",
      back: "返回",
      save: "保存",
      cancel: "取消",
      complete: "完成",
      next: "下一步",
      retry: "重试",
      error: "错误",
      loading: "加载中...",
      navigating: "导航中...",
      please_wait: "请稍等",
      api_key_required: "需要API密钥",
      api_key_description: "生成学习内容需要Google API密钥。",
      api_key: "API密钥",
      enter_api_key: "输入您的API密钥",
      saving: "保存中...",
      save: "保存",
      error_occurred: "发生错误",
      try_again: "重试",
      content_loaded_successfully: "内容加载成功",
      settings_saved: "设置已保存",
      api_key_saved: "API密钥已保存",
      save_error: "保存时发生错误",
      go_to_settings: "Go to Settings",

      // --- Home page ---
      home_title: "个性化英语学习",
      home_description: "提供根据您的兴趣和英语水平定制的最佳学习体验。",
      start_learning: "开始学习",
      topic_selection: "主题选择",
      level_assessment: "水平评估",
      step_learning: "阶段性学习",
      footer_copyright: "© 2024 英语学习大师。保留所有权利。",

      // --- Topic selection ---
      select_topic: "选择您感兴趣的主题",
      select_subcategory: "的子类别",
      select_detail: "选择的具体主题",
      step: "步骤",
      start_assessment: "开始水平评估",
      select_subcategory_of: "{{category}}的子类别",
      select_detail_of: "{{category}}的具体主题",

      // --- Level assessment ---
      level_assessment_title: "英语水平评估",
      level_assessment_guide: '点击下面文本中您不认识的单词。选择完所有不认识的单词后，点击"提交"按钮。',
      selected_words: "已选单词",
      submit: "提交",
      evaluating: "评估水平中...",
      analyzing_results: "分析结果中。",
      moving_higher: "移至更高水平",
      moving_lower: "移至更低水平",
      unknown_words_less: "未知单词少于3%，评估更高水平。",
      unknown_words_more: "未知单词超过5%，评估更低水平。",
      topic: "主题",
      unknown_words_percentage: "未知单词百分比",
      unknown_words: "未知单词",
      appropriate: "适合",
      level_assessment_history: "水平评估历史",

      // --- Level complete ---
      level_complete: "学习模块完成！",
      congratulations: "恭喜！",
      completed_topic: "您已成功完成",
      level: "级别",
      successfully_completed: "的学习。",
      learning_stats: "学习统计",
      learned_words: "已学单词",
      learned_sentences: "已学句子",
      learned_passages: "已学段落",
      select_next: "选择下一步：",
      continue_to_level: "继续学习级别",
      select_new_topic: "选择新主题",

      // --- Learning page ---
      learning_page_title: "学习内容",
      loading_learning_content: "加载学习内容中...",
      learning_for_topic_level: "主题：",
      learning_content_placeholder: "您的学习内容将显示在此处。",
      this_is_where_you_learn: "此页面将根据您选择的主题和级别指导您进行单词、句子和段落学习。",
      go_home: "返回主页",
      content_not_available: "内容不可用。",
      content_not_available_description: "未能生成学习内容或内容格式无效。",

      words_learning: "单词学习",
      sentences_learning: "句子学习",
      passage_learning: "段落学习",
      word_guide: "点击下面文本中您不认识的单词。您可以查看所选单词的含义和例句。",
      selected_words: "已选单词：",
      loading_meaning: "加载单词含义中...",
      meaning_error: "获取单词含义失败。",
      ai_definition: "AI提供的定义",
      dict_definition: "词典定义",
      generate_quiz: "用所选单词生成测验",
      generating_quiz: "生成测验中...",
      word_quiz: "单词测验",
      wrong_problems: "重做错题",
      wrong_problems_display: "(仅显示{count}个错题)",
      fill_in_blank: "填空",
      word_meaning: "单词含义",
      check_answer: "检查答案",
      correct_answer: "正确！",
      wrong_answer: "不正确。请重试。",
      retry_wrong: "重做错题",
      word_learning_complete: "单词学习完成！",
      word_learning_success: "您已成功完成单词学习。",

      // Sentence learning
      sentence_guide: "点击难以理解的句子。您可以查看所选句子的结构和解释。点击扬声器图标可以听发音。",
      selected_sentences: "已选句子：",
      analyzing_sentence: "分析句子中...",
      sentence_analysis_error: "获取句子分析失败。",
      sentence_structure: "句子结构：",
      interpretation: "解释：",
      generate_sentence_quiz: "用所选句子生成测验",
      sentence_quiz: "句子测验",
      related_sentence: "相关句子：",
      sentence_structure_quiz: "句子结构",
      sentence_comprehension: "句子理解",
      sentence_learning_complete: "句子学习完成！",
      sentence_learning_success: "您已成功完成句子学习。",

      // Passage learning
      passage: "段落：",
      read_passage: "朗读段落",
      stop_reading: "停止朗读",
      difficult_to_understand: "难以理解",
      hide_explanation: "隐藏解释",
      complete_and_start_quiz: "完成学习并开始测验",
      theme: "主题：",
      structural_pattern: "结构模式：",
      korean_translation: "翻译：",
      passage_quiz: "段落理解测验",
      passage_learning_complete: "段落学习完成！",
      passage_learning_success: "您已成功完成段落学习。",

      // --- Contextual/Category Translations (from category-translations.ts) ---
      // Primary Categories
      "科学": "科学",
      "艺术": "艺术",
      "体育": "体育",
      "技术": "技术",
      "历史": "历史",
      "文学": "文学",
      "商务": "商务",
      "旅行": "旅行",
      "一般": "一般", // Default topic

      // Science Subcategories
      "物理学": "物理学",
      "化学": "化学",
      "生物学": "生物学",
      "天文学": "天文学",
      "地球科学": "地球科学",

      // Arts Subcategories
      "音乐": "音乐",
      "美术": "美术",
      "电影": "电影",
      "戏剧": "戏剧",
      "摄影": "摄影",
      "雕塑": "雕塑",

      // Sports Subcategories
      "足球": "足球",
      "篮球": "篮球",
      "排球": "排球", // Example if needed
      "网球": "网球",
      "游泳": "游泳",

      // Technology Subcategories
      "编程": "编程",
      "人工智能": "人工智能",
      "机器人技术": "机器人技术",
      "网页开发": "网页开发",
      "移动应用": "移动应用",

      // History Subcategories
      "古代史": "古代史",
      "中世纪史": "中世纪史",
      "近代史": "近代史",
      "当代史": "当代史",
      "文化史": "文化史",

      // Literature Subcategories
      "小说": "小说",
      "诗歌": "诗歌",
      "剧本": "剧本", // Example if needed
      "散文": "散文",
      "评论": "评论",

      // Business Subcategories
      "市场营销": "市场营销",
      "财务": "财务",
      "创业": "创业",
      "管理": "管理",
      "经济学": "经济学",

      // Travel Subcategories
      "欧洲": "欧洲",
      "亚洲": "亚洲",
      "北美": "北美",
      "南美": "南美",
      "非洲": "非洲",

      // Physics Detail Categories
      "力学": "力学",
      "量子力学": "量子力学",
      "相对论": "相对论",
      "热力学": "热力学",
      "电磁学": "电磁学",

      // Chemistry Detail Categories
      "有机化学": "有机化学",
      "无机化学": "无机化学",
      "分析化学": "分析化学",
      "生物化学": "生物化学",
      "物理化学": "物理化学",

      // Biology Detail Categories
      "分子生物学": "分子生物学",
      "遗传学": "遗传学",
      "生态学": "生态学",
      "进化论": "进化论",
      "细胞生物学": "细胞生物学",

      // Astronomy Detail Categories
      "太阳系": "太阳系",
      "恒星和星系": "恒星和星系",
      "宇宙学": "宇宙学",
      "天体物理学": "天体物理学",
      "行星科学": "行星科学",

      // Earth Science Detail Categories
      "地质学": "地质学",
      "大气科学": "大气科学",
      "海洋学": "海洋学",
      "环境科学": "环境科学",
      "气候学": "气候学",

      // Music Detail Categories
      "古典音乐": "古典音乐",
      "爵士乐": "爵士乐",
      "流行音乐": "流行音乐",
      "摇滚音乐": "摇滚音乐",
      "嘻哈音乐": "嘻哈音乐",

      // Fine Arts Detail Categories
      "绘画": "绘画",
      // "雕塑" is duplicated, handled by single key
      "当代艺术": "当代艺术",
      "设计": "设计",
      "建筑": "建筑",

      // Film Detail Categories
      "动作片": "动作片",
      "剧情片": "剧情片",
      "喜剧片": "喜剧片",
      "恐怖片": "恐怖片",
      "纪录片": "纪录片",

      // Theater Detail Categories
      "音乐剧": "音乐剧",
      "莎士比亚": "莎士比亚",
      "现代戏剧": "现代戏剧",
      "即兴戏剧": "即兴戏剧",
      "前卫戏剧": "前卫戏剧",

      // Photography Detail Categories
      "风景摄影": "风景摄影",
      "人像摄影": "人像摄影",
      "纪实摄影": "纪实摄影",
      "艺术摄影": "艺术摄影",
      "商业摄影": "商业摄影",

      // Soccer Detail Categories
      "英超": "英超",
      "西甲": "西甲",
      "德甲": "德甲",
      "意甲": "意甲",
      "韩国职业足球联赛": "韩国职业足球联赛",

      // Basketball Detail Categories
      "NBA": "NBA",
      "WNBA": "WNBA",
      "欧洲联赛": "欧洲联赛",
      "韩国篮球联赛": "韩国篮球联赛",
      "大学篮球": "大学篮球",

      // Baseball Detail Categories
      "美国职业棒球大联盟": "美国职业棒球大联盟",
      "日本职业棒球": "日本职业棒球",
      "韩国职业棒球联赛": "韩国职业棒球联赛",
      "大学棒球": "大学棒球",
      "棒球技术": "棒球技术",

      // Tennis Detail Categories
      "大满贯": "大满贯",
      "ATP巡回赛": "ATP巡回赛",
      "WTA巡回赛": "WTA巡回赛",
      "戴维斯杯": "戴维斯杯",
      "网球技术": "网球技术",

      // Swimming Detail Categories
      "自由泳": "自由泳",
      "仰泳": "仰泳",
      "蛙泳": "蛙泳",
      "蝶泳": "蝶泳",
      "个人混合泳": "个人混合泳",

      // Programming Detail Categories
      "JavaScript": "JavaScript",
      "Python": "Python",
      "Java": "Java",
      "C++": "C++",
      "Ruby": "Ruby",

      // AI Detail Categories
      "机器学习": "机器学习",
      "深度学习": "深度学习",
      "自然语言处理": "自然语言处理",
      "计算机视觉": "计算机视觉",
      "强化学习": "强化学习",

      // Robotics Detail Categories
      "工业机器人": "工业机器人",
      "服务机器人": "服务机器人",
      "无人机": "无人机",
      "自动驾驶": "自动驾驶",
      "机器人伦理": "机器人伦理",

      // Web Development Detail Categories
      "前端": "前端",
      "后端": "后端",
      "全栈": "全栈",
      "网页设计": "网页设计",
      "网络安全": "网络安全",

      // Mobile Apps Detail Categories
      "iOS开发": "iOS开发",
      "安卓开发": "安卓开发",
      "跨平台": "跨平台",
      "应用设计": "应用设计",
      "应用营销": "应用营销",

      // Ancient History Detail Categories
      "埃及": "埃及",
      "希腊": "希腊",
      "罗马": "罗马",
      "中国": "中国",
      "美索不达米亚": "美索不达米亚",

      // Medieval History Detail Categories
      "中世纪欧洲": "中世纪欧洲",
      "拜占庭": "拜占庭",
      "伊斯兰世界": "伊斯兰世界",
      "东亚": "东亚",
      "维京人": "维京人",

      // Modern History Detail Categories
      "文艺复兴": "文艺复兴",
      "工业革命": "工业革命",
      "启蒙运动": "启蒙运动",
      "帝国主义": "帝国主义",
      "民族主义": "民族主义",

      // Contemporary History Detail Categories
      "世界大战": "世界大战",
      "冷战": "冷战",
      "去殖民化": "去殖民化",
      "信息时代": "信息时代",
      "全球化": "全球化",

      // Cultural History Detail Categories
      "艺术史": "艺术史",
      "科学史": "科学史",
      "宗教史": "宗教史",
      "日常生活史": "日常生活史",
      "思想史": "思想史",

      // Fiction Detail Categories
      "经典小说": "经典小说",
      "现代小说": "现代小说",
      "科幻小说": "科幻小说",
      "奇幻小说": "奇幻小说",
      "推理小说": "推理小说",

      // Poetry Detail Categories
      "抒情诗": "抒情诗",
      "史诗": "史诗",
      "现代诗": "现代诗",
      "自由诗": "自由诗",
      "实验诗": "实验诗",

      // Drama Detail Categories
      "悲剧": "悲剧",
      "喜剧": "喜剧",
      // "现代戏剧" is duplicated, handled by single key
      "音乐剧": "音乐剧",
      "实验戏剧": "实验戏剧",

      // Essays Detail Categories
      "个人随笔": "个人随笔",
      "批评随笔": "批评随笔",
      "旅行随笔": "旅行随笔",
      "文化随笔": "文化随笔",
      "哲学随笔": "哲学随笔",

      // Criticism Detail Categories
      "文学批评": "文学批评",
      "电影批评": "电影批评",
      "艺术批评": "艺术批评",
      "文化批评": "文化批评",
      "社会批评": "社会批评",

      // Marketing Detail Categories
      "数字营销": "数字营销",
      "品牌营销": "品牌营销",
      "内容营销": "内容营销",
      "社交媒体营销": "社交媒体营销",
      "营销策略": "营销策略",

      // Finance Detail Categories
      "投资": "投资",
      "金融市场": "金融市场",
      "会计": "会计",
      "税务": "税务",
      "财务管理": "财务管理",

      // Entrepreneurship Detail Categories
      "创业公司": "创业公司",
      "商业模式": "商业模式",
      "融资": "融资",
      "创业策略": "创业策略",
      "增长策略": "增长策略",

      // Management Detail Categories
      "领导力": "领导力",
      "组织管理": "组织管理",
      "战略管理": "战略管理",
      "人力资源管理": "人力资源管理",
      "运营管理": "运营管理",

      // Economics Detail Categories
      "微观经济学": "微观经济学",
      "宏观经济学": "宏观经济学",
      "国际经济学": "国际经济学",
      "行为经济学": "行为经济学",
      "发展经济学": "发展经济学",

      // Europe Detail Categories
      "西欧": "西欧",
      "东欧": "东欧",
      "北欧": "北欧",
      "南欧": "南欧",
      "中欧": "中欧",

      // Asia Detail Categories
      "东亚": "东亚",
      "东南亚": "东南亚",
      "南亚": "南亚",
      "中亚": "中亚",
      "西亚": "西亚",

      // North America Detail Categories
      "美国东部": "美国东部",
      "美国西部": "美国西部",
      "加拿大": "加拿大",
      "墨西哥": "墨西哥",
      "加勒比海": "加勒比海",

      // South America Detail Categories
      "巴西": "巴西",
      "阿根廷": "阿根廷",
      "秘鲁": "秘鲁",
      "智利": "智利",
      "哥伦比亚": "哥伦比亚",

      // Africa Detail Categories
      "北非": "北非",
      "西非": "西非",
      "东非": "东非",
      "南非": "南非",
      "中非": "中非",

      // Word Meaning & Review Mode (already included)
      "含义": "含义",
      "含义关系": "含义关系",
      "含义关系解释": "查看单词不同含义之间的关系。",
      "查看含义关系": "查看含义关系",
      "此单词没有可用的含义关系信息。": "此单词没有可用的含义关系信息。",
      "此单词只有一个含义。": "此单词只有一个含义。",
      "含义": "含义",
      "复习模式": "复习模式",
      "复习说明": "复习做错的题目",
      "复习说明详情": '复习做错的题目后，点击"复习完成"按钮重新尝试这些题目。',
      "复习完成": "复习完成",
      "复习完成按钮": "复习完成",
      "重做错题": "重做错题",
      "完成复习": "完成复习",
      "需要复习": "需要复习",
      "继续下一步": "继续下一步",

      // Etymology (already included)
      "词源": "词源",
      "词源解释": "查看单词的起源和历史发展过程。",
      "无词源信息": "此单词没有可用的词源信息。",
      "词源时间线": "词源时间线",
      "词源时间线解释": "按时间顺序查看单词的历史发展过程。",
      "无词源时间线信息": "此单词没有可用的词源时间线信息。",
      "未知时期": "未知时期",
      "单词演变": "单词演变",
      "历史发展": "历史发展",
      "韩语含义": "韩语含义",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "ko", // 기본 언어
  fallbackLng: "en", // 번역이 없을 경우 영어로 폴백
  interpolation: {
    escapeValue: false, // React에서는 이미 XSS 방지가 되어 있음
  },
});

export default i18n;