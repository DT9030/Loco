
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  increment, 
  addDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  writeBatch,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import { Post, Comment, UserProfile } from '../types';

/**
 * SOCIAL: POST SAVING
 */
export const toggleSavePost = async (postId: string, userId: string, folderId: string = 'all') => {
  // Check if saved anywhere
  const saveId = `${postId}_${userId}`;
  const saveRef = doc(db, 'saved_items', saveId);
  const saveSnap = await getDoc(saveRef);
  
  if (saveSnap.exists()) {
    await deleteDoc(saveRef);
    return false;
  } else {
    await setDoc(saveRef, {
      postId,
      userId,
      savedAt: Date.now(),
      folderId: folderId
    });
    return true;
  }
};

export const deleteFolder = async (folderId: string, userId: string) => {
  const batch = writeBatch(db);
  
  // 1. Delete the folder doc
  const folderRef = doc(db, 'folders', folderId);
  batch.delete(folderRef);

  // 2. Find all saved items in this folder and delete them
  const q = query(collection(db, 'saved_items'), where('folderId', '==', folderId), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  snapshot.forEach((d) => {
    batch.delete(doc(db, 'saved_items', d.id));
  });

  await batch.commit();
};

/**
 * SOCIAL: COMMENT LIKES
 */
export const toggleCommentLike = async (commentId: string, userId: string) => {
  const likeId = `${commentId}_${userId}`;
  const likeRef = doc(db, 'commentLikes', likeId);
  const commentRef = doc(db, 'comments', commentId);
  
  const likeSnap = await getDoc(likeRef);
  const isLiking = !likeSnap.exists();

  const batch = writeBatch(db);
  if (isLiking) {
    batch.set(likeRef, { commentId, userId, createdAt: Date.now() });
    batch.update(commentRef, { likesCount: increment(1) });
  } else {
    batch.delete(likeRef);
    batch.update(commentRef, { likesCount: increment(-1) });
  }
  await batch.commit();
};

/**
 * SOCIAL: NESTED COMMENTS
 */
export const addComment = async (
  postId: string, 
  userId: string, 
  username: string, 
  text: string, 
  postAuthorId: string, 
  postTitle: string,
  parentId: string | null = null,
  parentAuthorId?: string
) => {
  const commentData = {
    postId,
    authorId: userId,
    authorName: username,
    text,
    createdAt: Date.now(),
    parentId,
    likesCount: 0
  };

  const docRef = await addDoc(collection(db, 'comments'), commentData);
  await updateDoc(doc(db, 'posts', postId), { comments: increment(1) });

  // Notification Logic
  let recipientId = parentId ? parentAuthorId : postAuthorId;
  const alertType = parentId ? 'reply' : 'comment';

  if (userId !== recipientId && recipientId) {
    await addDoc(collection(db, 'alerts'), {
      recipientId,
      triggeredBy: userId,
      senderName: username,
      type: alertType,
      postId,
      postTitle,
      commentId: docRef.id,
      isRead: false,
      createdAt: Date.now()
    });
  }

  return { id: docRef.id, ...commentData };
};

export const subscribeToComments = (postId: string, callback: (comments: Comment[]) => void) => {
  const q = query(
    collection(db, 'comments'), 
    where('postId', '==', postId)
  );
  return onSnapshot(q, (snapshot) => {
    const comments = snapshot.docs
      .map(d => ({ id: d.id, ...d.data() } as Comment))
      .sort((a, b) => a.createdAt - b.createdAt); // ASC
    callback(comments);
  });
};

/**
 * POST MANAGEMENT
 */
export const toggleLike = async (postId: string, userId: string, authorId: string, username: string, postTitle: string) => {
  const likeId = `${postId}_${userId}`;
  const likeRef = doc(db, 'likes', likeId);
  const postRef = doc(db, 'posts', postId);
  
  const likeSnap = await getDoc(likeRef);
  const isLiking = !likeSnap.exists();

  const batch = writeBatch(db);
  if (isLiking) {
    batch.set(likeRef, { postId, userId, createdAt: Date.now() });
    batch.update(postRef, { likes: increment(1) });
    if (userId !== authorId) {
      const alertRef = doc(collection(db, 'alerts'));
      batch.set(alertRef, {
        recipientId: authorId,
        triggeredBy: userId,
        senderName: username,
        type: 'like',
        postId,
        postTitle,
        isRead: false,
        createdAt: Date.now()
      });
    }
  } else {
    batch.delete(likeRef);
    batch.update(postRef, { likes: increment(-1) });
  }
  await batch.commit();
};

export const updateProfile = async (userId: string, data: Partial<UserProfile>) => {
  await updateDoc(doc(db, 'users', userId), data);
};

export const deletePost = async (postId: string, userId: string) => {
  const postRef = doc(db, 'posts', postId);
  const postSnap = await getDoc(postRef);
  
  if (postSnap.exists() && postSnap.data().authorId === userId) {
    await deleteDoc(postRef);
  }
};
