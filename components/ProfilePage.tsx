
import React, { useState } from 'react';
import { Profile, StudyGroupType, STUDY_GROUPS, AVATARS, ACHIEVEMENTS, Achievement, TOPICS } from '../types';
import SmartText from './SmartText';

interface ProfilePageProps {
  profile: Profile;
  onUpdateProfile: (profile: Profile) => void;
  onClearData: () => void;
  onExportData: () => void;
  onImportData: (data: string) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ profile, onUpdateProfile, onClearData, onExportData, onImportData }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'history'>('profile');
  const [name, setName] = useState(profile.name);
  const [description, setDescription] = useState(profile.description);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [isEditing, setIsEditing] = useState(!profile.name);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Achievement | null>(null);

  const totalXP = profile.correctAnswers * 10;
  const level = Math.floor(totalXP / 100) + 1;
  const xpIntoLevel = totalXP % 100;
  const xpNeededForNext = 100;

  const formatTimeSpent = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    if (h > 0) return `${h}j ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ 
      ...profile,
      name, 
      description, 
      avatar
    });
    setIsEditing(false);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        onImportData(text);
      };
      reader.readAsText(file);
    }
  };

  const masteryPercentage = profile.totalAttempts > 0 
    ? Math.round((profile.correctAnswers / profile.totalAttempts) * 100) 
    : 0;

  const currentGroup = STUDY_GROUPS.find(g => g.name === profile.group);

  const calculateTopicMastery = (topicName: string) => {
    const b = profile.problemStats[`${topicName}_1`] || 0;
    const i = profile.problemStats[`${topicName}_2`] || 0;
    const a = profile.problemStats[`${topicName}_3`] || 0;
    const correct = b + i + a;
    const attempts = profile.topicAttempts[topicName] || 0;
    const accuracy = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;
    
    let rank = "Novis";
    if (accuracy > 95 && correct > 20) rank = "Grandmaster";
    else if (accuracy > 80) rank = "Pakar";
    else if (accuracy > 60) rank = "Mahir";
    else if (accuracy > 40) rank = "Kompeten";
    else if (attempts > 0) rank = "Belajar";

    return { correct, attempts, accuracy, b, i, a, rank };
  };

  const themeStyles: Record<string, { border: string, bg: string, text: string, lightBg: string, accent: string }> = {
    "Numerical Solution": { border: "border-blue-200", bg: "bg-blue-600", text: "text-blue-800", lightBg: "bg-blue-50", accent: "bg-blue-100" },
    "Integration": { border: "border-purple-200", bg: "bg-purple-600", text: "text-purple-800", lightBg: "bg-purple-50", accent: "bg-purple-100" },
    "Vector": { border: "border-emerald-200", bg: "bg-emerald-600", text: "text-emerald-800", lightBg: "bg-emerald-50", accent: "bg-emerald-100" },
    "default": { border: "border-gray-300", bg: "bg-gray-600", text: "text-gray-800", lightBg: "bg-gray-50", accent: "bg-gray-200" }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 md:py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 bg-gray-200 p-1 rounded-2xl w-fit mx-auto md:mx-0">
        <button 
          onClick={() => setActiveTab('profile')}
          className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'profile' ? 'bg-white shadow-md text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          👤 Profil
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-white shadow-md text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          📜 Sejarah
        </button>
      </div>

      <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-xl border border-gray-200 overflow-hidden relative">
        {activeTab === 'profile' ? (
          <>
            <div className="bg-gradient-to-br from-indigo-900 via-red-900 to-rose-900 h-48 md:h-64 relative overflow-hidden p-6 md:p-8">
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M0 100 L50 0 L100 100 Z" fill="currentColor" />
                </svg>
              </div>
              
              <div className="relative z-10 flex justify-end items-start gap-3 md:gap-4">
                <div className="bg-white/20 backdrop-blur-lg px-4 md:px-6 py-2 md:py-3 rounded-2xl border border-white/30 flex items-center gap-2 md:gap-3 shadow-lg">
                  <span className="text-xl md:text-2xl">🔥</span>
                  <div className="text-white text-right">
                    <p className="text-[8px] md:text-[10px] font-black uppercase opacity-80">Daily Streak</p>
                    <p className="font-black text-sm md:text-lg leading-none">1 Hari</p>
                  </div>
                </div>
                <div className="bg-amber-400 px-4 md:px-6 py-2 md:py-3 rounded-2xl border-2 border-amber-200/50 shadow-xl flex items-center gap-2 md:gap-3 transform hover:scale-105 transition-transform">
                  <div className="text-white text-right">
                    <p className="text-[8px] md:text-[10px] font-black uppercase text-amber-900">Level</p>
                    <p className="font-black text-lg md:text-2xl leading-none text-white">{level}</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-12 md:-bottom-16 left-1/2 md:left-12 -translate-x-1/2 md:translate-x-0 group">
                <div className="w-32 h-32 md:w-44 md:h-44 rounded-[2.5rem] md:rounded-[3rem] bg-white shadow-2xl flex items-center justify-center text-6xl md:text-8xl border-[6px] md:border-[8px] border-white relative transition-transform group-hover:scale-105">
                  {avatar}
                  <div className="absolute -top-3 -right-3 md:-top-4 md:-right-4 w-10 h-10 md:w-14 md:h-14 bg-red-600 text-white rounded-full flex items-center justify-center font-black text-lg md:text-2xl border-2 md:border-4 border-white shadow-lg">
                    {level}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-24 md:pt-28 pb-12 px-6 md:px-12 text-center md:text-left">
              {isEditing ? (
                <form onSubmit={handleSave} className="space-y-8 md:space-y-12">
                  <div className="bg-gray-50 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-gray-200 text-center md:text-left shadow-inner">
                    <label className="block text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6">Pilih Avatar Anda</label>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 md:gap-4">
                      {AVATARS.map(a => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => setAvatar(a)}
                          className={`text-2xl md:text-4xl p-3 md:p-5 rounded-2xl md:rounded-[2rem] border-4 transition-all hover:scale-110 ${avatar === a ? 'border-red-600 bg-white shadow-xl' : 'border-gray-100 bg-white/50 hover:bg-white'}`}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                    <div className="space-y-3 text-left">
                      <label className="block text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Nama Pelajar</label>
                      <input 
                        type="text" 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Calon 007"
                        className="w-full p-5 rounded-[1.5rem] md:rounded-[2rem] border-2 border-gray-200 focus:border-red-600 outline-none transition-all font-black text-lg md:text-xl shadow-inner bg-gray-50 text-gray-900"
                        required
                      />
                    </div>
                    <div className="space-y-3 text-left">
                      <label className="block text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Moto Akademik</label>
                      <textarea 
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Fokus. Tekun. Berjaya."
                        className="w-full p-5 rounded-[1.5rem] md:rounded-[2rem] border-2 border-gray-200 focus:border-red-600 outline-none transition-all font-bold h-24 resize-none shadow-inner bg-gray-50 text-gray-900"
                      />
                    </div>
                  </div>
                  
                  <button 
                    type="submit"
                    className="w-full py-6 md:py-8 bg-gradient-to-r from-indigo-700 to-red-700 text-white font-black rounded-[2rem] md:rounded-[2.5rem] shadow-2xl hover:shadow-indigo-500/40 transition-all text-xl md:text-2xl uppercase tracking-widest active:scale-95"
                  >
                    Simpan Perubahan
                  </button>
                </form>
              ) : (
                <div className="space-y-10 md:space-y-12">
                  <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 md:gap-12">
                    <div className="flex-1 space-y-6 w-full">
                      <div className="text-center md:text-left">
                        <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter uppercase mb-4 leading-none">
                          {name || 'Ahli Matematik'}
                        </h2>
                        <p className="text-base md:text-xl text-gray-600 font-bold leading-relaxed italic mx-auto md:mx-0 max-w-xl">
                          "{description || 'Menguasai seni matematik SM025.'}"
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-indigo-50 border border-indigo-100 p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] flex items-center gap-4 text-left shadow-sm">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-2xl flex items-center justify-center text-xl md:text-2xl shadow-sm shrink-0">⏳</div>
                          <div>
                            <p className="text-[8px] md:text-[10px] font-black text-indigo-500 uppercase tracking-widest">Masa Fokus</p>
                            <p className="font-black text-indigo-900 text-sm md:text-base">{formatTimeSpent(profile.totalTimeSpent)}</p>
                          </div>
                        </div>
                        <div className="bg-rose-50 border border-rose-100 p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] flex items-center gap-4 text-left shadow-sm">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-2xl flex items-center justify-center text-xl md:text-2xl shadow-sm shrink-0">🎓</div>
                          <div>
                            <p className="text-[8px] md:text-[10px] font-black text-rose-500 uppercase tracking-widest">Tarikh Sertai</p>
                            <p className="font-black text-rose-900 text-sm md:text-base">{profile.joinDate}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4">
                        {currentGroup ? (
                          <span className="bg-indigo-600 text-white text-[10px] md:text-xs font-black px-5 md:px-6 py-2 md:py-2.5 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-2 md:gap-3">
                            <span className="text-lg md:text-xl">{currentGroup.icon}</span> {currentGroup.name}
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-500 text-[10px] md:text-xs font-black px-5 md:px-6 py-2 md:py-2.5 rounded-full uppercase tracking-widest border border-gray-200">Tanpa Kumpulan</span>
                        )}
                        <span className="bg-amber-100 text-amber-800 text-[10px] md:text-xs font-black px-5 md:px-6 py-2 md:py-2.5 rounded-full uppercase tracking-widest border border-amber-300 shadow-sm">
                          Ketepatan {masteryPercentage}%
                        </span>
                      </div>

                      <div className="bg-white border-2 border-gray-100 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-sm max-w-md mx-auto md:mx-0">
                        <div className="flex justify-between items-end mb-4">
                          <div className="text-left">
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Kemajuan Tahap {level}</p>
                            <p className="text-xl md:text-2xl font-black text-indigo-700 leading-none">Penyelesai Elit</p>
                          </div>
                          <span className="text-xs md:text-sm font-black text-indigo-600">{xpIntoLevel} / {xpNeededForNext} XP</span>
                        </div>
                        <div className="h-3 md:h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-200 shadow-inner p-1">
                          <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                            style={{ width: `${xpIntoLevel}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="w-full md:w-auto px-8 py-3 bg-white border-2 border-gray-200 rounded-2xl text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all shadow-sm order-first md:order-last"
                    >
                      Kemaskini Identiti
                    </button>
                  </div>

                  <div className="pt-10 md:pt-12 border-t border-gray-100">
                    <h3 className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-10 text-center flex items-center gap-4">
                      <span className="flex-1 h-px bg-gray-200"></span>
                      Penguasaan Silibus SM025
                      <span className="flex-1 h-px bg-gray-200"></span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                      {TOPICS.map(topic => {
                        const stats = calculateTopicMastery(topic);
                        const style = themeStyles[topic] || themeStyles.default;

                        return (
                          <div key={topic} className={`p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border-2 ${style.border} ${style.lightBg} relative overflow-hidden group hover:shadow-2xl transition-all duration-300 text-left shadow-sm`}>
                            <div className="flex justify-between items-start mb-6 relative z-10">
                              <div>
                                <span className={`text-[9px] md:text-[10px] font-black ${style.text} uppercase tracking-widest block mb-1`}>{topic}</span>
                                <span className="text-xl md:text-2xl font-black text-gray-900">{stats.accuracy}% <span className="text-[10px] font-black text-gray-400">Acc.</span></span>
                              </div>
                              <div className={`px-2.5 py-1 rounded-full ${style.accent} ${style.text} text-[8px] md:text-[9px] font-black uppercase tracking-tighter shadow-sm border border-white/50`}>
                                {stats.rank}
                              </div>
                            </div>

                            <div className="h-2.5 md:h-3 w-full bg-white rounded-full overflow-hidden mb-6 md:mb-8 relative z-10 shadow-inner border border-gray-200">
                              <div 
                                className={`h-full ${style.bg} transition-all duration-1000 shadow-md`} 
                                style={{ width: `${stats.accuracy}%` }}
                              />
                            </div>

                            <div className="space-y-3 relative z-10">
                              <div className="flex justify-between items-center text-[8px] md:text-[9px] font-black text-gray-500 uppercase mb-2">
                                <span>Campuran Kesukaran</span>
                                <span>{stats.correct} Selesai</span>
                              </div>
                              <div className="h-2 w-full bg-gray-200 rounded-full flex overflow-hidden shadow-inner">
                                <div className="h-full bg-blue-500" style={{ width: `${stats.correct > 0 ? (stats.b / stats.correct) * 100 : 0}%` }} title="Asas"></div>
                                <div className="h-full bg-amber-500" style={{ width: `${stats.correct > 0 ? (stats.i / stats.correct) * 100 : 0}%` }} title="Sederhana"></div>
                                <div className="h-full bg-rose-600" style={{ width: `${stats.correct > 0 ? (stats.a / stats.correct) * 100 : 0}%` }} title="Pakar"></div>
                              </div>
                            </div>
                            <div className="absolute -bottom-4 -right-2 text-6xl md:text-8xl font-black text-black/5 select-none">{topic[0]}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-10 md:pt-12 border-t border-gray-100">
                    <h3 className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-8 text-center">Pengurusan Data & Sandaran</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-200 text-center flex flex-col items-center hover:shadow-md transition-shadow">
                        <div className="text-3xl mb-3">📤</div>
                        <h4 className="font-black text-xs uppercase mb-2 text-gray-800">Eksport Data</h4>
                        <p className="text-[10px] text-gray-600 mb-4 leading-relaxed font-bold">Simpan semua kemajuan, ganjaran dan nota kesalahan anda ke dalam fail JSON.</p>
                        <button 
                          onClick={onExportData}
                          className="mt-auto w-full py-3 bg-white border border-gray-300 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all text-gray-700 shadow-sm"
                        >
                          Muat Turun Fail
                        </button>
                      </div>

                      <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-200 text-center flex flex-col items-center hover:shadow-md transition-shadow">
                        <div className="text-3xl mb-3">📥</div>
                        <h4 className="font-black text-xs uppercase mb-2 text-gray-800">Import Data</h4>
                        <p className="text-[10px] text-gray-600 mb-4 leading-relaxed font-bold">Pulihkan data anda daripada fail sandaran sebelumnya.</p>
                        <label className="mt-auto w-full py-3 bg-white border border-gray-300 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all cursor-pointer text-gray-700 shadow-sm">
                          Pilih Fail JSON
                          <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                        </label>
                      </div>

                      <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100 text-center flex flex-col items-center hover:shadow-md transition-shadow">
                        <div className="text-3xl mb-3">⚠️</div>
                        <h4 className="font-black text-xs uppercase mb-2 text-red-700">Padam Semua</h4>
                        <p className="text-[10px] text-red-600 mb-4 leading-relaxed font-bold">Tindakan ini tidak boleh dibatalkan. Semua data akan dipadamkan selama-lamanya.</p>
                        <button 
                          onClick={() => setShowConfirmClear(true)}
                          className="mt-auto w-full py-3 bg-red-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-200"
                        >
                          Padam Data
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="p-6 md:p-12 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tighter">Sejarah Penyelesaian</h2>
            <p className="text-gray-600 font-bold text-sm mb-10">Berikut adalah 20 soalan terakhir yang anda selesaikan dengan betul.</p>

            {profile.solveHistory && profile.solveHistory.length > 0 ? (
              <div className="space-y-4">
                {profile.solveHistory.map((prob, idx) => (
                  <div key={prob.id + idx} className="bg-gray-50 p-6 rounded-[1.5rem] border border-gray-200 hover:border-red-200 transition-all group shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[9px] font-black text-red-700 uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded mr-2 border border-red-100">{prob.topic}</span>
                        <span className="text-[9px] font-black text-amber-600 uppercase">Tahap {prob.difficulty}</span>
                      </div>
                      <span className="text-[8px] font-black text-gray-400 uppercase">#{profile.solveHistory.length - idx}</span>
                    </div>
                    <SmartText text={prob.question} as="div" className="text-sm font-black text-gray-900 mb-4 leading-relaxed" />
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-inner">
                      <p className="text-[9px] font-black text-green-700 uppercase tracking-widest mb-2">Jawapan Anda (Betul):</p>
                      <SmartText text={prob.options[prob.correctIndex]} as="div" className="text-xs font-bold text-gray-700" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-300">
                <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Tiada sejarah penyelesaian lagi.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showConfirmClear && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] max-w-sm w-full p-8 text-center shadow-2xl border border-gray-200">
            <div className="text-5xl mb-4">🧨</div>
            <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">Padam Semua Data?</h3>
            <p className="text-sm text-gray-600 mb-8 leading-relaxed font-bold">Anda akan kehilangan semua mata, ganjaran, dan kedudukan. Tindakan ini adalah kekal.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirmClear(false)}
                className="flex-1 py-3 bg-gray-100 rounded-xl text-[10px] font-black uppercase text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={() => { onClearData(); setShowConfirmClear(false); }}
                className="flex-1 py-3 bg-red-600 rounded-xl text-[10px] font-black uppercase text-white shadow-lg hover:bg-red-700 transition-colors"
              >
                Padam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
