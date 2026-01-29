import React, { useState } from 'react';
import { Profile, STUDY_GROUPS } from '../types';

interface RankingPageProps {
  userProfile: Profile;
}

const KMM_CAMPUS_MOCK = [
  { name: 'Intan', group: 'Alpha Integrals', avatar: '🦊', correct: 145, total: 160 },
  { name: 'Min Er', group: 'Vector Vanguards', avatar: '👩‍🔬', correct: 138, total: 155 },
  { name: 'Yaya', group: 'Newton\'s Nomads', avatar: '🚀', correct: 122, total: 140 },
  { name: 'Thilah', group: 'Alpha Integrals', avatar: '🧠', correct: 110, total: 125 },
  { name: 'Zarra', group: 'Vector Vanguards', avatar: '🎓', correct: 98, total: 115 },
];

const RankingPage: React.FC<RankingPageProps> = ({ userProfile }) => {
  const [view, setView] = useState<'global' | 'group'>('global');

  const getLeaderboard = () => {
    let list = [...KMM_CAMPUS_MOCK];
    
    list.push({
      name: userProfile.name || 'You',
      group: userProfile.group,
      avatar: userProfile.avatar,
      correct: userProfile.correctAnswers,
      total: userProfile.totalAttempts
    });

    if (view === 'group' && userProfile.group !== 'None') {
      list = list.filter(item => item.group === userProfile.group);
    }

    return list.sort((a, b) => {
      const masteryA = a.total > 0 ? a.correct / a.total : 0;
      const masteryB = b.total > 0 ? b.correct / b.total : 0;
      return masteryB - masteryA;
    });
  };

  const leaderboard = getLeaderboard();

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 px-1">
      <div className="text-center">
        <div className="inline-block bg-red-600 text-white text-[9px] md:text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4 shadow-sm">
          Official KMM Rankings
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2 tracking-tight">Kolej Matrikulasi Melaka</h2>
        <p className="text-sm md:text-base text-gray-500 italic">"Melestari Kecemerlangan Akademik di Bumi Hang Tuah"</p>
      </div>

      <div className="flex justify-center">
        <div className="bg-gray-100 p-1 rounded-2xl flex gap-1 w-full max-w-sm">
          <button 
            onClick={() => setView('global')}
            className={`flex-1 px-4 py-2.5 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all ${view === 'global' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Campus
          </button>
          <button 
            onClick={() => setView('group')}
            className={`flex-1 px-4 py-2.5 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all ${view === 'group' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Study Group
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center md:items-end justify-center gap-4 md:gap-4 mb-10 md:mb-16 mt-4 md:mt-0">
          {leaderboard[1] && (
            <div className="flex flex-col items-center order-2 md:order-1 flex-1 w-full max-w-[280px] md:max-w-[200px]">
              <div className="text-4xl mb-2 md:mb-4">{leaderboard[1].avatar}</div>
              <div className="bg-white border-2 md:border-b-0 border-slate-100 w-full h-24 md:h-32 rounded-3xl md:rounded-t-3xl md:rounded-b-none flex flex-row md:flex-col items-center justify-between md:justify-center px-6 md:p-4 text-center shadow-sm">
                <div className="flex flex-col items-start md:items-center">
                  <span className="font-bold text-slate-800 truncate w-32 md:w-full text-left md:text-center text-sm">{leaderboard[1].name}</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {leaderboard[1].total > 0 ? Math.round((leaderboard[1].correct / leaderboard[1].total) * 100) : 0}% Mastery
                  </span>
                </div>
                <div className="bg-slate-100 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-slate-400 font-black shrink-0 border-2 border-white">2</div>
              </div>
            </div>
          )}

          {leaderboard[0] && (
            <div className="flex flex-col items-center order-1 md:order-2 flex-1 w-full max-w-[300px] md:max-w-[220px]">
              <div className="text-5xl md:text-6xl mb-2 md:mb-4 relative">
                {leaderboard[0].avatar}
                <div className="absolute -top-4 -right-4 text-2xl md:text-3xl animate-bounce">👑</div>
              </div>
              <div className="bg-white border-2 border-amber-200 w-full h-28 md:h-44 rounded-3xl md:rounded-t-[2.5rem] md:rounded-b-none flex flex-row md:flex-col items-center justify-between md:justify-center px-6 md:p-4 text-center shadow-xl shadow-amber-100/50">
                <div className="flex flex-col items-start md:items-center">
                  <span className="font-black text-gray-900 truncate w-32 md:w-full text-left md:text-center text-base md:text-lg">{leaderboard[0].name}</span>
                  <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">
                    {leaderboard[0].total > 0 ? Math.round((leaderboard[0].correct / leaderboard[0].total) * 100) : 0}% Mastery
                  </span>
                </div>
                <div className="bg-amber-400 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white font-black text-xl md:text-2xl shadow-md border-4 border-amber-50 shrink-0">1</div>
              </div>
            </div>
          )}

          {leaderboard[2] && (
            <div className="flex flex-col items-center order-3 flex-1 w-full max-w-[280px] md:max-w-[200px]">
              <div className="text-4xl mb-2 md:mb-4">{leaderboard[2].avatar}</div>
              <div className="bg-white border-2 md:border-b-0 border-orange-50 w-full h-24 rounded-3xl md:rounded-t-3xl md:rounded-b-none flex flex-row md:flex-col items-center justify-between md:justify-center px-6 md:p-4 text-center shadow-sm">
                <div className="flex flex-col items-start md:items-center">
                  <span className="font-bold text-slate-800 truncate w-32 md:w-full text-left md:text-center text-sm">{leaderboard[2].name}</span>
                  <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">
                    {leaderboard[2].total > 0 ? Math.round((leaderboard[2].correct / leaderboard[2].total) * 100) : 0}% Mastery
                  </span>
                </div>
                <div className="bg-orange-100 w-10 h-10 rounded-full flex items-center justify-center text-orange-400 font-black shrink-0 border-2 border-white">3</div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody className="divide-y divide-gray-50">
                {leaderboard.slice(3).map((item, idx) => (
                  <tr key={idx} className={`${item.name === (userProfile.name || 'You') ? 'bg-red-50/30' : 'hover:bg-gray-50'} transition-all`}>
                    <td className="px-6 py-5 w-12 md:w-16 text-center text-xs md:text-sm font-black text-gray-300">{idx + 4}</td>
                    <td className="px-2 py-5 w-12 text-2xl md:text-3xl text-center">{item.avatar}</td>
                    <td className="px-4 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800 text-sm md:text-base flex items-center gap-2">
                          {item.name}
                          {item.name === (userProfile.name || 'You') && <span className="text-[9px] font-black text-red-600 bg-red-50 px-1.5 py-0.5 rounded uppercase">You</span>}
                        </span>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{item.group}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="font-mono font-black text-red-600 text-sm md:text-base">
                        {item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankingPage;