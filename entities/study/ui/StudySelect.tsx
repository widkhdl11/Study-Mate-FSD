'use client'

import { getRegionPath } from "@/shared/config/region"
import { getCategoryPath } from "@/shared/config/study-category"
import { Badge } from "@/shared/shadcn/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/shadcn/ui/select"
import { studyStatusConversion } from "@/shared/lib/conversion/study"
import { MapPin, Tag, Users } from "lucide-react"
import Link from "next/link"
import { use } from "react"
import { StudyResponse } from "../model/types"

// 스터디를 고르는 controlled 컴포넌트.
// - rhf도 폼 타입도 모름. 필요한 것(value=studyId, onChange)만 받음.
// - 폼 바인딩(FormField/FormMessage)은 소비처(폼)의 책임.
// - 데이터는 promise를 use()로 풀어 Suspense 단위 유지.
type StudySelectProps = {
    studiesPromise: Promise<StudyResponse[]>;
    value: number | undefined;
    onChange: (id: number) => void;
    disabled?: boolean;
}

export default function StudySelect({
    studiesPromise,
    value,
    onChange,
    disabled,
}: StudySelectProps) {
    const studies = use(studiesPromise);
    const selectedStudy = studies.find((s) => s.id === Number(value));

    return (
        <>
            {studies?.length > 0 ? (
                <Select
                    value={
                        value === undefined || value === 0
                            ? undefined
                            : value.toString()
                    }
                    onValueChange={(v) => onChange(Number(v))}
                    disabled={disabled}>
                    <SelectTrigger>
                        <SelectValue placeholder='선택' />
                    </SelectTrigger>

                    <SelectContent>
                        {studies?.map((study) => (
                            <SelectItem
                                key={study.id}
                                value={study.id.toString()}
                                disabled={
                                    study.status === 'closed' ||
                                    study.status === 'completed'
                                }>
                                {study.title}
                                {study.status === 'closed' || study.status === 'completed' ?
                                    <Badge variant='outline' className='m-1'>
                                        {studyStatusConversion(study.status)}
                                    </Badge> :
                                    null
                                }
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            ) : (
                <div className='flex flex-col items-center justify-center'>
                    <div className='flex flex-col items-center justify-between h-full w-full'>
                        <p className='text-sm text-slate-500 dark:text-slate-400'>
                            스터디가 없습니다
                        </p>
                        <Link
                            href='/studies/create'
                            className='text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'>
                            스터디 만들기
                        </Link>
                    </div>
                </div>
            )}

            {selectedStudy && (
                <div className='mt-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30'>
                    <h4 className='text-sm font-semibold text-slate-900 dark:text-white mb-3'>
                        {selectedStudy.title}
                    </h4>
                    <div className='grid grid-cols-2 gap-3'>
                        <div className='flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400'>
                            <Tag className='w-4 h-4 text-blue-600 shrink-0' />
                            <span className='shrink-0'>카테고리</span>
                            <div className='flex items-center pr-2'>
                                {getCategoryPath(
                                    Number(selectedStudy.studyCategory)
                                ).labels.map((category) => (
                                    <Badge
                                        key={category}
                                        variant='secondary'
                                        className='m-auto'>
                                        {category}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        <div className='flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 w-full'>
                            <MapPin className='w-4 h-4 text-blue-600 shrink-0' />
                            <span className='shrink-0'>지역</span>
                            <div className='w-full flex justify-start shrink-1'>
                                {getRegionPath(
                                    Number(selectedStudy.region)
                                ).labels.map((region) => (
                                    <Badge
                                        key={region}
                                        variant='outline'
                                        className='m-1'>
                                        {region}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        <div className='flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 col-span-2'>
                            <Users className='w-4 h-4 text-blue-600' />
                            <span>모집 인원</span>
                            <span className='font-medium text-slate-900 dark:text-white'>
                                {selectedStudy.currentParticipants}/
                                {selectedStudy.maxParticipants}명
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
