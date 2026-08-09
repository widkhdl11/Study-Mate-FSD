import { queryMyChatRooms } from "@/entities/chat";
import { ProfileSection, TabSection } from "@/widgets/profile";
import { TabSectionSkeleton } from "@/shared/ui/skeleton";
import { queryMyPostsWithStudy } from "@/entities/post";
import { queryMyStudies } from "@/entities/study";
import { ProfileResponse, queryMyProfile, queryMyProfileCount } from "@/entities/user";
import { createClient } from "@/shared/api/supabase/server";
import { CustomUserAuth } from "@/shared/lib/auth";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default async function UserProfilePage() {
  const supabase = await createClient();
  const { user } = await CustomUserAuth(supabase);
  const profileData = await queryMyProfile(supabase, user.id);
  if (!profileData.ok) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1">
        <ProfileSection currentUser={profileData.value} />
        <Suspense fallback={<TabSectionSkeleton />}>
          <ProfileTabsLoader user={profileData.value} />
        </Suspense>
      </main>
    </div>
  );
}

async function ProfileTabsLoader({ user }: { user: ProfileResponse }) {
  const supabase = await createClient();
  const [postsData, studiesData, chatRoomsResult, profilesCountResult] = await Promise.all([
    queryMyPostsWithStudy(supabase, user.id),
    queryMyStudies(supabase, user.id),
    queryMyChatRooms(supabase, user.id),
    queryMyProfileCount(supabase, user.id),
  ]);

  if (!postsData.ok || !studiesData.ok || !chatRoomsResult.ok) {
    notFound();
  }

  // 카운트 쿼리 실패 시 조용한 0(로드실패↔진짜0 혼동)을 피하려고
  // 이미 성공적으로 불러온 실제 배열 길이로 폴백한다.
  const profilesCountData = profilesCountResult.ok
    ? profilesCountResult.value
    : {
        myPostsCount: postsData.value.length,
        myParticipatedStudiesCount: studiesData.value.length,
        myParticipatedChatRoomsCount: chatRoomsResult.value.length,
      };

  return (
    <TabSection
      chatRooms={chatRoomsResult.value}
      myPosts={postsData.value}
      myStudies={studiesData.value}
      currentUser={user}
      profilesCountData={profilesCountData}
    />
  );
}
