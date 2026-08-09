'use client'

import { getRegionPath } from "@/shared/config/region"
import { getCategoryPath } from "@/shared/config/study-category"
import { studyStatusConversion } from "@/shared/lib/conversion/study"
import { Badge } from "@/shared/shadcn/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/shadcn/ui/select"
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

                    {/* align=start: 트리거 좌측 기준 정렬(기본 center는 선택값 길이에 따라 좌우로 들쭉날쭉).
                        폭은 클램프하지 않아 드롭다운이 내용만큼 우측으로 늘어난다. */}
                    <SelectContent align='start'>
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
                        <p className='text-sm text-muted-foreground'>
                            스터디가 없습니다
                        </p>
                        <Link
                            href='/studies/create'
                            className='text-sm text-primary hover:text-primary/80'>
                            스터디 만들기
                        </Link>
                    </div>
                </div>
            )}

            {selectedStudy && (
                <div className='mt-3 rounded-lg border border-primary/20 bg-primary/5 p-4'>
                    <h4 className='text-sm font-semibold text-foreground mb-3'>
                        {selectedStudy.title}
                    </h4>
                    <div className='grid grid-cols-2 gap-3'>
                        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                            <Tag className='w-4 h-4 text-primary shrink-0' />
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
                        <div className='flex items-center gap-2 text-sm text-muted-foreground w-full'>
                            <MapPin className='w-4 h-4 text-primary shrink-0' />
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
                        <div className='flex items-center gap-2 text-sm text-muted-foreground col-span-2'>
                            <Users className='w-4 h-4 text-primary' />
                            <span>모집 인원</span>
                            <span className='font-medium text-foreground'>
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
