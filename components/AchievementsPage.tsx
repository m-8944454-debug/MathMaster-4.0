
import React, { useState } from 'react';
import { Profile, ACHIEVEMENTS, Achievement } from '../types';

interface AchievementsPageProps {
  profile: Profile;
}

const AchievementsPage: React.FC<AchievementsPageProps> = ({ profile }) => {
  const [selectedBadge, setSelectedBadge] = useState<Achievement | null>(null);

  const getAchievementProgress = (badge: Achievement) => {
    if (badge.statKey && badge.goalValue) {
      const current = profile.problemStats[badge.statKey] || 0;
      return {
        current,
        goal: badge.goalValue,
        percentage: Math.min((current / badge.goalValue) * 100, 100)
      };
    }
    // Kes khas untuk matlamat harian
    if (badge.id === 'devotion' && badge.goalValue) {
      const current = profile.dailyGoalTotalCount || 0;
      return {
        current,
        goal: badge.goalValue,
        percentage: Math.min((current / badge.goalValue) * 100, 100)
      };
    }
    return null;
  };

  const unlockedCount = profile.unlockedBadges.length;
  const totalCount = ACHIEVEMENTS.length;

  return (
    <div className="max-w-5xl mx-auto py-6 animate-in fade-in duration-700">
      <div className="text-center mb-16">
        <div className="inline-block bg-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] mb-4 shadow-lg">
          Dewan Kecemerlangan Matematik
        </div>
        <h2 className="text-5xl font-black text-gray-900 mb-4 tracking-tighter uppercase">Lencana Kumpulan</h2>
        <div className="flex items-center justify-center gap-4">
          <div className="h-1.5 w-48 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-1000" 
              style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            ></div>
          </div>
          <span className="text-sm font-black text-gray-400">{unlockedCount} / {totalCount} TERBUKA</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {ACHIEVEMENTS.map((badge) => {
          const isUnlocked = profile.unlockedBadges.includes(badge.id);
          const progress = getAchievementProgress(badge);

          return (
            <div 
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className={`group relative bg-white rounded-[2.5rem] p-8 border-4 transition-all cursor-pointer hover:shadow-2xl hover:-translate-y-2
                ${isUnlocked 
                  ? 'border-indigo-500 shadow-xl shadow-indigo-50' 
                  : 'border-gray-50 opacity-80 grayscale hover:grayscale-0 hover:opacity-100'
                }
              `}
            >
              <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center text-5xl mb-6 shadow-lg transition-transform group-hover:scale-110 
                ${isUnlocked ? 'bg-indigo-50 border-2 border-indigo-100' : 'bg-gray-50 border-2 border-gray-100'}`}
              >
                {badge.icon}
              </div>

              <h3 className={`text-xl font-black mb-2 uppercase tracking-tight ${isUnlocked ? 'text-indigo-900' : 'text-gray-400'}`}>
                {badge.name}
              </h3>
              <p className="text-sm text-gray-500 font-medium mb-6 leading-relaxed">
                {badge.description}
              </p>

              {isUnlocked ? (
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-[10px] text-white">✓</span>
                  <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Telah Dicapai</span>
                </div>
              ) : (
                <div>
                   {progress ? (
                     <div className="space-y-2">
                        <div className="flex justify-between text-[9px] font-black text-gray-400 uppercase tracking-widest">
                          <span>Kemajuan</span>
                          <span>{progress.current} / {progress.goal}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-500 transition-all duration-500" 
                            style={{ width: `${progress.percentage}%` }}
                          ></div>
                        </div>
                     </div>
                   ) : (
                     <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Terkunci</span>
                   )}
                </div>
              )}

              {/* Kesan Cahaya */}
              {isUnlocked && (
                <div className="absolute top-0 right-0 p-4">
                  <div className="text-amber-400 animate-pulse">✨</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Paparan Terperinci */}
      {selectedBadge && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6"
          onClick={() => setSelectedBadge(null)}
        >
          <div 
            className="bg-white rounded-[3rem] max-w-xl w-full p-10 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center mb-8">
              <div className="w-32 h-32 rounded-[3rem] bg-indigo-50 flex items-center justify-center text-7xl shadow-inner border-4 border-white ring-8 ring-indigo-50/50">
                {selectedBadge.icon}
              </div>
            </div>
            
            <div className="text-center mb-8">
              <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-2">{selectedBadge.name}</h3>
              <p className="text-indigo-600 font-bold italic">" {selectedBadge.description} "</p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-10">
              <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Keperluan</span>
                <p className="font-black text-gray-800 text-sm leading-snug">{selectedBadge.criteria}</p>
              </div>
              <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100">
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block mb-2">Impak</span>
                <p className="font-bold text-indigo-700 text-sm italic leading-snug">{selectedBadge.practicalImpact}</p>
              </div>
            </div>

            <button 
              onClick={() => setSelectedBadge(null)}
              className="w-full py-5 bg-gray-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl uppercase tracking-[0.2em] text-xs"
            >
              Tutup Rekod
            </button>
          </div>
        </div>
      )}

      {/* Bahagian CTA Bawah */}
      <div className="mt-24 p-12 bg-gray-900 rounded-[3rem] text-center text-white relative overflow-hidden group">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent group-hover:scale-150 transition-transform duration-1000"></div>
        <h3 className="text-3xl font-black mb-4 uppercase tracking-tighter">Menjadi Pakar Matematik</h3>
        <p className="text-gray-400 max-w-xl mx-auto font-medium mb-8">
          Jalan menuju kepakaran adalah berterusan. Setiap soalan yang diselesaikan adalah langkah ke arah pemahaman peringkat pakar.
        </p>
        <div className="flex justify-center gap-12">
           <div className="text-center">
             <div className="text-3xl font-black text-indigo-400 mb-1">{profile.correctAnswers}</div>
             <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Jawapan Betul</div>
           </div>
           <div className="w-px h-12 bg-gray-800"></div>
           <div className="text-center">
             <div className="text-3xl font-black text-amber-400 mb-1">{profile.unlockedBadges.length}</div>
             <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Pingat Diraih</div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementsPage;
