import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Clock, 
  Heart, 
  MessageCircle, 
  Share2, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Camera, 
  Gamepad2, 
  Send, 
  ThumbsUp, 
  Smile, 
  AlertCircle 
} from 'lucide-react';
import { BlockedApp } from '../types';
import { sound } from '../utils/audio';

interface SimulatedAppViewProps {
  app: BlockedApp;
  onClose: () => void;
  remainingSeconds: number;
}

export const SimulatedAppView: React.FC<SimulatedAppViewProps> = ({
  app,
  onClose,
  remainingSeconds,
}) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'reels'>('feed');
  const [likes, setLikes] = useState<Record<string, number>>({ post1: 1420, post2: 890, post3: 3200 });
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  // Mini-game state for 'games'
  const [gameScore, setGameScore] = useState(0);
  const [gameRunning, setGameRunning] = useState(false);
  const [playerY, setPlayerY] = useState(50);

  // Format time remaining
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const toggleLike = (id: string) => {
    setLikedPosts((prev) => {
      const isCurrentlyLiked = !!prev[id];
      setLikes((l) => ({
        ...l,
        [id]: isCurrentlyLiked ? l[id] - 1 : l[id] + 1,
      }));
      return { ...prev, [id]: !isCurrentlyLiked };
    });
  };

  // Mini-game jump
  const handleGameJump = () => {
    if (!gameRunning) {
      setGameRunning(true);
      setGameScore(0);
      setPlayerY(30);
      return;
    }
    setPlayerY((prev) => Math.max(10, prev - 25));
    setGameScore((s) => s + 10);
  };

  useEffect(() => {
    if (!gameRunning) return;
    const interval = setInterval(() => {
      setPlayerY((prev) => {
        if (prev >= 80) return 80;
        return prev + 6;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [gameRunning]);

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col overflow-hidden select-none animate-in fade-in duration-200">
      {/* Top Floating Heads-up Session Bar */}
      <div className="bg-slate-950/90 backdrop-blur border-b border-slate-800 px-4 py-2.5 flex items-center justify-between z-20">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shadow"
            style={{ background: app.gradient }}
          >
            {app.name.charAt(0)}
          </div>
          <div>
            <span className="font-bold text-xs sm:text-sm text-slate-100 flex items-center gap-1.5">
              {app.name}
              <span className="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-1.5 py-0.2 rounded">
                Verified Unlocked
              </span>
            </span>
          </div>
        </div>

        {/* Floating 1-Hour Timer HUD */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-emerald-500/40 shadow-sm">
            <Clock className={`w-3.5 h-3.5 ${remainingSeconds < 300 ? 'text-rose-400 animate-spin' : 'text-emerald-400 animate-pulse'}`} />
            <span className={`font-mono text-xs font-bold ${remainingSeconds < 300 ? 'text-rose-400' : 'text-emerald-300'}`}>
              {timeFormatted} left
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title="Exit App"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* App Body Simulator */}
      <div className="flex-1 overflow-y-auto relative flex flex-col items-center justify-start bg-slate-950">
        
        {/* 1. TIKTOK SIMULATOR */}
        {app.id === 'tiktok' && (
          <div className="w-full max-w-sm h-full flex flex-col justify-between relative bg-neutral-900 border-x border-neutral-800">
            {/* Simulated Video Card */}
            <div className="relative flex-1 bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 flex flex-col justify-end p-5">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

              {/* Floating Action Buttons */}
              <div className="absolute right-3 bottom-20 flex flex-col items-center gap-5 z-10">
                <button
                  type="button"
                  onClick={() => toggleLike('post1')}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className={`p-2.5 rounded-full backdrop-blur transition ${likedPosts['post1'] ? 'bg-rose-500 text-white' : 'bg-black/50 text-white'}`}>
                    <Heart className={`w-6 h-6 ${likedPosts['post1'] ? 'fill-white' : ''}`} />
                  </div>
                  <span className="text-[11px] font-bold">{likes['post1']}</span>
                </button>

                <div className="flex flex-col items-center gap-1">
                  <div className="p-2.5 rounded-full bg-black/50 backdrop-blur text-white">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold">342</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <div className="p-2.5 rounded-full bg-black/50 backdrop-blur text-white">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold">120</span>
                </div>
              </div>

              {/* Video Info */}
              <div className="relative z-10 space-y-2 max-w-[80%]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">@talented_student</span>
                  <button className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500 font-bold">
                    Follow
                  </button>
                </div>
                <p className="text-xs text-slate-200">
                  "Study done! TaleemGuard AI cleared my Quadratic Equations test in 10 minutes 📚🎯 #StudyGoals #MatricPrep"
                </p>
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" /> Original Audio - StudyShield AI Vibes
                </div>
              </div>
            </div>

            {/* Bottom Nav */}
            <div className="h-12 bg-black border-t border-neutral-800 flex items-center justify-around text-xs text-neutral-400">
              <span className="text-white font-bold">Home</span>
              <span>Friends</span>
              <div className="w-8 h-6 bg-gradient-to-r from-cyan-400 to-rose-500 rounded-lg flex items-center justify-center text-black font-bold">
                +
              </div>
              <span>Inbox</span>
              <span>Profile</span>
            </div>
          </div>
        )}

        {/* 2. INSTAGRAM SIMULATOR */}
        {app.id === 'instagram' && (
          <div className="w-full max-w-sm h-full flex flex-col justify-between bg-black border-x border-neutral-800">
            {/* Top Bar */}
            <div className="p-3 border-b border-neutral-800 flex items-center justify-between">
              <span className="font-bold text-base tracking-tight font-serif">Instagram</span>
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5" />
                <MessageCircle className="w-5 h-5" />
              </div>
            </div>

            {/* Stories */}
            <div className="flex gap-3 p-3 overflow-x-auto border-b border-neutral-800/80">
              {['Your Story', 'hassan.pk', 'zainab_10', 'ali_science'].map((name, i) => (
                <div key={name} className="flex flex-col items-center gap-1 shrink-0">
                  <div className={`w-14 h-14 rounded-full p-0.5 ${i === 0 ? 'border border-slate-700' : 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600'}`}>
                    <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center text-xs font-bold">
                      {name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-300 truncate max-w-[60px]">{name}</span>
                </div>
              ))}
            </div>

            {/* Feed Post */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-xs font-bold">
                  TG
                </div>
                <span className="text-xs font-bold text-slate-200">taleemguard.official</span>
              </div>

              <div className="w-full h-64 bg-gradient-to-tr from-slate-900 to-indigo-950 rounded-2xl flex flex-col items-center justify-center p-6 text-center border border-slate-800">
                <span className="text-4xl mb-2">🏆</span>
                <h4 className="font-bold text-sm text-slate-100">Reward Session Active</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Enjoy your earned 1-hour screen time. Auto-lock engages when time expires!
                </p>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-4">
                  <button onClick={() => toggleLike('post2')}>
                    <Heart className={`w-5 h-5 ${likedPosts['post2'] ? 'text-rose-500 fill-rose-500' : ''}`} />
                  </button>
                  <MessageCircle className="w-5 h-5" />
                  <Send className="w-5 h-5" />
                </div>
              </div>
              <div className="text-xs font-bold">{likes['post2']} likes</div>
            </div>
          </div>
        )}

        {/* 3. FACEBOOK SIMULATOR */}
        {app.id === 'facebook' && (
          <div className="w-full max-w-sm h-full flex flex-col justify-between bg-slate-900 border-x border-slate-800">
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <span className="font-bold text-xl text-blue-500 tracking-tight">facebook</span>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs">🔍</div>
                <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs">💬</div>
              </div>
            </div>

            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs">U</div>
              <input
                type="text"
                placeholder="What's on your mind?"
                className="flex-1 bg-slate-900 border border-slate-800 rounded-full px-4 py-1.5 text-xs text-slate-200"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold">F</div>
                  <div>
                    <div className="text-xs font-bold">Federal Board Education Group</div>
                    <div className="text-[10px] text-slate-400">Sponsored • Just now</div>
                  </div>
                </div>
                <p className="text-xs text-slate-200">
                  Great job balancing your daily school studies and recreation time!
                </p>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-around text-xs text-slate-400">
                  <button onClick={() => toggleLike('post3')} className="flex items-center gap-1 hover:text-blue-400">
                    <ThumbsUp className={`w-4 h-4 ${likedPosts['post3'] ? 'text-blue-500 fill-blue-500' : ''}`} /> Like
                  </button>
                  <button className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> Comment</button>
                  <button className="flex items-center gap-1"><Share2 className="w-4 h-4" /> Share</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. SNAPCHAT SIMULATOR */}
        {app.id === 'snapchat' && (
          <div className="w-full max-w-sm h-full flex flex-col justify-between bg-black border-x border-neutral-800 relative">
            <div className="flex-1 bg-gradient-to-b from-slate-900 via-neutral-900 to-black flex flex-col items-center justify-center p-6 text-center">
              <div className="w-24 h-24 rounded-full border-4 border-yellow-400 flex items-center justify-center mb-4 bg-yellow-400/20 animate-pulse">
                <Camera className="w-12 h-12 text-yellow-400" />
              </div>

              <h3 className="text-base font-bold text-slate-100 mb-1">
                Snap Camera Viewfinder
              </h3>
              <p className="text-xs text-slate-400 max-w-xs">
                Streak saved! Your daily study quota is approved by TaleemGuard AI.
              </p>

              <div className="mt-8 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => sound.playScanBeep()}
                  className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition bg-white/20"
                >
                  <div className="w-12 h-12 rounded-full bg-white" />
                </button>
              </div>
            </div>

            <div className="h-14 bg-black border-t border-neutral-800 flex items-center justify-around text-xs text-neutral-400">
              <span>Map</span>
              <span>Chat</span>
              <span className="text-yellow-400 font-bold">Camera</span>
              <span>Stories</span>
              <span>Spotlight</span>
            </div>
          </div>
        )}

        {/* 5. GAMES SIMULATOR */}
        {app.id === 'games' && (
          <div className="w-full max-w-md h-full flex flex-col justify-between bg-slate-950 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">Battle Dash Mini Arcade</span>
                <div className="text-lg font-bold text-amber-400">
                  Score: {gameScore} pts
                </div>
              </div>
              <button
                type="button"
                onClick={handleGameJump}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow"
              >
                {gameRunning ? 'TAP TO JUMP 🚀' : 'START GAME ▶'}
              </button>
            </div>

            {/* Game Canvas Arena */}
            <div
              onClick={handleGameJump}
              className="flex-1 my-3 bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl relative overflow-hidden cursor-pointer"
            >
              {/* Star particles */}
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px]" />

              {/* Player Avatar */}
              <div
                className="absolute left-12 w-10 h-10 rounded-xl bg-emerald-500 border-2 border-white flex items-center justify-center text-lg shadow-lg shadow-emerald-500/50 transition-all duration-150"
                style={{ top: `${playerY}%` }}
              >
                🤖
              </div>

              {/* Obstacles */}
              <div className="absolute bottom-0 right-10 w-8 h-24 bg-rose-600 rounded-t-xl" />
              <div className="absolute top-0 right-32 w-8 h-20 bg-amber-600 rounded-b-xl" />

              <div className="absolute bottom-4 inset-x-0 text-center text-[11px] text-slate-400 pointer-events-none">
                Tap anywhere on screen to jump and dodge obstacles!
              </div>
            </div>

            <div className="text-center text-xs text-slate-400">
              🎮 Reward Gaming Session Active • Auto-lock engaging after 1 hour
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
