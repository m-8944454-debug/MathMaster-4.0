import React, { useState, useEffect, useCallback } from 'react';
import { GameState, Reward, Profile, MistakeRecord, MathProblem, AVATARS, DiscussionPost, DiscussionComment, STUDY_GROUPS, StudyGroup } from './types';
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
  
  const [points, setPoints] = useState<number>(() => {
    const saved = localStorage.getItem('math_points');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [rewards, setRewards] = useState<Reward[]>(() => {
    const saved = localStorage.getItem('math_rewards');
    return saved ? JSON.parse(saved) : [];
  });

  const [groups, setGroups] = useState<StudyGroup[]>(() => {
    const saved = localStorage.getItem('math_groups');
    return saved ? JSON.parse(saved) : STUDY_GROUPS;
  });

  const [profile, setProfile] = useState<Profile>(() => {
    const saved = localStorage.getItem('math_profile');
    const today = new Date().toDateString();
    
    const defaultProfile: Profile = { 
      name: '', 
      description: '', 
      group: 'None',
      avatar: AVATARS[0],
      correctAnswers: 0,
      totalAttempts: 0,
      dailyCorrectCount: 0,
      dailyGoalReached: false,
      dailyGoalTotalCount: 0,
      unlockedBadges: [],
      topicHistory: [],
      problemStats: {},
      topicAttempts: {},
      lastResetDate: today,
      joinDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      totalTimeSpent: 0
    };

    if (saved) {
      try {
        const parsed: Profile = JSON.parse(saved);
        const merged = { 
          ...defaultProfile, 
          ...parsed,
          problemStats: parsed.problemStats || {},
          topicAttempts: parsed.topicAttempts || {},
          unlockedBadges: parsed.unlockedBadges || [],
          joinDate: parsed.joinDate || defaultProfile.joinDate,
          totalTimeSpent: parsed.totalTimeSpent || 0
        };

        if (merged.lastResetDate !== today) {
          return {
            ...merged,
            dailyCorrectCount: 0,
            dailyGoalReached: false,
            lastResetDate: today
          };
        }
        return merged;
      } catch (e) {
        return defaultProfile;
      }
    }
    
    return defaultProfile;
  });

  const [mistakeNotebook, setMistakeNotebook] = useState<MistakeRecord[]>(() => {
    const saved = localStorage.getItem('math_notebook');
    return saved ? JSON.parse(saved) : [];
  });

  const [discussionPosts, setDiscussionPosts] = useState<DiscussionPost[]>(() => {
    const saved = localStorage.getItem('math_discussions');
    return saved ? JSON.parse(saved) : [];
  });

  const checkAchievements = useCallback((updatedProfile: Profile) => {
    const newBadges = [...updatedProfile.unlockedBadges];
    let changed = false;

    if (!newBadges.includes('genesis') && updatedProfile.correctAnswers >= 1) {
      newBadges.push('genesis');
      changed = true;
    }

    const vectorBasicCount = updatedProfile.problemStats['Vector_1'] || 0;
    if (!newBadges.includes('vector_apprentice') && vectorBasicCount >= 50) {
      newBadges.push('vector_apprentice');
      changed = true;
    }

    const requiredTopics = ["Numerical Solution", "Integration", "Vector"];
    if (!newBadges.includes('polymath') && requiredTopics.every(t => updatedProfile.topicHistory.includes(t))) {
      newBadges.push('polymath');
      changed = true;
    }

    if (!newBadges.includes('legend') && updatedProfile.correctAnswers >= 100) {
      newBadges.push('legend');
      changed = true;
    }

    const accuracy = updatedProfile.totalAttempts > 0 ? (updatedProfile.correctAnswers / updatedProfile.totalAttempts) : 0;
    if (!newBadges.includes('precision') && updatedProfile.totalAttempts >= 20 && accuracy >= 0.9) {
      newBadges.push('precision');
      changed = true;
    }

    if (!newBadges.includes('devotion') && updatedProfile.dailyGoalTotalCount >= 5) {
      newBadges.push('devotion');
      changed = true;
    }

    if (changed) {
      setProfile(prev => ({ ...prev, unlockedBadges: newBadges }));
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setProfile(prev => ({
        ...prev,
        totalTimeSpent: prev.totalTimeSpent + 10
      }));
    }, 10000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('math_points', points.toString());
  }, [points]);

  useEffect(() => {
    localStorage.setItem('math_rewards', JSON.stringify(rewards));
  }, [rewards]);

  useEffect(() => {
    localStorage.setItem('math_groups', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem('math_profile', JSON.stringify(profile));
    checkAchievements(profile);
  }, [profile, checkAchievements]);

  useEffect(() => {
    localStorage.setItem('math_notebook', JSON.stringify(mistakeNotebook));
  }, [mistakeNotebook]);

  useEffect(() => {
    localStorage.setItem('math_discussions', JSON.stringify(discussionPosts));
  }, [discussionPosts]);

  const addPoints = (amount: number, problem?: MathProblem) => {
    setPoints(prev => prev + amount);
    
    setProfile(prev => {
      const newDailyCount = prev.dailyCorrectCount + 1;
      let bonus = 0;
      let goalReached = prev.dailyGoalReached;
      let totalDailyGoals = prev.dailyGoalTotalCount;

      if (newDailyCount === 10 && !goalReached) {
        bonus = 100;
        goalReached = true;
        totalDailyGoals += 1;
      }

      if (bonus > 0) setPoints(p => p + bonus);

      const newTopicHistory = problem && !prev.topicHistory.includes(problem.topic) 
        ? [...prev.topicHistory, problem.topic] 
        : prev.topicHistory;

      const newStats = { ...prev.problemStats };
      const newTopicAttempts = { ...prev.topicAttempts };
      if (problem) {
        const statKey = `${problem.topic}_${problem.difficulty}`;
        newStats[statKey] = (newStats[statKey] || 0) + 1;
        newTopicAttempts[problem.topic] = (newTopicAttempts[problem.topic] || 0) + 1;
      }

      const newBadges = [...prev.unlockedBadges];
      if (problem?.difficulty === 3 && !newBadges.includes('advanced')) {
        newBadges.push('advanced');
      }

      return {
        ...prev,
        correctAnswers: prev.correctAnswers + 1,
        totalAttempts: prev.totalAttempts + 1,
        dailyCorrectCount: newDailyCount,
        dailyGoalReached: goalReached,
        dailyGoalTotalCount: totalDailyGoals,
        topicHistory: newTopicHistory,
        problemStats: newStats,
        topicAttempts: newTopicAttempts,
        unlockedBadges: newBadges
      };
    });
  };

  const handleIncorrectAttempt = (topic?: string) => {
    setProfile(prev => {
      const newTopicAttempts = { ...prev.topicAttempts };
      if (topic) {
        newTopicAttempts[topic] = (newTopicAttempts[topic] || 0) + 1;
      }
      return {
        ...prev,
        totalAttempts: prev.totalAttempts + 1,
        topicAttempts: newTopicAttempts
      };
    });
  };

  const addReward = (name: string, cost: number) => {
    const newReward: Reward = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      pointsNeeded: cost,
      redeemed: false,
      createdAt: Date.now(),
    };
    setRewards(prev => [...prev, newReward]);
  };

  const redeemReward = (id: string) => {
    const reward = rewards.find(r => r.id === id);
    if (reward && points >= reward.pointsNeeded) {
      setPoints(prev => prev - reward.pointsNeeded);
      setRewards(prev => prev.map(r => r.id === id ? { ...r, redeemed: true } : r));
    }
  };

  const removeReward = (id: string) => {
    setRewards(prev => prev.filter(r => r.id !== id));
  };

  const handleMistake = (problem: MathProblem) => {
    setMistakeNotebook(prev => {
      if (prev.find(m => m.problem.id === problem.id)) return prev;
      return [{ problem, addedAt: Date.now() }, ...prev];
    });
  };

  const clearMistake = (problemId: string) => {
    setMistakeNotebook(prev => prev.filter(m => m.problem.id !== problemId));
  };

  const addDiscussionPost = (problem: MathProblem) => {
    const newPost: DiscussionPost = {
      id: Math.random().toString(36).substr(2, 9),
      groupName: profile.group,
      authorName: profile.name || 'Anonymous',
      authorAvatar: profile.avatar,
      problem,
      timestamp: Date.now(),
      comments: []
    };
    setDiscussionPosts(prev => [newPost, ...prev]);
  };

  const addCommentToPost = (postId: string, text: string) => {
    const newComment: DiscussionComment = {
      id: Math.random().toString(36).substr(2, 9),
      authorName: profile.name || 'Anonymous',
      authorAvatar: profile.avatar,
      text,
      createdAt: Date.now()
    };
    setDiscussionPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, comments: [...post.comments, newComment] }
        : post
    ));
  };

  const onCreateGroup = (newGroup: StudyGroup) => {
    setGroups(prev => [...prev, newGroup]);
    setProfile(prev => ({ ...prev, group: newGroup.name }));
  };

  const clearAllData = () => {
    localStorage.clear();
    setPoints(0);
    setRewards([]);
    setGroups(STUDY_GROUPS);
    setProfile({ 
      name: '', 
      description: '', 
      group: 'None',
      avatar: AVATARS[0],
      correctAnswers: 0,
      totalAttempts: 0,
      dailyCorrectCount: 0,
      dailyGoalReached: false,
      dailyGoalTotalCount: 0,
      unlockedBadges: [],
      topicHistory: [],
      problemStats: {},
      topicAttempts: {},
      lastResetDate: new Date().toDateString(),
      joinDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      totalTimeSpent: 0
    });
    setMistakeNotebook([]);
    setDiscussionPosts([]);
    setGameState(GameState.HOME);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfcfd]">
      <Header 
        points={points} 
        setGameState={setGameState} 
        gameState={gameState} 
        mistakeCount={mistakeNotebook.length}
      />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
        {gameState === GameState.HOME && (
          <Home 
            setGameState={setGameState} 
            userProfile={profile} 
            mistakeCount={mistakeNotebook.length}
          />
        )}
        
        {gameState === GameState.PRACTICE && (
          <MathPractice 
            onCorrectAnswer={(problem) => addPoints(10, problem)} 
            onMistake={handleMistake}
            onIncorrectAttempt={(topic) => handleIncorrectAttempt(topic)}
          />
        )}
        
        {gameState === GameState.REWARDS && (
          <RewardSystem 
            rewards={rewards} 
            points={points} 
            onAddReward={addReward} 
            onRedeemReward={redeemReward}
            onRemoveReward={removeReward}
          />
        )}

        {gameState === GameState.ACHIEVEMENTS && (
          <AchievementsPage 
            profile={profile} 
          />
        )}

        {gameState === GameState.NOTEBOOK && (
          <MistakeNotebook 
            records={mistakeNotebook}
            onCorrectRetry={(id) => {
              addPoints(5);
              clearMistake(id);
            }}
          />
        )}

        {gameState === GameState.PROFILE && (
          <ProfilePage 
            profile={profile}
            onUpdateProfile={setProfile}
            onClearData={clearAllData}
          />
        )}

        {gameState === GameState.RANKINGS && (
          <RankingPage userProfile={profile} />
        )}

        {gameState === GameState.GROUP && (
          <GroupPage 
            userProfile={profile} 
            groups={groups}
            onUpdateProfile={setProfile}
            onCreateGroup={onCreateGroup}
            mistakeNotebook={mistakeNotebook}
            discussionPosts={discussionPosts.filter(p => p.groupName === profile.group)}
            onAddDiscussionPost={addDiscussionPost}
            onAddComment={addCommentToPost}
          />
        )}
      </main>

      <footer className="bg-white border-t py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-400 text-xs font-medium">
          &copy; 2025 MathMaster • Empowering KMM Students
        </div>
      </footer>
    </div>
  );
};

export default App;