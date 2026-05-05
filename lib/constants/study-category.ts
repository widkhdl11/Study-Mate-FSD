// lib/constants/categories.ts

// ==================== 타입 정의 ====================
type CategoryItem = {
  code: number;
  label: string;
  value: string;
};

// ==================== 카테고리 코드 체계 ====================
// 대분류: 100, 200, 300...
// 중분류: 110, 120, 130...
// 소분류: 111, 112, 113...

export const STUDY_CATEGORIES = {
  // 100: IT/개발
  IT_DEVELOPMENT: {
    code: 100,
    label: "IT/개발",
    value: "IT_DEVELOPMENT",
    subcategories: {
      FRONTEND: {
        code: 110,
        label: "프론트엔드",
        value: "FRONTEND",
        details: [
          { code: 111, label: "React", value: "REACT" },
          { code: 112, label: "Vue", value: "VUE" },
          { code: 113, label: "Angular", value: "ANGULAR" },
          { code: 114, label: "Svelte", value: "SVELTE" },
          { code: 115, label: "Next.js", value: "NEXTJS" },
          { code: 116, label: "TypeScript", value: "TYPESCRIPT" },
        ],
      },
      BACKEND: {
        code: 120,
        label: "백엔드",
        value: "BACKEND",
        details: [
          { code: 121, label: "Spring", value: "SPRING" },
          { code: 122, label: "Node.js", value: "NODEJS" },
          { code: 123, label: "Django", value: "DJANGO" },
          { code: 124, label: "FastAPI", value: "FASTAPI" },
          { code: 125, label: "NestJS", value: "NESTJS" },
          { code: 126, label: "Express", value: "EXPRESS" },
        ],
      },
      MOBILE: {
        code: 130,
        label: "모바일",
        value: "MOBILE",
        details: [
          { code: 131, label: "iOS", value: "IOS" },
          { code: 132, label: "Android", value: "ANDROID" },
          { code: 133, label: "React Native", value: "REACT_NATIVE" },
          { code: 134, label: "Flutter", value: "FLUTTER" },
          { code: 135, label: "Swift", value: "SWIFT" },
          { code: 136, label: "Kotlin", value: "KOTLIN" },
        ],
      },
      AI_ML: {
        code: 140,
        label: "AI/머신러닝",
        value: "AI_ML",
        details: [
          { code: 141, label: "Python", value: "PYTHON" },
          { code: 142, label: "TensorFlow", value: "TENSORFLOW" },
          { code: 143, label: "PyTorch", value: "PYTORCH" },
          { code: 144, label: "딥러닝", value: "DEEP_LEARNING" },
          { code: 145, label: "데이터 분석", value: "DATA_ANALYSIS" },
        ],
      },
      DEVOPS: {
        code: 150,
        label: "DevOps/인프라",
        value: "DEVOPS",
        details: [
          { code: 151, label: "AWS", value: "AWS" },
          { code: 152, label: "Docker", value: "DOCKER" },
          { code: 153, label: "Kubernetes", value: "KUBERNETES" },
          { code: 154, label: "CI/CD", value: "CICD" },
          { code: 155, label: "Linux", value: "LINUX" },
        ],
      },
      DATABASE: {
        code: 160,
        label: "데이터베이스",
        value: "DATABASE",
        details: [
          { code: 161, label: "MySQL", value: "MYSQL" },
          { code: 162, label: "PostgreSQL", value: "POSTGRESQL" },
          { code: 163, label: "MongoDB", value: "MONGODB" },
          { code: 164, label: "Redis", value: "REDIS" },
          { code: 165, label: "SQL", value: "SQL" },
        ],
      },
      SECURITY: {
        code: 170,
        label: "보안",
        value: "SECURITY",
        details: [
          { code: 171, label: "네트워크 보안", value: "NETWORK_SECURITY" },
          { code: 172, label: "웹 해킹", value: "WEB_HACKING" },
          { code: 173, label: "시스템 보안", value: "SYSTEM_SECURITY" },
          { code: 174, label: "암호학", value: "CRYPTOGRAPHY" },
        ],
      },
      GAME: {
        code: 180,
        label: "게임 개발",
        value: "GAME",
        details: [
          { code: 181, label: "Unity", value: "UNITY" },
          { code: 182, label: "Unreal", value: "UNREAL" },
          { code: 183, label: "C++", value: "CPP" },
          { code: 184, label: "C#", value: "CSHARP" },
          { code: 185, label: "게임 기획", value: "GAME_DESIGN" },
        ],
      },
    },
  },

  // 200: 디자인
  DESIGN: {
    code: 200,
    label: "디자인",
    value: "DESIGN",
    subcategories: {
      UI_UX: {
        code: 210,
        label: "UI/UX",
        value: "UI_UX",
        details: [
          { code: 211, label: "Figma", value: "FIGMA" },
          { code: 212, label: "Adobe XD", value: "ADOBE_XD" },
          { code: 213, label: "Sketch", value: "SKETCH" },
          { code: 214, label: "프로토타이핑", value: "PROTOTYPING" },
          { code: 215, label: "사용성 테스트", value: "USABILITY_TEST" },
        ],
      },
      GRAPHIC: {
        code: 220,
        label: "그래픽 디자인",
        value: "GRAPHIC",
        details: [
          { code: 221, label: "Photoshop", value: "PHOTOSHOP" },
          { code: 222, label: "Illustrator", value: "ILLUSTRATOR" },
          { code: 223, label: "브랜딩", value: "BRANDING" },
          { code: 224, label: "타이포그래피", value: "TYPOGRAPHY" },
        ],
      },
      VIDEO: {
        code: 230,
        label: "영상/모션",
        value: "VIDEO",
        details: [
          { code: 231, label: "Premiere Pro", value: "PREMIERE_PRO" },
          { code: 232, label: "After Effects", value: "AFTER_EFFECTS" },
          { code: 233, label: "Final Cut", value: "FINAL_CUT" },
          { code: 234, label: "DaVinci", value: "DAVINCI" },
        ],
      },
      THREE_D: {
        code: 240,
        label: "3D/모델링",
        value: "THREE_D",
        details: [
          { code: 241, label: "Blender", value: "BLENDER" },
          { code: 242, label: "Maya", value: "MAYA" },
          { code: 243, label: "3ds Max", value: "3DS_MAX" },
          { code: 244, label: "Cinema 4D", value: "CINEMA_4D" },
        ],
      },
    },
  },

  // 300: 외국어
  LANGUAGE: {
    code: 300,
    label: "외국어",
    value: "LANGUAGE",
    subcategories: {
      ENGLISH: {
        code: 310,
        label: "영어",
        value: "ENGLISH",
        details: [
          { code: 311, label: "토익", value: "TOEIC" },
          { code: 312, label: "토스", value: "TOSS" },
          { code: 313, label: "오픽", value: "OPIC" },
          { code: 314, label: "회화", value: "CONVERSATION" },
          { code: 315, label: "비즈니스 영어", value: "BUSINESS_ENGLISH" },
        ],
      },
      JAPANESE: {
        code: 320,
        label: "일본어",
        value: "JAPANESE",
        details: [
          { code: 321, label: "JLPT", value: "JLPT" },
          { code: 322, label: "JPT", value: "JPT" },
          { code: 323, label: "회화", value: "CONVERSATION" },
          { code: 324, label: "비즈니스 일본어", value: "BUSINESS_JAPANESE" },
        ],
      },
      CHINESE: {
        code: 330,
        label: "중국어",
        value: "CHINESE",
        details: [
          { code: 331, label: "HSK", value: "HSK" },
          { code: 332, label: "TSC", value: "TSC" },
          { code: 333, label: "회화", value: "CONVERSATION" },
        ],
      },
    },
  },

  // 400: 비즈니스/금융
  BUSINESS: {
    code: 400,
    label: "비즈니스/금융",
    value: "BUSINESS",
    subcategories: {
      STARTUP: {
        code: 410,
        label: "창업/스타트업",
        value: "STARTUP",
        details: [
          { code: 411, label: "사업 계획", value: "BUSINESS_PLAN" },
          { code: 412, label: "IR 피칭", value: "IR_PITCHING" },
          { code: 413, label: "투자 유치", value: "INVESTMENT" },
        ],
      },
      MARKETING: {
        code: 420,
        label: "마케팅",
        value: "MARKETING",
        details: [
          { code: 421, label: "디지털 마케팅", value: "DIGITAL_MARKETING" },
          { code: 422, label: "SNS 마케팅", value: "SNS_MARKETING" },
          { code: 423, label: "콘텐츠 마케팅", value: "CONTENT_MARKETING" },
        ],
      },
      FINANCE: {
        code: 430,
        label: "재무/회계",
        value: "FINANCE",
        details: [
          { code: 431, label: "재무제표", value: "FINANCIAL_STATEMENT" },
          { code: 432, label: "투자", value: "INVESTMENT" },
          { code: 433, label: "주식", value: "STOCK" },
        ],
      },
    },
  },

  // 500: 자격증/시험
  CERTIFICATION: {
    code: 500,
    label: "자격증/시험",
    value: "CERTIFICATION",
    subcategories: {
      IT_CERT: {
        code: 510,
        label: "IT 자격증",
        value: "IT_CERT",
        details: [
          { code: 511, label: "정보처리기사", value: "CRAFTSMAN_INFO_PROCESSING" },
          { code: 512, label: "네트워크관리사", value: "NETWORK_ADMIN" },
          { code: 513, label: "AWS", value: "AWS_CERT" },
        ],
      },
      PUBLIC_SERVANT: {
        code: 520,
        label: "공무원",
        value: "PUBLIC_SERVANT",
        details: [
          { code: 521, label: "국가직", value: "NATIONAL" },
          { code: 522, label: "지방직", value: "LOCAL" },
          { code: 523, label: "서울시", value: "SEOUL" },
        ],
      },
    },
  },

  // 600: 학업/입시
  ACADEMICS: {
    code: 600,
    label: "학업/입시",
    value: "ACADEMICS",
    subcategories: {
      UNIVERSITY: {
        code: 610,
        label: "대학 입시",
        value: "UNIVERSITY",
        details: [
          { code: 611, label: "수능", value: "CSAT" },
          { code: 612, label: "논술", value: "ESSAY" },
          { code: 613, label: "면접", value: "INTERVIEW" },
        ],
      },
      MATH: {
        code: 620,
        label: "수학",
        value: "MATH",
        details: [
          { code: 621, label: "미적분", value: "CALCULUS" },
          { code: 622, label: "선형대수", value: "LINEAR_ALGEBRA" },
          { code: 623, label: "확률과 통계", value: "PROBABILITY_STATISTICS" },
        ],
      },
    },
  },

  // 700: 취미/라이프
  HOBBY: {
    code: 700,
    label: "취미/라이프",
    value: "HOBBY",
    subcategories: {
      SPORTS: {
        code: 710,
        label: "운동/스포츠",
        value: "SPORTS",
        details: [
          { code: 711, label: "러닝", value: "RUNNING" },
          { code: 712, label: "헬스", value: "FITNESS" },
          { code: 713, label: "요가", value: "YOGA" },
        ],
      },
      MUSIC: {
        code: 720,
        label: "음악",
        value: "MUSIC",
        details: [
          { code: 721, label: "기타", value: "GUITAR" },
          { code: 722, label: "피아노", value: "PIANO" },
          { code: 723, label: "보컬", value: "VOCAL" },
        ],
      },
    },
  },

  // 800: 자기계발
  SELF_IMPROVEMENT: {
    code: 800,
    label: "자기계발",
    value: "SELF_IMPROVEMENT",
    subcategories: {
      PRODUCTIVITY: {
        code: 810,
        label: "생산성/습관",
        value: "PRODUCTIVITY",
        details: [
          { code: 811, label: "시간 관리", value: "TIME_MANAGEMENT" },
          { code: 812, label: "습관 만들기", value: "HABIT_BUILDING" },
          { code: 813, label: "노션", value: "NOTION" },
        ],
      },
    },
  },
} as const;

// ==================== 유틸리티 함수 ====================

// ===== 1. 코드로 찾기 =====
export const getCategoryByCode = (code: number): CategoryItem | null => {
  for (const mainCat of Object.values(STUDY_CATEGORIES)) {
    if (mainCat.code === code) {
      return { code: mainCat.code, label: mainCat.label, value: mainCat.value };
    }

    for (const subCat of Object.values(mainCat.subcategories)) {
      if (subCat.code === code) {
        return { code: subCat.code, label: subCat.label, value: subCat.value };
      }

      const detail = subCat.details?.find((d: { code: number }) => d.code === code);
      if (detail) {
        return { code: detail.code, label: detail.label, value: detail.value };
      }
    }
  }
  return null;
};

// ===== 2. Value로 찾기 =====
export const getCategoryByValue = (value: string): CategoryItem | null => {
  for (const mainCat of Object.values(STUDY_CATEGORIES)) {
    if (mainCat.value === value) {
      return { code: mainCat.code, label: mainCat.label, value: mainCat.value };
    }

    for (const subCat of Object.values(mainCat.subcategories)) {
      if (subCat.value === value) {
        return { code: subCat.code, label: subCat.label, value: subCat.value };
      }

      const detail = subCat.details?.find((d: { value: string }) => d.value === value);
      if (detail) {
        return { code: detail.code, label: detail.label, value: detail.value };
      }
    }
  }
  return null;
};

// ===== 3. Label로 찾기 =====
export const getCategoryByLabel = (label: string): CategoryItem | null => {
  for (const mainCat of Object.values(STUDY_CATEGORIES)) {
    if (mainCat.label === label) {
      return { code: mainCat.code, label: mainCat.label, value: mainCat.value };
    }

    for (const subCat of Object.values(mainCat.subcategories)) {
      if (subCat.label === label) {
        return { code: subCat.code, label: subCat.label, value: subCat.value };
      }

      const detail = subCat.details?.find((d: { label: string }) => d.label === label);
      if (detail) {
        return { code: detail.code, label: detail.label, value: detail.value };
      }
    }
  }
  return null;
};

// ===== 4. 경로 얻기 =====
export const getCategoryPath = (code: number): {
  codes: number[];
  labels: string[];
  values: string[];
} => {
  for (const mainCat of Object.values(STUDY_CATEGORIES)) {
    if (mainCat.code === code) {
      return {
        codes: [mainCat.code],
        labels: [mainCat.label],
        values: [mainCat.value],
      };
    }

    for (const subCat of Object.values(mainCat.subcategories)) {
      if (subCat.code === code) {
        return {
          codes: [mainCat.code, subCat.code],
          labels: [mainCat.label, subCat.label],
          values: [mainCat.value, subCat.value],
        };
      }

      const detail = subCat.details?.find((d: { code: number }) => d.code === code);
      if (detail) {
        return {
          codes: [mainCat.code, subCat.code, detail.code],
          labels: [mainCat.label, subCat.label, detail.label],
          values: [mainCat.value, subCat.value, detail.value],
        };
      }
    }
  }
  return { codes: [], labels: [], values: [] };
};

// ===== 5. 계층별 목록 ===== (계충 출력용)
export const getMainCategories = (): CategoryItem[] => {
  return Object.values(STUDY_CATEGORIES).map((cat) => ({
    code: cat.code,
    label: cat.label,
    value: cat.value,
  }));
};

export const getSubcategories = (mainValue: string): CategoryItem[] => {
  const mainCat = Object.values(STUDY_CATEGORIES).find(
    (cat) => cat.value === mainValue
  );
  if (!mainCat) return [];

  return Object.values(mainCat.subcategories).map((sub) => ({
    code: sub.code,
    label: sub.label,
    value: sub.value,
  }));
};

export const getDetailCategories = (
  mainValue: string,
  subValue: string
): CategoryItem[] => {
  const mainCat = Object.values(STUDY_CATEGORIES).find(
    (cat) => cat.value === mainValue
  );
  if (!mainCat) return [];

  const subCat = Object.values(mainCat.subcategories).find(
    (sub) => sub.value === subValue
  );
  if (!subCat) return [];

  return subCat.details || [];
};

// ===== 6. 레거시 호환 함수 (기존 코드 유지용) =====
export const getCategoryLabelByCode = (code: number): string => {
  return getCategoryByCode(code)?.label || "";
};

export const getCategoryCodeByLabel = (label: string): number | null => {
  return getCategoryByLabel(label)?.code || null;
};

export const getCategoryCodeByValue = (value: string): number | null => {
  return getCategoryByValue(value)?.code || null;
};

// ===== 7. 타입 내보내기 =====
export type { CategoryItem };

