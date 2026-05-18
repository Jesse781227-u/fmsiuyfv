export type User = {
  id: string;
  email: string;
  sisterName: string;
  plan: 'free' | 'private' | 'matchmaking';
  createdAt: string;
};

export type Reply = {
  id: string;
  sisterName: string;
  text: string;
  voiceBlob?: string;
  timestamp: string;
  reactions: Reactions;
  replies: Reply[];
};

export type Reactions = {
  heart: number;
  pray: number;
  relate: number;
  hug: number;
};

export type Spill = {
  id: string;
  text: string;
  voiceBlob?: string;
  sisterName: string;
  category: string;
  timestamp: string;
  reactions: Reactions;
  userReactions: { heart: boolean; pray: boolean; relate: boolean; hug: boolean };
  replies: Reply[];
  therapistResponse?: { text: string; timestamp: string };
  isPriority?: boolean;
};

export type PrivateMessage = {
  id: string;
  text: string;
  sender: 'user' | 'therapist';
  timestamp: string;
};

export type PriorityConfession = {
  id: string;
  text: string;
  sisterName: string;
  timestamp: string;
  therapistResponse?: { text: string; timestamp: string };
};

export type MatchmakingRequest = {
  id: string;
  userEmail: string;
  sisterName: string;
  ageRange: string;
  location: string;
  interests: string;
  dealbreakers: string;
  bio: string;
  status: 'pending' | 'matched' | 'closed';
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
};
