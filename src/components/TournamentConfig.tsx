import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface TournamentConfig {
  teamCount: number;
  teamNames: string[];
  matchDuration: number;
  breakDuration: number;
  repeatMatches: number;
}

const TournamentConfig: React.FC = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState<TournamentConfig>({
    teamCount: 3,
    teamNames: ['チームA', 'チームB', 'チームC', 'チームD', 'チームE', 'チームF'],
    matchDuration: 10, // 10分
    breakDuration: 5, // 5分
    repeatMatches: 1,
  });

  const handleStart = () => {
    if (config.teamCount < 2) {
      alert('チーム数は2以上にしてください');
      return;
    }
    // 分を秒に変換して保存
    const configWithSeconds = {
      ...config,
      matchDuration: config.matchDuration * 60,
      breakDuration: config.breakDuration * 60,
    };
    navigate('/match', { state: { config: configWithSeconds } });
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">ふっと！</h1>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          チーム数
        </label>
        <select
          value={config.teamCount}
          onChange={(e) => setConfig(prev => ({ ...prev, teamCount: parseInt(e.target.value) }))}
          className="w-full p-2 border rounded"
        >
          {[2, 3, 4, 5, 6].map(num => (
            <option key={num} value={num}>{num}チーム</option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          試合時間（分）
        </label>
        <input
          type="number"
          min="1"
          value={config.matchDuration}
          onChange={(e) => {
            const value = parseInt(e.target.value) || 10;
            setConfig(prev => ({ ...prev, matchDuration: Math.max(1, value) }));
          }}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          休憩時間（分）
        </label>
        <input
          type="number"
          min="0"
          value={config.breakDuration}
          onChange={(e) => {
            const value = parseInt(e.target.value) || 5;
            setConfig(prev => ({ ...prev, breakDuration: Math.max(0, value) }));
          }}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          試合の繰り返し回数
        </label>
        <select
          value={config.repeatMatches}
          onChange={(e) => setConfig(prev => ({ ...prev, repeatMatches: parseInt(e.target.value) }))}
          className="w-full p-2 border rounded"
        >
          <option value="1">1回（総当たり）</option>
          <option value="2">2回（2回総当たり）</option>
          <option value="3">3回（3回総当たり）</option>
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          チーム名設定
        </label>
        <div className="space-y-2">
          {Array.from({ length: config.teamCount }).map((_, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-sm text-gray-600 w-8">チーム{index + 1}</span>
              <input
                type="text"
                value={config.teamNames[index]}
                onChange={(e) => {
                  const newNames = [...config.teamNames];
                  newNames[index] = e.target.value;
                  setConfig(prev => ({ ...prev, teamNames: newNames }));
                }}
                className="flex-1 p-2 border rounded"
                placeholder={`チーム${index + 1}`}
              />
            </div>
          ))}
        </div>
      </div>

      <button type="button" onClick={handleStart} className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
        大会を開始
      </button>
    </div>
  );
};

export default TournamentConfig; 