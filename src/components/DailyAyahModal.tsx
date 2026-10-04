import React, { useState } from 'react';
import { BookOpen, CheckCircle2, Volume2, Sparkles, X } from 'lucide-react';
import { DailyAyah } from '../types';
import { sound } from '../utils/audio';

interface DailyAyahModalProps {
  ayah: DailyAyah;
  onCompleted: () => void;
  isOpen: boolean;
  onClose?: () => void;
}

export const DailyAyahModal: React.FC<DailyAyahModalProps> = ({
  ayah,
  onCompleted,
  isOpen,
  onClose,
}) => {
  const [hasRecited, setHasRecited] = useState(false);

  if (!isOpen) return null;

  const handleReciteConfirm = () => {
    sound.playAyahChime();
    setHasRecited(true);
    setTimeout(() => {
      onCompleted();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-[#090e17] via-[#080d15] to-[#041a13] border border-emerald-500/30 rounded-[32px] p-6 sm:p-8 shadow-2xl shadow-emerald-950/60 text-slate-100">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-900 border border-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold">
              Daily Quranic Reflection (روزانہ کی قرآنی آیت)
            </span>
            <h3 className="text-sm font-semibold text-slate-200">
              {ayah.surah}
            </h3>
          </div>
        </div>

        {/* Arabic Calligraphy Card */}
        <div className="bg-[#05080f] border border-emerald-500/20 rounded-2xl p-6 text-center shadow-inner my-4">
          <p
            className="text-2xl sm:text-3xl text-emerald-300 leading-relaxed font-serif tracking-wide py-2"
            style={{ fontFamily: "'Amiri', serif" }}
            dir="rtl"
          >
            {ayah.arabic}
          </p>

          <p className="text-xs sm:text-sm text-emerald-400/80 italic font-mono mt-3">
            "{ayah.transliteration}"
          </p>
        </div>

        {/* Translations */}
        <div className="space-y-3 mb-6 text-sm">
          <div className="bg-[#05080f]/90 border border-emerald-900/40 rounded-2xl p-4">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
              Urdu Translation (اردو ترجمہ):
            </span>
            <p className="text-slate-200 leading-relaxed text-right font-serif text-base" dir="rtl">
              {ayah.urdu}
            </p>
          </div>

          <div className="bg-[#05080f]/90 border border-slate-800 rounded-2xl p-3.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              English Meaning:
            </span>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {ayah.english}
            </p>
          </div>

          {/* Spiritual Lesson */}
          <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
            <Sparkles className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <div>
              <strong className="text-emerald-200 block mb-0.5">Lesson For Student (سبق آموز نصیحت):</strong>
              {ayah.lesson}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleReciteConfirm}
          className="w-full py-3.5 px-6 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xl shadow-emerald-950/60 transition active:scale-98"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          Maine Tilawat Kar Li Aur Samajh Liya (Recited & Understood)
        </button>
      </div>
    </div>
  );
};
