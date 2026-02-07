
import React, { useState, useEffect, useRef } from 'react';
import { GameState } from '../types';

interface HeaderProps {
  points: number;
  gameState: GameState;
  setGameState: (state: GameState) => void;
  mistakeCount: number;
}

const Header: React.FC<HeaderProps> = ({ points, gameState, setGameState, mistakeCount }) => {
  const [pointsIncrement, setPointsIncrement] = useState<number | null>(null);
  const [isPopping, setIsPopping] = useState(false);
  const prevPointsRef = useRef(points);

  useEffect(() => {
    if (points > prevPointsRef.current) {
      const diff = points - prevPointsRef.current;
      setPointsIncrement(diff);
      setIsPopping(true);

      // Reset animations
      const timer = setTimeout(() => {
        setPointsIncrement(null);
        setIsPopping(false);
      }, 1000);

      prevPointsRef.current = points;
      return () => clearTimeout(timer);
    } else if (points < prevPointsRef.current) {
      // In case points are spent, just update the ref without animation
      prevPointsRef.current = points;
    }
  }, [points]);

  const NavButton = ({ state, label, icon, badge }: { state: GameState, label: string, icon: React.ReactNode, badge?: number }) => (
    <button 
      onClick={() => setGameState(state)}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all relative whitespace-nowrap
        ${gameState === state ? 'bg-red-50 text-red-600 shadow-sm' : 'text-gray-500 hover:text-red-500 hover:bg-gray-50'}`}
    >
      {icon}
      <span className="hidden lg:inline">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[8px] text-white ring-2 ring-white">
          {badge}
        </span>
      )}
    </button>
  );

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
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

        <div className="flex-1 overflow-x-auto no-scrollbar scroll-smooth mx-2">
          <nav className="flex items-center gap-1 min-w-max pr-2">
            <NavButton state={GameState.PRACTICE} label="Latihan" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>} />
            <NavButton state={GameState.NOTEBOOK} label="Buku Nota" badge={mistakeCount} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>} />
            <NavButton state={GameState.GROUP} label="Kumpulan" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>} />
            <NavButton state={GameState.RANKINGS} label="Kedudukan" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>} />
            <NavButton state={GameState.REWARDS} label="Ganjaran" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>} />
            <NavButton state={GameState.ACHIEVEMENTS} label="Lencana" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z"/></svg>} />
          </nav>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div 
            onClick={() => setGameState(GameState.PROFILE)}
            className="flex items-center gap-2 bg-gray-50 hover:bg-red-50 px-3 py-1.5 rounded-2xl cursor-pointer transition-colors border border-transparent hover:border-red-100 group relative"
          >
            <div className={`text-sm font-black text-gray-700 group-hover:text-red-600 transition-all ${isPopping ? 'animate-pop text-red-600 scale-110' : ''}`}>
              {points} <span className="text-[10px] text-gray-400">PTS</span>
            </div>
            
            {/* Point increment animation */}
            {pointsIncrement !== null && (
              <div className="absolute -top-6 left-4 font-black text-red-600 text-sm animate-float-up pointer-events-none">
                +{pointsIncrement}
              </div>
            )}

            <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-sm shadow-sm border border-gray-100 group-hover:scale-110 transition-transform overflow-hidden">
               <span className="text-xs">👤</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
