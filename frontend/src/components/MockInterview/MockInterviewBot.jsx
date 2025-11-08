import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Download, History, Send, RotateCcw, AlertCircle } from 'lucide-react';

const MockInterviewBot = () => {
  const GEMINI_API_KEY = "AIzaSyCVrGPaPqhxQqxsrWzSOzJSTvzCRAFPAOg";
  
  const [stage, setStage] = useState('setup');
  const [userDetails, setUserDetails] = useState({
    role: '',
    experience: '',
    skills: '',
    numQuestions: 10
  });
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [answers, setAnswers] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [results, setResults] = useState(null);
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  useEffect(() => {
    loadInterviewHistory();
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setUserAnswer(prev => prev + ' ' + transcript);
      };
      
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const loadInterviewHistory = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('interviewHistory') || '[]');
      setInterviewHistory(stored);
    } catch (err) {
      console.error('Error loading history:', err);
    }
  };

  const speak = (text) => {
    if (!voiceEnabled) return;
    
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    synthRef.current.cancel();
    setIsSpeaking(false);
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const cleanJSONResponse = (text) => {
    let cleaned = text.replace(/```json\n?/gi, '').replace(/```\n?/g, '');
    const jsonMatch = cleaned.match(/[\[{][\s\S]*[\]}]/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }
    cleaned = cleaned
      .replace(/,\s*([\]}])/g, '$1')
      .replace(/\n/g, ' ')
      .replace(/\t/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
    return cleaned;
  };

  const generateQuestions = async () => {
    setIsProcessing(true);
    setError('');
    
    const prompt = `Generate exactly ${userDetails.numQuestions} unique interview questions for a ${userDetails.role} position with ${userDetails.experience} years of experience. Focus on these skills: ${userDetails.skills}.

Mix technical, behavioral, and situational questions based on the role and experience level.

Return ONLY a valid JSON array with this exact structure (no markdown, no extra text):
[
  {
    "question": "detailed question text here",
    "difficulty": "easy",
    "category": "technical"
  }
]

Make sure:
- All questions are unique and relevant
- Difficulty varies (easy/medium/hard)
- Categories are: technical, behavioral, or situational
- Questions are specific to the role and skills mentioned`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${errorData.error?.message || 'Failed to generate questions'}`);
      }

      const data = await response.json();
      if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid API response structure');
      }

      const generatedText = data.candidates[0].content.parts[0].text;
      const cleanText = cleanJSONResponse(generatedText);
      const generatedQuestions = JSON.parse(cleanText);
      
      if (!Array.isArray(generatedQuestions) || generatedQuestions.length === 0) {
        throw new Error('No questions generated');
      }
      
      setQuestions(generatedQuestions);
      setStage('interview');
      setIsProcessing(false);
      
      setTimeout(() => {
        speak(generatedQuestions[0].question);
      }, 500);
    } catch (error) {
      console.error('❌ Error:', error);
      setIsProcessing(false);
      setError(error.message || 'Failed to generate questions. Please try again.');
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim()) return;

    const currentAnswer = {
      question: questions[currentQuestionIndex].question,
      answer: userAnswer,
      category: questions[currentQuestionIndex].category,
      difficulty: questions[currentQuestionIndex].difficulty
    };

    const newAnswers = [...answers, currentAnswer];
    setAnswers(newAnswers);
    setUserAnswer('');
    stopSpeaking();

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimeout(() => {
        speak(questions[currentQuestionIndex + 1].question);
      }, 500);
    } else {
      await evaluateInterview(newAnswers);
    }
  };

  const evaluateInterview = async (finalAnswers) => {
    setIsProcessing(true);
    setError('');
    
    const evaluationPrompt = `You are an expert interview evaluator. Analyze this interview performance in detail:

Role: ${userDetails.role}
Experience Level: ${userDetails.experience} years
Skills: ${userDetails.skills}

Interview Questions and Candidate Answers:
${finalAnswers.map((a, i) => `
Question ${i + 1} [${a.category} - ${a.difficulty}]: ${a.question}

Candidate's Answer: ${a.answer}
`).join('\n---\n')}

Provide a comprehensive evaluation. Return ONLY a valid JSON object (no markdown, no extra text):
{
  "overallScore": 85,
  "categoryScores": {
    "technical": 80,
    "behavioral": 85,
    "situational": 90
  },
  "strengths": [
    "Specific strength 1 with examples",
    "Specific strength 2 with examples"
  ],
  "weaknesses": [
    "Specific area for improvement 1",
    "Specific area for improvement 2"
  ],
  "detailedFeedback": [
    {
      "question": "exact question from above",
      "userAnswer": "their exact answer",
      "score": 8,
      "feedback": "Detailed analysis of the answer",
      "improvedAnswer": "A comprehensive improved answer example"
    }
  ]
}

Be honest and constructive. Scores should reflect actual performance.`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: evaluationPrompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${errorData.error?.message || 'Failed to evaluate'}`);
      }

      const data = await response.json();
      if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid evaluation response');
      }

      const generatedText = data.candidates[0].content.parts[0].text;
      const cleanText = cleanJSONResponse(generatedText);
      const evaluation = JSON.parse(cleanText);

      if (!evaluation.overallScore || !evaluation.categoryScores) {
        throw new Error('Invalid evaluation format');
      }

      const interviewResult = {
        ...evaluation,
        userDetails,
        timestamp: Date.now(),
        id: `interview-${Date.now()}`
      };
      
      setResults(interviewResult);
      setStage('results');
      setIsProcessing(false);
      
      const newHistory = [interviewResult, ...interviewHistory];
      setInterviewHistory(newHistory);
      localStorage.setItem('interviewHistory', JSON.stringify(newHistory));
      
      speak(`Interview completed! Your overall score is ${evaluation.overallScore} out of 100.`);
    } catch (error) {
      console.error('❌ Evaluation Error:', error);
      setIsProcessing(false);
      setError(error.message || 'Failed to evaluate. Please try again.');
    }
  };

  const downloadResults = (format) => {
    if (!results) return;

    const dataStr = format === 'json' 
      ? JSON.stringify(results, null, 2)
      : generatePDFContent(results);

    const blob = new Blob([dataStr], { type: format === 'json' ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `interview-results-${Date.now()}.${format === 'json' ? 'json' : 'txt'}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const generatePDFContent = (data) => {
    return `
INTERVIEW RESULTS
================

Role: ${data.userDetails.role}
Experience: ${data.userDetails.experience} years
Skills: ${data.userDetails.skills}
Date: ${new Date(data.timestamp).toLocaleDateString()}

OVERALL SCORE: ${data.overallScore}/100

CATEGORY SCORES:
${Object.entries(data.categoryScores).map(([cat, score]) => `- ${cat}: ${score}/100`).join('\n')}

STRENGTHS:
${data.strengths.map((s, i) => `${i + 1}. ${s}`).join('\n')}

AREAS FOR IMPROVEMENT:
${data.weaknesses.map((w, i) => `${i + 1}. ${w}`).join('\n')}

DETAILED FEEDBACK:
${data.detailedFeedback.map((f, i) => `
Question ${i + 1}: ${f.question}
Your Answer: ${f.userAnswer}
Score: ${f.score}/10
Feedback: ${f.feedback}
Improved Answer: ${f.improvedAnswer}
`).join('\n---\n')}
    `;
  };

  const resetInterview = () => {
    setStage('setup');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswer('');
    setAnswers([]);
    setResults(null);
    setError('');
    stopSpeaking();
  };

  const viewHistoryItem = (item) => {
    setResults(item);
    setStage('results');
  };

  if (stage === 'setup') {
    return (
     <div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100 p-6 animate-gradient">
        <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 hover:shadow-violet-200/50 transition-all duration-300">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent mb-2">AI Mock Interview Bot</h1>
          <p className="text-gray-800 mb-6">Prepare for your next interview with AI-powered practice</p>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-start">
              <AlertCircle className="mr-2 mt-0.5" size={20} />
              <span>{error}</span>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Job Role</label>
              <input
                type="text"
                placeholder="e.g., Software Engineer, Product Manager"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                value={userDetails.role}
                onChange={(e) => setUserDetails({...userDetails, role: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Years of Experience</label>
              <input
                type="text"
                placeholder="e.g., 3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                value={userDetails.experience}
                onChange={(e) => setUserDetails({...userDetails, experience: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Key Skills (comma-separated)</label>
              <textarea
                placeholder="e.g., React, Node.js, Python, System Design"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent h-24"
                value={userDetails.skills}
                onChange={(e) => setUserDetails({...userDetails, skills: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Number of Questions</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                value={userDetails.numQuestions}
                onChange={(e) => setUserDetails({...userDetails, numQuestions: parseInt(e.target.value)})}
              >
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
                <option value={20}>20 Questions</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="voiceEnabled"
                checked={voiceEnabled}
                onChange={(e) => setVoiceEnabled(e.target.checked)}
                className="w-4 h-4 text-violet-600"
              />
              <label htmlFor="voiceEnabled" className="text-sm text-gray-700">
                Enable voice questions
              </label>
            </div>
            
            <button
              onClick={generateQuestions}
              disabled={!userDetails.role || !userDetails.experience || !userDetails.skills || isProcessing}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-violet-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-violet-500/50"
            >
              {isProcessing ? 'Generating AI Questions...' : 'Start Interview'}
            </button>

            <button
              onClick={() => setStage('history')}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
            >
              <History size={20} />
              <span>View Interview History</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'interview') {
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    
    return (
     <div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100 p-6 animate-gradient">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 hover:shadow-violet-200/50 transition-all duration-300">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-900">Question {currentQuestionIndex + 1} of {questions.length}</span>
                <span className="text-sm text-gray-900">{Math.round(progress)}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{width: `${progress}%`}}
                />
              </div>
            </div>

            <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border-l-4 border-violet-500 p-6 rounded-lg mb-6 hover:shadow-lg transition-all duration-300">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-semibold text-gray-800 flex-1">
                  {questions[currentQuestionIndex]?.question}
                </h2>
                <button
                  onClick={() => isSpeaking ? stopSpeaking() : speak(questions[currentQuestionIndex]?.question)}
                  className="ml-4 p-2 hover:bg-violet-100 rounded-full transition-colors"
                >
                  {isSpeaking ? <VolumeX size={24} className="text-violet-600" /> : <Volume2 size={24} className="text-violet-600" />}
                </button>
              </div>
              <div className="flex space-x-2 mt-3">
                <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700">
                  {questions[currentQuestionIndex]?.category}
                </span>
                <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700">
                  {questions[currentQuestionIndex]?.difficulty}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your answer here or use voice input..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent h-40"
              />
              
              <div className="flex space-x-3">
                <button
                  onClick={toggleRecording}
                  className={`flex-1 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                    isRecording 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                  <span>{isRecording ? 'Stop Recording' : 'Voice Input'}</span>
                </button>
                
                <button
                  onClick={submitAnswer}
                  disabled={!userAnswer.trim()}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-violet-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-violet-500/50"
                >
                  <Send size={20} />
                  <span>{currentQuestionIndex === questions.length - 1 ? 'Finish Interview' : 'Next Question'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'results') {
    return (
     <div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100 p-6 animate-gradient">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 hover:shadow-violet-200/50 transition-all duration-300">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent mb-2">Interview Results</h1>
              <div className="text-6xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent mb-2">{results?.overallScore}/100</div>
              <p className="text-gray-900">Overall Performance</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {Object.entries(results?.categoryScores || {}).map(([category, score]) => (
                <div key={category} className="bg-gradient-to-br from-violet-50 to-indigo-50 p-4 rounded-lg hover:shadow-lg transition-all duration-300">
                  <div className="text-sm text-gray-900 capitalize mb-1">{category}</div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">{score}/100</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-3">Strengths</h3>
                <ul className="space-y-2">
                  {results?.strengths.map((strength, i) => (
                    <li key={i} className="text-green-700">• {strength}</li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-orange-50 p-6 rounded-lg">
                <h3 className="font-semibold text-orange-800 mb-3">Areas for Improvement</h3>
                <ul className="space-y-2">
                  {results?.weaknesses.map((weakness, i) => (
                    <li key={i} className="text-orange-700">• {weakness}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <h3 className="text-xl font-semibold text-gray-800">Detailed Feedback</h3>
              {results?.detailedFeedback.map((feedback, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-800">Q{i + 1}: {feedback.question}</h4>
                    <span className="text-violet-600 font-semibold">{feedback.score}/10</span>
                  </div>
                  <div className="mb-3">
                    <p className="text-sm text-gray-900 mb-1">Your Answer:</p>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded">{feedback.userAnswer}</p>
                  </div>
                  <div className="mb-3">
                    <p className="text-sm text-gray-900 mb-1">Feedback:</p>
                    <p className="text-gray-700">{feedback.feedback}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-900 mb-1">Improved Answer:</p>
                    <p className="text-gray-700 bg-violet-50 p-3 rounded">{feedback.improvedAnswer}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => downloadResults('json')}
                className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-violet-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-violet-500/50"
              >
                <Download size={20} />
                <span>Download JSON</span>
              </button>
              
              <button
                onClick={() => downloadResults('txt')}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-green-500/50"
              >
                <Download size={20} />
                <span>Download Report</span>
              </button>
              
              <button
                onClick={resetInterview}
                className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 rounded-lg font-medium hover:from-gray-700 hover:to-gray-800 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-gray-500/50"
              >
                <RotateCcw size={20} />
                <span>New Interview</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'history') {
    return (
     <div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100 p-6 animate-gradient">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 hover:shadow-violet-200/50 transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Interview History</h1>
              <button
                onClick={() => setStage('setup')}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Back to Setup
              </button>
            </div>

            {interviewHistory.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <History size={48} className="mx-auto mb-4 opacity-50" />
                <p>No interview history yet. Complete your first interview to see results here!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {interviewHistory.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:shadow-violet-200/50 transition-all duration-300 cursor-pointer bg-gradient-to-r hover:from-violet-50/30 hover:to-indigo-50/30"
                    onClick={() => viewHistoryItem(item)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-800">{item.userDetails.role}</h3>
                        <p className="text-sm text-gray-900">
                          {new Date(item.timestamp).toLocaleDateString()} at {new Date(item.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">{item.overallScore}/100</div>
                        <div className="text-xs text-gray-900">{item.userDetails.numQuestions} questions</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {Object.entries(item.categoryScores).map(([cat, score]) => (
                        <span key={cat} className="px-2 py-1 bg-gradient-to-r from-violet-50 to-indigo-50 text-violet-700 text-xs rounded-full">
                          {cat}: {score}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
    );
  }
};
// Add this style tag at the end before export
const style = document.createElement('style');
style.textContent = `
  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  .animate-gradient {
    background-size: 200% 200%;
    animation: gradient 15s ease infinite;
  }
`;
document.head.appendChild(style);
export default MockInterviewBot;