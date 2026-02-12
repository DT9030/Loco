
import { Post, Alert, CollectionItem } from './types';

export const MOCK_POSTS: Post[] = [
  {
    id: '1',
    authorId: 'user_1',
    authorName: 'local_expert',
    author: { handle: 'local_expert', isExpert: true },
    timeAgo: '2h ago',
    createdAt: Date.now() - 7200000,
    title: 'Best coffee shop for working?',
    content: 'Looking for a quiet spot with good Wi-Fi and plenty of outlets around SoHo. Any suggestions for a long afternoon session?',
    imageUrl: 'https://picsum.photos/seed/coffee/600/400',
    likes: 24,
    comments: 8,
    isSaved: true,
    category: 'Coffee',
    city: 'SoHo'
  },
  {
    id: '2',
    authorId: 'user_2',
    authorName: 'foodie_nyc',
    author: { handle: 'foodie_nyc' },
    timeAgo: '5h ago',
    createdAt: Date.now() - 18000000,
    title: 'Found the best tacos on Prince St!',
    content: 'The al pastor is a must-try. Long lines but moves fast! They also have a secret spicy salsa if you ask. 🌮',
    likes: 156,
    comments: 12,
    isLiked: true,
    category: 'Food',
    city: 'SoHo'
  },
  {
    id: '3',
    authorId: 'user_3',
    authorName: 'newbie_soho',
    author: { handle: 'newbie_soho' },
    timeAgo: '8h ago',
    createdAt: Date.now() - 28800000,
    title: 'Dog-friendly parks nearby?',
    content: "Just moved in with my golden retriever. Any good spots that aren't too crowded in the mornings?",
    likes: 5,
    comments: 3,
    category: 'Parks',
    city: 'SoHo'
  }
];

export const MOCK_ALERTS: Alert[] = [
  {
    id: '1',
    recipientId: 'current_user_id',
    senderName: 'User123',
    type: 'like',
    postTitle: 'Best coffee near downtown...',
    timeAgo: '2m ago',
    isRead: false,
    createdAt: Date.now() - 120000
  },
  {
    id: '2',
    recipientId: 'current_user_id',
    senderName: 'LocalExpert',
    type: 'reply',
    postTitle: 'Reliable plumbing services...',
    timeAgo: '15m ago',
    isRead: true,
    createdAt: Date.now() - 900000
  },
  {
    id: '3',
    recipientId: 'current_user_id',
    senderName: 'CommunityBot',
    type: 'like', // Changed from upvote to like
    postTitle: 'North Hill Area',
    timeAgo: '1h ago',
    isRead: true,
    createdAt: Date.now() - 3600000
  },
  {
    id: '4',
    recipientId: 'current_user_id',
    senderName: 'Sarah_J',
    type: 'milestone', // Changed from follow to milestone
    timeAgo: '3h ago',
    isRead: true,
    createdAt: Date.now() - 10800000
  },
  {
    id: '5',
    recipientId: 'current_user_id',
    senderName: 'System',
    type: 'milestone',
    message: 'Your post reached 50 views! Great job helping the community.',
    timeAgo: 'Yesterday',
    isRead: true,
    createdAt: Date.now() - 86400000
  }
];

export const MOCK_COLLECTIONS: CollectionItem[] = [
  {
    id: 'c1',
    category: 'Dining',
    location: 'Downtown',
    title: 'Best Pizza in Downtown?',
    description: '"Try Joe\'s on 5th for authentic thin crust. Highly recommend the truffle honey..."',
    dateSaved: 'Oct 12, 2023',
    imageUrl: 'https://picsum.photos/seed/pizza/100/100'
  },
  {
    id: 'c2',
    category: 'Services',
    location: 'Northside',
    title: 'Looking for a reliable plumber',
    description: '"Found an amazing service that fixed our leak in under an hour. Ask for Mike."',
    dateSaved: 'Oct 10, 2023',
    imageUrl: 'https://picsum.photos/seed/tools/100/100'
  },
  {
    id: 'c3',
    category: 'Outdoors',
    location: 'West Park',
    title: 'Hidden hiking trails nearby',
    description: '"The trail behind the old library isn\'t on Google Maps but it\'s gorgeous in the fall."',
    dateSaved: 'Oct 05, 2023',
    imageUrl: 'https://picsum.photos/seed/forest/100/100'
  }
];
