"use client";

import { ProfileResponse } from "@/entities/user";
import { formatDateToInput, formatGender } from "@/shared/lib/format";
import { Card } from "@/shared/shadcn/ui/card";
import { TabsContent } from "@/shared/shadcn/ui/tabs";

export default function MyInfoTab({ currentUser }: { currentUser: ProfileResponse }) {
  return (
    <>
      <TabsContent value="info" className="space-y-6">
        <Card className="p-6 bg-paper border-2 border-ink/15 rounded-xl shadow-soft">
          <h2 className="font-heading text-xl font-normal text-ink mb-6">계정 정보</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-ink/5 rounded-lg">
                <p className="text-sm text-ink-soft mb-1">닉네임</p>
                <p className="text-lg font-semibold text-ink">
                  {currentUser?.username}
                </p>
              </div>
              <div className="p-4 bg-ink/5 rounded-lg">
                <p className="text-sm text-ink-soft mb-1">이메일</p>
                <p className="text-lg font-semibold text-ink">
                  {currentUser?.email}
                </p>
              </div>
              <div className="p-4 bg-ink/5 rounded-lg">
                <p className="text-sm text-ink-soft mb-1">생년월일</p>
                <p className="text-lg font-semibold text-ink">
                  {currentUser?.birthDate}
                </p>
              </div>
              <div className="p-4 bg-ink/5 rounded-lg">
                <p className="text-sm text-ink-soft mb-1">성별</p>
                <p className="text-lg font-semibold text-ink">
                  {formatGender(currentUser?.gender || "")}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-paper border-2 border-ink/15 rounded-xl shadow-soft">
          <h2 className="font-heading text-xl font-normal text-ink mb-6">회원 정보</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-ink/5 rounded-lg">
              <p className="text-sm text-ink-soft mb-1">가입일</p>
              <p className="text-lg font-semibold text-ink">
                {formatDateToInput(new Date(currentUser?.createdAt || ""))}
              </p>
            </div>
          </div>
        </Card>
      </TabsContent>
    </>
  );
}
