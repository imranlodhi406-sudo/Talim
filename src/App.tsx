import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Clock, 
  BookOpen, 
  GraduationCap, 
  Fingerprint, 
  AlertTriangle, 
  CheckCircle, 
  Flame, 
  HeartHandshake, 
  Sparkles, 
  Sliders, 
  Smartphone, 
  LayoutDashboard,
  Volume2,
  Calendar,
  Layers,
  Camera,
  Globe
} from 'lucide-react';
import { BlockedApp, DailyAyah, PrayerItem, StudyAuditLog } from './types';
import { PhoneSimulator } from './components/PhoneSimulator';
import { LockOverlay } from './components/LockOverlay';
import { DailyAyahModal } from './components/DailyAyahModal';
import { NamazTrackerModal } from './components/NamazTrackerModal';
import { StudyHearingModal } from './components/StudyHearingModal';
import { ParentPortalModal } from './components/ParentPortalModal';
import { SimulatedAppView } from './components/SimulatedAppView';
import { PublishModal } from './components/PublishModal';
import { sound } from './utils/audio';

export default function App() {
  // Target apps as requested by user with persistent storage
  const [apps, setApps] = useState<BlockedApp[]>(() => {
    const saved = localStorage.getItem('taleemguard_apps_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return [
      {
        id: 'tiktok',
        name: 'TikTok',
        iconName: 'music',
        color: '#010101',
        gradient: 'linear-gradient(135deg, #000000 0%, #161823 50%, #25F4EE 100%)',
        isMonitored: true,
        description: 'Short video scrolling & entertainment',
        category: 'Video',
      },
      {
        id: 'instagram',
        name: 'Instagram',
        iconName: 'instagram',
        color: '#E1306C',
        gradient: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
        isMonitored: true,
        description: 'Reels, stories, posts & DM chat',
        category: 'Social',
      },
      {
        id: 'facebook',
        name: 'Facebook',
        iconName: 'facebook',
        color: '#1877F2',
        gradient: 'linear-gradient(135deg, #1877f2 0%, #0d5ec4 100%)',
        isMonitored: true,
        description: 'Social networking & video feed',
        category: 'Social',
      },
      {
        id: 'snapchat',
        name: 'Snapchat',
        iconName: 'camera',
        color: '#FFFC00',
        gradient: 'linear-gradient(135deg, #fffc00 0%, #f5d800 100%)',
        isMonitored: true,
        description: 'Streaks, snaps & camera filters',
        category: 'Social',
      },
      {
        id: 'games',
        name: 'Games',
        iconName: 'gamepad-2',
        color: '#8A2387',
        gradient: 'linear-gradient(135deg, #ff416c 0%, #8a2387 100%)',
        isMonitored: true,
        description: 'Free Fire, Subway Surfers, Battle games',
        category: 'Gaming',
      },
    ];
  });

  // REAL PERSISTENT 1-HOUR SCREEN TIME ENGINE
  const [sessionDurationMinutes, setSessionDurationMinutes] = useState(60);
  const [isSessionUnlocked, setIsSessionUnlocked] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(3600);
  const [isExpiredTimer, setIsExpiredTimer] = useState(false);

  // Modals & Active Views
  const [activeSimulatedApp, setActiveSimulatedApp] = useState<BlockedApp | null>(null);
  const [activeLockOverlayApp, setActiveLockOverlayApp] = useState<BlockedApp | null>(null);
  const [isStudyHearingOpen, setIsStudyHearingOpen] = useState(false);
  const [isParentPortalOpen, setIsParentPortalOpen] = useState(false);
  const [isAyahModalOpen, setIsAyahModalOpen] = useState(false);
  const [isNamazModalOpen, setIsNamazModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  // Daily Islamic Routine
  const [dailyAyah, setDailyAyah] = useState<DailyAyah>({
    surah: "Surah Taha (20:114)",
    arabic: "وَقُل رَّبِّ زِدْنِي عِلْمًا",
    transliteration: "Wa qul Rabbi zidnee 'ilmaa",
    urdu: "اور دعا کرو: اے میرے رب! مجھے علم میں اور اضافہ عطا فرما۔",
    english: "And say: 'My Lord, increase me in knowledge.'",
    reflection: "Knowledge is the greatest asset. Prioritize your syllabus before social media.",
    lesson: "Seek Allah's blessing in your memory before studying."
  });

  const [prayers, setPrayers] = useState<PrayerItem[]>([
    { name: "Fajr", urduName: "فجر", time: "05:15 AM", rakaat: "4 (2 Sunnah + 2 Farz)", offered: true },
    { name: "Dhuhr", urduName: "ظہر", time: "12:30 PM", rakaat: "12 Rakaat", offered: true },
    { name: "Asr", urduName: "عصر", time: "04:45 PM", rakaat: "8 Rakaat", offered: false },
    { name: "Maghrib", urduName: "مغرب", time: "06:20 PM", rakaat: "7 Rakaat", offered: false },
    { name: "Isha", urduName: "عشاء", time: "07:45 PM", rakaat: "17 Rakaat", offered: false },
  ]);
  const [activePrayer, setActivePrayer] = useState("Asr");

  // Study audit logs with localStorage persistence
  const [auditLogs, setAuditLogs] = useState<StudyAuditLog[]>(() => {
    const saved = localStorage.getItem('taleemguard_audit_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'log-initial',
        timestamp: 'Yesterday 04:30 PM',
        gradeClass: 'Class 10 (Matric)',
        subject: 'Mathematics',
        chapterName: 'Quadratic Equations',
        oralScore: 95,
        mathScore: 92,
        status: 'Passed & Unlocked',
        mistakesCount: 1,
        unlockedDurationMinutes: 60,
      }
    ];
  });

  // Clock string
  const [currentTimeString, setCurrentTimeString] = useState('');

  // Clock tick
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeString(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Save apps config to localStorage
  useEffect(() => {
    localStorage.setItem('taleemguard_apps_config', JSON.stringify(apps));
  }, [apps]);

  // Save audit logs to localStorage
  useEffect(() => {
    localStorage.setItem('taleemguard_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Check persistent session on boot
  useEffect(() => {
    const savedEnd = localStorage.getItem('taleemguard_session_end');
    if (savedEnd) {
      const endTime = parseInt(savedEnd, 10);
      const diff = Math.floor((endTime - Date.now()) / 1000);
      if (diff > 0) {
        setIsSessionUnlocked(true);
        setRemainingSeconds(diff);
      } else {
        setIsSessionUnlocked(false);
        setRemainingSeconds(0);
        localStorage.removeItem('taleemguard_session_end');
      }
    }
  }, []);

  // Fetch initial islamic data from server
  useEffect(() => {
    fetch('/api/islamic/daily-ayah')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.ayah) {
          setDailyAyah(data.ayah);
        }
      })
      .catch((err) => console.warn("Could not load ayah:", err));

    fetch('/api/islamic/prayer-times')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.prayers) {
          setPrayers(data.prayers);
          if (data.activePrayer) setActivePrayer(data.activePrayer);
        }
      })
      .catch((err) => console.warn("Could not load prayers:", err));
  }, []);

  // 1-HOUR REAL TIME COUNTDOWN ENGINE
  useEffect(() => {
    if (!isSessionUnlocked) return;

    const timer = setInterval(() => {
      const savedEnd = localStorage.getItem('taleemguard_session_end');
      if (savedEnd) {
        const endTime = parseInt(savedEnd, 10);
        const diff = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
        setRemainingSeconds(diff);

        if (diff <= 0) {
          clearInterval(timer);
          setIsSessionUnlocked(false);
          setIsExpiredTimer(true);
          localStorage.removeItem('taleemguard_session_end');
          sound.playLockEngaged();

          // Close active app if one was open
          if (activeSimulatedApp) {
            setActiveLockOverlayApp(activeSimulatedApp);
            setActiveSimulatedApp(null);
          } else {
            setActiveLockOverlayApp(apps[0]);
          }
        }
      } else {
        // Decrement local
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsSessionUnlocked(false);
            setIsExpiredTimer(true);
            sound.playLockEngaged();
            if (activeSimulatedApp) {
              setActiveLockOverlayApp(activeSimulatedApp);
              setActiveSimulatedApp(null);
            } else {
              setActiveLockOverlayApp(apps[0]);
            }
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isSessionUnlocked, activeSimulatedApp, apps]);

  // Handle clicking an app icon on the simulated phone
  const handleAppClick = (app: BlockedApp) => {
    // If not monitored, open freely
    if (!app.isMonitored) {
      setActiveSimulatedApp(app);
      return;
    }

    // If session is currently unlocked, open the simulated app
    if (isSessionUnlocked) {
      setActiveSimulatedApp(app);
    } else {
      // Locked! Play lock sound and show strict modal
      sound.playLockEngaged();
      setIsExpiredTimer(false);
      setActiveLockOverlayApp(app);
    }
  };

  // Toggle app lock on/off from parent settings
  const handleToggleAppLock = (appId: string) => {
    setApps((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, isMonitored: !a.isMonitored } : a))
    );
  };

  // Immediate lock engaged by parent
  const handleImmediateLock = () => {
    setIsSessionUnlocked(false);
    setActiveSimulatedApp(null);
    setRemainingSeconds(0);
    localStorage.removeItem('taleemguard_session_end');
  };

  // Emergency unlock granted by parent
  const handleEmergencyUnlock = (minutes: number) => {
    const endTimestamp = Date.now() + minutes * 60 * 1000;
    localStorage.setItem('taleemguard_session_end', String(endTimestamp));
    setIsSessionUnlocked(true);
    setIsExpiredTimer(false);
    setRemainingSeconds(minutes * 60);

    const log: StudyAuditLog = {
      id: `audit-override-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      gradeClass: 'Parental Authorization',
      subject: 'Parent Override',
      chapterName: 'Direct Bypass Granted',
      oralScore: 100,
      mathScore: 100,
      status: 'Parent Override',
      mistakesCount: 0,
      unlockedDurationMinutes: minutes,
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  // Study successfully passed by AI
  const handleStudyApproved = (auditLog: StudyAuditLog) => {
    const endTimestamp = Date.now() + sessionDurationMinutes * 60 * 1000;
    localStorage.setItem('taleemguard_session_end', String(endTimestamp));
    setIsSessionUnlocked(true);
    setIsExpiredTimer(false);
    setRemainingSeconds(sessionDurationMinutes * 60);
    setAuditLogs((prev) => [auditLog, ...prev]);
    setIsStudyHearingOpen(false);
  };

  // Toggle prayer checkbox
  const handleTogglePrayer = (name: string) => {
    setPrayers((prev) =>
      prev.map((p) => (p.name === name ? { ...p, offered: !p.offered } : p))
    );
  };

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-[#060a10] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950 relative overflow-x-hidden">
      {/* Subtle Ambient Background Gradients */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[400px] bg-emerald-600/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[400px] bg-teal-600/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-[#070c14]/80 backdrop-blur-xl sticky top-0 z-30 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-100">
                  TaleemGuard AI
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Strict Gatekeeper
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                TikTok, Insta, FB, Snapchat & Games Gatekeeper with 1-Hour Auto-Relock & Dual Biometrics
              </p>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Session Status Indicator */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-xs font-semibold shadow-sm transition-all ${
                isSessionUnlocked
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 shadow-emerald-950/40'
                  : 'bg-rose-950/70 border-rose-500/50 text-rose-300 shadow-rose-950/40'
              }`}
            >
              {isSessionUnlocked ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-mono font-bold">{timeFormatted} left</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                  <span>Locked (Study Req.)</span>
                </>
              )}
            </div>

            {/* Free Publish & Install Button */}
            <button
              type="button"
              onClick={() => setIsPublishModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-950/40 transition active:scale-95"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Free Publish & Install</span>
              <span className="sm:hidden">Publish Free</span>
            </button>

            {/* Parent Portal Button */}
            <button
              type="button"
              onClick={() => setIsParentPortalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-semibold transition active:scale-95 shadow-sm"
            >
              <Fingerprint className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Parent Biometrics</span>
              <span className="sm:hidden">Parents</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Rules, Ayah, Namaz & Audit Panel */}
        <div className="lg:col-span-7 space-y-5 order-2 lg:order-1">
          {/* Hero Rule Banner */}
          <div className="bg-gradient-to-r from-[#090e17] via-[#090e17] to-[#041d15] border border-emerald-500/20 rounded-[32px] p-5 sm:p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <Flame className="w-4 h-4 text-emerald-400" />
                  Daily Study Gatekeeper Policy (پہلے پڑھائی، پھر تفریح)
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-100 leading-tight">
                  No TikTok, Instagram, Snapchat or Games Until Daily Homework Is Heard!
                </h2>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
              Ye AI aap ki class aur chapter ka authentic book syllabus check karta hai, oral sawalat sunta hai, aur math ki copy ki picture verify karta hai. Sahi jawab aur pass hone par hi <strong>1 ghante (60 mins)</strong> ke liye apps khulti hain, jiske baad automatic lock lag jata hai!
            </p>

            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => setIsStudyHearingOpen(true)}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-emerald-950/60 flex items-center gap-2 transition active:scale-95"
              >
                <GraduationCap className="w-4 h-4" />
                AI Ko Parhai Ka Kaam Sunao (Start Oral Test)
              </button>

              <button
                type="button"
                onClick={() => setIsParentPortalOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-xs transition flex items-center gap-1.5 active:scale-95"
              >
                <Fingerprint className="w-4 h-4 text-indigo-400" />
                Mother & Father Biometrics
              </button>
            </div>
          </div>

          {/* Daily Quranic Ayah Card */}
          <div className="bg-[#090e17] border border-emerald-500/20 rounded-[32px] p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <BookOpen className="w-4 h-4" />
                Daily Quranic Ayah (روزانہ کی قرآنی آیت)
              </div>
              <button
                type="button"
                onClick={() => setIsAyahModalOpen(true)}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 underline font-medium"
              >
                Full Translation & Recite
              </button>
            </div>

            <div className="bg-[#05080f] rounded-2xl p-4 border border-emerald-950/80 text-center my-2 shadow-inner">
              <p
                className="text-xl sm:text-2xl text-emerald-300 leading-relaxed font-serif py-1"
                style={{ fontFamily: "'Amiri', serif" }}
                dir="rtl"
              >
                {dailyAyah.arabic}
              </p>
              <p className="text-xs text-slate-400 mt-2 font-mono italic">
                "{dailyAyah.transliteration}"
              </p>
              <p className="text-xs text-slate-300 mt-2 font-serif text-right" dir="rtl">
                {dailyAyah.urdu}
              </p>
            </div>
          </div>

          {/* Namaz Timings Widget */}
          <div className="bg-[#090e17] border border-slate-800/90 rounded-[32px] p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <Clock className="w-4 h-4" />
                Namaz Timings (نماز کے اوقات اور ٹریکر)
              </div>
              <button
                type="button"
                onClick={() => setIsNamazModalOpen(true)}
                className="text-[11px] text-amber-400 hover:text-amber-300 underline font-medium"
              >
                Open Salah Tracker
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              {prayers.map((prayer) => {
                const isCurrent = activePrayer.toLowerCase().includes(prayer.name.toLowerCase());
                return (
                  <div
                    key={prayer.name}
                    onClick={() => handleTogglePrayer(prayer.name)}
                    className={`p-2.5 rounded-2xl border cursor-pointer transition ${
                      prayer.offered
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                        : isCurrent
                        ? 'bg-amber-950/40 border-amber-500/50 text-amber-200 shadow-md'
                        : 'bg-[#05080f] border-slate-800/80 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-[11px] truncate">{prayer.name}</div>
                    <div className="text-[10px] font-mono mt-0.5">{prayer.time}</div>
                    <div className="mt-1 text-[10px]">
                      {prayer.offered ? '✓ Done' : isCurrent ? 'Active' : 'Pending'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monitored Apps Settings Bar */}
          <div className="bg-[#090e17] border border-slate-800/90 rounded-[32px] p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-200">
                  Protected Apps List (آن یا آف کرنے کا آپشن)
                </h3>
                <p className="text-xs text-slate-400">
                  Aap in apps par lock on ya off kar sakte hain:
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsParentPortalOpen(true)}
                className="text-xs text-indigo-400 hover:underline font-semibold"
              >
                Manage In Parent Portal
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {apps.map((app) => (
                <div
                  key={app.id}
                  className="bg-[#05080f] border border-slate-800/80 rounded-2xl p-2.5 flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm"
                      style={{ background: app.gradient }}
                    >
                      {app.name.charAt(0)}
                    </div>
                    <span className="text-xs font-semibold truncate text-slate-200">
                      {app.name}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleAppLock(app.id)}
                    className={`w-4 h-4 rounded-full border transition shrink-0 ${
                      app.isMonitored
                        ? 'bg-emerald-500 border-emerald-400 shadow-sm shadow-emerald-500/50'
                        : 'border-slate-700 bg-slate-900'
                    }`}
                    title={app.isMonitored ? 'Lock Active' : 'Lock Disabled'}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Simulated Child Phone Device */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center order-1 lg:order-2">
          <div className="w-full max-w-sm sm:max-w-md">
            <div className="text-center mb-3">
              <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">
                Student's Smartphone Screen (بچے کا موبائل)
              </span>
            </div>

            {/* Interactive Phone Simulator */}
            <PhoneSimulator
              apps={apps}
              isSessionUnlocked={isSessionUnlocked}
              remainingSeconds={remainingSeconds}
              onAppClick={handleAppClick}
              onOpenAyahModal={() => setIsAyahModalOpen(true)}
              onOpenNamazModal={() => setIsNamazModalOpen(true)}
              onOpenStudyHearing={() => setIsStudyHearingOpen(true)}
              onOpenParentPortal={() => setIsParentPortalOpen(true)}
              currentTimeString={currentTimeString}
            />
          </div>
        </div>
      </main>

      {/* MODALS */}

      {/* 1. Strict App Lock Screen Overlay */}
      <LockOverlay
        isOpen={!!activeLockOverlayApp}
        app={activeLockOverlayApp}
        onClose={() => setActiveLockOverlayApp(null)}
        onOpenStudyHearing={() => setIsStudyHearingOpen(true)}
        onOpenParentPortal={() => setIsParentPortalOpen(true)}
        isExpiredTimer={isExpiredTimer}
      />

      {/* 2. Interactive Study Hearing & Math Photo Verification Engine */}
      <StudyHearingModal
        isOpen={isStudyHearingOpen}
        onClose={() => setIsStudyHearingOpen(false)}
        onStudyApproved={handleStudyApproved}
        sessionDuration={sessionDurationMinutes}
      />

      {/* 3. Dual Parent Fingerprint & Security Portal */}
      <ParentPortalModal
        isOpen={isParentPortalOpen}
        onClose={() => setIsParentPortalOpen(false)}
        apps={apps}
        onToggleAppLock={handleToggleAppLock}
        onEmergencyUnlock={handleEmergencyUnlock}
        onImmediateLock={handleImmediateLock}
        auditLogs={auditLogs}
        sessionDuration={sessionDurationMinutes}
        onUpdateSessionDuration={(mins) => setSessionDurationMinutes(mins)}
      />

      {/* 4. Daily Quranic Ayah Modal */}
      <DailyAyahModal
        isOpen={isAyahModalOpen}
        ayah={dailyAyah}
        onClose={() => setIsAyahModalOpen(false)}
        onCompleted={() => setIsAyahModalOpen(false)}
      />

      {/* 5. Namaz Timings & Salah Tracker Modal */}
      <NamazTrackerModal
        isOpen={isNamazModalOpen}
        onClose={() => setIsNamazModalOpen(false)}
        prayers={prayers}
        activePrayer={activePrayer}
        onTogglePrayer={handleTogglePrayer}
      />

      {/* 6. Unlocked Simulated App Experience (TikTok, Insta, FB, Snapchat, Games) */}
      {activeSimulatedApp && (
        <SimulatedAppView
          app={activeSimulatedApp}
          onClose={() => setActiveSimulatedApp(null)}
          remainingSeconds={remainingSeconds}
        />
      )}

      {/* 7. Free Publish & Mobile App Guide Modal */}
      <PublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        sharedUrl="https://ais-pre-uxevjnme3n5p77gn4ro66x-270535780570.asia-southeast1.run.app"
      />
    </div>
  );
}
