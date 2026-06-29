import { TablesInsert } from "@/types_db";
import { CreateStudyCommand } from "@/entities/study";
type StudyInsert = TablesInsert<"studies">;
export function buildStudyInsert(validatedData: CreateStudyCommand, userId: string): StudyInsert {
    return {
        title: validatedData.title,
        study_category: validatedData.studyCategory.toString(),
        region: validatedData.region.toString(),
        max_participants: validatedData.maxParticipants,
        description: validatedData.description,
        creator_id: userId,
    }
}