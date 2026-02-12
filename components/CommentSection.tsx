
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Comment } from '../types';
import { toggleCommentLike, addComment, subscribeToComments } from '../services/api';
import { auth, db } from '../services/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface CommentSectionProps {
  postId: string;
  postTitle: string;
  postAuthorId: string;
  onClose: () => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId, postTitle, postAuthorId, onClose }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [likedCommentIds, setLikedCommentIds] = useState<Set<string>>(new Set());
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const userId = auth.currentUser?.uid;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return subscribeToComments(postId, setComments);
  }, [postId]);

  useEffect(() => {
    if (!userId) return;
    const q = query(collection(db, 'commentLikes'), where('userId', '==', userId));
    return onSnapshot(q, (s) => setLikedCommentIds(new Set(s.docs.map(d => d.data().commentId))));
  }, [userId]);

  const threadedComments = useMemo(() => {
    const root = comments.filter(c => !c.parentId);
    const replies = comments.filter(c => !!c.parentId);
    
    return root.map(parent => ({
      ...parent,
      isLiked: likedCommentIds.has(parent.id),
      replies: replies.filter(r => r.parentId === parent.id).map(r => ({
        ...r,
        isLiked: likedCommentIds.has(r.id)
      }))
    }));
  }, [comments, likedCommentIds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !userId) return;

    const username = auth.currentUser?.displayName || 'Neighbor';
    
    await addComment(
      postId, 
      userId, 
      username, 
      text, 
      postAuthorId, 
      postTitle, 
      replyTo?.id || null,
      replyTo?.authorId
    );

    setText('');
    setReplyTo(null);
  };

  const handleReplyClick = (comment: Comment) => {
    setReplyTo(comment);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Drawer Indicator */}
      <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mt-3 shrink-0"></div>

      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 shrink-0">
        <h3 className="font-black text-lg">Comments</h3>
        <button onClick={onClose} className="size-10 flex items-center justify-center hover:bg-gray-50 rounded-full transition-colors">
          <span className="material-symbols-outlined text-black font-black">close</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 pb-32 no-scrollbar">
        {threadedComments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="size-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-4xl text-gray-200">chat_bubble_outline</span>
            </div>
            <p className="text-black font-black text-base">No comments yet</p>
            <p className="text-gray-400 text-sm mt-1 font-medium leading-relaxed">Join the neighborhood conversation.</p>
          </div>
        ) : (
          threadedComments.map(comment => (
            <div key={comment.id} className="space-y-6">
              <CommentItem 
                comment={comment} 
                onReply={() => handleReplyClick(comment)} 
                isReply={false}
              />
              {comment.replies.map(reply => (
                <div key={reply.id} className="ml-10 pl-5 border-l-2 border-gray-50">
                  <CommentItem 
                    comment={reply} 
                    onReply={() => handleReplyClick(comment)} 
                    isReply={true}
                  />
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Input Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 pt-4 pb-12 z-[1100]">
        {replyTo && (
          <div className="flex items-center justify-between bg-primary/5 px-5 py-2.5 rounded-t-2xl text-[11px] border-x border-t border-primary/10 animate-in slide-in-from-bottom-2">
            <p className="font-black text-primary">Replying to <span className="font-black">@{replyTo.authorName}</span></p>
            <button onClick={() => setReplyTo(null)} className="material-symbols-outlined text-sm text-primary font-black">close</button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex gap-4">
          <div className="flex-1">
            <input 
              ref={inputRef}
              className={`w-full bg-gray-50 border-none rounded-full py-4 px-6 text-sm font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-primary/40 transition-all ${replyTo ? 'rounded-tl-none' : ''}`}
              placeholder={replyTo ? "Write a reply..." : "Share your thoughts..."}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={!text.trim()}
            className="bg-primary size-14 rounded-full flex items-center justify-center text-white shadow-xl shadow-primary/30 active:scale-90 transition-transform disabled:opacity-30 disabled:grayscale"
          >
            <span className="material-symbols-outlined font-black text-2xl">send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

const CommentItem: React.FC<{ comment: any; onReply: () => void; isReply: boolean }> = ({ comment, onReply, isReply }) => {
  const userId = auth.currentUser?.uid;

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) return;
    toggleCommentLike(comment.id, userId);
  };

  return (
    <div className="group animate-in fade-in slide-in-from-left-4 duration-300">
      <div className="flex gap-4">
        <div className={`shrink-0 flex items-center justify-center font-black rounded-full text-white border-2 border-white shadow-sm ${isReply ? 'size-7 text-[10px] bg-slate-300' : 'size-9 text-[13px] bg-primary'}`}>
          {comment.authorName?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-black text-sm text-black tracking-tight">@{comment.authorName}</span>
            <span className="text-[10px] text-gray-300 font-black uppercase">now</span>
          </div>
          <p className="text-sm text-black leading-relaxed font-medium mb-3">{comment.text}</p>
          <div className="flex items-center gap-6">
            <button 
              onClick={onReply} 
              className="text-[10px] font-black uppercase tracking-widest text-black/40 hover:text-primary transition-colors"
            >
              Reply
            </button>
            <div className="flex items-center gap-2 text-black/20">
              <span className="text-[10px] font-black uppercase tracking-widest">{comment.likesCount || 0} likes</span>
            </div>
          </div>
        </div>
        <button 
          onClick={handleLike} 
          className={`shrink-0 flex items-center justify-center self-start pt-2 transition-all active:scale-150 ${comment.isLiked ? 'text-primary' : 'text-gray-100 hover:text-gray-200'}`}
        >
          <span className={`material-symbols-outlined text-[20px] ${comment.isLiked ? 'filled' : ''}`}>favorite</span>
        </button>
      </div>
    </div>
  );
};

export default CommentSection;
