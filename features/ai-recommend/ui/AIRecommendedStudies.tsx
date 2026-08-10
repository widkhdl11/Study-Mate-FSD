"use client";

import { useAIRecommendedPosts } from "../model/useAgent";
import { getRegionPath } from "@/shared/config/region";
import { getCategoryPath } from "@/shared/config/study-category";
import { Badge } from "@/shared/shadcn/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/shadcn/ui/card";
import { Loader2, MapPin, Sparkles, User } from "lucide-react";
import Link from "next/link";

export function AIRecommendedStudies() {
  const { data: recommendation, isLoading, error } = useAIRecommendedPosts();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI 추천 스터디
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">AI가 분석 중...</span>
        </CardContent>
      </Card>
    );
  }

  // 로그인 필요·추천 없음(신규 유저) 등이면 죽은 카드 대신 섹션 자체를 숨긴다.
  if (error || !recommendation || recommendation.posts.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          AI 추천 스터디
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {recommendation.summary}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendation.posts.map((rec, index) => (
          <Link 
            key={rec.id} 
            href={`/posts/${rec.id}`}
            className="block"
          >
            <div className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">
                      #{index + 1} 추천
                    </Badge>
                    {getCategoryPath(Number(rec.study?.studyCategory)).labels.map((category) => (
                        <Badge key={category} variant="outline" className={`text-xs font-normal`}>
                          {category}
                        </Badge>  
                      ))}
                  </div>
                  <h3 className="font-semibold">{rec.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {getRegionPath(Number(rec.study?.region)).labels.map((region) => (
                      <span key={region}>{region}</span>
                    ))}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <User className="w-3 h-3" /> {rec.author?.username}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}