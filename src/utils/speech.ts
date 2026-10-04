// Speech Synthesis & Recognition helpers

export function speakText(text: string, onEnd?: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Strip markdown, asterisks, brackets for natural reading
  const clean = text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/#/g, '')
    .replace(/[\[\]]/g, '')
    .replace(/\n+/g, ' ');

  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  // Try to pick a natural voice if available (Urdu / Hindi / British / US)
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(v => 
    v.lang.startsWith('ur') || 
    v.lang.startsWith('hi') || 
    v.name.includes('Natural') || 
    v.lang.includes('en-GB') || 
    v.lang.includes('en-US')
  );
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// Speech Recognition helper
export function createSpeechRecognizer(
  onTranscript: (text: string) => void,
  onError: (err: any) => void,
  onEnd: () => void
) {
  if (typeof window === 'undefined') return null;

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'en-US'; // Works reasonably well for Roman Urdu / English mixed answers

  recognition.onresult = (event: any) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      transcript += event.results[i][0].transcript;
    }
    onTranscript(transcript);
  };

  recognition.onerror = (e: any) => {
    console.warn("Speech recognition error:", e);
    onError(e);
  };

  recognition.onend = () => {
    onEnd();
  };

  return recognition;
}
