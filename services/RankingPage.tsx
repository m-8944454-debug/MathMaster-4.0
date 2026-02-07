
import React, { useMemo, useState, useEffect } from 'react';
import { Profile, AVATARS } from '../types';

interface RankingPageProps {
  userProfile: Profile;
}

// 模拟种子数据：当注册表为空时展示
const SEED_COMPETITORS = [
  { name: 'Min Er (KMM)', group: 'Alpha Integrals', avatar: AVATARS[1], correct: 45, total: 50 },
  { name: 'Siva', group: 'Vector Vanguards', avatar: AVATARS[3], correct: 38, total: 42 },
  { name: 'Hidayah', group: 'Newton\'s Nomads', avatar: AVATARS[4], correct: 32, total: 35 },
];

const RankingPage: React.FC<RankingPageProps> = ({ userProfile }) => {
  const [view, setView] = useState<'global' | 'group'>('global');
  const [lastSync, setLastSync] = useState(Date.now());

  // 监听 storage 事件，当其他“用户”（标签页）数据改变时刷新视图
  useEffect(() => {
    const handleSync = () => setLastSync(Date.now());
    window.addEventListener('storage', handleSync);
    return () => window.removeEventListener('storage', handleSync);
  }, []);

  const leaderboard = useMemo(() => {
    const registryRaw = localStorage.getItem('math_public_registry');
    let registry = registryRaw ? JSON.parse(registryRaw) : [];

    // 如果名录太少，加入种子数据增加气氛
    if (registry.length < 5) {
      SEED_COMPETITORS.forEach(seed => {
        if (!registry.find((u: any) => u.name === seed.name)) {
          registry.push(seed);
        }
      });
    }

    // 强制加入/更新当前用户，防止本地 profile 尚未写入 registry
    const meEntry = {
      name: userProfile.name || 'Pelajar Baru',
      group: userProfile.group,
      avatar: userProfile.avatar,
      correct: userProfile.correctAnswers,
      total: userProfile.totalAttempts,
      isMe: true
    };

    const meIdx = registry.findIndex((u: any) => u.name === meEntry.name);
    if (meIdx >= 0) registry[meIdx] = { ...registry[meIdx], ...meEntry };
    else registry.push(meEntry);

    // 过滤
    if (view === 'group' && userProfile.group !== 'Tiada') {
      registry = registry.filter((u: any) => u.group === userProfile.group);
    }

    // 排序：正确数优先，然后是准确率
    return registry.sort((a: any, b: any) => {
      if (b.correct !== a.correct) return b.correct - a.correct;
      const accA = a.total > 0 ? a.correct / a.total : 0;
      const accB = b.total > 0 ? b.correct / b.total : 0;
      return accB - accA;
    });
  }, [userProfile, view, lastSync]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="text-center">
        <span className="inline-block bg-red-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] mb-4 shadow-xl shadow-red-50">
          Global Campus Ranking (LIVE)
        </span>
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase">Papan Pendahulu</h2>
        <p className="text-slate-500 font-bold italic mt-2">"Buktikan kehebatan matematik anda di peringkat Kolej."</p>
      </div>

      <div className="flex justify-center gap-3">
        <button 
          onClick={() => setView('global')}
          className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-sm ${view === 'global' ? 'bg-red-600 text-white shadow-red-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
        >
          🌎 Global
        </button>
        <button 
          onClick={() => setView('group')}
          disabled={userProfile.group === 'Tiada'}
          className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-sm ${view === 'group' ? 'bg-red-600 text-white shadow-red-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 disabled:opacity-30'}`}
        >
          🏠 Kumpulan
        </button>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tangga</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pelajar</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Skor (Penyelesaian)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {leaderboard.map((item: any, idx: number) => (
                <tr key={idx} className={`${item.isMe ? 'bg-red-50/50' : 'hover:bg-slate-50/50'} transition-all`}>
                  <td className="px-8 py-8">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg
                      ${idx === 0 ? 'bg-amber-400 text-white shadow-lg rotate-3' : idx === 1 ? 'bg-slate-300 text-white shadow-lg -rotate-3' : idx === 2 ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-300'}
                    `}>
                      {idx + 1}
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <div className="flex items-center gap-5">
                      <span className="text-4xl filter drop-shadow-sm">{item.avatar}</span>
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900 text-xl tracking-tight">
                          {item.name}
                          {item.isMe && <span className="ml-3 text-[9px] bg-red-600 text-white px-2 py-0.5 rounded-full uppercase">Anda</span>}
                        </span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{item.group}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-8 text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-mono font-black text-red-600 text-3xl leading-none">{item.correct}</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase mt-2">Acc: {item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RankingPage;
