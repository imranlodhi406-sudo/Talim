import React from 'react';
import { Clock, Check, X, ShieldCheck, Sun, Moon, Sunset } from 'lucide-react';
import { PrayerItem } from '../types';

interface NamazTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  prayers: PrayerItem[];
  activePrayer: string;
  onTogglePrayer: (prayerName: string) => void;
}

export const NamazTrackerModal: React.FC<NamazTrackerModalProps> = ({
  isOpen,
  onClose,
  prayers,
  activePrayer,
  onTogglePrayer,
}) => {
  if (!isOpen) return null;

  const getPrayerIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'fajr':
        return <Sunset className="w-5 h-5 text-amber-400 rotate-180" />;
      case 'dhuhr':
        return <Sun className="w-5 h-5 text-yellow-400" />;
      case 'asr':
        return <Sun className="w-5 h-5 text-amber-500" />;
      case 'maghrib':
        return <Sunset className="w-5 h-5 text-orange-400" />;
      default:
        return <Moon className="w-5 h-5 text-indigo-400" />;
    }
  };

  const offeredCount = prayers.filter((p) => p.offered).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#090e17] border border-emerald-500/30 rounded-[32px] p-6 sm:p-7 shadow-2xl text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-900 border border-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-emerald-500/20 text-amber-400 border border-amber-500/30">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">
              Namaz Timings & Daily Salah Tracker
            </h3>
            <p className="text-xs text-slate-400 font-serif">
              نماز کے اوقات اور روزانہ کی حاضری
            </p>
          </div>
        </div>

        {/* Progress Tracker Banner */}
        <div className="bg-[#05080f] border border-slate-800 rounded-2xl p-4 mb-5 flex items-center justify-between shadow-inner">
          <div>
            <span className="text-xs text-slate-400">Prayers Offered Today:</span>
            <div className="text-xl font-bold text-emerald-400">
              {offeredCount} / 5 Prayers
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
              {offeredCount === 5 ? 'MashaAllah! All Offered' : `${5 - offeredCount} Remaining`}
            </span>
          </div>
        </div>

        {/* Prayers List */}
        <div className="space-y-2.5 mb-6">
          {prayers.map((prayer) => {
            const isCurrent = activePrayer.toLowerCase().includes(prayer.name.toLowerCase());
            return (
              <div
                key={prayer.name}
                onClick={() => onTogglePrayer(prayer.name)}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  prayer.offered
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-slate-100'
                    : isCurrent
                    ? 'bg-amber-950/30 border-amber-500/50 shadow-md shadow-amber-900/10'
                    : 'bg-[#05080f] border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    {getPrayerIcon(prayer.name)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-100">
                        {prayer.name}
                      </span>
                      <span className="text-xs text-emerald-400 font-serif">
                        ({prayer.urduName})
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-semibold">
                          Current Waqt
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      Rakaat: {prayer.rakaat}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-semibold text-slate-300">
                    {prayer.time}
                  </span>

                  <button
                    type="button"
                    className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                      prayer.offered
                        ? 'bg-emerald-500 border-emerald-400 text-white shadow-sm'
                        : 'border-slate-700 hover:border-slate-500 text-transparent'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition shadow"
        >
          Save & Return to TaleemGuard
        </button>
      </div>
    </div>
  );
};
