import React from 'react';
import { 
  Lock, 
  Unlock, 
  Clock, 
  Wifi, 
  Battery, 
  ShieldCheck, 
  BookOpen, 
  Compass, 
  Settings,
  Sparkles,
  Signal
} from 'lucide-react';
import { BlockedApp } from '../types';

interface PhoneSimulatorProps {
  apps: BlockedApp[];
  isSessionUnlocked: boolean;
  remainingSeconds: number;
  onAppClick: (app: BlockedApp) => void;
  onOpenAyahModal: () => void;
  onOpenNamazModal: () => void;
  onOpenStudyHearing: () => void;
  onOpenParentPortal: () => void;
  currentTimeString: string;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  apps,
  isSessionUnlocked,
  remainingSeconds,
  onAppClick,
  onOpenAyahModal,
  onOpenNamazModal,
  onOpenStudyHearing,
  onOpenParentPortal,
  currentTimeString,
}) => {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Calculate percentage of 60 mins remaining
  const percentageLeft = Math.min(100, Math.max(0, (remainingSeconds / 3600) * 100));

  return (
    <div className="relative w-full max-w-[340px] sm:max-w-[360px] mx-auto aspect-[9/19] min-h-[640px] max-h-[800px] bg-[#070b12] rounded-[48px] p-3.5 shadow-2xl border-[8px] border-slate-800/90 shadow-emerald-950/60 flex flex-col justify-between overflow-hidden select-none">
      {/* Outer Metallic & Glass Bezel Glare */}
      <div className="absolute inset-0 rounded-[40px] pointer-events-none border border-slate-700/40 shadow-inner" />
      <div className="absolute -top-32 -left-32 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Dynamic Island / Notch */}
      <div className="relative z-30 pt-1 pb-1.5 flex items-center justify-between px-5 text-[11px] font-semibold text-slate-300">
        <span className="font-mono tracking-tight">{currentTimeString || '10:30'}</span>
        
        {/* Dynamic Island pill */}
        <div className="w-24 h-5 rounded-full bg-black border border-slate-800 flex items-center justify-center gap-1.5 px-2 shadow-inner">
          <div className={`w-2 h-2 rounded-full ${isSessionUnlocked ? 'bg-emerald-400' : 'bg-rose-500'} animate-pulse`} />
          <span className="text-[9px] font-mono font-bold text-slate-200">
            {isSessionUnlocked ? '1h Pass' : 'Locked'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400">
          <Signal className="w-3 h-3 text-slate-300" />
          <Wifi className="w-3 h-3 text-slate-300" />
          <Battery className="w-3.5 h-3.5 text-emerald-400" />
        </div>
      </div>

      {/* Lock Status Live Widget */}
      <div className="relative z-20 px-2 pt-2">
        <div
          className={`p-3.5 rounded-3xl border transition-all duration-300 shadow-lg ${
            isSessionUnlocked
              ? 'bg-gradient-to-r from-emerald-950/90 via-slate-950 to-teal-950/90 border-emerald-500/40 text-emerald-200'
              : 'bg-gradient-to-r from-rose-950/90 via-slate-950 to-slate-950 border-rose-500/40 text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 font-bold text-xs">
              {isSessionUnlocked ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">1-Hour Pass Active</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                  <span className="text-rose-400">Strict Lock Active</span>
                </>
              )}
            </div>

            {isSessionUnlocked ? (
              <div className="flex items-center gap-1 bg-emerald-900/60 px-2 py-0.5 rounded-full border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-300">
                <Clock className="w-3 h-3 text-emerald-400" />
                {timeFormatted}
              </div>
            ) : (
              <span className="text-[10px] text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded-full border border-rose-800/80 font-semibold">
                Daily Study Req.
              </span>
            )}
          </div>

          {/* Progress bar for 1-hour session */}
          {isSessionUnlocked && (
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden my-1.5 border border-emerald-900/50">
              <div
                className="bg-gradient-to-r from-emerald-400 to-teal-400 h-full rounded-full transition-all duration-1000"
                style={{ width: `${percentageLeft}%` }}
              />
            </div>
          )}

          <p className="text-[11px] leading-snug text-slate-300">
            {isSessionUnlocked
              ? `AI study verified! 1 hour timer running. Apps auto-relock at 00:00.`
              : `TikTok, Insta, Snapchat & Games locked until today's study & math copy is verified!`}
          </p>

          {!isSessionUnlocked && (
            <button
              type="button"
              onClick={onOpenStudyHearing}
              className="mt-2.5 w-full py-2 px-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/60 transition active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" /> Start Daily AI Study Hearing
            </button>
          )}
        </div>
      </div>

      {/* Main Home Screen Grid */}
      <div className="relative z-10 flex-1 px-3 py-3 flex flex-col justify-around">
        {/* Monitored Apps Grid */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1 text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300">
              Target Apps ({apps.filter((a) => a.isMonitored).length})
            </span>
            <span className="text-[10px] text-emerald-400/90 font-serif">
              نگرانی شدہ ایپس
            </span>
          </div>

          <div className="grid grid-cols-4 gap-y-4 gap-x-2 text-center">
            {apps.map((app) => {
              const isLocked = app.isMonitored && !isSessionUnlocked;
              return (
                <div
                  key={app.id}
                  onClick={() => onAppClick(app)}
                  className="group flex flex-col items-center cursor-pointer transition-transform active:scale-90"
                >
                  <div className="relative">
                    {/* App Icon Container */}
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-200 group-hover:scale-105 border border-white/10"
                      style={{ background: app.gradient }}
                    >
                      <span className="text-xl font-black text-white drop-shadow">
                        {app.name === 'TikTok' ? '🎵' : 
                         app.name === 'Instagram' ? '📸' : 
                         app.name === 'Facebook' ? '🌐' : 
                         app.name === 'Snapchat' ? '👻' : '🎮'}
                      </span>
                    </div>

                    {/* Padlock status bubble */}
                    {app.isMonitored ? (
                      <div
                        className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-md border ${
                          isLocked
                            ? 'bg-rose-600 border-rose-300 text-white shadow-rose-950/80'
                            : 'bg-emerald-500 border-emerald-300 text-white shadow-emerald-950/80'
                        }`}
                      >
                        {isLocked ? <Lock className="w-3 h-3 stroke-[2.5]" /> : <Unlock className="w-3 h-3 stroke-[2.5]" />}
                      </div>
                    ) : (
                      <div className="absolute -top-1 -right-1 px-1 rounded-full bg-slate-800 text-[8px] text-slate-400 border border-slate-700">
                        OFF
                      </div>
                    )}
                  </div>

                  <span className="text-[11px] font-semibold text-slate-200 mt-1.5 truncate max-w-[64px]">
                    {app.name}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">
                    {isLocked ? 'Locked' : isSessionUnlocked ? 'Open' : 'Free'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Islamic Routine & Educational Utilities */}
        <div className="bg-[#0b1019]/90 border border-emerald-500/20 rounded-3xl p-3 my-1.5 backdrop-blur shadow-inner">
          <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-2">
            <span>Islamic Routine</span>
            <span className="font-serif">دینی معمولات</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onOpenAyahModal}
              className="p-2.5 rounded-2xl bg-slate-950/90 hover:bg-slate-900 border border-emerald-900/60 hover:border-emerald-500/50 text-left transition flex items-center gap-2 group shadow-sm"
            >
              <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-slate-200">Daily Ayah</div>
                <div className="text-[10px] text-slate-400 truncate">آیت اور نصیحت</div>
              </div>
            </button>

            <button
              type="button"
              onClick={onOpenNamazModal}
              className="p-2.5 rounded-2xl bg-slate-950/90 hover:bg-slate-900 border border-amber-900/60 hover:border-amber-500/50 text-left transition flex items-center gap-2 group shadow-sm"
            >
              <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 group-hover:scale-105 transition">
                <Compass className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-slate-200">Namaz Timings</div>
                <div className="text-[10px] text-slate-400 truncate">نماز کے اوقات</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Phone Dock */}
      <div className="relative z-20 pb-2">
        <div className="bg-[#0b1019]/90 backdrop-blur border border-slate-800/80 rounded-3xl p-2 flex items-center justify-around shadow-xl">
          <button
            type="button"
            onClick={onOpenStudyHearing}
            className="flex flex-col items-center gap-0.5 group px-4 py-1"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition">
              <ShieldCheck className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-bold text-emerald-300">Study AI</span>
          </button>

          <button
            type="button"
            onClick={onOpenParentPortal}
            className="flex flex-col items-center gap-0.5 group px-4 py-1"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-700 via-purple-700 to-indigo-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] font-bold text-indigo-300">Parents</span>
          </button>
        </div>

        {/* Home gesture bar */}
        <div className="w-28 h-1 bg-slate-500 rounded-full mx-auto mt-2 opacity-60" />
      </div>
    </div>
  );
};
