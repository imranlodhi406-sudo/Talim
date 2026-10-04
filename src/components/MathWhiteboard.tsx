import React, { useRef, useState, useEffect } from 'react';
import { 
  Edit3, 
  Eraser, 
  Trash2, 
  Camera, 
  Upload, 
  Check, 
  RefreshCw, 
  Video, 
  VideoOff, 
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { sound } from '../utils/audio';

interface MathWhiteboardProps {
  onImageSelected: (base64: string) => void;
  selectedImage: string | null;
}

export const MathWhiteboard: React.FC<MathWhiteboardProps> = ({
  onImageSelected,
  selectedImage,
}) => {
  const [inputMode, setInputMode] = useState<'camera' | 'upload' | 'draw'>('camera');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#34d399'); // emerald
  const [lineWidth, setLineWidth] = useState(3);
  const [isEraser, setIsEraser] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera tracks helper
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  // Start live webcam/phone camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      stopCamera();
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('Camera access not granted or unavailable. You can upload photo or draw on the whiteboard.');
    }
  };

  useEffect(() => {
    if (inputMode === 'camera' && !selectedImage) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [inputMode, selectedImage]);

  // Capture photo from live camera
  const captureFromCamera = () => {
    if (!videoRef.current) return;
    sound.playScanBeep();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }

    const video = videoRef.current;
    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = video.videoWidth || 1280;
    captureCanvas.height = video.videoHeight || 720;
    const ctx = captureCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
      const dataUrl = captureCanvas.toDataURL('image/jpeg', 0.88);
      onImageSelected(dataUrl);
      stopCamera();
    }
  };

  // Initialize canvas for drawing
  useEffect(() => {
    if (inputMode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#080d15';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw neat school notebook lines
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        for (let y = 32; y < canvas.height; y += 32) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
      }
    }
  }, [inputMode]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsDrawing(true);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    ctx.beginPath();
    ctx.moveTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    ctx.strokeStyle = isEraser ? '#080d15' : penColor;
    ctx.lineWidth = isEraser ? 18 : lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.lineTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      onImageSelected(dataUrl);
    }
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#080d15';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let y = 32; y < canvas.height; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }
    onImageSelected('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onImageSelected(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-[#0b1019] border border-emerald-500/20 rounded-3xl p-4 sm:p-5 shadow-2xl">
      {/* Mode Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setInputMode('camera');
              if (selectedImage) onImageSelected('');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              inputMode === 'camera'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Live Camera Snap (کیمرہ)
          </button>

          <button
            type="button"
            onClick={() => {
              setInputMode('upload');
              fileInputRef.current?.click();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              inputMode === 'upload'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Photo
          </button>

          <button
            type="button"
            onClick={() => {
              setInputMode('draw');
              if (selectedImage) onImageSelected('');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              inputMode === 'draw'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            Scratchpad (قلم)
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        {inputMode === 'draw' && (
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => { setIsEraser(false); setPenColor('#34d399'); }}
                className={`w-6 h-6 rounded-full bg-emerald-400 mx-0.5 border-2 ${!isEraser && penColor === '#34d399' ? 'border-white scale-110 shadow-sm' : 'border-transparent'}`}
                title="Emerald pen"
              />
              <button
                type="button"
                onClick={() => { setIsEraser(false); setPenColor('#38bdf8'); }}
                className={`w-6 h-6 rounded-full bg-sky-400 mx-0.5 border-2 ${!isEraser && penColor === '#38bdf8' ? 'border-white scale-110 shadow-sm' : 'border-transparent'}`}
                title="Cyan pen"
              />
              <button
                type="button"
                onClick={() => { setIsEraser(false); setPenColor('#fbbf24'); }}
                className={`w-6 h-6 rounded-full bg-amber-400 mx-0.5 border-2 ${!isEraser && penColor === '#fbbf24' ? 'border-white scale-110 shadow-sm' : 'border-transparent'}`}
                title="Gold pen"
              />
              <button
                type="button"
                onClick={() => setIsEraser(!isEraser)}
                className={`px-2 py-0.5 text-xs rounded-lg flex items-center gap-1 ${isEraser ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Eraser"
              >
                <Eraser className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={clearCanvas}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-800 text-xs transition"
              title="Clear Pad"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 1. CAMERA VIEW */}
      {inputMode === 'camera' && (
        <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-800 min-h-[260px] sm:min-h-[300px] flex flex-col items-center justify-center">
          {selectedImage ? (
            /* Frozen captured preview */
            <div className="relative w-full h-full p-2 flex flex-col items-center">
              <img
                src={selectedImage}
                alt="Captured notebook page"
                className="max-h-64 sm:max-h-72 w-auto mx-auto rounded-xl border border-emerald-500/40 shadow-lg object-contain"
              />
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800/80">
                  <Check className="w-3.5 h-3.5" /> Photo Snapped Ready for AI
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onImageSelected('');
                    startCamera();
                  }}
                  className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition"
                >
                  <RefreshCw className="w-3 h-3" /> Retake Photo
                </button>
              </div>
            </div>
          ) : cameraError ? (
            /* Fallback when camera permission denied */
            <div className="p-6 text-center max-w-sm">
              <VideoOff className="w-10 h-10 text-amber-400 mx-auto mb-2" />
              <p className="text-xs text-slate-300 mb-3">{cameraError}</p>
              <button
                type="button"
                onClick={() => setInputMode('upload')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition"
              >
                Upload Photo Instead
              </button>
            </div>
          ) : (
            /* Live Camera Feed */
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-h-64 sm:max-h-72 object-cover rounded-xl"
              />

              {/* Viewfinder Target Overlay */}
              <div className="absolute inset-4 sm:inset-6 border-2 border-dashed border-emerald-400/60 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                <div className="flex justify-between text-[10px] font-mono text-emerald-400 bg-black/60 px-2 py-0.5 rounded self-start">
                  <span>NOTEBOOK SCANNER ACTIVE</span>
                </div>
                <div className="text-[11px] text-center text-slate-200 bg-black/70 py-1 px-3 rounded-full backdrop-blur self-center">
                  📄 Align your notebook math solution inside the box
                </div>
              </div>

              {/* Shutter Button */}
              <div className="absolute bottom-3 inset-x-0 flex justify-center">
                <button
                  type="button"
                  onClick={captureFromCamera}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-xl shadow-emerald-500/30 flex items-center gap-2 active:scale-95 transition"
                >
                  <Camera className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                  SNAP NOTEBOOK PHOTO
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. UPLOAD VIEW */}
      {inputMode === 'upload' && (
        <div className="border border-dashed border-slate-700/80 rounded-2xl p-6 text-center bg-slate-950/60 min-h-[240px] flex flex-col items-center justify-center">
          {selectedImage ? (
            <div className="relative max-w-sm w-full">
              <img
                src={selectedImage}
                alt="Notebook submission"
                className="max-h-56 w-auto mx-auto rounded-xl border border-emerald-500/40 shadow-lg object-contain"
              />
              <div className="mt-3 flex items-center justify-center gap-2">
                <span className="text-xs text-emerald-400 font-semibold bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800">
                  ✓ Photo Loaded
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-full inline-flex items-center gap-1 transition"
                >
                  <RefreshCw className="w-3 h-3" /> Change File
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer p-6 hover:bg-slate-900/60 rounded-2xl transition w-full"
            >
              <Upload className="w-10 h-10 text-emerald-400 mx-auto mb-2 animate-bounce" />
              <p className="text-sm font-semibold text-slate-200">
                Click to Select Photo from Device
              </p>
              <p className="text-xs text-slate-400 mt-1">
                (Apni copy ke page ki tasveer choose karein)
              </p>
            </div>
          )}
        </div>
      )}

      {/* 3. DRAW / SCRATCHPAD VIEW */}
      {inputMode === 'draw' && (
        <div className="relative border border-slate-800 rounded-2xl overflow-hidden touch-none bg-[#080d15] shadow-inner">
          <canvas
            ref={canvasRef}
            width={720}
            height={340}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-56 sm:h-64 cursor-crosshair block"
          />
          <div className="absolute bottom-2 left-3 text-[11px] text-slate-400 pointer-events-none bg-slate-900/90 px-2.5 py-0.5 rounded-lg border border-slate-800 backdrop-blur">
            ✍️ Solve step-by-step with stylus or finger
          </div>
        </div>
      )}
    </div>
  );
};
