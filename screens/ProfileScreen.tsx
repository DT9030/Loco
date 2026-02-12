
import React, { useState } from 'react';
import { Post, UserProfile } from '../types';

interface ProfileScreenProps {
  profile: UserProfile;
  posts: Post[];
  onLogout: () => void;
  onUpdateProfile?: (data: Partial<UserProfile>) => Promise<void>;
  onDeletePost?: (id: string) => Promise<void>;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ profile, posts, onLogout, onUpdateProfile, onDeletePost }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ username: profile.username, city: profile.city });
  const userPosts = posts.filter(p => p.authorId === profile.uid);

  const handleUpdate = async () => {
    if (onUpdateProfile) await onUpdateProfile(editData);
    setIsEditing(false);
  };

  return (
    <div className="bg-white min-h-screen animate-in fade-in duration-300">
      <header className="pt-12 px-4 pb-4 border-b border-gray-100 flex justify-between items-center">
        <h1 className="text-xl font-black">My Profile</h1>
        <button onClick={onLogout} className="text-red-500 font-bold text-sm">Logout</button>
      </header>

      <div className="p-8 flex flex-col items-center">
        <div className="size-20 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4 border-2 border-primary">
          <span className="material-symbols-outlined text-4xl filled">person</span>
        </div>
        
        {isEditing ? (
          <div className="w-full space-y-2 text-center">
            <input 
              className="w-full text-center border-b border-gray-200 py-1 font-black text-xl focus:outline-none" 
              value={editData.username} 
              onChange={e => setEditData({...editData, username: e.target.value})}
            />
            <input 
              className="w-full text-center border-b border-gray-200 py-1 text-sm font-bold text-black/50" 
              value={editData.city} 
              onChange={e => setEditData({...editData, city: e.target.value})}
            />
            <div className="flex gap-2 justify-center mt-4">
              <button onClick={() => setIsEditing(false)} className="text-xs font-bold text-gray-400">Cancel</button>
              <button onClick={handleUpdate} className="text-xs font-bold text-primary">Save Changes</button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-black">@{profile.username}</h2>
            <p className="text-black/50 font-bold flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-sm">location_on</span>
              {profile.city}
            </p>
            <button onClick={() => setIsEditing(true)} className="mt-4 text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20 px-4 py-2 rounded-full">Edit Profile</button>
          </>
        )}
      </div>

      <div className="px-4">
        <h3 className="font-black text-sm uppercase tracking-widest text-black/30 mb-4">My Posts</h3>
        <div className="space-y-4 pb-20">
          {userPosts.map(post => (
            <div key={post.id} className="p-4 border border-gray-100 rounded-2xl relative group">
              <button 
                onClick={() => onDeletePost && onDeletePost(post.id)}
                className="absolute top-4 right-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span className="material-symbols-outlined text-xl">delete</span>
              </button>
              <h4 className="font-black text-black mb-1">{post.title}</h4>
              <p className="text-xs text-black/60 line-clamp-2">{post.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
