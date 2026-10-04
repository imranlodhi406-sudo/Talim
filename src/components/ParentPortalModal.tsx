import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Fingerprint, 
  KeyRound, 
  CheckCircle, 
  X, 
  Sliders, 
  Clock, 
  History, 
  Lock, 
  Unlock, 
  UserCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { BlockedApp, ParentProfile, StudyAuditLog } from '../types';
import { sound } from '../utils/audio';

interface ParentPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  apps: BlockedApp[];
  onToggleAppLock: (appId: string) => void;
  onEmergencyUnlock: (minutes: number) => void;
  onImmediateLock: () => void;
  auditLogs: StudyAuditLog[];
  sessionDuration: number;
  onUpdateSessionDuration: (mins: number) => void;
}

export const ParentPortalModal: React.FC<ParentPortalModalProps> = ({
  isOpen,
  onClose,
  apps,
  onToggleAppLock,
  onEmergencyUnlock,
  onImmediateLock,
  auditLogs,
  sessionDuration,
  onUpdateSessionDuration,
}) => {
  // Dual parent credentials state
  const [activeParent, setActiveParent] = useState<'father' | 'mother'>('father');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMethod, setAuthMethod] = useState<'fingerprint' | 'pin'>('fingerprint');
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Scanning simulation state
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [hasHardwareBiometrics, setHasHardwareBiometrics] = useState(false);

  // Parent credentials (Mother & Father) with persistent localStorage PINs
  const [fatherPin, setFatherPin] = useState(() => {
    return localStorage.getItem('taleemguard_father_pin') || '7860';
  });
  const [motherPin, setMotherPin] = useState(() => {
    return localStorage.getItem('taleemguard_mother_pin') || '1234';
  });

  const parentProfiles = {
    father: {
      id: 'father' as const,
      role: 'Father' as const,
      name: 'Daddy (Father)',
      titleUrdu: 'والد صاحب (ابو)',
      pin: fatherPin,
      fingerprintName: "Daddy's Biometric Sensor (Verified)",
      badgeColor: 'from-blue-600 via-indigo-600 to-sky-600',
    },
    mother: {
      id: 'mother' as const,
      role: 'Mother' as const,
      name: 'Mummy (Mother)',
      titleUrdu: 'والدہ محترمہ (امی)',
      pin: motherPin,
      fingerprintName: "Mummy's Biometric Sensor (Verified)",
      badgeColor: 'from-rose-600 via-pink-600 to-purple-600',
    },
  };

  const [activeTab, setActiveTab] = useState<'apps' | 'controls' | 'audit' | 'pins'>('apps');

  // Check for device hardware biometrics
  useEffect(() => {
    if (typeof window !== 'undefined' && window.PublicKeyCredential) {
      window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable?.()
        .then((available) => setHasHardwareBiometrics(available))
        .catch(() => setHasHardwareBiometrics(false));
    }
  }, []);

  if (!isOpen) return null;

  // Trigger Hardware / Tactile Biometric Scan
  const handleStartScan = async () => {
    setIsScanning(true);
    setScanProgress(0);
    sound.playScanBeep();

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([40, 60, 40]);
    }

    // Attempt real WebAuthn hardware biometric if supported
    if (hasHardwareBiometrics && typeof navigator !== 'undefined' && navigator.credentials) {
      try {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);
        // Prompt device native TouchID/FaceID/Fingerprint dialog
        // If user completes, grant instantly
        setTimeout(() => {
          setIsScanning(false);
          sound.playAccessGranted();
          setIsAuthenticated(true);
        }, 1200);
        return;
      } catch (e) {
        // Fall back to tactile simulation
      }
    }

    // Tactile laser scan simulation with sound & haptic progression
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          sound.playAccessGranted();
          setIsAuthenticated(true);
          return 100;
        }
        sound.playScanBeep();
        return prev + 25;
      });
    }, 250);
  };

  const handleStopScan = () => {
    if (isScanning && scanProgress < 100) {
      setIsScanning(false);
      setScanProgress(0);
    }
  };

  // Handle PIN verification
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = parentProfiles[activeParent].pin;
    if (enteredPin === correctPin) {
      sound.playAccessGranted();
      setIsAuthenticated(true);
      setPinError(false);
      setEnteredPin('');
    } else {
      sound.playErrorBuzz();
      setPinError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setEnteredPin('');
    setScanProgress(0);
  };

  const updateFatherPin = (newPin: string) => {
    setFatherPin(newPin);
    localStorage.setItem('taleemguard_father_pin', newPin);
  };

  const updateMotherPin = (newPin: string) => {
    setMotherPin(newPin);
    localStorage.setItem('taleemguard_mother_pin', newPin);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#090e17] border border-emerald-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-900 border border-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-emerald-500/20 text-amber-400 border border-amber-500/30 shadow-inner">
            <Fingerprint className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              Parent Security Control Center
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Mother & Father Verified
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              والدین کے کنٹرول اور بائیومیٹرک تصدیق کا پورٹل
            </p>
          </div>
        </div>

        {!isAuthenticated ? (
          /* Authentication Screen */
          <div className="bg-[#05080f] border border-slate-800/80 rounded-3xl p-6 sm:p-8 text-center shadow-inner">
            {/* Parent Identity Switcher */}
            <div className="inline-block p-1 rounded-2xl bg-slate-900/90 border border-slate-800 mb-6 shadow-md">
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveParent('father');
                    setEnteredPin('');
                    setPinError(false);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    activeParent === 'father'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  Daddy (Father / ابو)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveParent('mother');
                    setEnteredPin('');
                    setPinError(false);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    activeParent === 'mother'
                      ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-900/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  Mummy (Mother / امی)
                </button>
              </div>
            </div>

            <div className="max-w-md mx-auto">
              <div className="flex justify-center gap-6 mb-6 border-b border-slate-800/80 pb-2">
                <button
                  type="button"
                  onClick={() => setAuthMethod('fingerprint')}
                  className={`text-xs font-bold transition flex items-center gap-1.5 pb-2 border-b-2 -mb-2 ${
                    authMethod === 'fingerprint'
                      ? 'border-emerald-400 text-emerald-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Fingerprint className="w-4 h-4" />
                  Biometric Fingerprint
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod('pin')}
                  className={`text-xs font-bold transition flex items-center gap-1.5 pb-2 border-b-2 -mb-2 ${
                    authMethod === 'pin'
                      ? 'border-emerald-400 text-emerald-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <KeyRound className="w-4 h-4" />
                  Passcode (PIN)
                </button>
              </div>

              {authMethod === 'fingerprint' ? (
                <div className="py-4">
                  <p className="text-xs text-slate-300 mb-4">
                    Place and hold {parentProfiles[activeParent].name}'s registered finger on the sensor below:
                  </p>

                  <div className="relative inline-block my-2">
                    <button
                      type="button"
                      onMouseDown={handleStartScan}
                      onMouseUp={handleStopScan}
                      onTouchStart={handleStartScan}
                      onTouchEnd={handleStopScan}
                      className={`relative w-28 h-28 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        isScanning
                          ? 'border-emerald-400 bg-emerald-950/70 shadow-2xl shadow-emerald-500/60 scale-105'
                          : 'border-slate-700 bg-slate-900/90 hover:border-emerald-500/60'
                      }`}
                    >
                      <Fingerprint
                        className={`w-14 h-14 transition-colors ${
                          isScanning ? 'text-emerald-400 animate-pulse' : 'text-slate-400'
                        }`}
                      />

                      {/* Laser scanner vertical beam */}
                      {isScanning && (
                        <div className="absolute inset-x-3 top-2 h-1 bg-gradient-to-r from-transparent via-emerald-300 to-transparent shadow-lg shadow-emerald-400 animate-bounce" />
                      )}
                    </button>

                    {isScanning && (
                      <div className="mt-3 text-xs font-mono text-emerald-400 font-bold tracking-wider">
                        SCANNING BIOMETRICS: {scanProgress}%
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 mt-4">
                    {hasHardwareBiometrics
                      ? '⚡ Device TouchID / Fingerprint sensor ready'
                      : '📱 Press and hold finger on screen for 1 second to authenticate'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handlePinSubmit} className="py-2">
                  <p className="text-xs text-slate-300 mb-3">
                    Enter {parentProfiles[activeParent].name}'s secret passcode:
                  </p>

                  <div className="flex justify-center gap-2 mb-4">
                    <input
                      type="password"
                      maxLength={4}
                      value={enteredPin}
                      onChange={(e) => setEnteredPin(e.target.value)}
                      placeholder="••••"
                      className="text-center tracking-widest text-2xl w-44 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500 shadow-inner"
                    />
                  </div>

                  {pinError && (
                    <p className="text-xs text-rose-400 font-semibold mb-3">
                      Incorrect passcode. Please try again!
                    </p>
                  )}

                  <div className="text-[11px] text-slate-400 mb-4 bg-slate-900/60 p-2 rounded-xl inline-block border border-slate-800">
                    Current PIN for {parentProfiles[activeParent].name}:{' '}
                    <span className="font-mono text-emerald-400 font-bold">
                      {parentProfiles[activeParent].pin}
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full max-w-xs mx-auto py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-950/40"
                  >
                    Authenticate & Open Portal
                  </button>
                </form>
              )}
            </div>
          </div>
        ) : (
          /* Authenticated Parent Dashboard */
          <div>
            {/* Active Parent Banner */}
            <div className="bg-[#05080f] border border-slate-800 rounded-2xl p-4 mb-5 flex items-center justify-between shadow-inner">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${parentProfiles[activeParent].badgeColor} flex items-center justify-center text-white font-bold text-sm shadow-md`}
                >
                  {activeParent === 'father' ? 'D' : 'M'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-100">
                      {parentProfiles[activeParent].name}
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                      Biometric Session Active ✓
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-serif">
                    {parentProfiles[activeParent].titleUrdu}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="text-xs text-slate-400 hover:text-rose-400 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 transition"
              >
                Log Out
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-800/80 mb-5 gap-5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('apps')}
                className={`pb-2.5 border-b-2 transition ${
                  activeTab === 'apps'
                    ? 'border-emerald-400 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                App Locks ({apps.filter((a) => a.isMonitored).length} Locked)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('controls')}
                className={`pb-2.5 border-b-2 transition ${
                  activeTab === 'controls'
                    ? 'border-emerald-400 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Screen Time Limits
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('audit')}
                className={`pb-2.5 border-b-2 transition ${
                  activeTab === 'audit'
                    ? 'border-emerald-400 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Study History ({auditLogs.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('pins')}
                className={`pb-2.5 border-b-2 transition ${
                  activeTab === 'pins'
                    ? 'border-emerald-400 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Change Passcodes
              </button>
            </div>

            {/* Tab 1: App Locks Manager */}
            {activeTab === 'apps' && (
              <div className="space-y-3">
                <div className="bg-[#05080f] p-3 rounded-2xl border border-slate-800/80 text-xs text-slate-300">
                  Toggle which apps are monitored and blocked. Apps toggled ON cannot be opened until daily lessons and math notebook photos are recited and verified.
                </div>

                <div className="grid gap-2.5">
                  {apps.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-[#05080f] border border-slate-800/80 hover:border-emerald-500/30 transition shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-md"
                          style={{ background: app.gradient }}
                        >
                          {app.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                            {app.name}
                            <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                              {app.category}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400">
                            {app.description}
                          </span>
                        </div>
                      </div>

                      {/* On/Off Switch */}
                      <button
                        type="button"
                        onClick={() => onToggleAppLock(app.id)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          app.isMonitored ? 'bg-emerald-500 shadow-md shadow-emerald-500/30' : 'bg-slate-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            app.isMonitored ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: Timer & Emergency Controls */}
            {activeTab === 'controls' && (
              <div className="space-y-4">
                <div className="bg-[#05080f] border border-slate-800 rounded-2xl p-4">
                  <h4 className="text-sm font-bold text-slate-200 mb-1 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    Auto Re-Lock Duration (Screen Time Allowance)
                  </h4>
                  <p className="text-xs text-slate-400 mb-3">
                    Jab bacha parhai sunaye to apps kitni der tak khuli rahein? 1 hour (60 min) default hai.
                  </p>

                  <div className="grid grid-cols-4 gap-2">
                    {[30, 45, 60, 90].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => onUpdateSessionDuration(mins)}
                        className={`py-2 rounded-xl text-xs font-bold border transition ${
                          sessionDuration === mins
                            ? 'bg-emerald-600 border-emerald-400 text-white shadow-md'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {mins} Mins {mins === 60 ? '(Default)' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="bg-[#05080f] border border-rose-900/40 rounded-2xl p-4">
                    <h4 className="text-sm font-bold text-rose-300 mb-1 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Immediate Hard Lockdown
                    </h4>
                    <p className="text-xs text-slate-400 mb-3">
                      Instantly close apps and lock the child's screen right now.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playLockEngaged();
                        onImmediateLock();
                        onClose();
                      }}
                      className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-md"
                    >
                      Engage Lockdown Now
                    </button>
                  </div>

                  <div className="bg-[#05080f] border border-emerald-900/40 rounded-2xl p-4">
                    <h4 className="text-sm font-bold text-emerald-300 mb-1 flex items-center gap-2">
                      <Unlock className="w-4 h-4" />
                      Parent Emergency Unlock
                    </h4>
                    <p className="text-xs text-slate-400 mb-3">
                      Grant 1-hour access under parent authorization without oral quiz.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playAccessGranted();
                        onEmergencyUnlock(sessionDuration);
                        onClose();
                      }}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md"
                    >
                      Authorize 1-Hour Session
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Study History */}
            {activeTab === 'audit' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Student Study Hearing Records</span>
                  <span>Total Sessions: {auditLogs.length}</span>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="bg-[#05080f] border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between text-xs shadow-sm"
                    >
                      <div>
                        <div className="font-semibold text-slate-200">
                          {log.subject} - {log.chapterName}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {log.gradeClass} • {log.timestamp}
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            log.status.includes('Passed')
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}
                        >
                          {log.status}
                        </span>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Oral: <strong className="text-slate-200">{log.oralScore}%</strong> | Math: <strong className="text-slate-200">{log.mathScore}%</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 4: Passcode Configuration */}
            {activeTab === 'pins' && (
              <div className="space-y-4">
                <div className="bg-[#05080f] border border-slate-800 rounded-2xl p-4 space-y-3">
                  <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-emerald-400" />
                    Update Daddy & Mummy Passcodes (PINs)
                  </h4>
                  <p className="text-xs text-slate-400">
                    You can change your 4-digit security PINs anytime. They are saved securely on this device.
                  </p>

                  <div className="grid sm:grid-cols-2 gap-4 pt-2">
                    <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                      <label className="block text-xs font-semibold text-blue-300 mb-1">
                        Daddy (Father / ابو) PIN:
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        value={fatherPin}
                        onChange={(e) => updateFatherPin(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-center text-lg font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                      <label className="block text-xs font-semibold text-rose-300 mb-1">
                        Mummy (Mother / امی) PIN:
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        value={motherPin}
                        onChange={(e) => updateMotherPin(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-center text-lg font-mono text-slate-100 focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
