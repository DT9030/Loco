
import React, { useState, useEffect } from 'react';
import { ScreenType, Post, Alert, UserProfile, CollectionFolder, SavedItem } from './types';
import HomeScreen from './screens/HomeScreen';
import AlertsScreen from './screens/AlertsScreen';
import CreateScreen from './screens/CreateScreen';
import CollectionsScreen from './screens/CollectionsScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoginScreen from './screens/LoginScreen';
import BottomNav from './components/BottomNav';
import { auth, db } from './services/firebase';
import * as api from './services/api';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, onSnapshot, orderBy, limit, doc, getDoc, setDoc, writeBatch, addDoc } from 'firebase/firestore';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [loading, setLoading] = useState(true);

  const [posts, setPosts] = useState<Post[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [folders, setFolders] = useState<CollectionFolder[]>([]);
  const [savedItemIds, setSavedItemIds] = useState<Set<string>>(new Set());
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Sync Global Feed
  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50));
    return onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Post)));
    });
  }, [currentUser]);

  // Sync Personal Alerts
  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, 'alerts'), 
      where('recipientId', '==', currentUser.uid)
    );
    return onSnapshot(q, (snapshot) => {
      const alertData = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() } as Alert))
        .sort((a, b) => b.createdAt - a.createdAt);
      
      setAlerts(alertData);
      setUnreadCount(alertData.filter(a => !a.isRead).length);
    });
  }, [currentUser]);

  // Sync My Likes & Saves
  useEffect(() => {
    if (!currentUser) return;
    const likesQ = query(collection(db, 'likes'), where('userId', '==', currentUser.uid));
    const savedQ = query(collection(db, 'saved_items'), where('userId', '==', currentUser.uid));
    const folderQ = query(collection(db, 'folders'), where('userId', '==', currentUser.uid));

    const unsubLikes = onSnapshot(likesQ, (s) => setLikedPostIds(new Set(s.docs.map(d => d.data().postId))));
    const unsubSaved = onSnapshot(savedQ, (s) => setSavedItemIds(new Set(s.docs.map(d => d.data().postId))));
    const unsubFolders = onSnapshot(folderQ, (s) => setFolders(s.docs.map(d => ({ id: d.id, ...d.data() } as CollectionFolder))));

    return () => { unsubLikes(); unsubSaved(); unsubFolders(); };
  }, [currentUser]);

  const handleToggleLike = async (postId: string) => {
    if (!currentUser || !userProfile) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    await api.toggleLike(postId, currentUser.uid, post.authorId, userProfile.username, post.title);
  };

  const handleSaveToFolder = async (postId: string, folderId: string) => {
    if (!currentUser) return;
    await api.toggleSavePost(postId, currentUser.uid, folderId);
  };

  const handleMarkAsRead = async () => {
    if (!currentUser || alerts.length === 0) return;
    const batch = writeBatch(db);
    alerts.forEach(alert => {
      if (!alert.isRead) batch.update(doc(db, 'alerts', alert.id), { isRead: true });
    });
    await batch.commit();
  };

  if (loading) return <div className="flex items-center justify-center h-screen bg-white"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  if (!currentUser) return <LoginScreen />;

  const renderScreen = () => {
    const postsWithMeta = posts.map(p => ({
      ...p,
      isLiked: likedPostIds.has(p.id),
      isSaved: savedItemIds.has(p.id)
    }));

    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen 
            posts={postsWithMeta} 
            toggleLike={handleToggleLike} 
            folders={folders}
            onSaveToFolder={handleSaveToFolder}
          />
        );
      case 'alerts':
        return <AlertsScreen alerts={alerts} onRead={handleMarkAsRead} />;
      case 'create':
        return (
          <CreateScreen 
            onClose={() => setCurrentScreen('home')} 
            onPost={(p) => addDoc(collection(db, 'posts'), p).then(() => setCurrentScreen('home'))} 
            profile={userProfile!} 
          />
        );
      case 'collections':
        return <CollectionsScreen posts={postsWithMeta} userId={currentUser.uid} />;
      case 'profile':
        return (
          <ProfileScreen 
            profile={userProfile!} 
            posts={postsWithMeta} 
            onLogout={() => auth.signOut()} 
            onUpdateProfile={(data) => api.updateProfile(currentUser.uid, data).then(() => setUserProfile(prev => prev ? {...prev, ...data} : null))}
            onDeletePost={(id) => api.deletePost(id, currentUser.uid)}
          />
        );
      default:
        return <HomeScreen posts={postsWithMeta} toggleLike={handleToggleLike} folders={folders} onSaveToFolder={handleSaveToFolder} />;
    }
  };

  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-white shadow-2xl relative flex flex-col overflow-hidden">
      <main className="flex-1 overflow-y-auto pb-24">{renderScreen()}</main>
      {currentScreen !== 'create' && <BottomNav activeScreen={currentScreen} onNavigate={setCurrentScreen} badgeCount={unreadCount} />}
    </div>
  );
};

export default App;
