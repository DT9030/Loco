
import React, { useState, useEffect, useMemo } from 'react';
import { Post, CollectionFolder, SavedItem } from '../types';
import { db } from '../services/firebase';
import { deleteFolder } from '../services/api';
import { collection, query, where, onSnapshot, addDoc, doc } from 'firebase/firestore';

interface CollectionsScreenProps {
  posts: Post[];
  userId: string;
}

const CollectionsScreen: React.FC<CollectionsScreenProps> = ({ posts: globalPosts, userId }) => {
  const [folders, setFolders] = useState<CollectionFolder[]>([]);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string | 'all'>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    const folderQ = query(collection(db, 'folders'), where('userId', '==', userId));
    const itemQ = query(collection(db, 'saved_items'), where('userId', '==', userId));

    const unsubFolders = onSnapshot(folderQ, (s) => setFolders(s.docs.map(d => ({ id: d.id, ...d.data() } as CollectionFolder))));
    const unsubItems = onSnapshot(itemQ, (s) => setSavedItems(s.docs.map(d => ({ id: d.id, ...d.data() } as SavedItem))));

    return () => { unsubFolders(); unsubItems(); };
  }, [userId]);

  const displayedPosts = useMemo(() => {
    const savedPostIdsInFolder = activeFolderId === 'all' 
      ? savedItems.map(i => i.postId)
      : savedItems.filter(i => i.folderId === activeFolderId).map(i => i.postId);
    
    return globalPosts.filter(p => savedPostIdsInFolder.includes(p.id));
  }, [globalPosts, savedItems, activeFolderId]);

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    await addDoc(collection(db, 'folders'), {
      userId,
      name: newFolderName,
      createdAt: Date.now()
    });
    setNewFolderName('');
    setIsCreating(false);
  };

  const handleDeleteFolder = async () => {
    if (activeFolderId === 'all') return;
    if (window.confirm('Are you sure you want to delete this collection and all its bookmarks?')) {
      await deleteFolder(activeFolderId, userId);
      setActiveFolderId('all');
    }
  };

  return (
    <div className="bg-white min-h-screen animate-in fade-in duration-300 pb-20">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 pt-12">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-black">Collections</h1>
            {activeFolderId !== 'all' && (
              <button 
                onClick={handleDeleteFolder}
                className="text-red-400 size-8 flex items-center justify-center hover:bg-red-50 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">delete</span>
              </button>
            )}
          </div>
          <button 
            onClick={() => setIsCreating(true)}
            className="flex items-center justify-center size-10 rounded-full bg-primary/10 text-primary active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined font-black">create_new_folder</span>
          </button>
        </div>

        <div className="flex px-6 gap-8 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveFolderId('all')}
            className={`pb-4 pt-2 border-b-[3px] transition-all whitespace-nowrap text-sm font-black uppercase tracking-widest ${
              activeFolderId === 'all' ? 'border-primary text-primary' : 'border-transparent text-black/30'
            }`}
          >
            All Items
          </button>
          {folders.map(folder => (
            <button 
              key={folder.id}
              onClick={() => setActiveFolderId(folder.id)}
              className={`pb-4 pt-2 border-b-[3px] transition-all whitespace-nowrap text-sm font-black uppercase tracking-widest ${
                activeFolderId === folder.id ? 'border-primary text-primary' : 'border-transparent text-black/30'
              }`}
            >
              {folder.name}
            </button>
          ))}
        </div>
      </header>

      <main className="px-6 py-8 space-y-6">
        {displayedPosts.length > 0 ? (
          displayedPosts.map(post => (
            <div key={post.id} className="bg-white border border-gray-50 rounded-2xl p-5 shadow-sm flex gap-5 active:scale-[0.98] transition-transform">
              <div className="size-20 bg-gray-50 rounded-2xl shrink-0 flex items-center justify-center border border-gray-100">
                <span className="material-symbols-outlined text-gray-200 text-3xl">local_activity</span>
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">{post.category}</p>
                <h3 className="font-black text-black truncate text-base leading-tight">{post.title}</h3>
                <p className="text-xs text-black/50 line-clamp-2 mt-1 font-medium leading-relaxed">{post.content}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="py-24 text-center flex flex-col items-center">
            <div className="size-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-5xl text-gray-200">bookmark_add</span>
            </div>
            <p className="text-black font-black text-lg">Your collection is empty</p>
            <p className="text-gray-400 text-sm mt-2 max-w-[200px] font-medium leading-relaxed">Save local tips or recommendations to find them later.</p>
          </div>
        )}
      </main>

      {isCreating && (
        <div className="fixed inset-0 bg-black/60 z-[2000] flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-black mb-6">New Collection</h2>
            <input 
              autoFocus
              className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 mb-6 focus:ring-2 focus:ring-primary/50 text-black font-bold placeholder:text-gray-300"
              placeholder="e.g. Dream Coffee Shops"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
            />
            <div className="flex gap-4">
              <button 
                onClick={() => setIsCreating(false)}
                className="flex-1 py-4 text-black font-black text-sm uppercase tracking-widest"
              >
                Cancel
              </button>
              <button 
                onClick={createFolder}
                className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionsScreen;
