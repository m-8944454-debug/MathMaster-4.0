
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { generateMathProblem, generateDetailedSolution } from '../services/geminiService';
import { MathProblem, Difficulty } from '../types';
import SmartText from './SmartText';

interface MathPracticeProps {
  onCorrectAnswer: (problem: MathProblem) => void;
  onMistake: (problem: MathProblem) => void;
  onIncorrectAttempt: (topic?: string) => void;
}

const TOPICS = ["Numerical Solution", "Integration", "Vector"];

const MathPractice: React.FC<MathPracticeProps> = ({ onCorrectAnswer, onMistake, onIncorrectAttempt }) => {
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [nextProblem, setNextProblem] = useState<MathProblem | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [preloading, setPreloading] = useState<boolean>(false);
  const [generatingSolution, setGeneratingSolution] = useState<boolean>(false);
  
  const [activeHelpTab, setActiveHelpTab] = useState<'tips' | 'steps' | 'answer' | null>(null);
  const [detailedSolution, setDetailedSolution] = useState<string | null>(null);
  
  const [selectedTopic, setSelectedTopic] = useState<string>(TOPICS[0]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(1);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [wrongAttempts, setWrongAttempts] = useState<number>(0);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'quota' | 'general' | null>(null);

  const topicRef = useRef(selectedTopic);
  const difficultyRef = useRef(selectedDifficulty);

  useEffect(() => {
    topicRef.current = selectedTopic;
    difficultyRef.current = selectedDifficulty;
  }, [selectedTopic, selectedDifficulty]);

  const prefetchNext = useCallback(async () => {
    if (preloading) return;
    setPreloading(true);
    try {
      const p = await generateMathProblem(topicRef.current, difficultyRef.current);
      setNextProblem(p);
    } catch (e) {
      console.error("Prefetch failed", e);
    } finally {
      setPreloading(false);
    }
  }, [preloading]);

  const loadNewProblem = useCallback(async () => {
    setLoading(true);
    setErrorType(null);
    setStatusMessage(null);
    setSelectedOption(null);
    setIsChecked(false);
    setWrongAttempts(0);
    setIsCorrect(false);
    setDetailedSolution(null);
    setActiveHelpTab(null);

    if (nextProblem) {
      setProblem(nextProblem);
      setNextProblem(null);
      setLoading(false);
      setTimeout(prefetchNext, 100);
      return;
    }

    try {
      const newProblem = await generateMathProblem(selectedTopic, selectedDifficulty);
      setProblem(newProblem);
      setTimeout(prefetchNext, 100);
    } catch (error: any) {
      const isQuota = error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED');
      setErrorType(isQuota ? 'quota' : 'general');
      setStatusMessage(isQuota ? "Pelayan Gemini sibuk. Cuba lagi dalam 1 minit." : "Ralat menjana soalan. Sila muat semula.");
      setProblem(null);
    } finally {
      setLoading(false);
    }
  }, [nextProblem, selectedTopic, selectedDifficulty, prefetchNext]);

  const handleGenerateAISolution = async () => {
    if (!problem || generatingSolution) return;
    if (detailedSolution) {
      setActiveHelpTab('steps');
      return;
    }
    
    setGeneratingSolution(true);
    setActiveHelpTab('steps');
    try {
      const solution = await generateDetailedSolution(problem);
      setDetailedSolution(solution);
    } catch (e) {
      console.error(e);
      setDetailedSolution("Gagal menjana langkah kerja AI. Sila rujuk 'Petunjuk' atau 'Jawapan Akhir'.");
    } finally {
      setGeneratingSolution(false);
    }
  };

  const handleCheck = () => {
    if (selectedOption === null || !problem) return;
    
    const correct = selectedOption === problem.correctIndex;
    setIsChecked(true);

    if (correct) {
      setIsCorrect(true);
      setStatusMessage("Syabas! Jawapan anda tepat.");
      onCorrectAnswer(problem);
      if (!nextProblem) prefetchNext();
    } else {
      onIncorrectAttempt(problem.topic);
      const newWrongAttempts = wrongAttempts + 1;
      setWrongAttempts(newWrongAttempts);
      
      if (newWrongAttempts === 1) {
        setStatusMessage("Jawapan kurang tepat. Cuba analisis semula.");
      } else if (newWrongAttempts >= 2) {
        setStatusMessage("Masih kurang tepat. Gunakan bantuan untuk memahami konsep.");
        onMistake(problem);
      }

      setTimeout(() => {
        if (!isCorrect) setIsChecked(false);
      }, 1200);
    }
  };

  const getDifficultyStars = (level: number) => "★".repeat(level) + "☆".repeat(3 - level);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center animate-in fade-in">
        <div className="w-16 h-16 border-[6px] border-gray-100 border-t-red-600 rounded-full animate-spin mb-8"></div>
        <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Menyediakan Cabaran...</h3>
        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-2">Silibus SM025 Sedang Dijana</p>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="max-w-xl mx-auto py-8 md:py-12 px-4 md:px-12 text-center bg-white rounded-[2.5rem] shadow-sm border border-gray-100 animate-in fade-in zoom-in-95">
        <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2 tracking-tighter uppercase">Konfigurasi Latihan</h2>
        <div className="space-y-6 mt-10 text-left">
          {errorType && <p className="text-red-600 text-sm font-bold p-4 bg-red-50 rounded-xl">{statusMessage}</p>}
          
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Topik Matrikulasi</label>
            <div className="grid grid-cols-1 gap-2">
              {TOPICS.map(t => (
                <button 
                  key={t} 
                  onClick={() => { setSelectedTopic(t); setNextProblem(null); }} 
                  className={`p-4 rounded-2xl border-2 transition-all text-left font-bold ${selectedTopic === t ? 'border-red-600 bg-red-50 text-red-700' : 'border-gray-100 hover:border-gray-200 text-gray-600'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Aras Kesukaran</label>
            <div className="flex gap-2">
              {[1, 2, 3].map(d => (
                <button
                  key={d}
                  onClick={() => { setSelectedDifficulty(d as Difficulty); setNextProblem(null); }}
                  className={`flex-1 p-3 rounded-2xl border-2 transition-all text-center flex flex-col items-center gap-1 ${selectedDifficulty === d ? 'border-red-600 bg-red-50 text-red-700' : 'border-gray-100 hover:border-gray-200 text-gray-400'}`}
                >
                  <span className="text-lg font-mono leading-none">{getDifficultyStars(d)}</span>
                  <span className="text-[9px] uppercase font-black">{d === 1 ? 'Asas' : d === 2 ? 'Sederhana' : 'Pakar'}</span>
                </button>
              ))}
            </div>
          </div>

          <button onClick={loadNewProblem} className="w-full bg-red-600 text-white font-black py-5 rounded-[2rem] shadow-xl hover:bg-red-700 transition-all uppercase tracking-widest active:scale-95">Mula Sesi Latihan</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 md:space-y-6 animate-in slide-in-from-bottom-6 px-1">
      {/* Header Info */}
      <div className="bg-white px-6 md:px-10 py-4 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Modul</span>
            <span className="text-xs md:text-sm font-black text-red-600">{selectedTopic}</span>
          </div>
          <div className="h-8 w-px bg-gray-100"></div>
          <div>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Kesukaran</span>
            <span className="text-amber-500 font-mono text-sm md:text-lg">{getDifficultyStars(selectedDifficulty)}</span>
          </div>
        </div>
        <button onClick={() => { setProblem(null); setNextProblem(null); }} className="text-[9px] font-black text-gray-400 hover:text-red-500 uppercase tracking-widest border border-gray-100 px-4 py-2 rounded-xl transition-all">Tukar Topik</button>
      </div>

      <div className="bg-white rounded-[2.5rem] md:rounded-[3rem] shadow-xl overflow-hidden border border-gray-100 p-6 md:p-16">
        {/* Question Area */}
        <div className="mb-10">
          <SmartText text={problem.question} as="h2" className="text-xl md:text-3xl font-bold text-gray-800 leading-relaxed" />
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-10">
          {problem.options.map((option, idx) => (
            <button 
              key={idx} 
              disabled={isCorrect || isChecked} 
              onClick={() => setSelectedOption(idx)} 
              className={`w-full text-left p-5 md:p-8 rounded-[1.5rem] border-2 transition-all flex items-center gap-4 relative
                ${selectedOption === idx 
                  ? (isCorrect ? 'border-green-500 bg-green-50 shadow-md' : isChecked ? 'border-red-500 bg-red-50' : 'border-red-600 bg-red-50 ring-4 ring-red-50') 
                  : (isCorrect && idx === problem.correctIndex ? 'border-green-500 bg-green-50' : 'border-gray-50 hover:bg-gray-50')
                }
              `}
            >
              <span className={`w-8 h-8 md:w-10 md:h-10 shrink-0 flex items-center justify-center rounded-2xl text-xs font-black border-2 transition-colors ${selectedOption === idx ? 'bg-red-600 text-white border-red-600 shadow-sm' : 'text-gray-300 border-gray-200'}`}>
                {String.fromCharCode(65 + idx)}
              </span>
              <SmartText text={option} as="span" className="text-sm md:text-lg text-gray-700 font-bold leading-tight" />
            </button>
          ))}
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className={`mb-8 p-6 rounded-[1.5rem] border text-center font-black text-sm md:text-lg animate-in slide-in-from-top-4 ${isCorrect ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
            {statusMessage}
          </div>
        )}

        {/* Assistance Hub - Only shows after 2 wrong attempts */}
        {wrongAttempts >= 2 && !isCorrect && (
          <div className="mb-10 bg-slate-50 border border-slate-200 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden animate-in slide-in-from-bottom-4 shadow-inner">
            <div className="p-6 border-b border-slate-200 bg-white/50 text-center">
              <h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Pusat Bantuan Terbuka</h4>
              <p className="text-xs text-gray-500 font-medium italic">Anda telah mencuba 2 kali. Pilih mod bantuan untuk melangkah lebih jauh.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row border-b border-slate-200">
              <button 
                onClick={() => setActiveHelpTab('tips')}
                className={`flex-1 py-4 px-6 text-[10px] font-black uppercase tracking-widest transition-all ${activeHelpTab === 'tips' ? 'bg-white text-red-600 border-b-2 border-red-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                💡 Petunjuk
              </button>
              <button 
                onClick={handleGenerateAISolution}
                className={`flex-1 py-4 px-6 text-[10px] font-black uppercase tracking-widest transition-all ${activeHelpTab === 'steps' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                🤖 Langkah Kerja AI
              </button>
              <button 
                onClick={() => setActiveHelpTab('answer')}
                className={`flex-1 py-4 px-6 text-[10px] font-black uppercase tracking-widest transition-all ${activeHelpTab === 'answer' ? 'bg-white text-amber-600 border-b-2 border-amber-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                🎯 Jawapan
              </button>
            </div>

            <div className="p-6 md:p-10 min-h-[140px]">
              {!activeHelpTab && (
                <div className="flex flex-col items-center justify-center text-center py-6 opacity-40">
                   <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Pilih bantuan di atas</p>
                </div>
              )}

              {activeHelpTab === 'tips' && (
                <div className="animate-in fade-in slide-in-from-left-2">
                  <h5 className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                     <span className="w-2 h-2 bg-red-400 rounded-full"></span> Konsep Utama:
                  </h5>
                  <SmartText text={problem.tips} as="p" className="text-slate-700 font-medium italic text-sm md:text-lg leading-relaxed bg-white p-6 rounded-2xl border border-red-50" />
                </div>
              )}

              {activeHelpTab === 'steps' && (
                <div className="animate-in fade-in slide-in-from-left-2">
                  <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    {generatingSolution ? <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div> : <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>}
                    {generatingSolution ? "AI sedang menganalisis..." : "Langkah Kerja Terperinci (Tutor AI):"}
                  </h5>
                  {generatingSolution ? (
                    <div className="space-y-3 opacity-30">
                      <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse"></div>
                      <div className="h-4 bg-slate-200 rounded w-full animate-pulse"></div>
                    </div>
                  ) : (
                    <div className="bg-white p-6 rounded-2xl border border-indigo-50 shadow-inner overflow-x-auto">
                      <SmartText text={detailedSolution || problem.workingSteps} as="div" className="text-slate-800 text-xs md:text-sm font-medium leading-loose" />
                    </div>
                  )}
                </div>
              )}

              {activeHelpTab === 'answer' && (
                <div className="animate-in fade-in slide-in-from-left-2 text-center py-6">
                  <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3">Jawapan Akhir Adalah:</p>
                  <div className="inline-flex items-center justify-center gap-4 bg-white px-10 py-4 rounded-3xl border-2 border-amber-100 shadow-xl">
                    <span className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center font-black">{String.fromCharCode(65 + problem.correctIndex)}</span>
                    <SmartText text={problem.options[problem.correctIndex]} as="span" className="text-xl md:text-2xl font-black text-gray-900" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Explanation - Shows only when correct */}
        {isCorrect && (
          <div className="mb-10 p-6 md:p-10 bg-green-50 border border-green-200 rounded-[2.5rem] animate-in zoom-in-95 shadow-sm">
            <h4 className="font-black text-green-900 text-lg md:text-2xl mb-4 text-center uppercase tracking-tighter">Analisis Penyelesaian</h4>
            <SmartText text={problem.explanation} as="div" className="text-green-800 font-medium mb-8 text-center text-sm md:text-lg leading-relaxed" />
            <div className="bg-white/80 p-6 rounded-2xl border border-green-100">
               <p className="text-[9px] font-black text-green-400 uppercase tracking-widest mb-3 text-center">Langkah Kerja Rasmi:</p>
               <SmartText text={problem.workingSteps} as="div" className="text-[10px] md:text-xs font-mono whitespace-pre-wrap overflow-x-auto leading-loose" />
            </div>
          </div>
        )}

        {/* Main Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          {!isCorrect ? (
            <button 
              disabled={selectedOption === null || isChecked} 
              onClick={handleCheck} 
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black py-5 md:py-8 rounded-[2rem] shadow-xl shadow-red-100 transition-all active:scale-95 text-base md:text-2xl uppercase tracking-tighter"
            >
              Hantar Jawapan
            </button>
          ) : (
            <button 
              onClick={loadNewProblem} 
              className="w-full bg-gray-900 hover:bg-black text-white font-black py-5 md:py-8 rounded-[2rem] shadow-xl shadow-gray-200 transition-all flex items-center justify-center gap-4 active:scale-95 text-base md:text-2xl uppercase tracking-tighter group"
            >
              <div className="flex items-center gap-4">
                <span>{nextProblem ? "Teruskan Sekarang" : "Jana Soalan Baru"}</span>
                {preloading && !nextProblem ? (
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8 text-red-500 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MathPractice;
