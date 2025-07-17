'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Question, CreateAnswerData } from '@/types';
import { Mic, MicOff, User } from 'lucide-react';

interface AnswerModalProps {
  isOpen: boolean;
  onClose: (answerSubmitted?: boolean) => void;
  question: Question;
}

export const SimpleAnswerModal: React.FC<AnswerModalProps> = ({
  isOpen,
  onClose,
  question,
}) => {
  const [textAnswer, setTextAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recognition, setRecognition] = useState<any>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Initialize speech recognition
      if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const SpeechRecognition = (window as unknown as { SpeechRecognition: any; webkitSpeechRecognition: any }).SpeechRecognition || (window as unknown as { SpeechRecognition: any; webkitSpeechRecognition: any }).webkitSpeechRecognition;
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false; // Changed to false for better reliability
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'en-US';
        recognitionInstance.maxAlternatives = 1;

        recognitionInstance.onstart = () => {
          console.log('Speech recognition started');
          setIsRecording(true);
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognitionInstance.onresult = (event: any) => {
          let finalTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            }
          }
          
          if (finalTranscript) {
            setTextAnswer(prev => prev + (prev ? ' ' : '') + finalTranscript);
          }
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognitionInstance.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
          
          // Don't show error message for network errors during initialization
          if (event.error === 'network' && !isRecording) {
            console.log('Network error during speech recognition initialization (this is normal)');
            return;
          }
          
          if (event.error === 'not-allowed') {
            setError('Microphone access denied. Please allow microphone permissions and try again.');
          } else if (event.error === 'no-speech') {
            setError('No speech detected. Please try speaking again.');
          } else if (event.error === 'network') {
            setError('Network error. Please check your internet connection and try again.');
          } else if (event.error === 'aborted') {
            // User stopped recording, don't show error
            return;
          } else {
            console.log(`Speech recognition error: ${event.error} (not showing to user)`);
          }
        };

        recognitionInstance.onend = () => {
          console.log('Speech recognition ended');
          setIsRecording(false);
        };

        setRecognition(recognitionInstance);
      } else {
        console.log('Speech recognition not supported in this browser');
      }
    }

    // Cleanup function
    return () => {
      if (recognition) {
        try {
          recognition.stop();
        } catch (error) {
          console.log('Error stopping recognition:', error);
        }
      }
      if (recordingInterval) {
        clearInterval(recordingInterval);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());

        // Try to convert audio to text
        try {
          await convertAudioToText();
        } catch (error) {
          console.log('Audio to text conversion failed:', error);
          // Continue without text conversion
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecordingAudio(true);
      setRecordingDuration(0);
      
      // Start duration counter
      const interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      setRecordingInterval(interval);

    } catch (error) {
      console.error('Audio recording error:', error);
      setError('Could not access microphone. Please allow microphone permissions.');
    }
  };

  const convertAudioToText = async () => {
    // For now, we'll use the same speech recognition approach
    // In a production app, you might want to use a service like:
    // - Google Cloud Speech-to-Text
    // - Azure Speech Services
    // - AWS Transcribe
    // - OpenAI Whisper API
    
    try {
      if (recognition && 'webkitSpeechRecognition' in window) {
        // Note: This is a simplified approach
        // Real audio-to-text would require uploading the blob to a service
        console.log('Audio recorded. Text conversion would happen on server with proper API.');
      }
    } catch (error) {
      console.log('Text conversion not available:', error);
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorder && isRecordingAudio) {
      mediaRecorder.stop();
      setIsRecordingAudio(false);
      if (recordingInterval) {
        clearInterval(recordingInterval);
        setRecordingInterval(null);
      }
    }
  };

  const clearAudioRecording = () => {
    setAudioBlob(null);
    setRecordingDuration(0);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textAnswer.trim() && !audioBlob) {
      setError('Please provide either a text answer or an audio recording.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let audioUrl = null;

      // Upload audio if present
      if (audioBlob) {
        const formData = new FormData();
        formData.append('audio', audioBlob, `answer-${Date.now()}.wav`);
        formData.append('questionId', question.id);

        const uploadResponse = await fetch('/api/upload/audio', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload audio');
        }

        const uploadData = await uploadResponse.json();
        audioUrl = uploadData.audioUrl;
      }

      // Create answer
      const answerData: CreateAnswerData = {
        questionId: question.id,
        ...(textAnswer.trim() && { text: textAnswer.trim() }),
        ...(audioUrl && { audioUrl }),
      };

      const response = await fetch('/api/answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(answerData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit answer');
      }

      // Success - close modal and reset form
      setTextAnswer('');
      setAudioBlob(null);
      setRecordingDuration(0);
      onClose(true); // Pass true to indicate answer was submitted
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTextAnswer('');
    setError('');
    setAudioBlob(null);
    setRecordingDuration(0);
    
    if (isRecording && recognition) {
      recognition.stop();
    }
    
    if (isRecordingAudio && mediaRecorder) {
      mediaRecorder.stop();
      setIsRecordingAudio(false);
    }
    
    if (recordingInterval) {
      clearInterval(recordingInterval);
      setRecordingInterval(null);
    }
    
    onClose(false); // Pass false to indicate no answer was submitted
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="💬 Write Your Answer" size="lg">
      <div className="space-y-6">
        {/* Question Display */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100 shadow-sm backdrop-blur-sm">
          <h3 className="font-semibold text-gray-900 mb-3 text-lg whitespace-pre-wrap">{question.text}</h3>
          <div className="text-sm text-blue-700 flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Asked by <span className="font-medium">{question.user?.name}</span> in <span className="font-medium">{question.group?.name}</span></span>
          </div>
        </div>

        {/* Answer Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-800 rounded-xl shadow-sm animate-pulse">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Answer ✨
              </label>
              <div className="relative">
                <textarea
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  placeholder="Share your knowledge and help others... 🧠💡"
                  className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/80 resize-none text-gray-900"
                  rows={4}
                  autoFocus
                />
                {/* <button
                  type="button"
                  onClick={handleToggleRecording}
                  className={cn(
                    'absolute right-3 top-3 p-2 rounded-xl transition-all duration-200 transform hover:scale-105',
                    isRecording
                      ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-600 shadow-lg'
                      : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 hover:from-blue-100 hover:to-blue-200 hover:text-blue-600'
                  )}
                  title="Speech to Text"
                >
                  {isRecording ? (
                    <MicOff className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </button> */}
              </div>
              {/* {isRecording && (
                <p className="text-sm text-red-600 mt-2 animate-pulse flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-ping"></div>
                  🎤 Listening... Speak clearly and pause when finished
                </p>
              )} */}
              {!recognition && (
                <p className="text-sm text-gray-500 mt-2">
                  💡 Speech recognition requires Chrome, Edge, or Safari browser
                </p>
              )}
            </div>

            {/* Audio Recording Section */}
            <div className="border-t border-gray-200/50 pt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Or Record Audio Answer 🎙️
              </label>
              
              {!audioBlob && !isRecordingAudio && (
                <button
                  type="button"
                  onClick={startAudioRecording}
                  className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-xl border border-green-200 hover:from-green-200 hover:to-emerald-200 transition-all duration-200 font-medium"
                >
                  <Mic className="w-5 h-5" />
                  <span>Start Audio Recording</span>
                </button>
              )}

              {isRecordingAudio && (
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border border-red-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-700 font-medium">Recording... {formatDuration(recordingDuration)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={stopAudioRecording}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <MicOff className="w-4 h-4" />
                    <span>Stop</span>
                  </button>
                </div>
              )}

              {audioBlob && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-blue-700 font-medium">
                      🎙️ Audio Recorded ({formatDuration(recordingDuration)})
                    </span>
                    <button
                      type="button"
                      onClick={clearAudioRecording}
                      className="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-1 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                  <audio controls className="w-full mb-2">
                    <source src={URL.createObjectURL(audioBlob)} type="audio/wav" />
                    <source src={URL.createObjectURL(audioBlob)} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-green-600">✅ Ready to submit</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-600">Size: {(audioBlob.size / 1024).toFixed(1)} KB</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-200/50">
            <p className="text-sm text-gray-600">
              💡 Tip: Provide either text or audio answer (or both!)
            </p>
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading || (!textAnswer.trim() && !audioBlob)}
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </div>
                ) : (
                  '🚀 Submit Answer'
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};
