import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Smartphone, 
  Globe, 
  Share2, 
  Download, 
  Sparkles, 
  Apple, 
  Chrome,
  ExternalLink
} from 'lucide-react';
import { sound } from '../utils/audio';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  sharedUrl: string;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  sharedUrl,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = sharedUrl || (typeof window !== 'undefined' ? window.location.href : '');

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    sound.playAccessGranted();
    setTimeout(() => setCopied(false), 2500);
  };

  // QR Code URL via safe open API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(currentUrl)}&color=10-185-129&bgcolor=5-8-15`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#090e17] border border-emerald-500/30 rounded-[32px] p-6 sm:p-8 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-900 border border-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5 border-b border-slate-800/80 pb-4">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30">
            <Globe className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              Free Publish & Mobile App Guide
            </h2>
            <p className="text-xs text-slate-400 font-serif">
              مفت پبلش کرنے اور موبائل پر اصلی ایپ کی طرح چلانے کا طریقہ
            </p>
          </div>
        </div>

        {/* Free Hosting Status Banner */}
        <div className="bg-[#05080f] border border-emerald-500/30 rounded-2xl p-4 mb-5 shadow-inner space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              100% Free Lifetime Hosting Active
            </span>
            <span className="text-[10px] bg-emerald-950 px-2 py-0.5 rounded-full text-emerald-300 border border-emerald-800 font-mono font-bold">
              LIVE ONLINE
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Aap ki ye app <strong>Google Cloud Run</strong> par bilkul <strong>مفت (100% Free)</strong> لائیو پبلش ہے۔ آپ کو کسی پلے اسٹور، ڈومین یا ہوسٹنگ کے پیسے دینے کی ضرورت نہیں ہے!
          </p>
        </div>

        {/* Shareable Link Box */}
        <div className="space-y-2 mb-6">
          <label className="block text-xs font-semibold text-slate-300">
            Aap Ka Permanent Free Live URL:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="flex-1 bg-[#05080f] border border-slate-700/80 rounded-2xl px-3.5 py-2.5 text-xs font-mono text-emerald-300 truncate focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition shadow-md active:scale-95 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copy Link
                </>
              )}
            </button>
          </div>
        </div>

        {/* QR Code & Mobile Install */}
        <div className="bg-[#05080f] border border-slate-800 rounded-3xl p-5 mb-5 flex flex-col sm:flex-row items-center gap-5 shadow-inner">
          <div className="p-2 bg-slate-950 rounded-2xl border border-emerald-500/30 shrink-0 shadow-lg">
            <img
              src={qrCodeUrl}
              alt="Scan to open on phone"
              className="w-32 h-32 rounded-xl"
            />
          </div>

          <div className="space-y-1.5 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Smartphone className="w-4 h-4" />
              Scan with Phone Camera
            </div>
            <h4 className="text-sm font-bold text-slate-100">
              Apne Mobile Par Direct Kholein
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Apne mobile ka camera is QR code par karein ya ooper wala link WhatsApp/Chrome par open karein.
            </p>
          </div>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="space-y-3 mb-6">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Mobile Screen Par Asal App Ki Tarah Lagane Ka Tareeqa (3 Steps):
          </h4>

          {/* Android */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
            <div className="font-bold text-emerald-300 flex items-center gap-1.5">
              <Chrome className="w-4 h-4 text-emerald-400" />
              Android Mobile (Samsung, Infinix, Vivo, Xiaomi, Oppo):
            </div>
            <ol className="list-decimal list-inside text-slate-300 space-y-1 pl-1 text-[11px]">
              <li>Chrome browser mein ooper wala link open karein.</li>
              <li>Ooper dain taraf <strong>3 dots (⋮)</strong> par tap karein.</li>
              <li><strong>"Install App"</strong> ya <strong>"Add to Home screen"</strong> par click karein.</li>
              <li>App icon mobile screen par WhatsApp aur TikTok ki tarah ban jayegi!</li>
            </ol>
          </div>

          {/* iPhone */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
            <div className="font-bold text-sky-300 flex items-center gap-1.5">
              <Apple className="w-4 h-4 text-sky-400" />
              iPhone / iPad (iOS Safari):
            </div>
            <ol className="list-decimal list-inside text-slate-300 space-y-1 pl-1 text-[11px]">
              <li>Safari browser mein link open karein.</li>
              <li>Neeche <strong>Share button (تیر والا نشان)</strong> par click karein.</li>
              <li>Scroll karke <strong>"Add to Home Screen"</strong> par tap karein.</li>
            </ol>
          </div>
        </div>

        {/* Free GitHub / Vercel Option */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
          <strong className="text-slate-200 block">Apni Custom Domain (Vercel / Render):</strong>
          <p>
            Yeh poora code open-source hai. Agar aap apna custom naam (jaise <code>mytaleemguard.vercel.app</code>) banana chahte hain to AI Studio ke <strong>"Export to GitHub"</strong> button se Vercel par 1 click mein 100% free deploy kar sakte hain!
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition shadow"
        >
          Close Guide
        </button>
      </div>
    </div>
  );
};
