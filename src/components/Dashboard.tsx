
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Target, Scale, Trophy, Clock, TrendingUp } from 'lucide-react';

interface SessionData {
  totalSessions: number;
  totalMinutes: number;
  averageScore: number;
  recentSessions: Array<{
    type: string;
    score: number;
    date: string;
  }>;
}

const Dashboard = () => {
  const [sessionData, setSessionData] = useState<SessionData>({
    totalSessions: 0,
    totalMinutes: 0,
    averageScore: 0,
    recentSessions: []
  });

  useEffect(() => {
    const data = localStorage.getItem('debatify-sessions');
    if (data) {
      setSessionData(JSON.parse(data));
    }
  }, []);

  const modules = [
    {
      title: 'AI Debate Coach',
      description: 'Practice live debates with AI opponents. Use voice recognition for natural conversation flow.',
      icon: Brain,
      path: '/coach',
      color: 'from-blue-500 to-purple-600',
      features: ['Voice Recognition', 'Real-time Rebuttals', 'Adaptive Difficulty']
    },
    {
      title: 'Practice Arena',
      description: 'Get random debate motions and receive detailed AI feedback on your arguments.',
      icon: Target,
      path: '/practice',
      color: 'from-green-500 to-teal-600',
      features: ['Random Motions', 'Structure Analysis', 'Tone Evaluation']
    },
    {
      title: 'Smart Judge Assistant',
      description: 'Upload full debate transcripts for comprehensive AI-powered adjudication.',
      icon: Scale,
      path: '/judge',
      color: 'from-orange-500 to-red-600',
      features: ['Fallacy Detection', 'Argument Scoring', 'Role Analysis']
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-4">
          Welcome to <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Debatify</span>
        </h1>
        <p className="text-xl text-slate-300 max-w-3xl mx-auto">
          Your AI-powered companion for mastering competitive debating. Practice, learn, and excel with intelligent feedback.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20">
          <div className="flex items-center space-x-3">
            <Trophy className="h-8 w-8 text-yellow-400" />
            <div>
              <p className="text-slate-400 text-sm">Total Sessions</p>
              <p className="text-2xl font-bold text-white">{sessionData.totalSessions}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20">
          <div className="flex items-center space-x-3">
            <Clock className="h-8 w-8 text-blue-400" />
            <div>
              <p className="text-slate-400 text-sm">Practice Time</p>
              <p className="text-2xl font-bold text-white">{sessionData.totalMinutes} min</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-8 w-8 text-green-400" />
            <div>
              <p className="text-slate-400 text-sm">Average Score</p>
              <p className="text-2xl font-bold text-white">{sessionData.averageScore || 0}/100</p>
            </div>
          </div>
        </div>
      </div>

      {/* Module Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {modules.map((module, index) => {
          const Icon = module.icon;
          return (
            <Link
              key={index}
              to={module.path}
              className="group bg-slate-800/50 backdrop-blur-xl rounded-xl p-8 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
            >
              <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${module.color} mb-6`}>
                <Icon className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
                {module.title}
              </h3>
              
              <p className="text-slate-400 mb-6 leading-relaxed">
                {module.description}
              </p>
              
              <div className="space-y-2">
                {module.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-slate-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-purple-400 font-semibold group-hover:text-purple-300 transition-colors">
                Start Practicing →
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Sessions */}
      {sessionData.recentSessions.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">Recent Sessions</h2>
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20">
            <div className="space-y-4">
              {sessionData.recentSessions.slice(0, 5).map((session, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{session.type}</p>
                    <p className="text-slate-400 text-sm">{session.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-400">{session.score}/100</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
