/**
 * entities/study — Public API (cross-slice 진입점)
 *
 * 외부 슬라이스(features/widgets/app)는 *이 파일만* import 한다.
 * 내부 부품은 노출하지 않는다:
 *   - construct, Study.fromRow/toRow/toInsertRow/toUpdateRow (객체에 포함되어 따라옴 — 직접 호출 금지)
 *   - StudyRow/StudyInsertRow/StudyUpdateRow/StudyFromRowError
 *   - Capacity, StudyStatus (내부 VO)
 *   - api/query/studyDetail/{row, toView}, StudyDetailCreatorView
 */

// ── 도메인 (aggregate + VO) ──
export { Study } from "./model/Study";
export type { StudyDeleteIntent, StudyError, StudyInsert } from "./model/Study";
export { StudyId } from "./model/StudyId";
export type { StudyIdError } from "./model/StudyId";

// ── 쓰기 (Repository / command) ──
export {
  createStudyWithHost, deleteStudy, findAllStudies, findStudyById, insertStudy,
  updateStudy
} from "./api/StudyRepository";
export type { StudyRepositoryError } from "./api/StudyRepository";

// ── 읽기 (Query) ──
export { queryMyStudies } from "./api/query/myStudies/queryMyStudies";
export type { QueryGetMyStudiesError } from "./api/query/myStudies/queryMyStudies";
export { queryStudyEditView } from "./api/query/queryStudyEditView";
export type { StudyEditView, StudyEditViewError } from "./api/query/queryStudyEditView";
export { queryRecruitingStudiesCount } from "./api/query/recruitingStudiesCount/queryRecruitingStudiesCount";
export { queryStudyDetail } from "./api/query/studyDetail/queryStudyDetail";
export type { QueryStudyDetailError } from "./api/query/studyDetail/queryStudyDetail";
export type { StudyDetailView } from "./api/query/studyDetail/types";


// ── UI  ──
export { StudyCapacityBar } from "./ui/StudyCapacityBar";
export { StudyCategoryBadges } from "./ui/StudyCategoryBadges";
export type { CategoryPath } from "./ui/StudyCategoryBadges";
export { default as StudyInfo } from "./ui/StudyInfo";
export { StudyRegionLabel } from "./ui/StudyRegionLabel";
export { default as StudySelect } from "./ui/StudySelect";
export { StudyStatusBadge } from "./ui/StudyStatusBadge";

// ── 공개 타입 ──
export type { StudyRecommendationView, StudyResponse } from "./model/types";

// ── 폼 스키마 ──
export { studyCreateSchema, studyUpdateSchema } from "./model/studyFormSchema";
export type {
  CreateStudyCommand, UpdateStudyCommand
} from "./model/studyFormSchema";

