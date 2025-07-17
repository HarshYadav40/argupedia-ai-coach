import React, { useState, useEffect } from 'react';
import { Mic, MicOff, RefreshCw, Play, Square, Save } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface FeedbackData {
  structure: number;
  clarity: number;
  logic: number;
  tone: number;
  overall: number;
  strengths: string[];
  improvements: string[];
  detailedFeedback: string;
}

const PracticeArena = () => {
  const [currentMotion, setCurrentMotion] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const motions = [
    "This house believes that social media has done more harm than good",
    "This house would ban private schools",
    "This house believes that climate change is the greatest threat to humanity",
    "This house would implement a universal basic income",
    "This house believes that artificial intelligence poses a threat to human employment",
    "This house would ban all forms of advertising",
    "This house believes that democracy is the best form of government",
    "This house would legalize all drugs",
    "This house believes that space exploration is a waste of resources",
    "This house would ban animal testing for all purposes"
  ];

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }

        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript);
        }
      };

      recognitionInstance.onend = () => {
        if (isRecording) {
          recognitionInstance.start();
        }
      };

      setRecognition(recognitionInstance);
    }

    // Initialize with a random motion
    setCurrentMotion(motions[Math.floor(Math.random() * motions.length)]);
  }, []);

  useEffect(() => {
    if (isRecording && intervalId === null) {
      const id = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      setIntervalId(id);
    } else if (!isRecording && intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRecording]);

  const getNewMotion = () => {
    const availableMotions = motions.filter(motion => motion !== currentMotion);
    const randomMotion = availableMotions[Math.floor(Math.random() * availableMotions.length)];
    setCurrentMotion(randomMotion);
    setTranscript('');
    setFeedback(null);
    setRecordingTime(0);
  };

  const startRecording = () => {
    if (recognition) {
      setIsRecording(true);
      setTranscript('');
      setRecordingTime(0);
      recognition.start();
    }
  };

  const stopRecording = () => {
    if (recognition) {
      setIsRecording(false);
      recognition.stop();
    }
  };

  const analyzeSpeech = async () => {
    if (!transcript.trim()) return;

    setIsAnalyzing(true);
    setFeedback(null);

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAYmEj1tHJMiRm7lMsQbJ83Tf3IfkkY0Fg`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a debate coach analyzing a practice speech. The motion was: "${currentMotion}"

The speaker's transcript: "${transcript}"

Please provide detailed feedback in the following JSON format:
{
  "structure": [score 1-100],
  "clarity": [score 1-100],
  "logic": [score 1-100],
  "tone": [score 1-100],
  "overall": [average of all scores],
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "detailedFeedback": "Comprehensive paragraph explaining the analysis"
}

Evaluate:
- Structure: Opening, body, conclusion, logical flow
- Clarity: Clear expression, easy to understand
- Logic: Sound reasoning, evidence, argument strength
- Tone: Confidence, persuasiveness, engagement

Provide constructive, specific feedback that helps improve debating skills.`
            }]
          }]
        })
      });

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
      try {
        // Extract JSON from the response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const feedbackData = JSON.parse(jsonMatch[0]);
          setFeedback(feedbackData);
          
          // Save to localStorage
          savePracticeSession(feedbackData);
        } else {
          throw new Error("No valid JSON found in response");
        }
      } catch (parseError) {
        console.error('Error parsing feedback:', parseError);
        // Fallback feedback
        setFeedback({
          structure: 70,
          clarity: 75,
          logic: 72,
          tone: 78,
          overall: 74,
          strengths: ["Good effort", "Clear delivery", "Relevant points"],
          improvements: ["Work on structure", "Add more evidence", "Improve conclusion"],
          detailedFeedback: "Your speech shows good potential. Focus on structuring your arguments more clearly and supporting them with stronger evidence."
        });
      }
    } catch (error) {
      console.error('Error analyzing speech:', error);
      setFeedback({
        structure: 0,
        clarity: 0,
        logic: 0,
        tone: 0,
        overall: 0,
        strengths: [],
        improvements: ["Please try again - analysis failed"],
        detailedFeedback: "Sorry, I couldn't analyze your speech. Please check your connection and try again."
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const savePracticeSession = (feedbackData: FeedbackData) => {
    const existingData = localStorage.getItem('debatify-sessions');
    const sessionData = existingData ? JSON.parse(existingData) : {
      totalSessions: 0,
      totalMinutes: 0,
      averageScore: 0,
      recentSessions: []
    };

    const newSession = {
      type: 'Practice Arena',
      score: feedbackData.overall,
      date: new Date().toLocaleDateString(),
      motion: currentMotion,
      duration: recordingTime
    };

    sessionData.totalSessions += 1;
    sessionData.totalMinutes += Math.floor(recordingTime / 60);
    sessionData.recentSessions.unshift(newSession);
    sessionData.recentSessions = sessionData.recentSessions.slice(0, 10);
    
    // Recalculate average score
    const totalScore = sessionData.recentSessions.reduce((sum: number, session: any) => sum + session.score, 0);
    sessionData.averageScore = Math.round(totalScore / sessionData.recentSessions.length);

    localStorage.setItem('debatify-sessions', JSON.stringify(sessionData));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Practice Arena</h1>
        <p className="text-xl text-slate-300">Perfect your arguments with AI-powered feedback</p>
      </div>

      {/* Motion Card */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-sm font-medium text-purple-400 mb-2">Motion</h2>
            <p className="text-lg text-white font-medium">{currentMotion}</p>
          </div>
          <button
            onClick={getNewMotion}
            className="ml-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>New Motion</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recording Section */}
        <div className="space-y-6">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20">
            <h3 className="text-xl font-bold text-white mb-6">Record Your Speech</h3>
            
            <div className="text-center space-y-4">
              <div className="text-3xl font-mono text-purple-400">
                {formatTime(recordingTime)}
              </div>
              
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!recognition}
                className={`p-6 rounded-full transition-all duration-200 ${
                  isRecording
                    ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                    : 'bg-purple-600 hover:bg-purple-700'
                } ${!recognition ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isRecording ? (
                  <Square className="h-8 w-8 text-white" />
                ) : (
                  <Play className="h-8 w-8 text-white" />
                )}
              </button>
              
              <p className="text-slate-300">
                {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
              </p>
              
              {!recognition && (
                <p className="text-red-400 text-sm">Speech recognition not supported</p>
              )}
            </div>
          </div>

          {/* Transcript */}
          {transcript && (
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20">
              <h3 className="text-lg font-bold text-white mb-4">Transcript</h3>
              <div className="bg-slate-700/50 p-4 rounded-lg max-h-40 overflow-y-auto">
                <p className="text-slate-300 text-sm leading-relaxed">
                  {transcript}
                </p>
              </div>
              
              <button
                onClick={analyzeSpeech}
                disabled={isAnalyzing}
                className="mt-4 w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {isAnalyzing ? (
                  <>
                    <LoadingSpinner />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Analyze Speech</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Feedback Section */}
        <div className="space-y-6">
          {feedback && (
            <>
              {/* Score Cards */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Structure', score: feedback.structure, color: 'blue' },
                  { label: 'Clarity', score: feedback.clarity, color: 'green' },
                  { label: 'Logic', score: feedback.logic, color: 'purple' },
                  { label: 'Tone', score: feedback.tone, color: 'orange' }
                ].map((item) => (
                  <div key={item.label} className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-4 border border-purple-500/20">
                    <div className="text-center">
                      <p className="text-slate-400 text-sm mb-1">{item.label}</p>
                      <p className="text-2xl font-bold text-white">{item.score}/100</p>
                      <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                        <div
                          className={`bg-${item.color}-500 h-2 rounded-full transition-all duration-1000`}
                          style={{ width: `${item.score}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Overall Score */}
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-white mb-2">Overall Score</h3>
                  <div className="text-4xl font-bold text-purple-400 mb-4">
                    {feedback.overall}/100
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${feedback.overall}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Detailed Feedback */}
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20">
                <h3 className="text-lg font-bold text-white mb-4">Detailed Feedback</h3>
                <p className="text-slate-300 leading-relaxed mb-6">
                  {feedback.detailedFeedback}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-green-400 font-semibold mb-3">Strengths</h4>
                    <ul className="space-y-2">
                      {feedback.strengths.map((strength, index) => (
                        <li key={index} className="text-slate-300 text-sm flex items-start space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full mt-1.5 flex-shrink-0"></div>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-orange-400 font-semibold mb-3">Areas for Improvement</h4>
                    <ul className="space-y-2">
                      {feedback.improvements.map((improvement, index) => (
                        <li key={index} className="text-slate-300 text-sm flex items-start space-x-2">
                          <div className="w-2 h-2 bg-orange-400 rounded-full mt-1.5 flex-shrink-0"></div>
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}

          {!feedback && !isAnalyzing && (
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-12 border border-purple-500/20 text-center">
              <p className="text-slate-400 text-lg">
                Record your speech and get detailed AI feedback on your debate performance.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeArena;
