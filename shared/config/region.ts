// lib/constants/regions.ts

// ==================== 타입 정의 ====================
type RegionItem = {
  code: number;
  label: string;
  value: string;
};

// ==================== 지역 코드 체계 ====================
// 대분류: 0, 1000, 2000, 3000...
// 중분류: 1001, 1002, 1003...

export const STUDY_REGIONS = {
  // 0: 온라인
  // ONLINE: {
  //   code: 0,
  //   label: "온라인",
  //   value: "ONLINE",
  //   subcategories: {},
  // },

  // 1000: 서울
  SEOUL: {
    code: 1000,
    label: "서울",
    value: "SEOUL",
    subcategories: {
      GANGNAM_GU: { code: 1001, label: "강남구", value: "GANGNAM_GU" },
      GANGDONG_GU: { code: 1002, label: "강동구", value: "GANGDONG_GU" },
      GANGBUK_GU: { code: 1003, label: "강북구", value: "GANGBUK_GU" },
      GANGSEO_GU: { code: 1004, label: "강서구", value: "GANGSEO_GU" },
      GWANAK_GU: { code: 1005, label: "관악구", value: "GWANAK_GU" },
      GWANGJIN_GU: { code: 1006, label: "광진구", value: "GWANGJIN_GU" },
      GURO_GU: { code: 1007, label: "구로구", value: "GURO_GU" },
      GEUMCHEON_GU: { code: 1008, label: "금천구", value: "GEUMCHEON_GU" },
      NOWON_GU: { code: 1009, label: "노원구", value: "NOWON_GU" },
      DOBONG_GU: { code: 1010, label: "도봉구", value: "DOBONG_GU" },
      DONGDAEMUN_GU: { code: 1011, label: "동대문구", value: "DONGDAEMUN_GU" },
      DONGJAK_GU: { code: 1012, label: "동작구", value: "DONGJAK_GU" },
      MAPO_GU: { code: 1013, label: "마포구", value: "MAPO_GU" },
      SEODAEMUN_GU: { code: 1014, label: "서대문구", value: "SEODAEMUN_GU" },
      SEOCHO_GU: { code: 1015, label: "서초구", value: "SEOCHO_GU" },
      SEONGDONG_GU: { code: 1016, label: "성동구", value: "SEONGDONG_GU" },
      SEONGBUK_GU: { code: 1017, label: "성북구", value: "SEONGBUK_GU" },
      SONGPA_GU: { code: 1018, label: "송파구", value: "SONGPA_GU" },
      YANGCHEON_GU: { code: 1019, label: "양천구", value: "YANGCHEON_GU" },
      YEONGDEUNGPO_GU: { code: 1020, label: "영등포구", value: "YEONGDEUNGPO_GU" },
      YONGSAN_GU: { code: 1021, label: "용산구", value: "YONGSAN_GU" },
      EUNPYEONG_GU: { code: 1022, label: "은평구", value: "EUNPYEONG_GU" },
      JONGNO_GU: { code: 1023, label: "종로구", value: "JONGNO_GU" },
      JUNG_GU: { code: 1024, label: "중구", value: "SEOUL_JUNG_GU" },
      JUNGNANG_GU: { code: 1025, label: "중랑구", value: "JUNGNANG_GU" },
    },
  },

  // 2000: 경기
  GYEONGGI: {
    code: 2000,
    label: "경기",
    value: "GYEONGGI",
    subcategories: {
      SUWON: { code: 2001, label: "수원시", value: "SUWON" },
      SEONGNAM: { code: 2002, label: "성남시", value: "SEONGNAM" },
      YONGIN: { code: 2003, label: "용인시", value: "YONGIN" },
      BUCHEON: { code: 2004, label: "부천시", value: "BUCHEON" },
      ANSAN: { code: 2005, label: "안산시", value: "ANSAN" },
      ANYANG: { code: 2006, label: "안양시", value: "ANYANG" },
      NAMYANGJU: { code: 2007, label: "남양주시", value: "NAMYANGJU" },
      HWASEONG: { code: 2008, label: "화성시", value: "HWASEONG" },
      PYEONGTAEK: { code: 2009, label: "평택시", value: "PYEONGTAEK" },
      UIJEONGBU: { code: 2010, label: "의정부시", value: "UIJEONGBU" },
      SIHEUNG: { code: 2011, label: "시흥시", value: "SIHEUNG" },
      PAJU: { code: 2012, label: "파주시", value: "PAJU" },
      GWANGMYEONG: { code: 2013, label: "광명시", value: "GWANGMYEONG" },
      GIMPO: { code: 2014, label: "김포시", value: "GIMPO" },
      GUNPO: { code: 2015, label: "군포시", value: "GUNPO" },
    },
  },

  // 3000: 인천
  INCHEON: {
    code: 3000,
    label: "인천",
    value: "INCHEON",
    subcategories: {
      JUNG_GU: { code: 3001, label: "중구", value: "INCHEON_JUNG_GU" },
      DONG_GU: { code: 3002, label: "동구", value: "INCHEON_DONG_GU" },
      MICHUHOL_GU: { code: 3003, label: "미추홀구", value: "MICHUHOL_GU" },
      YEONSU_GU: { code: 3004, label: "연수구", value: "YEONSU_GU" },
      NAMDONG_GU: { code: 3005, label: "남동구", value: "NAMDONG_GU" },
      BUPYEONG_GU: { code: 3006, label: "부평구", value: "BUPYEONG_GU" },
      GYEYANG_GU: { code: 3007, label: "계양구", value: "GYEYANG_GU" },
      SEO_GU: { code: 3008, label: "서구", value: "INCHEON_SEO_GU" },
    },
  },

  // 4000: 부산
  BUSAN: {
    code: 4000,
    label: "부산",
    value: "BUSAN",
    subcategories: {
      HAEUNDAE: { code: 4001, label: "해운대구", value: "HAEUNDAE" },
      BUSANJIN: { code: 4002, label: "부산진구", value: "BUSANJIN" },
      DONGNAE: { code: 4003, label: "동래구", value: "DONGNAE" },
      NAM_GU: { code: 4004, label: "남구", value: "BUSAN_NAM_GU" },
      SUYEONG: { code: 4005, label: "수영구", value: "SUYEONG" },
    },
  },

  // 5000: 대구
  DAEGU: {
    code: 5000,
    label: "대구",
    value: "DAEGU",
    subcategories: {
      JUNG_GU: { code: 5001, label: "중구", value: "DAEGU_JUNG_GU" },
      DONG_GU: { code: 5002, label: "동구", value: "DAEGU_DONG_GU" },
      SEO_GU: { code: 5003, label: "서구", value: "DAEGU_SEO_GU" },
      NAM_GU: { code: 5004, label: "남구", value: "DAEGU_NAM_GU" },
      BUK_GU: { code: 5005, label: "북구", value: "DAEGU_BUK_GU" },
      SUSEONG: { code: 5006, label: "수성구", value: "SUSEONG" },
    },
  },

  // 6000: 대전
  DAEJEON: {
    code: 6000,
    label: "대전",
    value: "DAEJEON",
    subcategories: {
      DONG_GU: { code: 6001, label: "동구", value: "DAEJEON_DONG_GU" },
      JUNG_GU: { code: 6002, label: "중구", value: "DAEJEON_JUNG_GU" },
      SEO_GU: { code: 6003, label: "서구", value: "DAEJEON_SEO_GU" },
      YUSEONG: { code: 6004, label: "유성구", value: "YUSEONG" },
    },
  },

  // 7000: 광주
  GWANGJU: {
    code: 7000,
    label: "광주",
    value: "GWANGJU",
    subcategories: {
      DONG_GU: { code: 7001, label: "동구", value: "GWANGJU_DONG_GU" },
      SEO_GU: { code: 7002, label: "서구", value: "GWANGJU_SEO_GU" },
      NAM_GU: { code: 7003, label: "남구", value: "GWANGJU_NAM_GU" },
      BUK_GU: { code: 7004, label: "북구", value: "GWANGJU_BUK_GU" },
      GWANGSAN: { code: 7005, label: "광산구", value: "GWANGSAN" },
    },
  },

  // 8000: 울산
  ULSAN: {
    code: 8000,
    label: "울산",
    value: "ULSAN",
    subcategories: {
      JUNG_GU: { code: 8001, label: "중구", value: "ULSAN_JUNG_GU" },
      NAM_GU: { code: 8002, label: "남구", value: "ULSAN_NAM_GU" },
      DONG_GU: { code: 8003, label: "동구", value: "ULSAN_DONG_GU" },
      BUK_GU: { code: 8004, label: "북구", value: "ULSAN_BUK_GU" },
    },
  },

  // 9000: 세종
  SEJONG: {
    code: 9000,
    label: "세종",
    value: "SEJONG",
    subcategories: {},
  },
} as const;

// ==================== 유틸리티 함수 ====================

// ===== 1. 코드로 찾기 =====
export const getRegionByCode = (code: number): RegionItem | null => {
  for (const region of Object.values(STUDY_REGIONS)) {
    if (region.code === code) {
      return { code: region.code, label: region.label, value: region.value };
    }

    for (const subregion of Object.values(region.subcategories)) {
      if (subregion.code === code) {
        return {
          code: subregion.code,
          label: subregion.label,
          value: subregion.value,
        };
      }
    }
  }
  return null;
};

// ===== 2. Value로 찾기 =====
export const getRegionByValue = (value: string): RegionItem | null => {
  for (const region of Object.values(STUDY_REGIONS)) {
    if (region.value === value) {
      return { code: region.code, label: region.label, value: region.value };
    }

    for (const subregion of Object.values(region.subcategories)) {
      if (subregion.value === value) {
        return {
          code: subregion.code,
          label: subregion.label,
          value: subregion.value,
        };
      }
    }
  }
  return null;
};

// ===== 3. Label로 찾기 =====
export const getRegionByLabel = (label: string): RegionItem | null => {
  for (const region of Object.values(STUDY_REGIONS)) {
    if (region.label === label) {
      return { code: region.code, label: region.label, value: region.value };
    }

    for (const subregion of Object.values(region.subcategories)) {
      if (subregion.label === label) {
        return {
          code: subregion.code,
          label: subregion.label,
          value: subregion.value,
        };
      }
    }
  }
  return null;
};

// ===== 4. 경로 얻기 =====
export const getRegionPath = (code: number): {
  codes: number[];
  labels: string[];
  values: string[];
} => {
  for (const region of Object.values(STUDY_REGIONS)) {
    if (region.code === code) {
      return {
        codes: [region.code],
        labels: [region.label],
        values: [region.value],
      };
    }

    for (const subregion of Object.values(region.subcategories)) {
      if (subregion.code === code) {
        return {
          codes: [region.code, subregion.code],
          labels: [region.label, subregion.label],
          values: [region.value, subregion.value],
        };
      }
    }
  }
  return { codes: [], labels: [], values: [] };
};


// ===== 4. 경로 얻기 =====
export const getRegionPathByValue = (value: string): { codes: number[]; labels: string[]; values: string[]; } => {
  return getRegionPath(getRegionByValue(value)?.code || 0);
};

// ===== 5. 계층별 목록 =====
export const getMainRegions = (): RegionItem[] => {
  return Object.values(STUDY_REGIONS).map((region) => ({
    code: region.code,
    label: region.label,
    value: region.value,
  }));
};

export const getSubRegions = (mainValue: string): RegionItem[] => {
  const region = Object.values(STUDY_REGIONS).find(
    (r) => r.value === mainValue
  );
  if (!region) return [];

  return Object.values(region.subcategories).map((sub) => ({
    code: sub.code,
    label: sub.label,
    value: sub.value,
  }));
};

// ===== 6. 레거시 호환 함수 (기존 코드 유지용) =====
export const getRegionLabelByCode = (code: number): string => {
  return getRegionByCode(code)?.label || "";
};

export const getSubregionLabelByCode = (code: number): string => {
  return getRegionByCode(code)?.label || "";
};

export const getMainRegion = (): { value: string; label: string }[] => {
  return getMainRegions().map((r) => ({ value: r.value, label: r.label }));
};

export const getSubRegion = (
  region: string
): { value: string; label: string }[] => {
  return getSubRegions(region).map((r) => ({ value: r.value, label: r.label }));
};

export const getRegionCodeByValue = (value: string): number => {
  return getRegionByValue(value)?.code || 0;
};

// ===== 7. 타입 내보내기 =====
export type { RegionItem };

