import React, { useState, useCallback } from 'react';
import { generateMathProblem } from '../services/geminiService';
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
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedTopic, setSelectedTopic] = useState<string>(TOPICS[0]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(1);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [wrongAttempts, setWrongAttempts] = useState<number>(0);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [activeHelp, setActiveHelp] = useState<'tips' | 'steps' | 'answer' | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadNewProblem = useCallback(async () => {
    setLoading(true);
    setProblem(null);
    setSelectedOption(null);
    setIsChecked(false);
    setWrongAttempts(0);
    setIsCorrect(false);
    setActiveHelp(null);
    setStatusMessage(null);
    try {
      const newProblem = await generateMathProblem(selectedTopic, selectedDifficulty);
      setProblem(newProblem);
    } catch (error) {
      console.error("Failed to fetch problem", error);
      setStatusMessage("Academic server connection error. Retrying...");
      setTimeout(loadNewProblem, 3000);
    } finally {
      setLoading(false);
    }
  }, [selectedTopic, selectedDifficulty]);

  const handleCheck = () => {
    if (selectedOption === null || !problem) return;
    
    const correct = selectedOption === problem.correctIndex;
    setIsChecked(true);

    if (correct) {
      setIsCorrect(true);
      setStatusMessage("Excellent! Your mathematical precision is noted.");
      onCorrectAnswer(problem);
    } else {
      onIncorrectAttempt(problem.topic);
      const newWrongAttempts = wrongAttempts + 1;
      setWrongAttempts(newWrongAttempts);
      setStatusMessage("Incorrect notation or result. Re-evaluate your steps.");
      
      if (newWrongAttempts === 2) {
        onMistake(problem);
      }

      setTimeout(() => {
        if (!isCorrect) setIsChecked(false);
      }, 1500);
    }
  };

  const getDifficultyStars = (level: number) => "★".repeat(level) + "☆".repeat(3 - level);

  if (!problem && !loading) {
    return (
      <div className="max-w-xl mx-auto py-8 md:py-12 px-4 md:px-12 text-center bg-white rounded-[2.5rem] shadow-sm border animate-in fade-in zoom-in-95">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2 tracking-tighter uppercase">Academic Practice</h2>
        <p className="text-sm md:text-base text-gray-500 mb-8 md:mb-10 font-medium italic">Master the SM025 syllabus using textbook-grade notation.</p>
        
        <div className="space-y-6 text-left">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Syllabus Topic</label>
            <div className="grid grid-cols-1 gap-2">
              {TOPICS.map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedTopic(t)}
                  className={`p-4 md:p-5 rounded-2xl border-2 transition-all text-left flex items-center justify-between font-bold text-sm md:text-base ${selectedTopic === t ? 'border-red-600 bg-red-50 text-red-700 shadow-sm' : 'border-gray-100 hover:border-gray-200 text-gray-600'}`}
                >
                  {t}
                  {selectedTopic === t && <div className="w-2 h-2 rounded-full bg-red-600"></div>}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Difficulty Level</label>
            <div className="flex gap-2 md:gap-3">
              {[1, 2, 3].map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDifficulty(d as Difficulty)}
                  className={`flex-1 p-3 md:p-4 rounded-2xl border-2 transition-all text-center flex flex-col items-center gap-1 ${selectedDifficulty === d ? 'border-red-600 bg-red-50 text-red-700 shadow-sm' : 'border-gray-100 hover:border-gray-200 text-gray-400'}`}
                >
                  <span className="text-base md:text-xl font-mono leading-none">{getDifficultyStars(d)}</span>
                  <span className="text-[9px] md:text-[10px] uppercase font-black">{d === 1 ? 'Basic' : d === 2 ? 'Inter' : 'Exam'}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={loadNewProblem}
            className="w-full bg-red-600 text-white font-black py-5 md:py-6 rounded-2xl shadow-xl hover:bg-red-700 transition-all active:scale-95 flex items-center justify-center gap-3 mt-4 text-base md:text-lg uppercase tracking-widest"
          >
            Generate Question
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center animate-in fade-in">
        <div className="w-12 h-12 md:w-16 md:h-16 border-[4px] md:border-[6px] border-gray-100 border-t-red-600 rounded-full animate-spin mb-8"></div>
        <h3 className="text-xl md:text-2xl font-black text-gray-900 uppercase">Consulting Syllabus...</h3>
        <p className="text-gray-400 text-[10px] md:text-sm font-bold uppercase tracking-widest mt-2">Generating Paper Mathematical Form</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 md:space-y-6 animate-in slide-in-from-bottom-6 px-1">
      <div className="bg-white px-6 md:px-10 py-4 md:py-5 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-6 md:gap-8">
          <div>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Module</span>
            <span className="text-xs md:text-sm font-black text-red-600 truncate max-w-[120px] block">{selectedTopic}</span>
          </div>
          <div className="h-8 w-px bg-gray-100 hidden sm:block"></div>
          <div>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Rigor</span>
            <span className="text-amber-500 font-mono text-sm md:text-lg">{getDifficultyStars(selectedDifficulty)}</span>
          </div>
        </div>
        <button 
          onClick={() => setProblem(null)}
          className="text-[9px] font-black text-gray-400 hover:text-red-500 uppercase tracking-widest border border-gray-100 px-4 py-1.5 rounded-xl transition-colors w-full sm:w-auto"
        >
          End Session
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] md:rounded-[3rem] shadow-xl overflow-hidden border border-gray-100 p-6 md:p-16 relative">
        <div className="mb-8 md:mb-12">
          <SmartText 
            text={problem?.question || ""} 
            as="h2" 
            className="text-xl md:text-3xl font-bold text-gray-800 leading-snug md:leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-8 md:mb-12">
          {problem?.options.map((option, idx) => (
            <button
              key={idx}
              disabled={isCorrect || isChecked}
              onClick={() => setSelectedOption(idx)}
              className={`w-full text-left p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border-2 transition-all flex items-center justify-between relative
                ${selectedOption === idx 
                  ? isCorrect 
                    ? 'border-green-500 bg-green-50' 
                    : isChecked 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-red-600 bg-red-50 ring-4 ring-red-100/50' 
                  : isCorrect && idx === problem.correctIndex
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-50 hover:border-red-200 hover:bg-red-50/5'
                }
              `}
            >
              <div className="flex items-center gap-4 md:gap-6">
                <span className={`w-8 h-8 md:w-10 md:h-10 shrink-0 flex items-center justify-center rounded-2xl text-xs font-black border-2
                  ${selectedOption === idx ? 'bg-red-600 text-white border-red-600 shadow-md' : 'text-gray-300 border-gray-200'}
                `}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <SmartText text={option} as="span" className="text-sm md:text-lg text-gray-700 font-bold leading-normal" />
              </div>
            </button>
          ))}
        </div>

        {statusMessage && (
          <div className={`mb-8 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border text-center font-black text-sm md:text-lg animate-in slide-in-from-top-4
            ${isCorrect ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
            {statusMessage}
          </div>
        )}

        {wrongAttempts >= 2 && !isCorrect && (
          <div className="mb-8 p-6 md:p-10 bg-red-50/30 border border-red-100 rounded-[2rem] md:rounded-[2.5rem] animate-in slide-in-from-bottom-6">
            <h4 className="font-black text-red-900 mb-6 flex items-center gap-3 uppercase tracking-tighter text-sm md:text-base">
              Mathematical Support:
            </h4>
            
            <div className="flex flex-wrap gap-2 md:gap-3 mb-6 md:mb-8">
              {['tips', 'steps', 'answer'].map((type) => (
                <button 
                  key={type}
                  onClick={() => setActiveHelp(type as any)} 
                  className={`flex-1 py-3 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-2 ${activeHelp === type ? 'bg-red-600 border-red-600 text-white shadow-md' : 'bg-white border-white text-red-600 shadow-sm'}`}
                >
                  {type === 'tips' ? 'Hint' : type === 'steps' ? 'Derivation' : 'Solution'}
                </button>
              ))}
            </div>
            
            {activeHelp && (
              <div className="p-5 md:p-8 bg-white rounded-[1.5rem] md:rounded-[2rem] border border-red-100 text-sm text-gray-700 shadow-sm animate-in fade-in">
                {activeHelp === 'tips' && <SmartText text={problem?.tips || ""} as="p" className="text-base md:text-lg font-medium italic" />}
                {activeHelp === 'steps' && <SmartText text={problem?.workingSteps || ""} as="div" className="whitespace-pre-wrap font-mono text-[10px] md:text-xs overflow-x-auto leading-loose p-3 md:p-4 rounded-xl" />}
                {activeHelp === 'answer' && <p className="font-black text-lg md:text-2xl text-red-600 uppercase">Correct Answer: Option {String.fromCharCode(65 + (problem?.correctIndex ?? 0))}</p>}
              </div>
            )}
          </div>
        )}

        {isCorrect && (
          <div className="mb-8 p-6 md:p-10 bg-green-50/50 border border-green-200 rounded-[2rem] md:rounded-[2.5rem] animate-in zoom-in-95">
            <h4 className="font-black text-green-900 text-lg md:text-2xl mb-4 text-center uppercase tracking-tighter">Verified Solution</h4>
            <SmartText text={problem?.explanation || ""} as="div" className="text-green-800 font-medium mb-6 text-center text-sm md:text-lg" />
            <SmartText text={problem?.workingSteps || ""} as="div" className="p-4 md:p-6 bg-white/80 rounded-xl border border-green-200 text-[10px] md:text-xs font-mono whitespace-pre-wrap overflow-x-auto leading-loose" />
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          {!isCorrect ? (
            <button
              disabled={selectedOption === null || isChecked}
              onClick={handleCheck}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black py-5 md:py-7 rounded-[1.5rem] md:rounded-[2rem] shadow-xl transition-all active:scale-95 text-base md:text-xl tracking-tight uppercase"
            >
              {isChecked ? "Processing..." : "Submit Response"}
            </button>
          ) : (
            <button
              onClick={loadNewProblem}
              className="w-full bg-gray-900 hover:bg-black text-white font-black py-5 md:py-7 rounded-[1.5rem] md:rounded-[2rem] shadow-xl transition-all flex items-center justify-center gap-4 active:scale-95 text-base md:text-xl tracking-tight uppercase"
            >
              <span>Next Assessment</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MathPractice;