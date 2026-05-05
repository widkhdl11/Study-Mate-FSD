'use client'

import { ChatRoom } from '@/types/chatType'
import { PostsResponse } from '@/types/postType'
import { MyProfileCountResponse, ProfileResponse } from '@/types/profileType'
import { StudiesResponse } from '@/types/studiesType'
import { BookOpen, FileText, MessageSquare, User } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'
import MyChatTab from './info/my-chat-tab'
import MyInfoTab from './info/my-info-tab'
import MyPostTab from './info/my-post-tab'
import MyStudiesTab from './info/my-studies-tab'

const STATUS_COLORS: Record<string, string> = {
    '모집중': 'bg-green-500 text-white',
    '마감': 'bg-red-500 text-white',
}

const CATEGORY_COLORS: Record<string, string> = {
    프론트엔드: 'bg-blue-100 text-blue-700 border-blue-200',
    백엔드: 'bg-purple-100 text-purple-700 border-purple-200',
    AI: 'bg-amber-100 text-amber-700 border-amber-200',
    모바일: 'bg-green-100 text-green-700 border-green-200',
    디자인: 'bg-pink-100 text-pink-700 border-pink-200',
}

export default function TabSection({
    chatRooms,
    myPosts,
    myStudies,
    currentUser,
    profilesCountData,
}: {
    chatRooms: ChatRoom[]
    myPosts: PostsResponse
    myStudies: StudiesResponse
    currentUser: ProfileResponse
    profilesCountData: MyProfileCountResponse
}) {
    const searchParams = useSearchParams()
    const [currentTab, setCurrentTab] = useState(
        searchParams.get('tab') || 'info'
    )

    useEffect(() => {
        setCurrentTab(searchParams.get('tab') || 'info')
    }, [searchParams])

    const handleTabChange = (value: string) => {
        setCurrentTab(value)
        window.history.replaceState(null, '', `/profile?tab=${value}`)
    }

    const getStatusColor = (status: string) =>
        STATUS_COLORS[status] || 'bg-slate-500 text-white'

    const getCategoryColor = (category: string) =>
        CATEGORY_COLORS[category] || 'bg-slate-100 text-slate-700 border-slate-200'

    return (
        <section className='py-8 px-4 sm:px-6 lg:px-8'>
            <div className='max-w-5xl mx-auto'>
                {/* <div className='grid grid-cols-3 gap-4 mb-6'>
                    <div className='text-center p-3 bg-muted/50 rounded-lg'>
                        <p className='text-2xl font-bold text-foreground'>
                            {profilesCountData.my_participated_studies_count}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                            내 스터디
                        </p>
                    </div>
                    <div className='text-center p-3 bg-muted/50 rounded-lg'>
                        <p className='text-2xl font-bold text-foreground'>
                            {profilesCountData.my_posts_count}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                            모집글 ({profilesCountData.my_posts_count})
                        </p>
                    </div>
                    <div className='text-center p-3 bg-muted/50 rounded-lg'>
                        <p className='text-2xl font-bold text-foreground'>
                            {profilesCountData.my_participated_chat_rooms_count}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                            포인트
                        </p>
                    </div>
                </div> */}

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
                            채팅 ({profilesCountData.my_participated_chat_rooms_count})
                        </TabsTrigger>
                        <TabsTrigger value='posts' className='gap-2'>
                            <FileText className='w-4 h-4 hidden sm:inline' />
                            작성한 글 ({profilesCountData.my_posts_count})
                        </TabsTrigger>
                        <TabsTrigger value='studies' className='gap-2'>
                            <BookOpen className='w-4 h-4 hidden sm:inline' />내
                            스터디 ({profilesCountData.my_participated_studies_count})
                        </TabsTrigger>
                    </TabsList>

                    <MyInfoTab currentUser={currentUser} />
                    <MyChatTab chatRooms={chatRooms || []} />
                    <MyPostTab
                        myPosts={myPosts}
                        getStatusColor={getStatusColor}
                        getCategoryColor={getCategoryColor}
                    />
                    <MyStudiesTab
                        myStudies={myStudies}
                        getStatusColor={getStatusColor}
                        getCategoryColor={getCategoryColor}
                    />
                </Tabs>
            </div>
        </section>
    )
}
