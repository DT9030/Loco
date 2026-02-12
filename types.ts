
export type ScreenType = 'home' | 'alerts' | 'create' | 'collections' | 'profile' | 'login' | 'register';

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  city: string;
  postCount: number;
  bio?: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  author: { handle: string; isExpert?: boolean };
  timeAgo: string;
  createdAt: number;
  title: string;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
  isSaved?: boolean;
  category: string;
  city: string;
  geohash?: string;
  location?: { latitude: number; longitude: number };
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: number;
  parentId: string | null;
  likesCount: number;
  isLiked?: boolean;
}

export interface Alert {
  id: string;
  recipientId: string;
  senderName: string;
  type: 'like' | 'comment' | 'reply' | 'milestone';
  postId?: string;
  postTitle?: string;
  commentId?: string;
  message?: string;
  isRead: boolean;
  createdAt: number;
  timeAgo?: string;
}

export interface CollectionFolder {
  id: string;
  userId: string;
  name: string;
  createdAt: number;
}

export interface SavedItem {
  id: string;
  userId: string;
  folderId: string;
  postId: string;
  savedAt: number;
}

// Added to resolve import error in constants.ts
export interface CollectionItem {
  id: string;
  category: string;
  location: string;
  title: string;
  description: string;
  dateSaved: string;
  imageUrl: string;
}
