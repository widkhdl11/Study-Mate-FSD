import { queryMyStudies } from "@/entities/study";
import { PostCreateForm } from "@/features/post/create";
import { createClient } from "@/shared/api/supabase/server";
import { CustomUserAuth } from "@/shared/lib/auth";
import { Button } from "@/shared/shadcn/ui/button";
import { Card } from "@/shared/shadcn/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function PostCreatePage() {
  const supabase = await createClient();
  const { user } = await CustomUserAuth(supabase);
  const studiesPromise = queryMyStudies(supabase, user.id).then((res) => {
    if (!res.ok) notFound();
    return res.value;
  });
  return (
     <div className='flex min-h-screen items-center justify-center bg-paper px-4 py-8'>
            <div className='w-full max-w-2xl'>
                <div className='mb-8'>
                    <Link href='/'>
                        <Button variant='ghost' className='mb-4 gap-2 bg-transparent text-ink hover:bg-ink/5 hover:text-ink'>
                            <ArrowLeft className='w-4 h-4' />
                            홈으로
                        </Button>
                    </Link>
                    <h1 className='font-heading text-3xl font-normal text-ink'>모집글 작성</h1>
                    <p className='mt-2 text-sm text-ink-soft'>
                        내 스터디의 멤버를 모을 모집글을 작성해요
                    </p>
                </div>

                <Card className='bg-paper border-2 border-ink/15 shadow-soft p-6 md:p-8'>
                    <PostCreateForm studiesPromise={studiesPromise} />
                </Card>
            </div>
        </div>
  );
}
