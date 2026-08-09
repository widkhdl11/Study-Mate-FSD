'use client'

import { MyChatRoomView } from '@/entities/chat'
import { MyPostWithStudyView } from '@/entities/post'
import { StudyResponse } from '@/entities/study'
import { MyProfileCountResponse, ProfileResponse } from '@/entities/user'
import { Tabs, TabsList, TabsTrigger } from '@/shared/shadcn/ui/tabs'
import { BookOpen, FileText, MessageSquare, User } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import MyChatTab from '../info/my-chat-tab'
import MyInfoTab from '../info/my-info-tab'
import MyPostTab from '../info/my-post-tab'
import MyStudiesTab from '../info/my-studies-tab'

export default function TabSection({
    chatRooms,
    myPosts,
    myStudies,
    currentUser,
    profilesCountData,
}: {
    chatRooms: MyChatRoomView[]
    myPosts: MyPostWithStudyView[]
    myStudies: StudyResponse[] | []
    currentUser: ProfileResponse
    profilesCountData: MyProfileCountResponse
}) {
    const searchParams = useSearchParams()
    const urlTab = searchParams.get('tab') || 'info'   // 지금 URL 값 (매 렌더 새로 읽음)

    const [currentTab, setCurrentTab] = useState(
        urlTab
    )
    const [prevTab, setPrevTab] = useState(urlTab)

    // URL이 (클릭 외의 진짜 네비게이션으로) 바뀌면 탭 동기화. urlTab↔prevTab로 비교해야 수렴.
    if (urlTab !== prevTab) {
        setPrevTab(urlTab)
        setCurrentTab(urlTab)
    }


    const handleTabChange = (value: string) => {
        setCurrentTab(value)
        // pushState라 뒤로가기가 프로필을 벗어나지 않고 이전 탭으로 복원된다.
        window.history.pushState(null, '', `/profile?tab=${value}`)
    }

    // 뒤로/앞으로 가기(popstate)로 URL이 바뀌면 탭 동기화.
    // (수동 pushState는 useSearchParams를 갱신하지 않아 popstate를 직접 듣는다)
    useEffect(() => {
        const onPop = () => {
            const t = new URLSearchParams(window.location.search).get('tab') || 'info'
            setCurrentTab(t)
            setPrevTab(t)
        }
        window.addEventListener('popstate', onPop)
        return () => window.removeEventListener('popstate', onPop)
    }, [])

    return (
        <section className='py-8 px-4 sm:px-6 lg:px-8'>
            <div className='max-w-5xl mx-auto'>
                <Tabs
                    value={currentTab}
                    onValueChange={handleTabChange}
                    className='space-y-6'>
                    <TabsList className='grid w-full grid-cols-2 sm:grid-cols-4 lg:w-auto lg:inline-flex'>
                        <TabsTrigger value='info' className='gap-2'>
                            <User className='w-4 h-4 hidden sm:inline' />내 정보
                        </TabsTrigger>
                        <TabsTrigger value='chats' className='gap-2'>
                            <MessageSquare className='w-4 h-4 hidden sm:inline' />
                            채팅 ({profilesCountData.myParticipatedChatRoomsCount})
                        </TabsTrigger>
                        <TabsTrigger value='posts' className='gap-2'>
                            <FileText className='w-4 h-4 hidden sm:inline' />
                            작성한 글 ({profilesCountData.myPostsCount})
                        </TabsTrigger>
                        <TabsTrigger value='studies' className='gap-2'>
                            <BookOpen className='w-4 h-4 hidden sm:inline' />내
                            스터디 ({profilesCountData.myParticipatedStudiesCount})
                        </TabsTrigger>
                    </TabsList>

                    <MyInfoTab currentUser={currentUser} />
                    <MyChatTab chatRooms={chatRooms || []} />
                    <MyPostTab myPosts={myPosts} />
                    <MyStudiesTab myStudies={myStudies} />
                </Tabs>
            </div>
        </section>
    )
}
