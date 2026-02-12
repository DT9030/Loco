
import React, { useEffect } from 'react';
import { Alert } from '../types';

interface AlertsScreenProps {
  alerts: Alert[];
  onRead: () => void;
}

const AlertsScreen: React.FC<AlertsScreenProps> = ({ alerts, onRead }) => {
  useEffect(() => {
    // Mark alerts as read when screen is opened
    onRead();
  }, []);

  return (
    <div className="bg-white min-h-screen animate-in fade-in duration-300 pt-12">
      <header className="pt-4 px-4 sticky top-0 bg-white z-20 border-b border-gray-50">
        <div className="flex items-center justify-between py-3 mb-2">
          <div className="w-10"></div>
          <h1 className="text-lg font-bold text-black">Alerts</h1>
          <button className="w-10 flex justify-end text-black">
            <span className="material-symbols-outlined text-2xl">settings</span>
          </button>
        </div>
        <div className="flex gap-8 px-4">
          <button className="pb-3 pt-2 border-b-[3px] border-primary text-black font-bold">
            <span className="text-sm font-black">Activity</span>
          </button>
        </div>
      </header>

      <div className="divide-y divide-gray-50 pb-20">
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <AlertItem key={alert.id} alert={alert} />
          ))
        ) : (
          <div className="p-20 text-center">
            <span className="material-symbols-outlined text-6xl text-black/10 mb-4">notifications_off</span>
            <p className="text-black font-bold">No activity yet</p>
            <p className="text-black/40 text-sm mt-1 font-medium">We'll notify you when someone interacts with your posts.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const AlertItem: React.FC<{ alert: Alert }> = ({ alert }) => {
  const getIcon = () => {
    switch (alert.type) {
      case 'like': return { name: 'favorite', color: 'bg-primary/10 text-primary', filled: true };
      case 'comment': return { name: 'chat_bubble', color: 'bg-slate-100 text-black/60', filled: false };
      default: return { name: 'notifications', color: 'bg-slate-100 text-black/60', filled: false };
    }
  };

  const icon = getIcon();

  return (
    <div className={`flex items-start gap-4 px-4 py-5 transition-colors ${!alert.isRead ? 'bg-primary/5' : 'bg-white hover:bg-slate-50'}`}>
      <div className={`flex items-center justify-center rounded-full shrink-0 h-11 w-11 ${icon.color}`}>
        <span className={`material-symbols-outlined ${icon.filled ? 'filled' : ''}`}>{icon.name}</span>
      </div>
      <div className="flex flex-col flex-1 gap-0.5">
        <p className="text-sm leading-snug text-black font-medium">
          <span className="font-black">@{alert.senderName} </span>
          {alert.type === 'like' && 'liked your post '}
          {alert.type === 'comment' && 'commented on your post '}
          {alert.postTitle && (
            <span className="text-black/60 font-bold italic">"{alert.postTitle}"</span>
          )}
          {alert.message}
        </p>
        <p className={`text-[12px] font-bold ${!alert.isRead ? 'text-primary' : 'text-black/30'}`}>
          {alert.timeAgo || 'Recently'}
        </p>
      </div>
      {!alert.isRead && <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>}
    </div>
  );
};

export default AlertsScreen;
