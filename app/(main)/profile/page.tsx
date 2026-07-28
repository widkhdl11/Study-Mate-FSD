import { getMyChatRoomsSSR } from "@/actions/chatAction";
import { getMyProfilesCountSSR } from "@/actions/profileAction";
import { ProfileSection, TabSection } from "@/widgets/profile";
import { TabSectionSkeleton } from "@/components/skeleton";
import { queryMyPostsWithStudy } from "@/entities/post";
import { queryMyStudies } from "@/entities/study";
import { ProfileResponse, queryMyProfile } from "@/entities/user";
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
  const [postsData, studiesData, chatRoomsData, profilesCountData] = await Promise.all([
    queryMyPostsWithStudy(supabase, user.id),
    queryMyStudies(supabase, user.id),
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
