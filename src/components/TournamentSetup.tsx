import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface TournamentConfig {
  teamCount: number;
  matchDuration: number;
  breakDuration: number;
  teamNames: string[];
}

const TournamentSetup: React.FC = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState<TournamentConfig>({
    teamCount: 4,
    matchDuration: 20,
    breakDuration: 5,
    teamNames: Array(6).fill('').map((_, i) => `チーム${i + 1}`),
  });

  const handleTeamCountChange = (count: number) => {
    setConfig(prev => ({
      ...prev,
      teamCount: count,
      teamNames: prev.teamNames.map((name, i) => i < count ? name : ''),
    }));
  };

  const handleTeamNameChange = (index: number, name: string) => {
    setConfig(prev => ({
      ...prev,
      teamNames: prev.teamNames.map((n, i) => i === index ? name : n),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 設定を保存して試合画面に遷移
    localStorage.setItem('tournamentConfig', JSON.stringify(config));
    navigate('/match');
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">大会設定</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            チーム数（2-6チーム）
            <input
              type="number"
              min="2"
              max="6"
              value={config.teamCount}
              onChange={(e) => handleTeamCountChange(parseInt(e.target.value))}
              className="w-full p-2 border rounded"
            />
          </label>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">チーム名設定</label>
          <div className="space-y-2">
            {Array.from({ length: config.teamCount }).map((_, index) => (
              <input
                key={index}
                type="text"
                value={config.teamNames[index]}
                onChange={(e) => handleTeamNameChange(index, e.target.value)}
                placeholder={`チーム${index + 1}`}
                className="w-full p-2 border rounded"
              />
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            試合時間（秒）
            <input
              type="number"
              min="1"
              value={config.matchDuration}
              onChange={(e) => setConfig({ ...config, matchDuration: parseInt(e.target.value) })}
              className="w-full p-2 border rounded"
            />
          </label>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            休憩時間（秒）
            <input
              type="number"
              min="1"
              value={config.breakDuration}
              onChange={(e) => setConfig({ ...config, breakDuration: parseInt(e.target.value) })}
              className="w-full p-2 border rounded"
            />
          </label>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          大会を開始
        </button>
      </form>
    </div>
  );
};

export default TournamentSetup; 