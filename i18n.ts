import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"

// Translation resources
const resources = {
  ko: {
    translation: {
      // Common
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

      // Home page
      home_title: "개인 맞춤형 영어 학습",
      home_description: "당신의 관심사와 영어 실력에 맞춘 최적의 학습 경험을 제공합니다.",
      start_learning: "학습 시작하기",
      topic_selection: "관심 주제 선택",
      level_assessment: "레벨 평가",
      step_learning: "단계별 학습",
      footer_copyright: "© 2024 영어 학습 마스터. 모든 권리 보유.",

      // Topic selection
      select_topic: "관심 있는 주제를 선택하세요",
      select_subcategory: "의 세부 분야를 선택하세요",
      select_detail: "의 구체적인 주제를 선택하세요",
      step: "단계",
      start_assessment: "레벨 평가 시작",
      select_subcategory_of: "{{category}} 의 세부 분야를 선택하세요",
      select_detail_of: "{{category}} 의 구체적인 주제를 선택하세요",

      // Level assessment
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

      // Level complete
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

      // Learning page
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

      // Settings
      settings_title: "설정",
      manage_settings: "애플리케이션 설정을 관리합니다.",
      api_key_settings: "API 키 설정",
      api_key_description:
        "단어 정의를 가져오기 위한 Google Gemini API 키를 입력하세요. API 키는 로컬에만 저장되며 서버로 전송되지 않습니다.",
      google_api_key: "Google Gemini API 키",
      api_key_placeholder: "AIza...",
      api_key_note: "API 키가 없으면 로컬 사전이 사용됩니다.",
      remember_api_key: "API 키 기억하기",
      remember_api_key_yes: "API 키를 브라우저에 저장하여 다음 방문 시에도 사용합니다.",
      remember_api_key_no: "API 키를 현재 세션에만 사용하고 브라우저를 닫으면 삭제합니다.",
      save_settings: "설정 저장",
      saving: "저장 중...",
      settings_saved: "설정이 저장되었습니다",
      api_key_saved: "Google API 키가 성공적으로 저장되었습니다.",
      error_occurred: "오류 발생",
      save_error: "설정을 저장하는 중 오류가 발생했습니다.",

      // Language settings
      language_settings: "언어 설정",
      interface_language: "인터페이스 언어",
      korean: "한국어",
      english: "영어",
      chinese: "중국어",

      // Learning continuation
      learning_complete: "학습 완료",
      completed_passage: "지문 학습을 성공적으로 완료했습니다. 계속해서 학습하시겠습니까?",
      learning_info: "학습 정보",
      end_learning: "학습 종료하기",
      continue_learning: "계속 학습하기",

      // 새로 추가하는 항목
      know_all_words: "모든 단어를 알고 있습니다",

      // 카테고리별 특화된 번역 키 추가
      과학의_세부: "과학의 세부 분야를 선택하세요",
      예술의_세부: "예술의 세부 분야를 선택하세요",
      스포츠의_세부: "스포츠의 세부 분야를 선택하세요",
      기술의_세부: "기술의 세부 분야를 선택하세요",
      역사의_세부: "역사의 세부 분야를 선택하세요",
      문학의_세부: "문학의 세부 분야를 선택하세요",
      비즈니스의_세부: "비즈니스의 세부 분야를 선택하세요",
      여행의_세부: "여행의 세부 분야를 선택하세요",

      // 기타 필요한 번역 키들...
    },
  },
  en: {
    translation: {
      // Common
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

      // Home page
      home_title: "Personalized English Learning",
      home_description: "Providing the optimal learning experience tailored to your interests and English proficiency.",
      start_learning: "Start Learning",
      topic_selection: "Topic Selection",
      level_assessment: "Level Assessment",
      step_learning: "Step-by-Step Learning",
      footer_copyright: "© 2024 English Learning Master. All rights reserved.",

      // Topic selection
      select_topic: "Select a topic you're interested in",
      select_subcategory: "Select a subcategory of",
      select_detail: "Select a specific topic of",
      step: "Step",
      start_assessment: "Start Level Assessment",
      select_subcategory_of: "Select a subcategory of {{category}}",
      select_detail_of: "Select a specific topic of {{category}}",

      // Level assessment
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

      // Level complete
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

      // Learning page
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

      // Settings
      settings_title: "Settings",
      manage_settings: "Manage application settings.",
      api_key_settings: "API Key Settings",
      api_key_description:
        "Enter your Google Gemini API key to fetch word definitions. The API key is stored locally only and is not sent to the server.",
      google_api_key: "Google Gemini API Key",
      api_key_placeholder: "AIza...",
      api_key_note: "If no API key is provided, the local dictionary will be used.",
      remember_api_key: "Remember API Key",
      remember_api_key_yes: "Store the API key in the browser for future visits.",
      remember_api_key_no: "Use the API key only for the current session and delete it when the browser is closed.",
      save_settings: "Save Settings",
      saving: "Saving...",
      settings_saved: "Settings Saved",
      api_key_saved: "Google API key has been successfully saved.",
      error_occurred: "Error Occurred",
      save_error: "An error occurred while saving settings.",

      // Language settings
      language_settings: "Language Settings",
      interface_language: "Interface Language",
      korean: "Korean",
      english: "English",
      chinese: "Chinese",

      // Learning continuation
      learning_complete: "Learning Complete",
      completed_passage: "You have successfully completed passage learning. Would you like to continue learning?",
      learning_info: "Learning Information",
      end_learning: "End Learning",
      continue_learning: "Continue Learning",

      // Physics topics
      역학: "Mechanics",
      양자역학: "Quantum Mechanics",
      상대성이론: "Theory of Relativity",
      열역학: "Thermodynamics",
      전자기학: "Electromagnetism",
      물리학: "Physics",
    },
  },
  zh: {
    translation: {
      // Common
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

      // Home page
      home_title: "个性化英语学习",
      home_description: "提供根据您的兴趣和英语水平定制的最佳学习体验。",
      start_learning: "开始学习",
      topic_selection: "主题选择",
      level_assessment: "水平评估",
      step_learning: "阶段性学习",
      footer_copyright: "© 2024 英语学习大师。保留所有权利。",

      // Topic selection
      select_topic: "选择您感兴趣的主题",
      select_subcategory: "选择的子类别",
      select_detail: "选择的具体主题",
      step: "步骤",
      start_assessment: "开始水平评估",
      select_subcategory_of: "选择{{category}}的子类别",
      select_detail_of: "选择{{category}}的具体主题",

      // Level assessment
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

      // Level complete
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

      // Learning page
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

      // Settings
      settings_title: "设置",
      manage_settings: "管理应用设置。",
      api_key_settings: "API密钥设置",
      api_key_description: "输入您的Google Gemini API密钥以获取单词定义。API密钥仅存储在本地，不会发送到服务器。",
      google_api_key: "Google Gemini API密钥",
      api_key_placeholder: "AIza...",
      api_key_note: "如果未提供API密钥，将使用本地词典。",
      remember_api_key: "记住API密钥",
      remember_api_key_yes: "在浏览器中存储API密钥以供将来访问。",
      remember_api_key_no: "仅在当前会话中使用API密钥，关闭浏览器时删除。",
      save_settings: "保存设置",
      saving: "保存中...",
      settings_saved: "设置已保存",
      api_key_saved: "Google API密钥已成功保存。",
      error_occurred: "发生错误",
      save_error: "保存设置时发生错误。",

      // Language settings
      language_settings: "语言设置",
      interface_language: "界面语言",
      korean: "韩语",
      english: "英语",
      chinese: "中文",

      // Learning continuation
      learning_complete: "学习完成",
      completed_passage: "您已成功完成段落学习。是否继续学习？",
      learning_info: "学习信息",
      end_learning: "结束学习",
      continue_learning: "继续学习",

      // Physics topics
      역학: "力学",
      양자역학: "量子力学",
      상대성이론: "相对论",
      열역학: "热力学",
      전자기학: "电磁学",
      물리학: "物理学",
    },
  },
}

i18n
  .use(LanguageDetector) // Automatically detect language
  .use(initReactI18next) // Initialize react-i18next
  .init({
    resources,
    fallbackLng: "ko", // Default language
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
    react: {
      useSuspense: false, // React 18에서 Suspense 관련 경고 방지
    },
  })

export default i18n
