
import React, { useState, useMemo, useEffect } from 'react';
import { Post, CollectionFolder } from '../types';
import { getNearbyPosts, getCurrentPosition } from '../services/locationService';
import CommentSection from '../components/CommentSection';

interface HomeScreenProps {
  posts: Post[];
  toggleLike: (id: string) => void;
  folders: CollectionFolder[];
  onSaveToFolder: (postId: string, folderId: string) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ posts: globalPosts, toggleLike, folders, onSaveToFolder }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationError, setLocationError] = useState(false);
  const [nearbyPosts, setNearbyPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePostForComments, setActivePostForComments] = useState<Post | null>(null);
  const [postToSave, setPostToSave] = useState<Post | null>(null);

  useEffect(() => {
    const fetchNearby = async () => {
      try {
        const pos = await getCurrentPosition();
        const results = await getNearbyPosts([pos.coords.latitude, pos.coords.longitude]);
        setNearbyPosts(results as Post[]);
      } catch (e) {
        setLocationError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchNearby();
  }, []);

  const mergedNearbyPosts = useMemo(() => {
    return nearbyPosts.map(nearby => {
      const globalMatch = globalPosts.find(p => p.id === nearby.id);
      return globalMatch ? globalMatch : nearby;
    });
  }, [nearbyPosts, globalPosts]);

  const filteredPosts = useMemo(() => {
    const feed = mergedNearbyPosts;
    if (!searchQuery.trim()) return feed;
    return feed.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [mergedNearbyPosts, searchQuery]);

  const handleSaveIconClick = (post: Post) => {
    if (post.isSaved) {
      // Direct unsave if already saved
      onSaveToFolder(post.id, 'all');
    } else {
      // Show folder selection
      setPostToSave(post);
    }
  };

  const confirmSave = (folderId: string) => {
    if (postToSave) {
      onSaveToFolder(postToSave.id, folderId);
      setPostToSave(null);
    }
  };

  if (locationError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <span className="material-symbols-outlined text-6xl text-gray-200 mb-4">location_off</span>
        <h2 className="text-xl font-black mb-2">Location access required</h2>
        <p className="text-gray-400 text-sm mb-6">LocalCircle only works when we know which neighborhood you are in. Please enable location in your settings.</p>
        <button onClick={() => window.location.reload()} className="bg-primary text-white font-bold px-8 py-3 rounded-full">Try Again</button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300 min-h-screen pb-20">
      <header className="bg-white/90 backdrop-blur-md pt-12 pb-2 px-4 sticky top-0 z-30 border-b border-gray-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">location_on</span>
            <h1 className="text-black text-lg font-bold">Nearby Feed</h1>
          </div>
          <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-black">person</span>
          </div>
        </div>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-black/20">search</span>
          <input 
            className="w-full bg-slate-100 border-none rounded-full py-3 pl-12 pr-5 text-sm text-black font-medium focus:ring-2 focus:ring-primary/30" 
            placeholder="Search local questions..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <main className="px-4 py-6 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="size-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-xs font-black text-gray-300 uppercase tracking-widest">Scanning Neighborhood...</p>
          </div>
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              onLike={() => toggleLike(post.id)}
              onSave={() => handleSaveIconClick(post)}
              onOpenComments={() => setActivePostForComments(post)}
            />
          ))
        ) : (
          <div className="py-20 text-center">
            <span className="material-symbols-outlined text-5xl text-gray-100 mb-4">explore</span>
            <p className="text-gray-400 font-bold">No posts found nearby.</p>
          </div>
        )}
      </main>

      {/* Save to Collection Modal */}
      {postToSave && (
        <div className="fixed inset-0 z-[1500] bg-black/60 flex items-end animate-in fade-in duration-300">
          <div className="w-full bg-white rounded-t-[2.5rem] p-8 pb-12 animate-in slide-in-from-bottom duration-500 max-w-[480px] mx-auto">
            <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-6"></div>
            <h3 className="text-xl font-black mb-6">Save to Collection</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar">
              <button 
                onClick={() => confirmSave('all')}
                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors"
              >
                <div className="size-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                  <span className="material-symbols-outlined">bookmarks</span>
                </div>
                <span className="font-black text-base flex-1 text-left">All Items</span>
                <span className="material-symbols-outlined text-gray-300">chevron_right</span>
              </button>
              {folders.map(folder => (
                <button 
                  key={folder.id}
                  onClick={() => confirmSave(folder.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors"
                >
                  <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">folder</span>
                  </div>
                  <span className="font-black text-base flex-1 text-left">{folder.name}</span>
                  <span className="material-symbols-outlined text-gray-300">chevron_right</span>
                </button>
              ))}
            </div>
            <button 
              onClick={() => setPostToSave(null)}
              className="w-full mt-6 py-4 rounded-2xl border-2 border-slate-100 font-black text-sm uppercase tracking-widest text-slate-400 active:scale-95 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Global Comment Overlay */}
      {activePostForComments && (
        <div className="fixed inset-0 z-[1000] bg-black/60 animate-in fade-in duration-300 backdrop-blur-sm">
          <div className="absolute inset-x-0 bottom-0 h-[92vh] bg-white rounded-t-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-500">
            <CommentSection 
              postId={activePostForComments.id} 
              postTitle={activePostForComments.title} 
              postAuthorId={activePostForComments.authorId} 
              onClose={() => setActivePostForComments(null)} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

const PostCard: React.FC<{ post: Post; onLike: () => void; onSave: () => void; onOpenComments: () => void }> = ({ post, onLike, onSave, onOpenComments }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm active:scale-[0.99] transition-transform duration-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="size-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black border-2 border-white shadow-sm">
          {post.authorName?.[0]?.toUpperCase() || 'N'}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-black">@{post.authorName}</p>
            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-bold text-black/40 uppercase">Neighbor</span>
          </div>
          <p className="text-[10px] text-black/30 font-bold uppercase tracking-tight">Just now • {post.city}</p>
        </div>
        <button className="material-symbols-outlined text-gray-300">more_horiz</button>
      </div>
      
      <h3 className="text-lg font-black mb-2 text-black leading-tight">{post.title}</h3>
      <p className="text-black/70 text-sm mb-5 leading-relaxed font-medium">{post.content}</p>
      
      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
        <div className="flex items-center gap-8">
          <button 
            onClick={onLike} 
            className={`flex items-center gap-2 transition-all active:scale-150 ${post.isLiked ? 'text-primary' : 'text-black/40'}`}
          >
            <span className={`material-symbols-outlined text-[24px] ${post.isLiked ? 'filled' : ''}`}>favorite</span>
            <span className="text-xs font-black">{post.likes}</span>
          </button>
          <button 
            onClick={onOpenComments} 
            className="flex items-center gap-2 text-black/40 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">chat_bubble</span>
            <span className="text-xs font-black">{post.comments}</span>
          </button>
        </div>
        <button 
          onClick={onSave} 
          className={`transition-all active:scale-150 ${post.isSaved ? 'text-primary' : 'text-black/40'}`}
        >
          <span className={`material-symbols-outlined text-[24px] ${post.isSaved ? 'filled' : ''}`}>bookmark</span>
        </button>
      </div>
    </div>
  );
};

export default HomeScreen;
