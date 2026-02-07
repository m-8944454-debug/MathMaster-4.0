
import React from 'react';
import { GameState, Profile } from '../types';

interface HomeProps {
  setGameState: (state: GameState) => void;
  userProfile: Profile;
  mistakeCount: number;
}

const MOCK_RANKING = [
  { name: 'Intan', group: 'Alpha Integrals', correct: 85, total: 92 },
  { name: 'Min Er', group: 'Vector Vanguards', correct: 78, total: 85 },
  { name: 'Yaya', group: 'Newton\'s Nomads', correct: 72, total: 80 },
  { name: 'Thilah', group: 'Alpha Integrals', correct: 68, total: 75 },
];

const Home: React.FC<HomeProps> = ({ setGameState, userProfile, mistakeCount }) => {
  const userMastery = userProfile.totalAttempts > 0 
    ? Math.round((userProfile.correctAnswers / userProfile.totalAttempts) * 100) 
    : 0;

  const leaderboard = [
    ...MOCK_RANKING,
    { 
      name: userProfile.name || 'Anda', 
      group: userProfile.group, 
      correct: userProfile.correctAnswers, 
      total: userProfile.totalAttempts 
    }
  ].sort((a, b) => {
    const masteryA = a.total > 0 ? a.correct / a.total : 0;
    const masteryB = b.total > 0 ? b.correct / b.total : 0;
    return masteryB - masteryA;
  });

  const getGroupColor = (group: string) => {
    switch(group) {
      case 'Alpha Integrals': return 'bg-blue-100 text-blue-700';
      case 'Vector Vanguards': return 'bg-emerald-100 text-emerald-700';
      case 'Newton\'s Nomads': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="flex flex-col items-center py-4 md:py-6">
      <div className="text-center mb-8 md:mb-12 px-2">
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
          Kuasai <span className="text-red-600">SM025</span> <br />
          Di Kolej Matrikulasi
        </h1>
        <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto">
          Setiap latihan membawa anda lebih dekat kepada gred A. Sertai rakan seperjuangan KMM dan naikkan kedudukan anda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 w-full">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100 text-center">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Profil KMM Saya</h3>
            <div className="text-3xl md:text-4xl font-black text-red-600 mb-1">{userMastery}%</div>
            <p className="text-sm text-gray-500 font-medium">Kadar Penguasaan</p>
            <div className="mt-6 flex justify-around text-center border-t pt-6 gap-2">
              <div className="flex-1">
                <div className="font-bold text-gray-800 text-sm md:text-base">{userProfile.correctAnswers}</div>
                <div className="text-[9px] uppercase text-gray-400 font-bold">Selesai</div>
              </div>
              <div className="w-px h-8 bg-gray-100"></div>
              <div className="flex-1">
                <div className="font-bold text-gray-800 text-sm md:text-base truncate px-1" title={userProfile.group}>{userProfile.group}</div>
                <div className="text-[9px] uppercase text-gray-400 font-bold">Kumpulan</div>
              </div>
            </div>
          </div>

          {mistakeCount > 0 && (
            <div 
              onClick={() => setGameState(GameState.NOTEBOOK)}
              className="bg-red-50 border-2 border-red-100 p-6 rounded-[2rem] cursor-pointer hover:bg-red-100 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-2xl flex items-center justify-center text-xl md:text-2xl shadow-sm border border-red-100 group-hover:scale-110 transition-transform">📓</div>
                <span className="bg-red-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{mistakeCount} Isu Kritikal</span>
              </div>
              <h4 className="font-black text-gray-900 uppercase tracking-tight text-base md:text-lg mb-1">Baiki Kesalahan</h4>
              <p className="text-xs text-red-600 font-bold">Selesaikan kesilapan lama untuk mata bonus.</p>
            </div>
          )}

          <button 
            onClick={() => setGameState(GameState.PRACTICE)}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-5 rounded-[2rem] shadow-lg transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
          >
            <span className="uppercase tracking-widest text-sm">Mula Latihan</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-red-50/30">
              <h3 className="font-bold text-gray-900">Kedudukan Kampus KMM</h3>
              <span className="text-[10px] font-bold text-red-600 bg-white px-2.5 py-1 rounded-lg shadow-sm border border-red-100 uppercase">Live Melaka</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 text-[10px] uppercase text-gray-400 font-black tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Tangga</th>
                    <th className="px-6 py-4">Pelajar</th>
                    <th className="px-6 py-4 hidden sm:table-cell">Kumpulan</th>
                    <th className="px-6 py-4 text-right">Penguasaan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {leaderboard.slice(0, 5).map((entry, idx) => (
                    <tr 
                      key={idx} 
                      className={`${entry.name === userProfile.name ? 'bg-red-50/30' : 'hover:bg-gray-50/50'} transition-colors`}
                    >
                      <td className="px-6 py-4">
                        <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-black
                          ${idx === 0 ? 'bg-amber-400 text-white shadow-sm' : idx === 1 ? 'bg-slate-300 text-white shadow-sm' : idx === 2 ? 'bg-amber-600 text-white shadow-sm' : 'text-gray-400'}
                        `}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800 text-sm">
                            {entry.name || 'Anonymous'}
                            {entry.name === userProfile.name && <span className="ml-2 text-[10px] text-red-600 font-black">ANDA</span>}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md mt-1 sm:hidden w-fit ${getGroupColor(entry.group)}`}>
                            {entry.group}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${getGroupColor(entry.group)}`}>
                          {entry.group}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-mono font-black text-red-600 text-sm">
                          {entry.total > 0 ? Math.round((entry.correct / entry.total) * 100) : 0}%
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
    </div>
  );
};

export default Home;
