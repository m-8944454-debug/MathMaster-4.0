
import React, { useState, useMemo, useEffect, useRef } from 'react';
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

interface Member {
  id: string;
  name: string;
  dailyCount: number;
  totalSolved: number;
  mastery: number;
  avatar: string;
  isYou: boolean;
  isLeader: boolean;
  status: 'online' | 'offline' | 'studying';
}

/**
 * Isolated Comment Input Component
 * Optimized for touch devices and fixed layout stability.
 */
const CommentInput: React.FC<{ onSend: (text: string) => void }> = ({ onSend }) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim()) {
      onSend(text);
      setText('');
    }
  };

  return (
    <div className="pt-4 mt-auto border-t border-gray-100 flex gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder="Add insight..."
        className="flex-grow bg-gray-50 border border-gray-100 rounded-xl md:rounded-2xl px-4 md:px-5 py-2.5 md:py-3 text-xs md:text-sm outline-none focus:border-red-600 focus:bg-white transition-all shadow-inner min-w-0"
      />
      <button
        onClick={handleSend}
        disabled={!text.trim()}
        className="bg-red-600 text-white p-3 md:p-4 rounded-xl md:rounded-2xl shadow-lg hover:bg-red-700 disabled:opacity-30 disabled:grayscale transition-all active:scale-95 flex items-center justify-center shrink-0"
      >
        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
        </svg>
      </button>
    </div>
  );
};

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
  const commentsEndRef = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const [groupCode, setGroupCode] = useState('');
  const [error, setError] = useState('');

  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newIcon, setNewIcon] = useState(ICONS[0]);
  const [newColor, setNewColor] = useState(COLORS[0]);

  const [isSharing, setIsSharing] = useState(false);

  const currentGroup = groups.find((g) => g.name === userProfile.group);

  useEffect(() => {
    discussionPosts.forEach((post) => {
      if (commentsEndRef.current[post.id]) {
        commentsEndRef.current[post.id]?.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }, [discussionPosts]);

  const handleJoinGroup = () => {
    const foundGroup = groups.find((g) => g.code.toUpperCase() === groupCode.toUpperCase());
    if (foundGroup) {
      onUpdateProfile({ ...userProfile, group: foundGroup.name });
      setGroupCode('');
      setError('');
    } else {
      setError('Invalid code! Ask your group leader.');
    }
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newCode) return;

    if (groups.find((g) => g.code.toUpperCase() === newCode.toUpperCase())) {
      setError('This code is already taken.');
      return;
    }

    const newGroup: StudyGroup = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName as StudyGroupType,
      code: newCode.toUpperCase(),
      icon: newIcon,
      color: newColor,
    };

    onCreateGroup(newGroup);
    setNewName('');
    setNewCode('');
    setError('');
  };

  const leaveGroup = () => {
    onUpdateProfile({ ...userProfile, group: 'None' });
  };

  const handleShareQuestion = (problem: MathProblem) => {
    onAddDiscussionPost(problem);
    setIsSharing(false);
  };

  const members: Member[] = useMemo(() => {
    const list: Member[] = [
      { id: '2', name: 'Min Er', dailyCount: 18, totalSolved: 512, mastery: 95, avatar: '👩‍🔬', isYou: false, isLeader: true, status: 'online' },
      { id: '1', name: 'Intan', dailyCount: 15, totalSolved: 452, mastery: 88, avatar: '🦊', isYou: false, isLeader: false, status: 'studying' },
      { id: '3', name: 'Yaya', dailyCount: 8, totalSolved: 310, mastery: 85, avatar: '🚀', isYou: false, isLeader: false, status: 'offline' },
      {
        id: 'me',
        name: userProfile.name || 'You',
        dailyCount: userProfile.dailyCorrectCount,
        totalSolved: userProfile.correctAnswers,
        mastery: userProfile.totalAttempts > 0 ? Math.round((userProfile.correctAnswers / userProfile.totalAttempts) * 100) : 0,
        avatar: userProfile.avatar,
        isYou: true,
        isLeader: false,
        status: 'online',
      },
    ];
    return list.sort((a, b) => b.totalSolved - a.totalSolved);
  }, [userProfile]);

  const dailyMVP = useMemo(() => {
    return [...members].sort((a, b) => b.dailyCount - a.dailyCount)[0];
  }, [members]);

  const totalGroupSolved = members.reduce((acc, m) => acc + m.totalSolved, 0);
  const dailyTaskProgress = Math.min(userProfile.dailyCorrectCount, 10);
  const isDailyTaskDone = userProfile.dailyCorrectCount >= 10;

  if (!currentGroup) {
    return (
      <div className="max-w-2xl mx-auto py-6 md:py-12 animate-in fade-in zoom-in-95 px-2">
        <div className="text-center mb-8 md:mb-10">
          <div className="w-16 h-16 md:w-24 md:h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
            <svg className="w-8 h-8 md:w-12 md:h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-gray-900 mb-2">Study Groups</h2>
          <p className="text-xs md:text-base text-gray-500">Master the SM025 syllabus with your campus scholars.</p>
        </div>

        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setJoinOrCreateTab('join')}
              className={`flex-1 py-4 md:py-6 font-black text-[10px] md:text-xs uppercase tracking-widest transition-all ${joinOrCreateTab === 'join' ? 'text-red-600 border-b-4 border-red-600' : 'text-gray-400 bg-gray-50'}`}
            >
              Join Group
            </button>
            <button
              onClick={() => setJoinOrCreateTab('create')}
              className={`flex-1 py-4 md:py-6 font-black text-[10px] md:text-xs uppercase tracking-widest transition-all ${joinOrCreateTab === 'create' ? 'text-red-600 border-b-4 border-red-600' : 'text-gray-400 bg-gray-50'}`}
            >
              Create New
            </button>
          </div>

          <div className="p-6 md:p-10">
            {joinOrCreateTab === 'join' ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Group Access Code</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={groupCode}
                      onChange={(e) => setGroupCode(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleJoinGroup()}
                      placeholder="e.g. ALPHA"
                      className="flex-grow p-4 md:p-5 rounded-xl md:rounded-2xl border-2 border-gray-100 focus:border-red-600 outline-none transition-all uppercase font-mono text-xl md:text-2xl"
                    />
                    <button
                      onClick={handleJoinGroup}
                      className="w-full sm:w-auto px-8 py-4 bg-red-600 text-white font-black rounded-xl md:rounded-2xl hover:bg-red-700 transition-all shadow-lg active:scale-95 text-sm md:text-base"
                    >
                      Enter
                    </button>
                  </div>
                  {error && <p className="text-sm text-red-500 font-bold mt-4">{error}</p>}
                </div>

                <div className="pt-4">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">Available Groups</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {groups.map((g) => (
                      <div key={g.id} className="flex items-center justify-between p-3 md:p-4 rounded-xl border-2 border-gray-50 bg-gray-50/30">
                        <div className="flex items-center gap-2 md:gap-3">
                          <span className="text-xl md:text-2xl">{g.icon}</span>
                          <span className="font-bold text-gray-700 text-sm md:text-base">{g.name}</span>
                        </div>
                        <span className="text-[9px] md:text-[10px] font-mono font-bold text-gray-400">{g.code}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateGroup} className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="text-left">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 md:mb-3">Group Name</label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Melaka Math Lords"
                      className="w-full p-3 md:p-4 rounded-xl border-2 border-gray-100 focus:border-red-600 outline-none transition-all font-bold text-sm md:text-base"
                      required
                    />
                  </div>
                  <div className="text-left">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 md:mb-3">Unique Code</label>
                    <input
                      type="text"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      placeholder="e.g. MML"
                      className="w-full p-3 md:p-4 rounded-xl border-2 border-gray-100 focus:border-red-600 outline-none transition-all font-mono uppercase font-black text-sm md:text-base"
                      required
                    />
                  </div>
                </div>

                <div className="text-left">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Choose Emblem</label>
                  <div className="grid grid-cols-6 sm:flex sm:flex-wrap gap-2">
                    {ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setNewIcon(icon)}
                        className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl text-xl border-2 transition-all ${newIcon === icon ? 'border-red-600 bg-red-50' : 'border-gray-50 bg-white'}`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 md:py-5 bg-red-600 text-white font-black rounded-xl md:rounded-2xl shadow-xl hover:bg-red-700 transition-all uppercase tracking-widest text-xs md:text-sm"
                >
                  Establish Study Group
                </button>
                {error && <p className="text-sm text-red-500 font-bold mt-2">{error}</p>}
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-8 animate-in fade-in duration-500 px-1">
      {/* Group Header - Responsive */}
      <div className="bg-white rounded-[2rem] p-6 md:p-12 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-${currentGroup.color}-500 opacity-5 rounded-full -mr-16 -mt-16 md:-mr-20 md:-mt-20`}></div>
        <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-4 md:gap-6 relative z-10 w-full">
          <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-${currentGroup.color}-100 flex items-center justify-center text-3xl md:text-4xl shadow-md border-4 border-white shrink-0`}>
            {currentGroup.icon}
          </div>
          <div className="flex-grow">
            <h2 className="text-2xl md:text-4xl font-black text-gray-900 leading-tight uppercase tracking-tighter">{currentGroup.name}</h2>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 md:gap-3 mt-1">
              <span className={`text-[8px] md:text-[10px] font-black text-${currentGroup.color}-600 bg-${currentGroup.color}-50 px-2.5 py-1 rounded-full uppercase tracking-widest border border-${currentGroup.color}-100`}>
                Code: {currentGroup.code}
              </span>
              <button onClick={leaveGroup} className="text-[8px] md:text-[10px] font-black text-gray-400 hover:text-red-500 uppercase tracking-widest transition-colors underline">Exit</button>
            </div>
          </div>
          <div className="flex flex-col items-center md:items-end gap-1 md:gap-2 relative z-10 text-center md:text-right shrink-0">
            <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Solving Count</p>
            <p className="text-xl md:text-3xl font-black text-gray-900">{totalGroupSolved} <span className="text-[10px] text-gray-400 italic font-medium uppercase">Total</span></p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Scrollable on mobile */}
      <div className="overflow-x-auto no-scrollbar pb-1">
        <div className="flex gap-1.5 p-1 bg-gray-100 rounded-2xl w-max md:w-fit min-w-full md:min-w-0">
          {[
            { id: 'overview', label: 'Dashboard', icon: '📊' },
            { id: 'members', label: 'Members', icon: '👥' },
            { id: 'discussion', label: 'Discussion', icon: '💬' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 md:gap-2 px-5 md:px-8 py-2.5 md:py-3 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all whitespace-nowrap
                ${activeTab === tab.id ? 'bg-white shadow-md text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <span className="text-sm md:text-base">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          <div className={`md:col-span-2 bg-gradient-to-br from-${currentGroup.color}-600 to-${currentGroup.color}-800 rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10 text-white shadow-xl relative overflow-hidden`}>
            <div className="relative z-10">
              <h3 className="text-xl md:text-3xl font-black uppercase tracking-tighter mb-1">Campus Mission</h3>
              <p className="text-white/70 text-[10px] md:text-sm font-bold uppercase tracking-widest mb-6 md:mb-8">Daily Group Achievement</p>

              <div className="space-y-4 md:space-y-6">
                <div className="flex justify-between items-end">
                  <p className="text-[10px] md:text-sm font-black uppercase tracking-tight">Solve Progress</p>
                  <p className="text-xl md:text-2xl font-black">{dailyTaskProgress} / 10</p>
                </div>
                <div className="h-3 md:h-4 bg-white/20 rounded-full overflow-hidden p-0.5 md:p-1">
                  <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${(dailyTaskProgress / 10) * 100}%` }}></div>
                </div>
                {isDailyTaskDone && (
                  <span className="inline-block bg-white text-gray-900 px-3 py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-sm">Goal Achieved! +100 Pts</span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10 border border-amber-100 shadow-xl relative text-center">
            <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-6 md:mb-8">Group MVP</h4>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl md:rounded-[2rem] bg-amber-50 flex items-center justify-center text-5xl md:text-6xl border-4 border-amber-100 mb-4 md:mb-6 relative">
                {dailyMVP?.avatar}
                <div className="absolute -top-2.5 -right-2.5 w-8 h-8 md:w-10 md:h-10 bg-amber-400 rounded-full flex items-center justify-center border-4 border-white text-white shadow-lg text-sm md:text-base">👑</div>
              </div>
              <p className="font-black text-xl md:text-2xl text-gray-900 mb-1">{dailyMVP?.name}</p>
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-tighter">+{dailyMVP?.dailyCount} Solved Today</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {members.map((member) => (
            <div key={member.id} className={`bg-white rounded-[2rem] p-6 md:p-8 border-2 transition-all hover:shadow-xl ${member.isYou ? 'border-red-600 shadow-md' : 'border-gray-50'}`}>
              <div className="flex justify-between items-start mb-4 md:mb-6">
                <div className="relative">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-2xl md:rounded-3xl flex items-center justify-center text-4xl md:text-5xl border border-gray-100 shadow-inner">
                    {member.avatar}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 md:w-6 md:h-6 rounded-full border-[3px] md:border-4 border-white ${member.status === 'online' ? 'bg-green-500' : member.status === 'studying' ? 'bg-amber-500 animate-pulse' : 'bg-gray-300'}`}></div>
                </div>
                {member.isLeader && (
                  <div className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full flex items-center gap-1 border border-amber-100 shadow-sm">
                    <span className="text-[8px] font-black uppercase tracking-widest">🛡️ Leader</span>
                  </div>
                )}
              </div>
              <h4 className="text-lg md:text-xl font-black text-gray-900 flex items-center gap-2">
                {member.name}
                {member.isYou && <span className="text-[9px] font-black text-red-600 bg-red-50 px-1.5 py-0.5 rounded uppercase">You</span>}
              </h4>
              <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{member.mastery}% Accuracy</p>

              <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-50 grid grid-cols-2 gap-2 md:gap-4 text-center">
                <div>
                  <p className="text-base md:text-lg font-black text-gray-900">{member.totalSolved}</p>
                  <p className="text-[7px] md:text-[8px] font-black text-gray-400 uppercase tracking-widest">Solved</p>
                </div>
                <div>
                  <p className="text-base md:text-lg font-black text-red-600">+{member.dailyCount}</p>
                  <p className="text-[7px] md:text-[8px] font-black text-gray-400 uppercase tracking-widest">Today</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'discussion' && (
        <div className="space-y-4 md:space-y-8">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 md:gap-6 shadow-sm">
            <div className="text-center sm:text-left">
              <h3 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tighter">Academic Study Room</h3>
              <p className="text-xs md:text-sm text-gray-500 font-medium italic">Collaborate and clear syllabus doubts.</p>
            </div>
            <button
              onClick={() => setIsSharing(true)}
              className="w-full sm:w-auto bg-red-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest shadow-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2"
            >
              <span>🚀</span> Share Challenge
            </button>
          </div>

          <div className="space-y-6 md:space-y-8">
            {discussionPosts.length === 0 ? (
              <div className="text-center py-16 md:py-20 bg-gray-50/50 rounded-[2.5rem] border-2 border-dashed border-gray-200 px-4">
                <div className="text-4xl md:text-5xl mb-4 opacity-30">💬</div>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs md:text-sm">No threads yet. Be the first!</p>
              </div>
            ) : (
              discussionPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden flex flex-col md:flex-row animate-in slide-in-from-bottom-4">
                  {/* Left Column: Problem Detail */}
                  <div className="w-full md:w-3/5 p-6 md:p-10 bg-slate-50/40 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col">
                    <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                      <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-xl md:rounded-2xl flex items-center justify-center text-2xl md:text-3xl shadow-sm border border-gray-100 shrink-0">
                        {post.authorAvatar}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-gray-900 text-base md:text-lg truncate">{post.authorName}</p>
                        <p className="text-[8px] md:text-[10px] text-gray-400 font-black uppercase tracking-widest">
                          Shared {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl border border-red-50 mb-4 md:mb-6 flex-grow shadow-inner overflow-x-auto">
                      <span className="inline-block bg-red-600 text-white text-[8px] md:text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest mb-3 md:mb-4">
                        {post.problem.topic}
                      </span>
                      <SmartText text={post.problem.question} as="div" className="text-base md:text-xl font-bold text-gray-800 leading-relaxed" />
                    </div>
                    <div className="flex gap-2">
                      <span className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Difficulty:</span>
                      <span className="text-[8px] md:text-[10px] font-black text-amber-500">{'★'.repeat(post.problem.difficulty)}</span>
                    </div>
                  </div>

                  {/* Right Column: Comments Section */}
                  <div className="w-full md:w-2/5 p-6 md:p-8 flex flex-col bg-white">
                    <h4 className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 md:mb-6 border-b border-gray-50 pb-2 md:pb-3 shrink-0">Member Insights ({post.comments.length})</h4>

                    <div className="flex-1 space-y-4 md:space-y-5 mb-4 md:mb-6 overflow-y-auto max-h-[300px] md:max-h-[350px] pr-1 custom-scrollbar flex flex-col">
                      {post.comments.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 py-8 md:py-10">
                          <p className="text-[10px] md:text-xs font-bold text-gray-400 italic">No insights yet.</p>
                        </div>
                      ) : (
                        post.comments.map((comment) => (
                          <div key={comment.id} className="flex gap-2 md:gap-3 group animate-in fade-in slide-in-from-right-2">
                            <div className="text-xl md:text-2xl mt-1 shrink-0">{comment.authorAvatar}</div>
                            <div className="bg-gray-50 p-3 md:p-4 rounded-xl md:rounded-2xl text-[10px] md:text-xs text-gray-700 flex-1 border border-gray-100 group-hover:bg-gray-100/50 transition-colors min-w-0">
                              <p className="font-black text-[8px] md:text-[9px] uppercase text-gray-400 mb-1 flex justify-between gap-2">
                                <span className="truncate">{comment.authorName}</span>
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                  {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </p>
                              <SmartText text={comment.text} as="div" className="leading-relaxed font-medium break-words" />
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={(el) => (commentsEndRef.current[post.id] = el)} />
                    </div>

                    <CommentInput onSend={(text) => onAddComment(post.id, text)} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Share Modal - Responsive */}
      {isSharing && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setIsSharing(false)}>
          <div className="bg-white rounded-[2rem] md:rounded-[3rem] max-w-xl w-full p-6 md:p-10 shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 md:mb-8">
              <h3 className="text-xl md:text-3xl font-black text-gray-900 uppercase tracking-tighter">Choose a Challenge</h3>
              <button onClick={() => setIsSharing(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <p className="text-xs md:text-sm text-gray-500 mb-6 md:mb-8 font-medium italic">Share questions you've struggled with to help the group grow.</p>

            <div className="max-h-[350px] md:max-h-[400px] overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {mistakeNotebook.length === 0 ? (
                <div className="py-12 md:py-20 text-center bg-gray-50 rounded-[1.5rem] md:rounded-[2rem] border-2 border-dashed border-gray-200 px-4">
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] md:text-xs">Your notebook is empty.</p>
                </div>
              ) : (
                mistakeNotebook.map((record) => (
                  <div
                    key={record.problem.id}
                    onClick={() => handleShareQuestion(record.problem)}
                    className="group p-4 md:p-6 rounded-xl md:rounded-2xl border-2 border-gray-100 bg-white hover:border-red-600 hover:shadow-xl transition-all cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-[8px] md:text-[9px] font-black text-red-600 uppercase tracking-widest block mb-1 md:mb-2">{record.problem.topic}</span>
                      <SmartText text={record.problem.question} as="div" className="font-bold text-gray-800 text-sm md:text-base truncate" />
                    </div>
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm shrink-0">
                      <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"/></svg>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button
              onClick={() => setIsSharing(false)}
              className="w-full mt-6 md:mt-10 py-4 bg-gray-100 hover:bg-gray-200 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase text-gray-500 tracking-widest transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupPage;
