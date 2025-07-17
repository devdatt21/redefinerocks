// Global type declarations
declare global {
  var mongoose: {
    conn: unknown;
    promise: unknown;
  };

  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export {};
