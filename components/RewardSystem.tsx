
import React, { useState } from 'react';
import { Reward } from '../types';

interface RewardSystemProps {
  rewards: Reward[];
  points: number;
  onAddReward: (name: string, cost: number) => void;
  onRedeemReward: (id: string) => void;
  onRemoveReward: (id: string) => void;
}

const RewardSystem: React.FC<RewardSystemProps> = ({ 
  rewards, 
  points, 
  onAddReward, 
  onRedeemReward,
  onRemoveReward
}) => {
  const [name, setName] = useState('');
  const [cost, setCost] = useState('100');
  const [showAdd, setShowAdd] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && cost) {
      onAddReward(name, parseInt(cost, 10));
      setName('');
      setCost('100');
      setShowAdd(false);
    }
  };

  const activeRewards = rewards.filter(r => !r.redeemed);
  const redeemedRewards = rewards.filter(r => r.redeemed);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Ganjaran Anda</h2>
          <p className="text-gray-500">Kumpul mata untuk tebus hadiah pilihan anda!</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="bg-red-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl hover:bg-red-700 transition-all"
        >
          {showAdd ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          )}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border shadow-sm space-y-4 animate-in fade-in slide-in-from-top-4">
          <h3 className="font-bold text-lg text-gray-800">Matlamat Ganjaran Baru</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Nama Ganjaran</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="cth: Makan Haidilao, Main Game 1 Jam"
                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-100 focus:border-red-600 transition-all outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Kos Mata</label>
              <input 
                type="number" 
                value={cost}
                onChange={e => setCost(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-100 focus:border-red-600 transition-all outline-none"
                required
                min="10"
              />
            </div>
          </div>
          <button type="submit" className="w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors">
            Cipta Matlamat
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeRewards.length === 0 && !showAdd && (
          <div className="col-span-full py-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-300">
            <p className="text-gray-500 font-medium">Tiada ganjaran aktif. Tambah matlamat pertama anda!</p>
            <p className="text-gray-400 text-sm mt-1 italic">"Ganjaran untuk kerja keras adalah kepuasan diri."</p>
          </div>
        )}
        
        {activeRewards.map(reward => {
          const progress = Math.min((points / reward.pointsNeeded) * 100, 100);
          const canRedeem = points >= reward.pointsNeeded;
          
          return (
            <div key={reward.id} className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-xl text-gray-800">{reward.name}</h3>
                <button 
                  onClick={() => onRemoveReward(reward.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-500 font-medium">{points} / {reward.pointsNeeded} mata</span>
                <span className={`font-bold ${progress === 100 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.round(progress)}%
                </span>
              </div>
              
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-6">
                <div 
                  className={`h-full transition-all duration-1000 ${progress === 100 ? 'bg-green-500' : 'bg-red-600'}`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <button
                disabled={!canRedeem}
                onClick={() => onRedeemReward(reward.id)}
                className={`w-full py-3 rounded-xl font-bold transition-all
                  ${canRedeem 
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md hover:shadow-lg' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {canRedeem ? 'Tebus Sekarang!' : 'Teruskan Latihan'}
              </button>
            </div>
          );
        })}
      </div>

      {redeemedRewards.length > 0 && (
        <div className="mt-12">
          <h3 className="text-lg font-bold text-gray-500 uppercase tracking-widest mb-4">Ganjaran Telah Ditebus</h3>
          <div className="space-y-3">
            {redeemedRewards.map(reward => (
              <div key={reward.id} className="bg-gray-50 px-6 py-4 rounded-xl border border-dashed flex items-center justify-between opacity-70">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 text-green-600 p-1.5 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-600 line-through">{reward.name}</span>
                </div>
                <span className="text-xs font-bold text-gray-400">Ditebus pada {new Date(reward.createdAt).toLocaleDateString('ms-MY')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RewardSystem;
