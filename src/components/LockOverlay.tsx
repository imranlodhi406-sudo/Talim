import React from 'react';
import { Lock, ShieldAlert, GraduationCap, KeyRound, X, AlertTriangle } from 'lucide-react';
import { BlockedApp } from '../types';

interface LockOverlayProps {
  isOpen: boolean;
  app: BlockedApp | null;
  onClose: () => void;
  onOpenStudyHearing: () => void;
  onOpenParentPortal: () => void;
  isExpiredTimer?: boolean;
}

export const LockOverlay: React.FC<LockOverlayProps> = ({
  isOpen,
  app,
  onClose,
  onOpenStudyHearing,
  onOpenParentPortal,
  isExpiredTimer = false,
}) => {
  if (!isOpen || !app) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#090e17] via-[#090c14] to-[#1a0a10] border border-rose-500/40 rounded-[32px] p-6 sm:p-8 shadow-2xl shadow-rose-950/80 text-center text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-900 border border-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Glowing Lock Ring */}
        <div className="relative inline-block mb-4">
          <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border-2 border-rose-500/60 flex items-center justify-center mx-auto shadow-2xl shadow-rose-600/50">
            <Lock className="w-10 h-10 text-rose-400 animate-pulse stroke-[2.5]" />
          </div>
          <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-slate-900 border border-rose-500 text-rose-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1 mb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
            {isExpiredTimer ? '1-Hour Allowance Finished' : 'TaleemGuard AI Shield'}
          </span>
          <h2 className="text-2xl font-black text-slate-100">
            {app.name} Is Locked
          </h2>
          <p className="text-xs text-rose-300/90 font-serif" dir="rtl">
            یہ ایپ بغیر پڑھائی سنانے کے نہیں کھل سکتی!
          </p>
        </div>

        {/* Message */}
        <div className="bg-[#05080f] border border-rose-950 rounded-2xl p-4 text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 space-y-2 text-left">
          {isExpiredTimer ? (
            <p className="font-medium text-rose-300">
              Aap ka <strong>1 ghante (60 minutes)</strong> ka screen time pura ho gaya hai! Rule ke mutabiq app automatically dobara lock ho gayi hai.
            </p>
          ) : (
            <p className="font-medium text-slate-200">
              Jab tak aap parh na lo aur TaleemGuard AI aap ka daily ka school/academy ka kaam na sun le aur math ki copy check na kar le, tab tak <span className="text-rose-400 font-bold">{app.name}</span> bilkul nahi khul sakti!
            </p>
          )}

          <div className="pt-1 text-[11px] text-slate-400 border-t border-slate-900 font-serif text-right" dir="rtl">
            پہلے درسی کتاب کے سوالات کے جوابات دیں، پھر تفریح کی اجازت ہو گی!
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenStudyHearing();
            }}
            className="w-full py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/60 transition flex items-center justify-center gap-2 active:scale-95"
          >
            <GraduationCap className="w-5 h-5 text-emerald-200" />
            AI Ko Aaj Ka Parhai Ka Kaam Sunao
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenParentPortal();
            }}
            className="w-full py-3 px-4 rounded-2xl font-semibold text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 transition flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4 text-amber-400" />
            Mummy / Daddy Biometrics & Password
          </button>
        </div>
      </div>
    </div>
  );
};
