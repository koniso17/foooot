import React from 'react';

interface MatchResult {
  matchNumber: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  date: string;
}

const Results: React.FC = () => {
  // ローカルストレージから試合結果を取得
  const results: MatchResult[] = JSON.parse(localStorage.getItem('matchResults') || '[]');

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">試合結果一覧</h2>
      <div className="space-y-4">
        {results.map((result, index) => (
          <div key={index} className="border rounded p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">試合 {result.matchNumber}</span>
              <span className="text-gray-600">{result.date}</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="font-bold">{result.homeTeam}</div>
              <div className="font-mono text-xl">
                {result.homeScore} - {result.awayScore}
              </div>
              <div className="font-bold">{result.awayTeam}</div>
            </div>
          </div>
        ))}
        {results.length === 0 && (
          <div className="text-center text-gray-500">
            まだ試合結果がありません
          </div>
        )}
      </div>
    </div>
  );
};

export default Results; 