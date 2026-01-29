import React from 'react';
import { GameState } from '../types';

interface HeaderProps {
  points: number;
  gameState: GameState;
  setGameState: (state: GameState) => void;
  mistakeCount: number;
}

const Header: React.FC<HeaderProps> = ({ points, gameState, setGameState, mistakeCount }) => {
  const NavButton = ({ state, label, icon, badge }: { state: GameState, label: string, icon: React.ReactNode, badge?: number }) => (
    <button 
      onClick={() => setGameState(state)}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all relative whitespace-nowrap
        ${gameState === state ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-indigo-500 hover:bg-gray-50'}`}
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[8px] text-white ring-2 ring-white">
          {badge}
        </span>
      )}
    </button>
  );

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div 
          className="flex items-center gap-2 cursor-pointer group shrink-0"
          onClick={() => setGameState(GameState.HOME)}
        >
          <div className="bg-red-600 p-1.5 rounded-lg shadow-sm group-hover:rotate-12 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="font-black text-base md:text-lg text-gray-900 tracking-tighter uppercase hidden sm:inline">MathMaster</span>
        </div>

        <div className="flex-1 overflow-x-auto no-scrollbar scroll-smooth">
          <nav className="flex items-center gap-1 min-w-max pr-2">
            <NavButton state={GameState.PRACTICE} label="Solve" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>} />
            <NavButton state={GameState.NOTEBOOK} label="Notebook" badge={mistakeCount} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>} />
            <NavButton state={GameState.GROUP} label="Group" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>} />
            <NavButton state={GameState.RANKINGS} label="Ranks" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>} />
            <NavButton state={GameState.ACHIEVEMENTS} label="Badges" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z"/></svg>} />
            <NavButton state={GameState.REWARDS} label="Awards" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>} />
          </nav>
        </div>

        <div 
          className="bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-full flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-transform shrink-0 shadow-sm"
          onClick={() => setGameState(GameState.PROFILE)}
        >
          <span className="text-xs md:text-sm font-black text-amber-700">{points}</span>
          <span className="text-[8px] md:text-[10px] font-bold text-amber-600 uppercase">Pts</span>
        </div>
      </div>
    </header>
  );
};

export default Header;