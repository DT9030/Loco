
import React, { useState } from 'react';
import { Post, UserProfile } from '../types';
import { getCurrentPosition } from '../services/locationService';
import { geohashForLocation } from 'geofire-common';

interface CreateScreenProps {
  onClose: () => void;
  onPost: (post: Post) => void;
  profile: UserProfile;
}

const CreateScreen: React.FC<CreateScreenProps> = ({ onClose, onPost, profile }) => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Coffee');
  const [loading, setLoading] = useState(false);
  
  const categories = ['Coffee', 'Food', 'Services', 'Parks', 'Safety'];

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;
    setLoading(true);

    try {
      const pos = await getCurrentPosition();
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const hash = geohashForLocation([lat, lng]);

      const newPost: any = {
        authorId: profile.uid,
        authorName: profile.username,
        author: { handle: profile.username },
        createdAt: Date.now(),
        title: title,
        content: content,
        likes: 0,
        comments: 0,
        category: selectedCategory,
        city: profile.city,
        location: { latitude: lat, longitude: lng },
        geohash: hash
      };

      onPost(newPost);
    } catch (e) {
      alert("Location access is required to post on LocalCircle.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col animate-in slide-in-from-bottom duration-300">
      <header className="flex items-center bg-white p-4 pb-2 justify-between sticky top-0 z-10 border-b border-gray-100">
        <button 
          onClick={onClose}
          className="size-10 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        <h2 className="text-lg font-bold flex-1 text-center">New Post</h2>
        <div className="w-10 flex justify-end">
          <button 
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim() || loading}
            className={`font-bold transition-opacity ${!title.trim() || !content.trim() || loading ? 'text-gray-300' : 'text-primary'}`}
          >
            {loading ? '...' : 'Post'}
          </button>
        </div>
      </header>

      <div className="flex flex-col flex-1 px-4 py-6 overflow-y-auto">
        <input 
          className="w-full border-none focus:ring-0 p-0 text-xl font-bold placeholder:text-gray-300 mb-4"
          placeholder="Give it a catchy title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea 
          className="w-full flex-1 resize-none border-none focus:ring-0 p-0 text-lg font-medium placeholder:text-gray-400 min-h-[200px]" 
          placeholder="What's happening in your neighborhood?"
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, 280))}
        />
      </div>

      <div className="pb-6">
        <h3 className="text-gray-400 text-xs font-bold uppercase px-4 pb-3 pt-4 tracking-wider">Select Category</h3>
        <div className="flex gap-3 px-4 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex h-10 shrink-0 items-center justify-center rounded-full px-5 transition-all ${
                selectedCategory === cat 
                  ? 'bg-primary text-white font-bold' 
                  : 'border border-gray-200 text-gray-600 font-medium'
              }`}
            >
              <span className="text-sm">{cat}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 border-t border-gray-50 bg-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-4">
            <button className="flex items-center justify-center size-12 rounded-full bg-gray-50 text-[#407b8f]">
              <span className="material-symbols-outlined">image</span>
            </button>
            <button className="flex items-center justify-center size-12 rounded-full bg-primary/10 text-primary">
              <span className="material-symbols-outlined filled">location_on</span>
            </button>
          </div>
          <div className="text-[#407b8f] text-sm font-medium">{280 - content.length} chars left</div>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={!title.trim() || !content.trim() || loading}
          className="w-full bg-primary disabled:bg-gray-200 py-4 rounded-full text-white font-bold text-lg shadow-lg shadow-primary/30 active:scale-[0.98] transition-all"
        >
          {loading ? 'Fetching location...' : 'Post Locally'}
        </button>
      </div>
    </div>
  );
};

export default CreateScreen;
