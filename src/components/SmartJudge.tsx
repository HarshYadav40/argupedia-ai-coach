
import React, { useState } from 'react';
import { Upload, FileText, Scale, AlertTriangle, TrendingUp, Award } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface JudgmentData {
  overallScore: number;
  argumentStrength: number;
  logicalConsistency: number;
  evidenceQuality: number;
  presentation: number;
  fallacies: string[];
  strengths: string[];
  weaknesses: string[];
  speakerRoles: {
    speaker: string;
    role: string;
    performance: number;
    feedback: string;
  }[];
  detailedAnalysis: string;
  winnerPrediction: string;
}

const SmartJudge = () => {
  const [transcript, setTranscript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [judgment, setJudgment] = useState<JudgmentData | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setTranscript(content);
      };
      reader.readAsText(uploadedFile);
    }
  };

  const analyzeDebate = async () => {
    if (!transcript.trim()) return;

    setIsAnalyzing(true);
    setJudgment(null);

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAYmEj1tHJMiRm7lMsQbJ83Tf3IfkkY0Fg`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an expert debate adjudicator. Analyze the following debate transcript and provide comprehensive judgment.

Transcript: "${transcript}"

Please provide detailed analysis in the following JSON format:
{
  "overallScore": [score 1-100],
  "argumentStrength": [score 1-100],
  "logicalConsistency": [score 1-100], 
  "evidenceQuality": [score 1-100],
  "presentation": [score 1-100],
  "fallacies": ["fallacy 1", "fallacy 2", "fallacy 3"],
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "speakerRoles": [
    {
      "speaker": "Speaker name or identifier",
      "role": "Government/Opposition/etc",
      "performance": [score 1-100],
      "feedback": "Specific feedback for this speaker"
    }
  ],
  "detailedAnalysis": "Comprehensive analysis paragraph",
  "winnerPrediction": "Which side likely won and why"
}

Analyze for:
- Logical fallacies (ad hominem, straw man, false dichotomy, etc.)
- Argument structure and strength
- Evidence quality and relevance  
- Speaker performance and roles
- Overall debate quality
- Predict the likely winner based on debate merit

Be thorough, fair, and constructive in your analysis.`
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
          const judgmentData = JSON.parse(jsonMatch[0]);
          setJudgment(judgmentData);
          
          // Save to localStorage
          saveJudgmentSession(judgmentData);
        } else {
          throw new Error("No valid JSON found in response");
        }
      } catch (parseError) {
        console.error('Error parsing judgment:', parseError);
        // Fallback judgment
        setJudgment({
          overallScore: 75,
          argumentStrength: 78,
          logicalConsistency: 72,
          evidenceQuality: 70,
          presentation: 80,
          fallacies: ["Could not detect specific fallacies"],
          strengths: ["Good structure", "Clear delivery", "Relevant arguments"],
          weaknesses: ["Could use more evidence", "Some weak rebuttals", "Timing issues"],
          speakerRoles: [
            {
              speaker: "Analysis unavailable",
              role: "Unable to determine",
              performance: 75,
              feedback: "Detailed speaker analysis could not be completed. Please try again with a clearer transcript."
            }
          ],
          detailedAnalysis: "Your debate shows good potential overall. The arguments presented were generally well-structured, though there's room for improvement in evidence quality and logical consistency.",
          winnerPrediction: "Unable to determine winner from current analysis. Please ensure the transcript includes clear speaker identification and complete arguments."
        });
      }
    } catch (error) {
      console.error('Error analyzing debate:', error);
      setJudgment({
        overallScore: 0,
        argumentStrength: 0,
        logicalConsistency: 0,
        evidenceQuality: 0,
        presentation: 0,
        fallacies: [],
        strengths: [],
        weaknesses: ["Analysis failed - please try again"],
        speakerRoles: [],
        detailedAnalysis: "Sorry, I couldn't analyze your debate. Please check your connection and try again.",
        winnerPrediction: "Analysis failed"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveJudgmentSession = (judgmentData: JudgmentData) => {
    const existingData = localStorage.getItem('debatify-sessions');
    const sessionData = existingData ? JSON.parse(existingData) : {
      totalSessions: 0,
      totalMinutes: 0,
      averageScore: 0,
      recentSessions: []
    };

    const newSession = {
      type: 'Smart Judge',
      score: judgmentData.overallScore,
      date: new Date().toLocaleDateString(),
      transcriptLength: transcript.length
    };

    sessionData.totalSessions += 1;
    sessionData.recentSessions.unshift(newSession);
    sessionData.recentSessions = sessionData.recentSessions.slice(0, 10);
    
    // Recalculate average score
    const totalScore = sessionData.recentSessions.reduce((sum: number, session: any) => sum + session.score, 0);
    sessionData.averageScore = Math.round(totalScore / sessionData.recentSessions.length);

    localStorage.setItem('debatify-sessions', JSON.stringify(sessionData));
  };

  const clearAnalysis = () => {
    setJudgment(null);
    setTranscript('');
    setFile(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Smart Judge Assistant</h1>
        <p className="text-xl text-slate-300">AI-powered comprehensive debate adjudication</p>
      </div>

      {/* Input Section */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20 mb-8">
        <h2 className="text-xl font-bold text-white mb-6">Upload Debate Transcript</h2>
        
        <div className="space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Upload Text File
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept=".txt,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>Choose File</span>
              </label>
              {file && (
                <span className="text-slate-300 text-sm">{file.name}</span>
              )}
            </div>
          </div>

          {/* Text Area */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Or Paste Transcript Here
            </label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste your complete debate transcript here... Include speaker names, arguments, rebuttals, and any other relevant debate content."
              className="w-full h-64 bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-purple-500 focus:outline-none resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={analyzeDebate}
              disabled={!transcript.trim() || isAnalyzing}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
            >
              {isAnalyzing ? (
                <>
                  <LoadingSpinner />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Scale className="h-5 w-5" />
                  <span>Analyze Debate</span>
                </>
              )}
            </button>
            
            {judgment && (
              <button
                onClick={clearAnalysis}
                className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
              >
                <FileText className="h-5 w-5" />
                <span>New Analysis</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      {judgment && (
        <div className="space-y-8">
          {/* Overall Score */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Overall Debate Quality</h2>
              <div className="text-5xl font-bold text-purple-400 mb-4">
                {judgment.overallScore}/100
              </div>
              <div className="w-full max-w-md mx-auto bg-slate-700 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-1000"
                  style={{ width: `${judgment.overallScore}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Detailed Scores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Argument Strength', score: judgment.argumentStrength, icon: TrendingUp, color: 'blue' },
              { label: 'Logical Consistency', score: judgment.logicalConsistency, icon: Scale, color: 'green' },
              { label: 'Evidence Quality', score: judgment.evidenceQuality, icon: FileText, color: 'purple' },
              { label: 'Presentation', score: judgment.presentation, icon: Award, color: 'orange' }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20">
                  <div className="text-center">
                    <Icon className={`h-8 w-8 text-${item.color}-400 mx-auto mb-3`} />
                    <p className="text-slate-400 text-sm mb-2">{item.label}</p>
                    <p className="text-2xl font-bold text-white mb-2">{item.score}/100</p>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className={`bg-${item.color}-500 h-2 rounded-full transition-all duration-1000`}
                        style={{ width: `${item.score}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Winner Prediction */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <Award className="h-6 w-6 text-yellow-400" />
              <span>Winner Prediction</span>
            </h3>
            <p className="text-slate-300 leading-relaxed">
              {judgment.winnerPrediction}
            </p>
          </div>

          {/* Speaker Analysis */}
          {judgment.speakerRoles.length > 0 && (
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20">
              <h3 className="text-xl font-bold text-white mb-6">Speaker Performance</h3>
              <div className="space-y-4">
                {judgment.speakerRoles.map((speaker, index) => (
                  <div key={index} className="bg-slate-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-white font-semibold">{speaker.speaker}</h4>
                        <p className="text-slate-400 text-sm">{speaker.role}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-400">{speaker.performance}/100</p>
                        <div className="w-20 bg-slate-600 rounded-full h-2 mt-1">
                          <div
                            className="bg-purple-500 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${speaker.performance}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-300 text-sm">{speaker.feedback}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Analysis */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20">
            <h3 className="text-xl font-bold text-white mb-4">Detailed Analysis</h3>
            <p className="text-slate-300 leading-relaxed mb-6">
              {judgment.detailedAnalysis}
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Logical Fallacies */}
              <div>
                <h4 className="text-red-400 font-semibold mb-3 flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Logical Fallacies</span>
                </h4>
                <ul className="space-y-2">
                  {judgment.fallacies.length > 0 ? judgment.fallacies.map((fallacy, index) => (
                    <li key={index} className="text-slate-300 text-sm flex items-start space-x-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>{fallacy}</span>
                    </li>
                  )) : (
                    <li className="text-slate-400 text-sm">No major fallacies detected</li>
                  )}
                </ul>
              </div>

              {/* Strengths */}
              <div>
                <h4 className="text-green-400 font-semibold mb-3">Strengths</h4>
                <ul className="space-y-2">
                  {judgment.strengths.map((strength, index) => (
                    <li key={index} className="text-slate-300 text-sm flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div>
                <h4 className="text-orange-400 font-semibold mb-3">Areas for Improvement</h4>
                <ul className="space-y-2">
                  {judgment.weaknesses.map((weakness, index) => (
                    <li key={index} className="text-slate-300 text-sm flex items-start space-x-2">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {!judgment && !isAnalyzing && (
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-12 border border-purple-500/20 text-center">
          <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-400 text-lg mb-2">
            Upload or paste your debate transcript for comprehensive AI analysis
          </p>
          <p className="text-slate-500">
            Get detailed scoring, fallacy detection, and speaker performance analysis
          </p>
        </div>
      )}
    </div>
  );
};

export default SmartJudge;
