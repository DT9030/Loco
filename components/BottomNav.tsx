
import React from 'react';
import { ScreenType } from '../types';

interface BottomNavProps {
  activeScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  badgeCount?: number;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, onNavigate, badgeCount = 0 }) => {
  const navItems: { id: ScreenType; icon: string }[] = [
    { id: 'home', icon: 'home' },
    { id: 'alerts', icon: 'notifications' },
    { id: 'create', icon: 'add' },
    { id: 'collections', icon: 'bookmark' },
    { id: 'profile', icon: 'person' },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white/90 backdrop-blur-md border-t border-gray-100 px-2 pb-8 pt-4 z-[100]">
      <div className="flex items-center justify-between">
        {navItems.map((item) => {
          const isActive = activeScreen === item.id;
          
          if (item.id === 'create') {
            return (
              <div key={item.id} className="flex items-center justify-center flex-1">
                <button 
                  onClick={() => onNavigate(item.id)}
                  className="bg-primary size-12 rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/30 active:scale-95 transition-transform"
                >
                  <span className="material-symbols-outlined text-3xl font-bold">add</span>
                </button>
              </div>
            );
          }
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center justify-center flex-1 transition-colors h-12 relative ${isActive ? 'text-primary' : 'text-gray-400'}`}
            >
              <span className={`material-symbols-outlined text-[28px] ${isActive ? 'filled' : ''}`}>
                {item.icon}
              </span>
              {item.id === 'alerts' && badgeCount > 0 && (
                <span className="absolute top-1 right-1/4 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border-2 border-white">
                  {badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
