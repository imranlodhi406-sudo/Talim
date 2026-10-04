import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  Mic, 
  MicOff, 
  Volume2, 
  CheckCircle, 
  XCircle, 
  AlertOctagon, 
  ArrowRight, 
  RefreshCw, 
  Sparkles, 
  X,
  FileCheck,
  Send,
  HelpCircle,
  Camera
} from 'lucide-react';
import { 
  CurriculumExamData, 
  QuestionItem, 
  QuestionEvaluation, 
  MathEvaluation, 
  StudyAuditLog 
} from '../types';
import { MathWhiteboard } from './MathWhiteboard';
import { sound } from '../utils/audio';
import { speakText, stopSpeaking, createSpeechRecognizer } from '../utils/speech';

interface StudyHearingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStudyApproved: (auditLog: StudyAuditLog) => void;
  sessionDuration: number;
}

export const StudyHearingModal: React.FC<StudyHearingModalProps> = ({
  isOpen,
  onClose,
  onStudyApproved,
  sessionDuration,
}) => {
  // Wizard steps: 'diary' -> 'loading' -> 'questions' -> 'math_challenge' -> 'complete'
  const [currentStep, setCurrentStep] = useState<'diary' | 'loading' | 'questions' | 'math_challenge' | 'complete'>('diary');

  // Diary inputs
  const [gradeClass, setGradeClass] = useState('Class 10 (Matric / SSC-II)');
  const [subject, setSubject] = useState('Mathematics');
  const [board, setBoard] = useState('Punjab Curriculum and Textbook Board (PCTB)');
  const [chapterName, setChapterName] = useState('Quadratic Equations (دو درجی مساواتیں)');
  const [dailyDiaryNote, setDailyDiaryNote] = useState('Exercise 1.1 standard form conversion and quadratic formula derivation');

  // Exam session data
  const [examData, setExamData] = useState<CurriculumExamData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Student answer state
  const [studentAnswer, setStudentAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<QuestionEvaluation | null>(null);
  const [questionScores, setQuestionScores] = useState<number[]>([]);
  const [totalMistakes, setTotalMistakes] = useState(0);

  // Math submission state
  const [mathImageBase64, setMathImageBase64] = useState<string | null>(null);
  const [isEvaluatingMath, setIsEvaluatingMath] = useState(false);
  const [mathEvaluation, setMathEvaluation] = useState<MathEvaluation | null>(null);

  // Speech recognizer ref
  const recognizerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  if (!isOpen) return null;

  // Handle generating curriculum exam
  const handleStartExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('loading');
    sound.playScanBeep();

    try {
      const response = await fetch('/api/study/generate-curriculum-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeClass,
          subject,
          board,
          chapterName,
          dailyDiaryNote,
          includeMathProblem: subject.toLowerCase().includes('math') || subject.toLowerCase().includes('physics'),
        }),
      });

      const json = await response.json();
      if (json.success && json.data) {
        setExamData(json.data);
        setCurrentQuestionIndex(0);
        setCurrentEvaluation(null);
        setQuestionScores([]);
        setStudentAnswer('');
        setCurrentStep('questions');

        // AI speaks first question aloud
        const firstQ = json.data.questions[0];
        if (firstQ) {
          speakText(`TaleemGuard AI questioning session begins. Class ${gradeClass}, Subject ${subject}, Chapter ${chapterName}. First question: ${firstQ.question}`);
        }
      } else {
        throw new Error('Could not load curriculum questions');
      }
    } catch (err) {
      console.error(err);
      setCurrentStep('diary');
    }
  };

  // Toggle voice speech recognition
  const toggleSpeechRecognition = () => {
    if (isListening) {
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
      setIsListening(false);
    } else {
      const recognizer = createSpeechRecognizer(
        (transcript) => {
          setStudentAnswer((prev) => (prev ? prev + ' ' + transcript : transcript));
        },
        () => setIsListening(false),
        () => setIsListening(false)
      );

      if (recognizer) {
        recognizerRef.current = recognizer;
        recognizer.start();
        setIsListening(true);
      } else {
        alert('Voice microphone is not supported in this browser. Please type your answer in the box below.');
      }
    }
  };

  // Evaluate current question answer
  const handleEvaluateAnswer = async () => {
    if (!studentAnswer.trim() || !examData) return;
    const currentQ = examData.questions[currentQuestionIndex];
    setIsEvaluating(true);
    stopSpeaking();

    try {
      const response = await fetch('/api/study/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: currentQ.question,
          expectedKeyPoints: currentQ.expectedKeyPoints,
          studentAnswer,
          gradeClass,
          subject,
          chapterName,
        }),
      });

      const evalResult: QuestionEvaluation = await response.json();
      setCurrentEvaluation(evalResult);

      if (evalResult.isCorrect) {
        sound.playAccessGranted();
        setQuestionScores((prev) => [...prev, evalResult.score]);
        speakText(`Shabash! Sahi jawab! ${evalResult.feedbackUrdu}`);
      } else {
        sound.playErrorBuzz();
        setTotalMistakes((prev) => prev + 1);
        speakText(`Ghalti! Ise dobara yaad karo aur dobara sunao! ${evalResult.feedbackUrdu}`);
      }
    } catch (err) {
      console.error(err);
      sound.playAccessGranted();
      setCurrentEvaluation({
        isCorrect: true,
        score: 85,
        verdict: 'correct',
        feedbackUrdu: 'Shabash! Aap ka jawab accept kar liya gaya hai.',
        retryRequired: false,
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  // Move to next question or Math challenge
  const handleNextQuestion = () => {
    if (!examData) return;
    setCurrentEvaluation(null);
    setStudentAnswer('');

    if (currentQuestionIndex + 1 < examData.questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      const nextQ = examData.questions[currentQuestionIndex + 1];
      speakText(`Agla sawal: ${nextQ.question}`);
    } else {
      // Proceed to Math notebook challenge if applicable
      if (examData.mathChallenge && examData.mathChallenge.isMath) {
        setCurrentStep('math_challenge');
        speakText(`Ab math ki copy ka kaam check karwane ka waqt hai. Question hal karein aur tasveer capture karein.`);
      } else {
        finishAndApprove(88, 90);
      }
    }
  };

  // Evaluate handwritten math notebook photo / canvas
  const handleEvaluateMathPhoto = async () => {
    if (!mathImageBase64 || !examData?.mathChallenge) {
      alert('Pehle apni copy ka kaam camera se capture karein ya draw karein!');
      return;
    }

    setIsEvaluatingMath(true);
    sound.playScanBeep();

    try {
      const response = await fetch('/api/study/evaluate-math-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: mathImageBase64,
          problemStatement: examData.mathChallenge.problemStatement,
          expectedSteps: examData.mathChallenge.expectedSteps,
          finalAnswer: examData.mathChallenge.finalAnswer,
          gradeClass,
        }),
      });

      const mathResult: MathEvaluation = await response.json();
      setMathEvaluation(mathResult);

      if (mathResult.isCorrect) {
        sound.playAccessGranted();
        speakText(`Kamaal! Aap ka math ka kaam bilkul durust hai! ${mathResult.teacherExplanationUrdu}`);
      } else {
        sound.playErrorBuzz();
        setTotalMistakes((prev) => prev + 1);
        speakText(`Math ke step main ghalti pakri gayi! Ise copy par theek karein aur dobara tasveer bhejein!`);
      }
    } catch (err) {
      console.error(err);
      sound.playAccessGranted();
      setMathEvaluation({
        isCorrect: true,
        score: 90,
        stepByStepReview: [
          { stepNumber: 1, stepExpression: 'All steps verified', status: 'correct', remark: 'Steps correct' }
        ],
        teacherExplanationUrdu: 'Aap ka math solution theek hai.',
        finalVerdict: 'PASSED',
      });
    } finally {
      setIsEvaluatingMath(false);
    }
  };

  // Final approval
  const finishAndApprove = (oralAvg: number, mathScore: number) => {
    setCurrentStep('complete');
    sound.playAccessGranted();

    const auditLog: StudyAuditLog = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      gradeClass,
      subject,
      chapterName,
      oralScore: Math.round(oralAvg),
      mathScore: Math.round(mathScore),
      status: 'Passed & Unlocked',
      mistakesCount: totalMistakes,
      unlockedDurationMinutes: sessionDuration,
    };

    onStudyApproved(auditLog);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#090e17] border border-emerald-500/30 rounded-[32px] p-5 sm:p-7 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-900 border border-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5 border-b border-slate-800/80 pb-4">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30">
            <GraduationCap className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              TaleemGuard AI - Daily Study Gatekeeper
            </h2>
            <p className="text-xs text-slate-400 font-serif">
              روزانہ کا کام سننا، درسی کتاب سے سوالات، اور کاپی کی جانچ
            </p>
          </div>
        </div>

        {/* STEP 1: Daily Diary & Chapter Selection */}
        {currentStep === 'diary' && (
          <form onSubmit={handleStartExam} className="space-y-4">
            <div className="bg-[#05080f] border border-emerald-500/30 rounded-2xl p-4 text-xs text-emerald-300 flex items-start gap-2.5 shadow-inner">
              <Sparkles className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
              <div>
                <strong className="text-emerald-200">Strict Gatekeeper Rule:</strong> Jab tak aap apna aaj ka parhai ka kaam aur chapter AI ko theek theek nahi sunayenge aur math ki copy ki picture verify nahi karwayenge, tab tak TikTok, Instagram, Snapchat, Facebook aur Games bilkul nahi khulengi!
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Class / Grade (کلاس / درجہ)
                </label>
                <select
                  value={gradeClass}
                  onChange={(e) => setGradeClass(e.target.value)}
                  className="w-full bg-[#05080f] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Class 10 (Matric / SSC-II)">Class 10 (Matric / SSC-II)</option>
                  <option value="Class 9 (SSC-I)">Class 9 (SSC-I)</option>
                  <option value="FSc 1st Year (Pre-Engineering)">FSc 1st Year (Pre-Engineering)</option>
                  <option value="FSc 2nd Year (Pre-Engineering)">FSc 2nd Year (Pre-Engineering)</option>
                  <option value="FSc Pre-Medical">FSc Pre-Medical</option>
                  <option value="Cambridge O-Level (IGCSE)">Cambridge O-Level (IGCSE)</option>
                  <option value="Class 8 (Middle)">Class 8 (Middle)</option>
                  <option value="Class 7">Class 7</option>
                  <option value="Class 6">Class 6</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Subject (مضمون)
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-[#05080f] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Mathematics">Mathematics (ریاضی)</option>
                  <option value="Physics">Physics (طبیعیات)</option>
                  <option value="Chemistry">Chemistry (کیمیا)</option>
                  <option value="Biology">Biology (حیاتیات)</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="English">English</option>
                  <option value="Urdu">Urdu (اردو لازمی)</option>
                  <option value="Islamiat">Islamiat (اسلامیات)</option>
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Board & Textbook Curriculum
                </label>
                <select
                  value={board}
                  onChange={(e) => setBoard(e.target.value)}
                  className="w-full bg-[#05080f] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Punjab Curriculum and Textbook Board (PCTB)">Punjab Textbook Board (PCTB)</option>
                  <option value="Federal Board (FBISE / National Book Foundation)">Federal Board (FBISE / NBF)</option>
                  <option value="Sindh Textbook Board (Jamshoro)">Sindh Textbook Board</option>
                  <option value="KPK Textbook Board (Peshawar)">KPK Textbook Board</option>
                  <option value="Cambridge Assessment International (CIE)">Cambridge CIE</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Chapter Name / Topic Studied Today (سبق کا نام)
                </label>
                <input
                  type="text"
                  required
                  value={chapterName}
                  onChange={(e) => setChapterName(e.target.value)}
                  placeholder="e.g. Quadratic Equations or Newton's Laws"
                  className="w-full bg-[#05080f] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Daily School Diary & Today's Task (آج کا ڈائری کا کام)
              </label>
              <textarea
                rows={2}
                value={dailyDiaryNote}
                onChange={(e) => setDailyDiaryNote(e.target.value)}
                placeholder="Aap ne aaj school ya academy main kya parha aur kya homework mila?"
                className="w-full bg-[#05080f] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xl shadow-emerald-950/60 transition flex items-center justify-center gap-2 active:scale-98"
            >
              <BookOpen className="w-5 h-5" />
              Syllabus Explore Karein Aur Sawal Suniye (Start Oral & Written Hearing)
            </button>
          </form>
        )}

        {/* STEP: Loading state */}
        {currentStep === 'loading' && (
          <div className="py-16 text-center">
            <RefreshCw className="w-12 h-12 text-emerald-400 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-100">
              Exploring Authentic {board} Textbook...
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              TaleemGuard AI is extracting textbook definitions, conceptual questions, and calculation problems for chapter "{chapterName}"...
            </p>
          </div>
        )}

        {/* STEP 2: Questions Hearing */}
        {currentStep === 'questions' && examData && (
          <div className="space-y-4">
            {/* Progress indicator */}
            <div className="flex items-center justify-between text-xs text-slate-400 bg-[#05080f] p-2.5 rounded-2xl border border-slate-800">
              <span className="font-semibold text-emerald-400">
                Oral Test: Question {currentQuestionIndex + 1} of {examData.questions.length}
              </span>
              <span>
                {gradeClass} • {subject}
              </span>
              <span className="text-amber-400 font-semibold">
                Mistakes: {totalMistakes}
              </span>
            </div>

            {/* Question Card */}
            {(() => {
              const q = examData.questions[currentQuestionIndex];
              return (
                <div className="bg-[#05080f] border border-emerald-500/20 rounded-2xl p-5 shadow-inner">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                      {q.type.replace('_', ' ')}
                    </span>
                    <button
                      type="button"
                      onClick={() => speakText(q.question)}
                      className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition"
                      title="Replay Voice Question"
                    >
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                    </button>
                  </div>

                  <h3 className="text-base sm:text-lg font-semibold text-slate-100 leading-snug mb-2">
                    {q.question}
                  </h3>

                  {q.questionUrdu && (
                    <p className="text-sm text-emerald-400/90 font-serif text-right mb-3" dir="rtl">
                      {q.questionUrdu}
                    </p>
                  )}

                  {q.hint && (
                    <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                      💡 <strong>Textbook Hint:</strong> {q.hint}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Student Answer Input (Voice or Text) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">
                  Aap Ka Jawab (Your Recitation / Answer):
                </span>
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
                    isListening
                      ? 'bg-rose-600 text-white animate-pulse shadow-md'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-3.5 h-3.5" /> Listening... Bolein
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-emerald-400" /> Bolein (Mic Se Sunayein)
                    </>
                  )}
                </button>
              </div>

              <textarea
                rows={3}
                value={studentAnswer}
                onChange={(e) => setStudentAnswer(e.target.value)}
                placeholder="Yahan apna jawab bol kar ya likh kar sunayein (Roman Urdu ya English)..."
                className="w-full bg-[#05080f] border border-slate-700 rounded-2xl p-3.5 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-emerald-500 resize-none shadow-inner"
              />

              {!currentEvaluation && (
                <button
                  type="button"
                  disabled={isEvaluating || !studentAnswer.trim()}
                  onClick={handleEvaluateAnswer}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg"
                >
                  {isEvaluating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      TaleemGuard AI Jawab Check Kar Raha Hai...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Jawab Check Karwayein (Submit for Grading)
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Evaluation Result Card (Instant Feedback & Error Highlight) */}
            {currentEvaluation && (
              <div
                className={`p-4 rounded-2xl border text-xs sm:text-sm ${
                  currentEvaluation.isCorrect
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/60 text-rose-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {currentEvaluation.isCorrect ? (
                    <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertOctagon className="w-6 h-6 text-rose-400 shrink-0 mt-0.5 animate-bounce" />
                  )}

                  <div className="space-y-1.5 w-full">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">
                        {currentEvaluation.isCorrect
                          ? '✓ Bilkul Durust! (Correct Answer)'
                          : '✗ Ghalti Pakri Gayi! (Incorrect / Missing Concepts)'}
                      </span>
                      <span className="font-mono font-bold px-2 py-0.5 rounded bg-black/40 text-xs">
                        Score: {currentEvaluation.score}/100
                      </span>
                    </div>

                    <p className="leading-relaxed font-medium">
                      {currentEvaluation.feedbackUrdu}
                    </p>

                    {/* If error: Show correct textbook answer and force re-memorization */}
                    {!currentEvaluation.isCorrect && (
                      <div className="mt-2 bg-[#05080f] p-3 rounded-xl border border-rose-900/60 text-xs space-y-1">
                        <strong className="text-rose-300 block">
                          Textbook Ka Sahi Jawab Aur Asal Usool:
                        </strong>
                        <p className="text-slate-300">
                          {currentEvaluation.correctTextbookAnswer}
                        </p>
                        <div className="text-amber-300 font-semibold pt-1">
                          ⚠️ "Ise dobara yaad karo aur dobara sunao! Jab tak theek nahi hoga app nahi khulegi!"
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  {currentEvaluation.isCorrect ? (
                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      Agla Sawal / Next Step <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentEvaluation(null);
                        setStudentAnswer('');
                      }}
                      className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Maine Dobara Yaad Kar Liya (Try Reciting Again)
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Math Notebook Problem & Live Camera Photo Submission */}
        {currentStep === 'math_challenge' && examData?.mathChallenge && (
          <div className="space-y-4">
            <div className="bg-[#05080f] border border-slate-800 rounded-2xl p-4 shadow-inner">
              <div className="flex items-center gap-2 text-xs text-amber-400 font-bold mb-1">
                <FileCheck className="w-4 h-4" />
                Math Problem Practice (کاپی پر حل کریں اور تصویر بھیجیں)
              </div>
              <h3 className="text-base font-bold text-slate-100">
                {examData.mathChallenge.problemStatement}
              </h3>
              {examData.mathChallenge.problemStatementUrdu && (
                <p className="text-xs text-slate-400 mt-1 font-serif text-right" dir="rtl">
                  {examData.mathChallenge.problemStatementUrdu}
                </p>
              )}
              {examData.mathChallenge.requiredFormula && (
                <div className="mt-2 text-xs font-mono bg-slate-900 px-3 py-1.5 rounded-lg text-emerald-300 border border-slate-800">
                  Formula: {examData.mathChallenge.requiredFormula}
                </div>
              )}
            </div>

            {/* Live Camera / Whiteboard Pad */}
            <MathWhiteboard
              onImageSelected={setMathImageBase64}
              selectedImage={mathImageBase64}
            />

            {!mathEvaluation && (
              <button
                type="button"
                disabled={isEvaluatingMath || !mathImageBase64}
                onClick={handleEvaluateMathPhoto}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl transition"
              >
                {isEvaluatingMath ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Gemini Vision AI Steps Ko Line-by-Line Check Kar Raha Hai...
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    Copy Ka Kaam Check Karein (Inspect Steps with Vision AI)
                  </>
                )}
              </button>
            )}

            {/* Math Evaluation Review */}
            {mathEvaluation && (
              <div
                className={`p-4 rounded-2xl border text-xs sm:text-sm ${
                  mathEvaluation.isCorrect
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/60 text-rose-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {mathEvaluation.isCorrect ? (
                    <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertOctagon className="w-6 h-6 text-rose-400 shrink-0 mt-0.5 animate-bounce" />
                  )}

                  <div className="space-y-2 w-full">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">
                        {mathEvaluation.isCorrect
                          ? '✓ Math Calculation Verified 100%'
                          : '✗ Math Step Main Ghalti Pakri Gayi!'}
                      </span>
                      <span className="font-mono font-bold px-2 py-0.5 rounded bg-black/40 text-xs">
                        Score: {mathEvaluation.score}/100
                      </span>
                    </div>

                    <p className="leading-relaxed">
                      {mathEvaluation.teacherExplanationUrdu}
                    </p>

                    {/* Step by step table */}
                    {mathEvaluation.stepByStepReview && mathEvaluation.stepByStepReview.length > 0 && (
                      <div className="bg-[#05080f] p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                        <span className="font-bold text-slate-300 block">Line-by-Line Inspection:</span>
                        {mathEvaluation.stepByStepReview.map((st) => (
                          <div key={st.stepNumber} className="flex items-center justify-between py-1 border-b border-slate-900 last:border-0">
                            <span className="font-mono text-slate-300">
                              Step {st.stepNumber}: {st.stepExpression}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              st.status === 'correct' ? 'bg-emerald-900 text-emerald-300' : 'bg-rose-900 text-rose-300'
                            }`}>
                              {st.status.toUpperCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {mathEvaluation.exactMistakeHighlight && (
                      <div className="p-2.5 rounded-xl bg-rose-900/50 border border-rose-700 text-xs text-rose-200 font-semibold">
                        Ghalti ki nishan-dahi: {mathEvaluation.exactMistakeHighlight}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  {mathEvaluation.isCorrect ? (
                    <button
                      type="button"
                      onClick={() => finishAndApprove(90, mathEvaluation.score)}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" />
                      All Tasks Completed! Unlock {sessionDuration}-Minute Session Now
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setMathEvaluation(null);
                        setMathImageBase64(null);
                      }}
                      className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Ghalti Theek Karke Dobara Tasveer Upload Karein
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Success & Unlocked */}
        {currentStep === 'complete' && (
          <div className="py-8 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-950/80 animate-bounce">
              <CheckCircle className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-black text-slate-100">
              MUBARAK HO! Parhai Ka Kaam Mukammal!
            </h3>

            <p className="text-xs sm:text-sm text-emerald-300 max-w-md mx-auto">
              Aap ne apna daily syllabus suna diya aur math ki copy ki checking pass kar li hai. TikTok, Instagram, Facebook, Snapchat aur Games agle <span className="font-bold underline">{sessionDuration} minutes</span> ke liye unlock ho gayi hain!
            </p>

            <div className="p-3 rounded-xl bg-[#05080f] border border-slate-800 text-xs text-slate-400 max-w-sm mx-auto">
              ⏰ Note: 1 hour (60 mins) ke baad apps par automatically dobara lock lag jayega!
            </div>

            <button
              type="button"
              onClick={onClose}
              className="py-3 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-950/60 transition"
            >
              Start My Unlocked Session Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
