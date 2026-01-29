import React, { useState } from 'react';
import { Profile, StudyGroupType, STUDY_GROUPS, AVATARS, ACHIEVEMENTS, Achievement, TOPICS } from '../types';

interface ProfilePageProps {
  profile: Profile;
  onUpdateProfile: (profile: Profile) => void;
  onClearData: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ profile, onUpdateProfile, onClearData }) => {
  const [name, setName] = useState(profile.name);
  const [description, setDescription] = useState(profile.description);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [groupCode, setGroupCode] = useState('');
  const [isEditing, setIsEditing] = useState(!profile.name);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Achievement | null>(null);
  const [error, setError] = useState('');

  // XP and Level Calculation: Level up every 100 XP (10XP per correct answer)
  const totalXP = profile.correctAnswers * 10;
  const level = Math.floor(totalXP / 100) + 1;
  const xpIntoLevel = totalXP % 100;
  const xpNeededForNext = 100;

  // Time formatting
  const formatTimeSpent = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    if (h > 0) return `${h}h ${m}m ${s}s`;
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

  const handleJoinGroup = () => {
    const foundGroup = STUDY_GROUPS.find(g => g.code.toUpperCase() === groupCode.toUpperCase());
    if (foundGroup) {
      onUpdateProfile({ ...profile, group: foundGroup.name });
      setGroupCode('');
      setError('');
    } else {
      setError('Invalid code. Ask your group leader!');
    }
  };

  const masteryPercentage = profile.totalAttempts > 0 
    ? Math.round((profile.correctAnswers / profile.totalAttempts) * 100) 
    : 0;

  const currentGroup = STUDY_GROUPS.find(g => g.name === profile.group);

  const getAchievementProgress = (badge: Achievement) => {
    if (badge.statKey && badge.goalValue) {
      const current = profile.problemStats[badge.statKey] || 0;
      return {
        current,
        goal: badge.goalValue,
        percentage: Math.min((current / badge.goalValue) * 100, 100)
      };
    }
    return null;
  };

  const calculateTopicMastery = (topicName: string) => {
    const b = profile.problemStats[`${topicName}_1`] || 0;
    const i = profile.problemStats[`${topicName}_2`] || 0;
    const a = profile.problemStats[`${topicName}_3`] || 0;
    const correct = b + i + a;
    const attempts = profile.topicAttempts[topicName] || 0;
    const accuracy = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;
    
    let rank = "Novice";
    if (accuracy > 95 && correct > 20) rank = "Grandmaster";
    else if (accuracy > 80) rank = "Expert";
    else if (accuracy > 60) rank = "Proficient";
    else if (accuracy > 40) rank = "Competent";
    else if (attempts > 0) rank = "Learning";

    return { correct, attempts, accuracy, b, i, a, rank };
  };

  const themeStyles: Record<string, { border: string, bg: string, text: string, lightBg: string, accent: string }> = {
    "Numerical Solution": { border: "border-blue-200", bg: "bg-blue-600", text: "text-blue-700", lightBg: "bg-blue-50", accent: "bg-blue-100" },
    "Integration": { border: "border-purple-200", bg: "bg-purple-600", text: "text-purple-700", lightBg: "bg-purple-50", accent: "bg-purple-100" },
    "Vector": { border: "border-emerald-200", bg: "bg-emerald-600", text: "text-emerald-700", lightBg: "bg-emerald-50", accent: "bg-emerald-100" },
    "default": { border: "border-gray-200", bg: "bg-gray-600", text: "text-gray-700", lightBg: "bg-gray-50", accent: "bg-gray-100" }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 md:py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden relative">
        {/* Banner with Animated Gradient */}
        <div className="bg-gradient-to-br from-indigo-900 via-red-900 to-rose-900 h-48 md:h-64 relative overflow-hidden p-6 md:p-8">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 100 L50 0 L100 100 Z" fill="currentColor" />
            </svg>
          </div>
          
          <div className="relative z-10 flex justify-end items-start gap-3 md:gap-4">
            <div className="bg-white/10 backdrop-blur-lg px-4 md:px-6 py-2 md:py-3 rounded-2xl border border-white/20 flex items-center gap-2 md:gap-3">
              <span className="text-xl md:text-2xl">🔥</span>
              <div className="text-white text-right">
                <p className="text-[8px] md:text-[10px] font-black uppercase opacity-60">Daily Streak</p>
                <p className="font-black text-sm md:text-lg leading-none">1 Day</p>
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
            <div className="w-32 h-32 md:w-44 md:h-44 rounded-[2.5rem] md:rounded-[3rem] bg-white shadow-xl flex items-center justify-center text-6xl md:text-8xl border-[6px] md:border-[8px] border-white relative transition-transform group-hover:scale-105">
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
              <div className="bg-gray-50/50 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 text-center md:text-left">
                <label className="block text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Choose Your Avatar</label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 md:gap-4">
                  {AVATARS.map(a => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAvatar(a)}
                      className={`text-2xl md:text-4xl p-3 md:p-5 rounded-2xl md:rounded-[2rem] border-4 transition-all hover:scale-110 ${avatar === a ? 'border-red-600 bg-white shadow-xl' : 'border-transparent bg-white/50 hover:bg-white'}`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                <div className="space-y-3 text-left">
                  <label className="block text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Scholar Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Candidate 007"
                    className="w-full p-5 rounded-[1.5rem] md:rounded-[2rem] border-2 border-gray-100 focus:border-red-600 outline-none transition-all font-black text-lg md:text-xl shadow-inner bg-gray-50"
                    required
                  />
                </div>
                <div className="space-y-3 text-left">
                  <label className="block text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Academic Motto</label>
                  <textarea 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Focus. Persevere. Succeed."
                    className="w-full p-5 rounded-[1.5rem] md:rounded-[2rem] border-2 border-gray-100 focus:border-red-600 outline-none transition-all font-bold h-24 resize-none shadow-inner bg-gray-50"
                  />
                </div>
              </div>
              
              <button 
                type="submit"
                className="w-full py-6 md:py-8 bg-gradient-to-r from-indigo-700 to-red-700 text-white font-black rounded-[2rem] md:rounded-[2.5rem] shadow-2xl hover:shadow-indigo-500/20 transition-all text-xl md:text-2xl uppercase tracking-widest active:scale-95"
              >
                Apply Changes
              </button>
            </form>
          ) : (
            <div className="space-y-10 md:space-y-12">
              <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 md:gap-12">
                <div className="flex-1 space-y-6 w-full">
                  <div className="text-center md:text-left">
                    <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter uppercase mb-4 leading-none">
                      {name || 'The Scholar'}
                    </h2>
                    <p className="text-base md:text-xl text-gray-500 font-medium leading-relaxed italic mx-auto md:mx-0 max-w-xl">
                      "{description || 'Mastering the art of SM025 mathematics.'}"
                    </p>
                  </div>
                  
                  {/* Join Info & Time Spent */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-indigo-50/50 border border-indigo-100 p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] flex items-center gap-4 text-left">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-2xl flex items-center justify-center text-xl md:text-2xl shadow-sm shrink-0">⏳</div>
                      <div>
                        <p className="text-[8px] md:text-[10px] font-black text-indigo-400 uppercase tracking-widest">Deep Focus Time</p>
                        <p className="font-black text-indigo-900 text-sm md:text-base">{formatTimeSpent(profile.totalTimeSpent)}</p>
                      </div>
                    </div>
                    <div className="bg-rose-50/50 border border-rose-100 p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] flex items-center gap-4 text-left">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-2xl flex items-center justify-center text-xl md:text-2xl shadow-sm shrink-0">🎓</div>
                      <div>
                        <p className="text-[8px] md:text-[10px] font-black text-rose-400 uppercase tracking-widest">Scholar Since</p>
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
                      <span className="bg-gray-100 text-gray-400 text-[10px] md:text-xs font-black px-5 md:px-6 py-2 md:py-2.5 rounded-full uppercase tracking-widest border border-gray-200">Unaligned Soul</span>
                    )}
                    <span className="bg-amber-100 text-amber-700 text-[10px] md:text-xs font-black px-5 md:px-6 py-2 md:py-2.5 rounded-full uppercase tracking-widest border border-amber-200 shadow-sm">
                      {masteryPercentage}% Accuracy
                    </span>
                  </div>

                  {/* Enhanced XP Gauge */}
                  <div className="bg-white border-2 border-gray-100 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-sm max-w-md mx-auto md:mx-0">
                    <div className="flex justify-between items-end mb-4">
                      <div className="text-left">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Level {level} Progress</p>
                        <p className="text-xl md:text-2xl font-black text-indigo-700 leading-none">Elite Solver</p>
                      </div>
                      <span className="text-xs md:text-sm font-black text-indigo-600">{xpIntoLevel} / {xpNeededForNext} XP</span>
                    </div>
                    <div className="h-3 md:h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-50 shadow-inner p-1">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                        style={{ width: `${xpIntoLevel}%` }}
                      />
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => setIsEditing(true)}
                  className="w-full md:w-auto px-8 py-3 bg-white border-2 border-gray-100 rounded-2xl text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-red-600 hover:border-red-100 hover:bg-red-50 transition-all shadow-sm order-first md:order-last"
                >
                  Edit Identity
                </button>
              </div>

              {/* Syllabus Mastery Grid */}
              <div className="pt-10 md:pt-12 border-t border-gray-50">
                <div className="flex justify-between items-center mb-8 md:mb-10">
                  <h3 className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex-1 flex items-center gap-2 md:gap-4 whitespace-nowrap">
                    <span className="flex-1 h-px bg-gray-100"></span>
                    Syllabus Mastery Breakdown
                    <span className="flex-1 h-px bg-gray-100"></span>
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                  {TOPICS.map(topic => {
                    const stats = calculateTopicMastery(topic);
                    const style = themeStyles[topic] || themeStyles.default;

                    return (
                      <div key={topic} className={`p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border-2 ${style.border} ${style.lightBg} relative overflow-hidden group hover:shadow-xl transition-all duration-300 text-left`}>
                        <div className="flex justify-between items-start mb-6 relative z-10">
                          <div>
                            <span className={`text-[9px] md:text-[10px] font-black ${style.text} uppercase tracking-widest block mb-1`}>{topic}</span>
                            <span className="text-xl md:text-2xl font-black text-gray-900">{stats.accuracy}% <span className="text-[10px] font-bold text-gray-400">Acc.</span></span>
                          </div>
                          <div className={`px-2.5 py-1 rounded-full ${style.accent} ${style.text} text-[8px] md:text-[9px] font-black uppercase tracking-tighter`}>
                            {stats.rank}
                          </div>
                        </div>

                        <div className="h-2.5 md:h-3 w-full bg-white rounded-full overflow-hidden mb-6 md:mb-8 relative z-10 shadow-inner border border-gray-100">
                          <div 
                            className={`h-full ${style.bg} transition-all duration-1000 shadow-lg`} 
                            style={{ width: `${stats.accuracy}%` }}
                          />
                        </div>

                        {/* Difficulty Mix visualization */}
                        <div className="space-y-3 relative z-10">
                          <div className="flex justify-between items-center text-[8px] md:text-[9px] font-black text-gray-400 uppercase mb-2">
                             <span>Difficulty Mix</span>
                             <span>{stats.correct} Solves</span>
                          </div>
                          <div className="h-1.5 w-full bg-gray-100 rounded-full flex overflow-hidden">
                             <div className="h-full bg-blue-400" style={{ width: `${stats.attempts > 0 ? (stats.b / stats.correct) * 100 : 0}%` }} title="Basic"></div>
                             <div className="h-full bg-amber-400" style={{ width: `${stats.attempts > 0 ? (stats.i / stats.correct) * 100 : 0}%` }} title="Intermediate"></div>
                             <div className="h-full bg-rose-500" style={{ width: `${stats.attempts > 0 ? (stats.a / stats.correct) * 100 : 0}%` }} title="Advanced"></div>
                          </div>
                          <div className="flex flex-wrap justify-between text-[7px] md:text-[8px] font-bold text-gray-400 uppercase gap-y-1">
                            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div> {stats.b} Basic</span>
                            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div> {stats.i} Inter</span>
                            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-rose-500 rounded-full"></div> {stats.a} Adv</span>
                          </div>
                        </div>

                        {/* Decorative background number */}
                        <div className="absolute -bottom-4 -right-2 text-6xl md:text-8xl font-black text-black/5 select-none transition-transform group-hover:scale-125">
                           {topic[0]}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Achievement Gallery */}
              <div className="pt-10 md:pt-12 border-t border-gray-50">
                <h3 className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-10 text-center">Achievement Gallery</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 md:gap-8">
                  {ACHIEVEMENTS.map(badge => {
                    const isUnlocked = profile.unlockedBadges.includes(badge.id);
                    const progress = getAchievementProgress(badge);
                    
                    return (
                      <div 
                        key={badge.id}
                        onClick={() => setSelectedBadge(badge)}
                        className={`group flex flex-col items-center transition-all ${isUnlocked ? 'cursor-pointer hover:scale-110' : 'opacity-30 grayscale'}`}
                      >
                        <div className={`w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-[2.5rem] flex items-center justify-center text-3xl md:text-4xl mb-3 transition-all relative border-2 md:border-4
                          ${isUnlocked ? 'bg-white border-amber-400 shadow-lg rotate-3' : 'bg-gray-100 border-transparent shadow-none'}`}
                        >
                          {badge.icon}
                          {isUnlocked && <div className="absolute -top-1.5 -right-1.5 w-6 h-6 md:w-8 md:h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-[10px] md:text-sm border-2 md:border-4 border-white shadow-md">✓</div>}
                        </div>
                        <span className={`text-[8px] md:text-[10px] font-black text-center uppercase tracking-tighter px-1 leading-tight ${isUnlocked ? 'text-gray-900' : 'text-gray-400'}`}>
                          {badge.name}
                        </span>
                        
                        {!isUnlocked && progress && (
                          <div className="mt-2 w-12 md:w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500" style={{ width: `${progress.percentage}%` }}></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stats Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {[
                  { label: 'Correct Answers', value: profile.correctAnswers, color: 'text-green-600', bg: 'bg-green-50' },
                  { label: 'Total Attempts', value: profile.totalAttempts, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Badges Earned', value: profile.unlockedBadges.length, color: 'text-amber-600', bg: 'bg-amber-50' },
                  { label: 'Daily Goals', value: profile.dailyGoalTotalCount, color: 'text-red-600', bg: 'bg-red-50' }
                ].map((stat, i) => (
                  <div key={i} className={`${stat.bg} p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-transparent hover:border-white hover:shadow-xl transition-all text-center group`}>
                    <p className={`text-2xl md:text-4xl font-black mb-1 ${stat.color} group-hover:scale-110 transition-transform`}>{stat.value}</p>
                    <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;