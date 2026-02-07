
import React, { useState, useEffect, useCallback } from 'react';
import { GameState, Reward, Profile, MistakeRecord, MathProblem, AVATARS, DiscussionPost, STUDY_GROUPS, StudyGroup } from './types';
import Header from './components/Header';
import Home from './components/Home';
import MathPractice from './components/MathPractice';
import RewardSystem from './components/RewardSystem';
import MistakeNotebook from './components/MistakeNotebook';
import ProfilePage from './components/ProfilePage';
import RankingPage from './components/RankingPage';
import GroupPage from './components/GroupPage';
import AchievementsPage from './components/AchievementsPage';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.HOME);
  
  // --- 1. 数据初始化 (从 LocalStorage 加载) ---
  const [points, setPoints] = useState<number>(() => {
    return parseInt(localStorage.getItem('math_points') || '0', 10);
  });

  const [rewards, setRewards] = useState<Reward[]>(() => {
    return JSON.parse(localStorage.getItem('math_rewards') || '[]');
  });

  const [groups, setGroups] = useState<StudyGroup[]>(() => {
    const saved = localStorage.getItem('math_global_groups');
    return saved ? JSON.parse(saved) : STUDY_GROUPS;
  });

  const [profile, setProfile] = useState<Profile>(() => {
    const saved = localStorage.getItem('math_profile');
    const today = new Date().toDateString();
    const defaultProfile: Profile = { 
      name: '', description: '', group: 'Tiada', avatar: AVATARS[0],
      correctAnswers: 0, totalAttempts: 0, dailyCorrectCount: 0,
      dailyGoalReached: false, dailyGoalTotalCount: 0, unlockedBadges: [],
      topicHistory: [], problemStats: {}, topicAttempts: {}, solveHistory: [],
      lastResetDate: today, joinDate: new Date().toLocaleDateString('ms-MY'), totalTimeSpent: 0
    };
    if (saved) {
      const p = JSON.parse(saved);
      if (p.lastResetDate !== today) { p.dailyCorrectCount = 0; p.dailyGoalReached = false; p.lastResetDate = today; }
      return { ...defaultProfile, ...p };
    }
    return defaultProfile;
  });

  const [mistakeNotebook, setMistakeNotebook] = useState<MistakeRecord[]>(() => {
    return JSON.parse(localStorage.getItem('math_notebook') || '[]');
  });

  const [discussionPosts, setDiscussionPosts] = useState<DiscussionPost[]>(() => {
    return JSON.parse(localStorage.getItem('math_discussions') || '[]');
  });

  // --- 2. 核心同步引擎：更新公共名录 (模拟后端) ---
  const updatePublicRegistry = useCallback((p: Profile) => {
    if (!p.name) return;
    const registryRaw = localStorage.getItem('math_public_registry');
    const registry = registryRaw ? JSON.parse(registryRaw) : [];
    const userIndex = registry.findIndex((u: any) => u.name === p.name);
    
    const userData = {
      name: p.name,
      group: p.group,
      avatar: p.avatar,
      correct: p.correctAnswers,
      total: p.totalAttempts,
      lastActive: Date.now()
    };

    if (userIndex >= 0) registry[userIndex] = userData;
    else registry.push(userData);

    localStorage.setItem('math_public_registry', JSON.stringify(registry));
    // 强制触发一次同步事件给当前页面（虽然 storage 只跨页面，但我们手动同步状态）
    window.dispatchEvent(new Event('storage'));
  }, []);

  // --- 3. 监听其他标签页的变动 ---
  useEffect(() => {
    const handleStorageChange = () => {
      // 当其他标签页更新了公共名录或群组，这里可以重新加载或更新排行榜状态
      const updatedGroups = localStorage.getItem('math_global_groups');
      if (updatedGroups) setGroups(JSON.parse(updatedGroups));
      
      const updatedPoints = localStorage.getItem('math_points');
      if (updatedPoints) setPoints(parseInt(updatedPoints, 10));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // --- 4. 自动保存本地数据 ---
  useEffect(() => { localStorage.setItem('math_points', points.toString()); }, [points]);
  useEffect(() => { localStorage.setItem('math_rewards', JSON.stringify(rewards)); }, [rewards]);
  useEffect(() => { localStorage.setItem('math_global_groups', JSON.stringify(groups)); }, [groups]);
  useEffect(() => { 
    localStorage.setItem('math_profile', JSON.stringify(profile));
    updatePublicRegistry(profile);
  }, [profile, updatePublicRegistry]);
  useEffect(() => { localStorage.setItem('math_notebook', JSON.stringify(mistakeNotebook)); }, [mistakeNotebook]);
  useEffect(() => { localStorage.setItem('math_discussions', JSON.stringify(discussionPosts)); }, [discussionPosts]);

  const addPoints = (amount: number, problem?: MathProblem) => {
    setPoints(prev => prev + amount);
    setProfile(prev => {
      const newDailyCount = prev.dailyCorrectCount + 1;
      let goalReached = prev.dailyGoalReached;
      let totalDailyGoals = prev.dailyGoalTotalCount;

      if (newDailyCount === 10 && !goalReached) {
        goalReached = true;
        totalDailyGoals += 1;
        setPoints(p => p + 100);
      }

      const newStats = { ...prev.problemStats };
      const newTopicAttempts = { ...prev.topicAttempts };
      let newSolveHistory = [...prev.solveHistory];

      if (problem) {
        const statKey = `${problem.topic}_${problem.difficulty}`;
        newStats[statKey] = (newStats[statKey] || 0) + 1;
        newTopicAttempts[problem.topic] = (newTopicAttempts[problem.topic] || 0) + 1;
        newSolveHistory = [problem, ...newSolveHistory].slice(0, 20);
      }

      return {
        ...prev,
        correctAnswers: prev.correctAnswers + 1,
        totalAttempts: prev.totalAttempts + 1,
        dailyCorrectCount: newDailyCount,
        dailyGoalReached: goalReached,
        dailyGoalTotalCount: totalDailyGoals,
        problemStats: newStats,
        topicAttempts: newTopicAttempts,
        solveHistory: newSolveHistory
      };
    });
  };

  const handleIncorrectAttempt = (topic?: string) => {
    setProfile(prev => {
      const newTopicAttempts = { ...prev.topicAttempts };
      if (topic) newTopicAttempts[topic] = (newTopicAttempts[topic] || 0) + 1;
      return { ...prev, totalAttempts: prev.totalAttempts + 1, topicAttempts: newTopicAttempts };
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header points={points} setGameState={setGameState} gameState={gameState} mistakeCount={mistakeNotebook.length} />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
        {gameState === GameState.HOME && <Home setGameState={setGameState} userProfile={profile} mistakeCount={mistakeNotebook.length} />}
        {gameState === GameState.PRACTICE && <MathPractice onCorrectAnswer={(p) => addPoints(10, p)} onMistake={(p) => setMistakeNotebook(prev => [...prev, {problem: p, addedAt: Date.now()}])} onIncorrectAttempt={handleIncorrectAttempt} />}
        {gameState === GameState.REWARDS && <RewardSystem rewards={rewards} points={points} onAddReward={(n, c) => setRewards([...rewards, {id: Math.random().toString(), name: n, pointsNeeded: c, redeemed: false, createdAt: Date.now()}])} onRedeemReward={(id) => { const r = rewards.find(x => x.id === id); if(r && points >= r.pointsNeeded) { setPoints(p => p - r.pointsNeeded); setRewards(rewards.map(x => x.id === id ? {...x, redeemed: true} : x)); }}} onRemoveReward={(id) => setRewards(rewards.filter(r => r.id !== id))} />}
        {gameState === GameState.NOTEBOOK && <MistakeNotebook records={mistakeNotebook} onCorrectRetry={(id) => { addPoints(5); setMistakeNotebook(prev => prev.filter(m => m.problem.id !== id)); }} />}
        {gameState === GameState.RANKINGS && <RankingPage userProfile={profile} />}
        {gameState === GameState.GROUP && (
          <GroupPage 
            userProfile={profile} 
            groups={groups}
            onUpdateProfile={setProfile}
            onCreateGroup={(g) => { setGroups([...groups, g]); setProfile({...profile, group: g.name}); }}
            mistakeNotebook={mistakeNotebook}
            discussionPosts={discussionPosts.filter(p => p.groupName === profile.group)}
            onAddDiscussionPost={(p) => setDiscussionPosts([{id: Math.random().toString(), groupName: profile.group, authorName: profile.name || 'Pelajar', authorAvatar: profile.avatar, problem: p, timestamp: Date.now(), comments: []}, ...discussionPosts])}
            onAddComment={(postId, text) => setDiscussionPosts(discussionPosts.map(p => p.id === postId ? {...p, comments: [...p.comments, {id: Math.random().toString(), authorName: profile.name, authorAvatar: profile.avatar, text, createdAt: Date.now()}]} : p))}
          />
        )}
        {gameState === GameState.PROFILE && <ProfilePage profile={profile} onUpdateProfile={setProfile} onClearData={() => {localStorage.clear(); window.location.reload();}} onExportData={() => {}} onImportData={() => {}} />}
        {gameState === GameState.ACHIEVEMENTS && <AchievementsPage profile={profile} />}
      </main>

      <footer className="bg-slate-50 border-t py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-900 font-black uppercase tracking-widest text-[10px]">MathMaster SM025 • Persistence Engine Active</p>
          <p className="text-slate-400 text-[8px] mt-1 uppercase font-bold tracking-tight">Data disimpan secara selamat dalam pelayar anda.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
