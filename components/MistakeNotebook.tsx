import React, { useState } from 'react';
import { MistakeRecord } from '../types';
import SmartText from './SmartText';

interface MistakeNotebookProps {
  records: MistakeRecord[];
  onCorrectRetry: (problemId: string) => void;
}

const MistakeNotebook: React.FC<MistakeNotebookProps> = ({ records, onCorrectRetry }) => {
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isWrong, setIsWrong] = useState(false);

  const selectedRecord = records.find(r => r.problem.id === selectedRecordId);

  const handleRetry = () => {
    if (selectedOption === null || !selectedRecord) return;
    
    if (selectedOption === selectedRecord.problem.correctIndex) {
      onCorrectRetry(selectedRecord.problem.id);
      setSelectedRecordId(null);
      setSelectedOption(null);
      setShowExplanation(false);
      setIsWrong(false);
    } else {
      setIsWrong(true);
      setTimeout(() => setIsWrong(false), 1000);
    }
  };

  if (records.length === 0) {
    return (
      <div className="text-center py-20 animate-in fade-in duration-700">
        <div className="w-20 h-20 bg-indigo-50 text-indigo-300 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Mistake Notebook Empty</h2>
        <p className="text-gray-500 mt-2 max-w-sm mx-auto">Great job! You haven't struggled with any specific questions yet. Keep practicing to find your weaknesses.</p>
      </div>
    );
  }

  if (selectedRecord) {
    const { problem } = selectedRecord;
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in slide-in-from-right-10 duration-500">
        <div className="flex items-center gap-4 mb-2">
          <button 
            onClick={() => { setSelectedRecordId(null); setSelectedOption(null); setShowExplanation(false); }}
            className="text-indigo-600 flex items-center gap-1 font-bold text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
            Back to Notebook
          </button>
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-8 md:p-12">
          <span className="inline-block bg-red-50 text-red-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4">Retry Attempt</span>
          <SmartText text={problem.question} as="h2" className="text-2xl font-medium text-gray-800 leading-relaxed mb-8" />
          
          <div className="space-y-4 mb-8">
            {problem.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedOption(idx)}
                className={`w-full text-left p-5 rounded-xl border-2 transition-all flex items-center gap-4
                  ${selectedOption === idx ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 hover:bg-gray-50'}
                  ${isWrong && selectedOption === idx ? 'border-red-500 bg-red-50 animate-shake' : ''}
                `}
              >
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${selectedOption === idx ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <SmartText text={option} as="span" className="font-medium text-gray-700" />
              </button>
            ))}
          </div>

          {showExplanation && (
            <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-dashed text-sm space-y-4">
              <div>
                <h4 className="font-black text-xs text-indigo-600 uppercase tracking-widest mb-1">Concept Explanation:</h4>
                <SmartText text={problem.explanation} as="p" className="text-gray-700 font-medium leading-relaxed" />
              </div>
              
              <div>
                <h4 className="font-black text-xs text-gray-400 uppercase tracking-widest mb-1">Previous Hint:</h4>
                <SmartText text={`"${problem.tips}"`} as="p" className="text-gray-600 italic" />
              </div>

              <div>
                <h4 className="font-black text-xs text-gray-400 uppercase tracking-widest mb-2">Detailed Steps:</h4>
                <SmartText text={problem.workingSteps} as="div" className="font-mono text-[11px] whitespace-pre-wrap text-gray-500 overflow-x-auto p-4 bg-white rounded-lg border leading-loose" />
              </div>
            </div>
          )}

          <div className="flex gap-4">
            {!showExplanation && (
              <button 
                onClick={() => setShowExplanation(true)}
                className="flex-1 py-4 px-6 rounded-xl border-2 border-indigo-600 text-indigo-600 font-bold hover:bg-indigo-50 transition-all"
              >
                Review Explanation & Steps
              </button>
            )}
            <button 
              onClick={handleRetry}
              disabled={selectedOption === null}
              className="flex-grow py-4 px-6 rounded-xl bg-indigo-600 text-white font-bold shadow-lg hover:bg-indigo-700 disabled:opacity-50 transition-all"
            >
              Master This Problem
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Mistake Notebook</h2>
          <p className="text-gray-500">Turn your errors into expertise. Answer these correctly to clear them.</p>
        </div>
        <div className="bg-red-50 text-red-700 px-4 py-2 rounded-xl text-sm font-bold border border-red-100">
          {records.length} {records.length === 1 ? 'problem' : 'problems'} to fix
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {records.map(record => (
          <div 
            key={record.problem.id}
            onClick={() => setSelectedRecordId(record.problem.id)}
            className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer flex items-center justify-between"
          >
            <div className="flex-1 min-w-0 pr-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded">
                  {record.problem.topic}
                </span>
                <span className="text-[10px] text-gray-400 font-medium">
                  Added {new Date(record.addedAt).toLocaleDateString()}
                </span>
              </div>
              <SmartText text={record.problem.question} as="h3" className="font-medium text-gray-800 truncate text-lg" />
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MistakeNotebook;