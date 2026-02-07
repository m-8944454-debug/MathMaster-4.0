
import React, { useState, useMemo } from 'react';
import { Profile, StudyGroup, StudyGroupType, MistakeRecord, DiscussionPost, MathProblem } from '../types';
import SmartText from './SmartText';

interface GroupPageProps {
  userProfile: Profile;
  groups: StudyGroup[];
  onUpdateProfile: (profile: Profile) => void;
  onCreateGroup: (group: StudyGroup) => void;
  mistakeNotebook: MistakeRecord[];
  discussionPosts: DiscussionPost[];
  onAddDiscussionPost: (problem: MathProblem) => void;
  onAddComment: (postId: string, text: string) => void;
}

const COLORS = ['blue', 'emerald', 'purple', 'rose', 'amber', 'indigo'];
const ICONS = ['🔢', '🧮', '📐', '🧪', '⚛️', '🍎', '∫', '→', '🧬', '🧠', '🔭', '🏛️'];

const GroupPage: React.FC<GroupPageProps> = ({
  userProfile,
  groups,
  onUpdateProfile,
  onCreateGroup,
  mistakeNotebook,
  discussionPosts,
  onAddDiscussionPost,
  onAddComment,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'discussion'>('overview');
  const [joinOrCreateTab, setJoinOrCreateTab] = useState<'join' | 'create'>('join');
  const [groupCode, setGroupCode] = useState('');
  const [error, setError] = useState('');
  
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newIcon, setNewIcon] = useState(ICONS[0]);
  const [newColor, setNewColor] = useState(COLORS[0]);

  const currentGroup = groups.find((g) => g.name === userProfile.group);

  const handleJoinGroup = () => {
    if (!groupCode.trim()) return;
    const foundGroup = groups.find((g) => g.code.toUpperCase() === groupCode.trim().toUpperCase());
    if (foundGroup) {
      onUpdateProfile({ ...userProfile, group: foundGroup.name });
      setGroupCode('');
      setError('');
    } else {
      setError('Kod kumpulan tidak dijumpai. Sila pastikan kod adalah tepat!');
    }
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCode.trim()) return;
    
    // 检查代码是否重复
    if (groups.find(g => g.code.toUpperCase() === newCode.trim().toUpperCase())) {
      setError('Kod ini sudah wujud! Pilih kod unik yang lain.');
      return;
    }

    const g: StudyGroup = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName.trim(),
      code: newCode.trim().toUpperCase(),
      icon: newIcon,
      color: newColor,
    };
    onCreateGroup(g);
    setError('');
    setNewName('');
    setNewCode('');
  };

  if (!currentGroup) {
    return (
      <div className="max-w-3xl mx-auto py-12 animate-in fade-in zoom-in-95">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-black text-slate-900 mb-3 uppercase tracking-tighter">Bilik Komuniti</h2>
          <p className="text-slate-500 font-bold text-lg">Cipta sejarah matematik anda bersama rakan seperjuangan.</p>
        </div>

        <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden">
          <div className="flex bg-slate-50 border-b border-slate-100">
            <button 
              onClick={() => setJoinOrCreateTab('join')} 
              className={`flex-1 py-8 font-black text-xs uppercase tracking-widest transition-all ${joinOrCreateTab === 'join' ? 'bg-white text-red-600 border-b-4 border-red-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Cari Kumpulan
            </button>
            <button 
              onClick={() => setJoinOrCreateTab('create')} 
              className={`flex-1 py-8 font-black text-xs uppercase tracking-widest transition-all ${joinOrCreateTab === 'create' ? 'bg-white text-red-600 border-b-4 border-red-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Cipta Baru
            </button>
          </div>

          <div className="p-12">
            {joinOrCreateTab === 'join' ? (
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Kod Akses Unik</label>
                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      value={groupCode} 
                      onChange={e => setGroupCode(e.target.value)} 
                      placeholder="CTH: ALPHA-KMM" 
                      className="flex-grow p-6 rounded-3xl border-2 border-slate-200 focus:border-red-600 outline-none uppercase font-black text-2xl text-slate-900 bg-slate-50 focus:bg-white transition-all shadow-inner" 
                    />
                    <button 
                      onClick={handleJoinGroup} 
                      className="px-12 bg-red-600 text-white font-black rounded-3xl hover:bg-red-700 shadow-xl shadow-red-100 transition-all uppercase tracking-widest text-xs active:scale-95"
                    >
                      Masuk
                    </button>
                  </div>
                  {error && <p className="text-red-600 text-xs font-black mt-4 flex items-center gap-2">⚠️ {error}</p>}
                </div>
                
                <div className="pt-10 border-t border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Kumpulan Aktif Berdekatan</p>
                   <div className="grid grid-cols-1 gap-4">
                     {groups.slice(0, 5).map(g => (
                       <div key={g.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-red-200 transition-colors group cursor-default">
                         <div className="flex items-center gap-5">
                           <span className="text-3xl filter drop-shadow-sm group-hover:scale-110 transition-transform">{g.icon}</span>
                           <span className="font-black text-slate-900 text-lg">{g.name}</span>
                         </div>
                         <div className="flex flex-col items-end">
                           <span className="font-mono font-black text-slate-400 text-xs tracking-widest">{g.code}</span>
                           <span className="text-[8px] font-bold text-slate-300 uppercase">Aktif Sekarang</span>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateGroup} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Kumpulan</label>
                    <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="cth: Geng Calculus 01" className="w-full p-5 rounded-2xl border-2 border-slate-200 font-black text-slate-900 focus:border-red-600 outline-none transition-all shadow-inner" required />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kod Akses Baru</label>
                    <input type="text" value={newCode} onChange={e => setNewCode(e.target.value)} placeholder="cth: CALCULUS1" className="w-full p-5 rounded-2xl border-2 border-slate-200 uppercase font-black text-slate-900 focus:border-red-600 outline-none transition-all shadow-inner" required />
                  </div>
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Pilih Lambang (Icon)</label>
                   <div className="flex flex-wrap gap-3">
                     {ICONS.map(i => (
                       <button 
                        type="button" 
                        key={i} 
                        onClick={() => setNewIcon(i)} 
                        className={`w-12 h-12 rounded-2xl text-2xl border-2 transition-all flex items-center justify-center ${newIcon === i ? 'border-red-600 bg-red-50 shadow-md scale-110' : 'border-slate-100 hover:border-slate-200'}`}
                      >
                        {i}
                      </button>
                     ))}
                   </div>
                </div>
                <button type="submit" className="w-full py-6 bg-red-600 text-white font-black rounded-3xl shadow-xl shadow-red-100 uppercase tracking-[0.2em] text-xs hover:bg-red-700 transition-all active:scale-95">Tubuhkan Kumpulan Sekarang</button>
                {error && <p className="text-red-600 text-xs font-black text-center">⚠️ {error}</p>}
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="bg-white rounded-[3rem] p-12 border border-slate-200 shadow-2xl flex flex-col md:flex-row items-center gap-10">
        <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-5xl border-4 border-white shadow-xl rotate-3">{currentGroup.icon}</div>
        <div className="flex-grow text-center md:text-left">
          <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-4">{currentGroup.name}</h2>
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
             <span className="text-[10px] font-black text-red-600 bg-red-50 px-5 py-2 rounded-full border border-red-100 uppercase tracking-[0.2em] shadow-sm">KOD AKSES: {currentGroup.code}</span>
             <button onClick={() => onUpdateProfile({...userProfile, group: 'Tiada'})} className="text-[10px] font-black text-slate-400 hover:text-red-600 transition-colors uppercase tracking-widest underline decoration-2 underline-offset-4">Keluar Kumpulan</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-xl">
        <div className="flex bg-slate-50 border-b border-slate-100">
          <button onClick={() => setActiveTab('overview')} className={`flex-1 py-6 font-black text-[10px] uppercase tracking-[0.2em] transition-all ${activeTab === 'overview' ? 'text-red-600 bg-white border-b-4 border-red-600' : 'text-slate-400 hover:text-slate-600'}`}>Dashboard</button>
          <button onClick={() => setActiveTab('members')} className={`flex-1 py-6 font-black text-[10px] uppercase tracking-[0.2em] transition-all ${activeTab === 'members' ? 'text-red-600 bg-white border-b-4 border-red-600' : 'text-slate-400 hover:text-slate-600'}`}>Ahli Kumpulan</button>
          <button onClick={() => setActiveTab('discussion')} className={`flex-1 py-6 font-black text-[10px] uppercase tracking-[0.2em] transition-all ${activeTab === 'discussion' ? 'text-red-600 bg-white border-b-4 border-red-600' : 'text-slate-400 hover:text-slate-600'}`}>Bilik Bincang</button>
        </div>
        
        <div className="p-12 min-h-[500px]">
           {activeTab === 'overview' && (
             <div className="space-y-10">
                <div className="bg-slate-900 rounded-[2.5rem] p-12 text-white relative overflow-hidden shadow-2xl">
                   <div className="relative z-10">
                     <h3 className="text-4xl font-black uppercase tracking-tighter mb-2">Matlamat Harian</h3>
                     <p className="text-slate-400 font-bold text-lg">Setiap ahli perlu mencapai 10 penyelesaian tepat.</p>
                     <div className="mt-12">
                        <div className="h-6 bg-slate-800 rounded-full overflow-hidden p-1 shadow-inner">
                           <div className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-1000 rounded-full shadow-lg" style={{width: `${Math.min((userProfile.dailyCorrectCount / 10) * 100, 100)}%`}}></div>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                           <p className="text-xs font-black uppercase tracking-widest text-slate-500">Pencapaian Peribadi</p>
                           <p className="text-xl font-black text-red-500 tracking-widest">{userProfile.dailyCorrectCount} / 10 SIAP</p>
                        </div>
                     </div>
                   </div>
                   <div className="absolute top-0 right-0 p-12 opacity-10 text-9xl font-black italic">10</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="p-8 bg-red-50 rounded-3xl border border-red-100">
                      <h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-4">Statistik Kumpulan</h4>
                      <div className="text-4xl font-black text-slate-900">{userProfile.correctAnswers} <span className="text-sm font-bold text-slate-400">Total Anda</span></div>
                   </div>
                   <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Kedudukan Dalam Kumpulan</h4>
                      <div className="text-4xl font-black text-slate-900">Top 3 <span className="text-sm font-bold text-slate-400">Minggu Ini</span></div>
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'members' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-10 bg-white rounded-[2rem] border-4 border-red-100 flex items-center gap-6 shadow-xl shadow-red-50">
                   <span className="text-6xl">{userProfile.avatar}</span>
                   <div className="flex-grow">
                      <p className="font-black text-slate-900 text-2xl tracking-tight">{userProfile.name || 'Pelajar'}</p>
                      <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Aktif Sekarang (+{userProfile.dailyCorrectCount})
                      </p>
                   </div>
                </div>
                {/* 模拟成员数据 */}
                <div className="p-10 bg-slate-50 rounded-[2rem] border border-slate-200 flex items-center gap-6 opacity-60">
                   <span className="text-6xl filter grayscale">👨‍🏫</span>
                   <div>
                      <p className="font-black text-slate-900 text-2xl tracking-tight">Cikgu (Ketua)</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Latihan Selesai: 450</p>
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'discussion' && (
             <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-5xl mb-6 opacity-30">💬</div>
                <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-sm">Bilik Perbincangan Aktif</p>
                <p className="text-slate-500 mt-3 font-bold max-w-sm">Gunakan soalan dari Buku Nota Kesalahan anda untuk memulakan diskusi.</p>
                <button 
                  onClick={() => setActiveTab('overview')} 
                  className="mt-10 px-8 py-3 bg-slate-900 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-black transition-all"
                >
                  Tutup Notis
                </button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default GroupPage;
