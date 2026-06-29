"use client";
import { User } from "@supabase/supabase-js";

export const convertUser = (user: User) => {
  return {
    id: user.id,
    username: user.user_metadata?.username,
    email: user.email,
    avatar_url: user.user_metadata?.avatar_url,
    joinedDate: new Date(user.created_at || "").toLocaleDateString(),
    initials: user.user_metadata?.initials,
    bio: user.user_metadata?.bio,
    birthDate: user.user_metadata?.birthDate,
    gender: user.user_metadata?.gender,
    points: user.user_metadata?.points,
    level: user.user_metadata?.level,
  };
};