"use client";

import HeaderSection from "@/components/posts/HeaderSection";
import MainSection from "@/components/posts/MainSection";
import { PostsResponse } from "@/entities/post/model/types";
import { useSearchParams } from "next/navigation";

export default function PostsUI({ allPosts }: { allPosts: PostsResponse }) {
  
  const searchParams = useSearchParams()
  const search = searchParams.get("search")?.trim() ?? "";


  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1">
        {/* Header Section */}
        <HeaderSection />

        {/* Main Content */}
        <MainSection
          allPosts={allPosts}
          search={search}
        />
      </main>

    </div>
  );
}
