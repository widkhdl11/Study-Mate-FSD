// React Query 키 중앙 관리
export const queryKeys = {
  // 인증
  user: ["user"],
  myProfile: ["myProfile"],
  // 스터디
  studies: ["studies"],
  myStudies: ["myStudies"],
  study: (id: number) => ["studies", id],
  studyDetail: (id: number) => ["studies", "detail", id],
  // 게시글
  posts: ["posts"],
  post: (id: number) => ["posts", id],
  myPosts: ["myPosts"],
  myCreatedStudies: ["myCreatedStudies"],
  // 좋아요
  like: (postId: number) => ["like", postId],

  // 참여자
  participant: (studyId: number, userId?: string) =>
    ["participant", "status", studyId, userId ?? ""],
  /** 해당 스터디의 모든 참여자 상태 캐시 (accept/reject 시 prefix 매칭용) */
  participantByStudy: (studyId: number) => ["participant", "status", studyId],

  // 채팅
  chat: (id: number) => ["chats", id],
  chatMessages: (chatId: number) => ["chatMessages", chatId],
  myChatRooms: ["myChatRooms"],
  notifications: ["notifications"],
  notification: (userId: string) => ["notifications", userId],
  chatParticipants: (chatId: number) => ["chatParticipants", chatId],


  
  aiRecommendedPosts: ["ai-recommended-posts"] as const,
};

// export const queryKeys = {
//   posts: {
//     all: ["posts"],
//     myPosts: ["posts", "my"],
//     detail: (id: number) => ["posts", id],
//   },
//   studies: {
//     all: ["studies"],
//     myStudies: ["studies", "my"],
//     detail: (id: number) => ["studies", id],
//   },
// } as const;