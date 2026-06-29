import { getMyChatRoomsSSR } from "@/actions/chatAction";
import { getMyProfilesCountSSR } from "@/actions/profileAction";
import ProfileSection from "@/components/profile/ProfileSection";
import TabSection from "@/components/profile/TabSection";
import { TabSectionSkeleton } from "@/components/skeleton";
import { queryMyPostsWithStudy } from "@/entities/post/api/query/postsWithStudy/queryMyPostsWithStudy";
import { queryGetMyStudies } from "@/entities/study/api/query/getMyStudies/queryGetMyStudies";
import { ProfileResponse } from "@/entities/user";
import { queryMyProfile } from "@/entities/user/api/query/myProfile/queryMyProfile";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default async function UserProfilePage() {
  const profileData = await queryMyProfile();
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
  const [postsData, studiesData, chatRoomsData, profilesCountData] = await Promise.all([
    queryMyPostsWithStudy(),
    queryGetMyStudies(),
    getMyChatRoomsSSR(),
    getMyProfilesCountSSR(),
  ]);

  if (!postsData.ok || !studiesData.ok) {
    notFound();
  }


  return (
    <TabSection
      chatRooms={chatRoomsData}
      myPosts={postsData.value}
      myStudies={studiesData.value}
      currentUser={user}
      profilesCountData={profilesCountData}
    />
  );
}
