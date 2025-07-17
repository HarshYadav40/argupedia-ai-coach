
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, RefreshCw, Volume2 } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const AIDebateCoach = () => {
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTopic, setCurrentTopic] = useState('');
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const topics = [
    "This house believes that social media has done more harm than good",
    "This house would ban private ownership of firearms",
    "This house believes that climate change is the greatest threat to humanity",
    "This house would implement universal basic income",
    "This house believes that artificial intelligence poses a threat to human employment"
  ];

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript + interimTranscript);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }

    // Initialize with a random topic
    setCurrentTopic(topics[Math.floor(Math.random() * topics.length)]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startListening = () => {
    if (recognition) {
      setIsListening(true);
      setTranscript('');
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setTranscript('');
    setIsLoading(true);

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAYmEj1tHJMiRm7lMsQbJ83Tf3IfkkY0Fg`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an AI debate coach. The current debate topic is: "${currentTopic}". 
              
              The user just said: "${text}"
              
              Provide a thoughtful rebuttal or counter-argument. Keep your response engaging, challenging, and educational. Focus on:
              1. Addressing their specific points
              2. Introducing counter-evidence or alternative perspectives
              3. Highlighting potential weaknesses in their argument
              4. Maintaining a respectful but challenging tone
              
              Keep your response under 150 words for natural conversation flow.`
            }]
          }]
        })
      });

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response. Please try again.";

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting. Please check your connection and try again.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const newTopic = () => {
    const availableTopics = topics.filter(topic => topic !== currentTopic);
    const randomTopic = availableTopics[Math.floor(Math.random() * availableTopics.length)];
    setCurrentTopic(randomTopic);
    setMessages([]);
    setTranscript('');
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">AI Debate Coach</h1>
        <p className="text-xl text-slate-300">Practice live debates with intelligent AI opponents</p>
      </div>

      {/* Topic Card */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-sm font-medium text-purple-400 mb-2">Current Topic</h2>
            <p className="text-lg text-white font-medium">{currentTopic}</p>
          </div>
          <button
            onClick={newTopic}
            className="ml-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>New Topic</span>
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-purple-500/20 mb-6 h-96 overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-slate-400 mt-20">
                <p className="text-lg mb-2">Ready to start debating?</p>
                <p>Use the microphone to speak your argument or type below.</p>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-slate-100'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  {message.sender === 'ai' && (
                    <button
                      onClick={() => speakText(message.text)}
                      className="mt-2 text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-700 px-4 py-2 rounded-lg">
                  <LoadingSpinner />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Voice Input */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20 mb-6">
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={!recognition}
            className={`p-4 rounded-full transition-all duration-200 ${
              isListening
                ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                : 'bg-purple-600 hover:bg-purple-700'
            } ${!recognition ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isListening ? (
              <MicOff className="h-6 w-6 text-white" />
            ) : (
              <Mic className="h-6 w-6 text-white" />
            )}
          </button>
          <div className="text-center">
            <p className="text-white font-medium">
              {isListening ? 'Listening...' : 'Click to speak'}
            </p>
            {!recognition && (
              <p className="text-red-400 text-sm">Speech recognition not supported</p>
            )}
          </div>
        </div>
        
        {transcript && (
          <div className="mt-4 p-4 bg-slate-700/50 rounded-lg">
            <p className="text-slate-300">{transcript}</p>
          </div>
        )}
      </div>

      {/* Text Input */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20">
        <div className="flex space-x-4">
          <input
            type="text"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Type your argument here..."
            className="flex-1 bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-purple-500 focus:outline-none"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                sendMessage(transcript);
              }
            }}
          />
          <button
            onClick={() => sendMessage(transcript)}
            disabled={!transcript.trim() || isLoading}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Send className="h-4 w-4" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIDebateCoach;
