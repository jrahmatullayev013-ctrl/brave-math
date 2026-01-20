
import React, { useState, useEffect, useRef } from 'react';
import { INITIAL_QUESTIONS } from './constants';
import { Question, UserStats } from './types';
import { geminiService } from './services/geminiService';

const App: React.FC = () => {
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('brave_stats');
    return saved ? JSON.parse(saved) : { score: 0, level: 1, completedIds: [] };
  });

  const [currentQuestion, setCurrentQuestion] = useState<Question>(INITIAL_QUESTIONS[0]);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('brave_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    if (!isLoading && feedback.type !== 'success') {
      inputRef.current?.focus();
    }
  }, [isLoading, feedback.type]);

  const loadNextQuestion = async () => {
    setIsLoading(true);
    setFeedback({ type: null, message: '' });
    setUserAnswer('');
    setHint(null);
    setShowExplanation(false);

    // Filter out completed questions from initial list
    const remainingStatic = INITIAL_QUESTIONS.filter(q => !stats.completedIds.includes(q.id));
    
    if (remainingStatic.length > 0) {
      const nextQ = remainingStatic[0];
      setCurrentQuestion(nextQ);
      setIsLoading(false);
    } else {
      // If all static questions are done, use AI to generate a new one
      try {
        const newQ = await geminiService.generateQuestion(stats.completedIds);
        if (newQ) {
          setCurrentQuestion(newQ);
        } else {
          // Fallback to a random existing question if AI fails
          setCurrentQuestion(INITIAL_QUESTIONS[Math.floor(Math.random() * INITIAL_QUESTIONS.length)]);
        }
      } catch (e) {
        setCurrentQuestion(INITIAL_QUESTIONS[Math.floor(Math.random() * INITIAL_QUESTIONS.length)]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const checkAnswer = () => {
    if (!userAnswer.trim() || isLoading || feedback.type === 'success') return;

    const normalizedUser = userAnswer.toLowerCase().trim();
    const normalizedCorrect = currentQuestion.answer.toLowerCase().trim();

    // Flexible matching for text-based answers
    const isCorrect = normalizedUser === normalizedCorrect || 
                     (isNaN(Number(normalizedCorrect)) && normalizedCorrect.includes(normalizedUser) && normalizedUser.length >= 2);

    if (isCorrect) {
      setFeedback({ type: 'success', message: 'To\'ppa-to\'g\'ri! 🎉' });
      setShowExplanation(true);
      if (!stats.completedIds.includes(currentQuestion.id)) {
        setStats(prev => {
          const newScore = prev.score + 10;
          return {
            ...prev,
            score: newScore,
            level: Math.floor(newScore / 50) + 1,
            completedIds: [...prev.completedIds, currentQuestion.id]
          };
        });
      }
    } else {
      setFeedback({ type: 'error', message: 'Xato. Yana bir bor urinib ko\'ring!' });
      // Shake effect could be added here
    }
  };

  const getHint = async () => {
    if (hint || isLoading) return;
    setIsLoading(true);
    const aiHint = await geminiService.getHint(currentQuestion.text, currentQuestion.answer);
    setHint(aiHint);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 bg-[#0f172a] text-slate-200 selection:bg-cyan-500/30">
      <header className="w-full max-w-2xl flex justify-between items-center mb-8 py-6">
        <div className="flex items-center gap-3 group cursor-default">
          <div className="bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-900 w-12 h-12 flex items-center justify-center rounded-2xl font-black text-2xl shadow-[0_0_30px_rgba(6,182,212,0.3)] group-hover:scale-110 transition-transform">B</div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tighter text-white leading-none">BRAVE</h1>
            <span className="text-[10px] text-cyan-500 font-bold tracking-[0.3em] uppercase">Math Intel</span>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="glass px-4 py-2 rounded-2xl flex flex-col items-center min-w-[80px]">
            <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">XP</span>
            <span className="text-lg font-bold text-cyan-400 leading-none">{stats.score}</span>
          </div>
          <div className="glass px-4 py-2 rounded-2xl flex flex-col items-center min-w-[80px]">
            <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">LVL</span>
            <span className="text-lg font-bold text-purple-400 leading-none">{stats.level}</span>
          </div>
        </div>
      </header>

      <main className="w-full max-w-2xl animate-slideUp">
        <div className="glass rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          {/* Difficulty Badge */}
          <div className={`absolute top-8 right-8 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
            currentQuestion.difficulty === 'oson' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
            currentQuestion.difficulty === 'o\'rta' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
            'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}>
            {currentQuestion.difficulty}
          </div>

          <div className="flex items-center gap-3 mb-8">
             <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,1)]"></div>
             <p className="text-cyan-400/80 font-bold uppercase text-[11px] tracking-[0.25em]">{currentQuestion.category}</p>
          </div>
          
          <div className="min-h-[160px] mb-12 flex items-center">
            {isLoading ? (
              <div className="w-full flex flex-col items-center gap-6">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-4 border-cyan-500/10 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-t-cyan-500 rounded-full animate-spin"></div>
                </div>
                <p className="text-slate-500 animate-pulse text-sm font-semibold tracking-wider uppercase">Masala tayyorlanmoqda...</p>
              </div>
            ) : (
              <h2 className="text-2xl md:text-4xl font-extrabold text-white leading-[1.3] math-font">
                {currentQuestion.text}
              </h2>
            )}
          </div>

          <div className="space-y-6">
            <div className="relative group">
              <input
                ref={inputRef}
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
                placeholder="Javob..."
                className={`w-full px-10 py-7 bg-slate-950/50 border-2 rounded-[2rem] outline-none transition-all text-3xl font-bold placeholder:text-slate-800 ${
                  feedback.type === 'error' ? 'border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.1)]' : 
                  feedback.type === 'success' ? 'border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 
                  'border-slate-800 focus:border-cyan-500 focus:bg-slate-950'
                }`}
                disabled={feedback.type === 'success' || isLoading}
              />
              {feedback.type === 'success' && (
                <button
                  onClick={loadNextQuestion}
                  className="absolute right-4 top-4 bottom-4 px-10 bg-cyan-500 text-slate-950 font-black rounded-2xl hover:bg-cyan-400 transition-all shadow-xl shadow-cyan-500/30 active:scale-95 flex items-center gap-3 text-lg"
                >
                  Keyingisi
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="ArrowRightIcon" />
                    <path d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              )}
            </div>

            {feedback.type !== 'success' && (
              <div className="flex gap-4">
                <button
                  onClick={checkAnswer}
                  disabled={isLoading || !userAnswer.trim()}
                  className="flex-[3] py-6 bg-white text-slate-950 font-black rounded-[1.5rem] hover:bg-slate-200 transition-all shadow-2xl active:scale-95 disabled:opacity-20 disabled:active:scale-100 uppercase tracking-widest"
                >
                  Tasdiqlash
                </button>
                <button
                  onClick={getHint}
                  disabled={isLoading || !!hint}
                  className="flex-1 py-6 bg-slate-800/50 text-slate-300 font-bold rounded-[1.5rem] hover:bg-slate-800 transition-all border border-slate-700/50 disabled:opacity-30 flex items-center justify-center"
                >
                  {isLoading && !hint ? (
                    <div className="w-5 h-5 border-2 border-slate-500 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <span className="flex items-center gap-2">HINT <span className="text-xl">💡</span></span>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="mt-8 min-h-[60px]">
            {feedback.message && feedback.type === 'error' && (
              <p className="text-center font-bold text-rose-400 animate-fadeIn text-lg">
                {feedback.message}
              </p>
            )}

            {hint && (
              <div className="mt-4 bg-slate-900/80 border border-slate-800 p-6 rounded-3xl animate-fadeIn">
                <p className="text-slate-300 text-sm leading-relaxed flex gap-3">
                  <span className="text-cyan-400 font-black shrink-0">YORDAM:</span> 
                  <span>{hint}</span>
                </p>
              </div>
            )}

            {showExplanation && (
              <div className="mt-4 bg-cyan-500/5 border border-cyan-500/10 p-6 rounded-3xl animate-fadeIn">
                <p className="text-cyan-100/80 text-sm leading-relaxed flex gap-3">
                  <span className="text-cyan-400 font-black shrink-0">ECHIM:</span> 
                  <span>{currentQuestion.explanation}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-auto py-12 text-slate-600 text-center w-full">
        <div className="flex flex-col items-center gap-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-40">AI-Powered Educational System</p>
          <div className="flex gap-6 opacity-30 grayscale hover:grayscale-0 transition-all">
            <span className="text-[10px] font-black border border-slate-700 px-2 py-1 rounded">GEMINI 2.5</span>
            <span className="text-[10px] font-black border border-slate-700 px-2 py-1 rounded">REACT 18</span>
            <span className="text-[10px] font-black border border-slate-700 px-2 py-1 rounded">TAILWIND</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
