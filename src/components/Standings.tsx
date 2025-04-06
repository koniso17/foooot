import React from 'react';

interface TeamStats {
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

const Standings: React.FC = () => {
  // ローカルストレージからチーム統計を取得
  const standings: TeamStats[] = JSON.parse(localStorage.getItem('teamStandings') || '[]');

  // 順位でソート（勝点、得失点差、得点の順）
  const sortedStandings = [...standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const aDiff = a.goalsFor - a.goalsAgainst;
    const bDiff = b.goalsFor - b.goalsAgainst;
    if (bDiff !== aDiff) return bDiff - aDiff;
    return b.goalsFor - a.goalsFor;
  });

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">順位表</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2">順位</th>
              <th className="px-4 py-2">チーム</th>
              <th className="px-4 py-2">試合</th>
              <th className="px-4 py-2">勝</th>
              <th className="px-4 py-2">分</th>
              <th className="px-4 py-2">負</th>
              <th className="px-4 py-2">得点</th>
              <th className="px-4 py-2">失点</th>
              <th className="px-4 py-2">得失点差</th>
              <th className="px-4 py-2">勝点</th>
            </tr>
          </thead>
          <tbody>
            {sortedStandings.map((team, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-2 text-center">{index + 1}</td>
                <td className="px-4 py-2 font-bold">{team.teamName}</td>
                <td className="px-4 py-2 text-center">{team.played}</td>
                <td className="px-4 py-2 text-center">{team.won}</td>
                <td className="px-4 py-2 text-center">{team.drawn}</td>
                <td className="px-4 py-2 text-center">{team.lost}</td>
                <td className="px-4 py-2 text-center">{team.goalsFor}</td>
                <td className="px-4 py-2 text-center">{team.goalsAgainst}</td>
                <td className="px-4 py-2 text-center">{team.goalsFor - team.goalsAgainst}</td>
                <td className="px-4 py-2 text-center font-bold">{team.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {standings.length === 0 && (
        <div className="text-center text-gray-500 mt-4">
          まだ試合結果がありません
        </div>
      )}
    </div>
  );
};

export default Standings; 