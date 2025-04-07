import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface MatchState {
  isRunning: boolean;
  timeLeft: number;
  isBreak: boolean;
  currentMatch: number;
  totalMatches: number;
  homeScore: number;
  awayScore: number;
  homeTeam: string;
  awayTeam: string;
}

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

interface MatchResult {
  matchNumber: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  date: string;
}

interface MatchSchedule {
  matchNumber: number;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  date?: string;
}

const MatchControl: React.FC = () => {
  const navigate = useNavigate();
  const whistleSound = useRef<HTMLAudioElement | null>(null);
  const config = JSON.parse(localStorage.getItem('tournamentConfig') || '{}');

  const generateMatches = (teams: string[], repeatCount: number) => {
    const matches: { homeTeam: string; awayTeam: string }[] = [];
    const teamCount = teams.length;
    
    // 基本的な組み合わせを生成
    for (let r = 0; r < repeatCount; r++) {
      for (let i = 0; i < teamCount; i++) {
        for (let j = i + 1; j < teamCount; j++) {
          // r が偶数の場合は通常の組み合わせ、奇数の場合はホームとアウェイを入れ替え
          matches.push({
            homeTeam: r % 2 === 0 ? teams[i] : teams[j],
            awayTeam: r % 2 === 0 ? teams[j] : teams[i]
          });
        }
      }
    }

    // 連戦を避けるための最適化
    const optimizedMatches: { homeTeam: string; awayTeam: string }[] = [];
    const usedTeams = new Set<string>();
    let remainingMatches = [...matches];

    while (remainingMatches.length > 0) {
      let bestMatch: { homeTeam: string; awayTeam: string } | null = null;
      let bestScore = -1;

      // 最適な試合を選択
      for (let i = 0; i < remainingMatches.length; i++) {
        const match = remainingMatches[i];
        const score = (usedTeams.has(match.homeTeam) ? 1 : 0) + (usedTeams.has(match.awayTeam) ? 1 : 0);
        
        if (score < bestScore || bestScore === -1) {
          bestScore = score;
          bestMatch = match;
        }
      }

      if (bestMatch) {
        optimizedMatches.push(bestMatch);
        usedTeams.add(bestMatch.homeTeam);
        usedTeams.add(bestMatch.awayTeam);
        remainingMatches = remainingMatches.filter(m => m !== bestMatch);
      } else {
        // 最適な試合が見つからない場合は最初の試合を使用
        const match = remainingMatches.shift();
        if (match) {
          optimizedMatches.push(match);
          usedTeams.clear();
          usedTeams.add(match.homeTeam);
          usedTeams.add(match.awayTeam);
        }
      }
    }

    return optimizedMatches;
  };

  const [matchState, setMatchState] = useState<MatchState>({
    isRunning: false,
    timeLeft: config.matchDuration,
    isBreak: false,
    currentMatch: 1,
    totalMatches: (config.teamCount * (config.teamCount - 1) / 2) * config.repeatMatches,
    homeScore: 0,
    awayScore: 0,
    homeTeam: config.teamNames[0] || 'ホーム',
    awayTeam: config.teamNames[1] || 'アウェイ',
  });

  const [teamStats, setTeamStats] = useState<TeamStats[]>(
    config.teamNames.map((name: string) => ({
      teamName: name,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
    }))
  );

  const [matchSchedule, setMatchSchedule] = useState<MatchSchedule[]>(() => {
    const teams = config.teamNames.slice(0, config.teamCount);
    const matches = generateMatches(teams, config.repeatMatches);
    return matches.map((match, index) => ({
      matchNumber: index + 1,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
    }));
  });

  const isTournamentComplete = matchState.currentMatch > matchState.totalMatches;

  const playWhistle = () => {
    if (whistleSound.current) {
      whistleSound.current.currentTime = 0;
      whistleSound.current.play();
    }
  };

  const updateTeamStats = (homeTeam: string, awayTeam: string, homeScore: number, awayScore: number) => {
    setTeamStats(prev => prev.map(team => {
      if (team.teamName === homeTeam) {
        return {
          ...team,
          played: team.played + 1,
          won: homeScore > awayScore ? team.won + 1 : team.won,
          drawn: homeScore === awayScore ? team.drawn + 1 : team.drawn,
          lost: homeScore < awayScore ? team.lost + 1 : team.lost,
          goalsFor: team.goalsFor + homeScore,
          goalsAgainst: team.goalsAgainst + awayScore,
          points: homeScore > awayScore ? team.points + 3 : homeScore === awayScore ? team.points + 1 : team.points,
        };
      }
      if (team.teamName === awayTeam) {
        return {
          ...team,
          played: team.played + 1,
          won: awayScore > homeScore ? team.won + 1 : team.won,
          drawn: homeScore === awayScore ? team.drawn + 1 : team.drawn,
          lost: awayScore < homeScore ? team.lost + 1 : team.lost,
          goalsFor: team.goalsFor + awayScore,
          goalsAgainst: team.goalsAgainst + homeScore,
          points: awayScore > homeScore ? team.points + 3 : homeScore === awayScore ? team.points + 1 : team.points,
        };
      }
      return team;
    }));
  };

  const saveMatchResult = (homeTeam: string, awayTeam: string, homeScore: number, awayScore: number) => {
    const result = {
      matchNumber: matchState.currentMatch,
      homeTeam,
      awayTeam,
      homeScore,
      awayScore,
      date: new Date().toLocaleString(),
    };
    
    setMatchSchedule(prev => prev.map(match => 
      match.matchNumber === matchState.currentMatch ? result : match
    ));
  };

  const getNextMatch = () => {
    const nextMatch = matchState.currentMatch + 1;
    if (nextMatch > matchState.totalMatches) return null;

    return matchSchedule.find(match => match.matchNumber === nextMatch);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (matchState.isRunning && matchState.timeLeft > 0) {
      timer = setInterval(() => {
        setMatchState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
    } else if (matchState.timeLeft === 0) {
      if (!matchState.isBreak) {
        if (!isTournamentComplete) {
          playWhistle();
        }
        updateTeamStats(matchState.homeTeam, matchState.awayTeam, matchState.homeScore, matchState.awayScore);
        saveMatchResult(matchState.homeTeam, matchState.awayTeam, matchState.homeScore, matchState.awayScore);
        setMatchState(prev => ({
          ...prev,
          isBreak: true,
          timeLeft: config.breakDuration,
        }));
      } else {
        if (!isTournamentComplete) {
          playWhistle();
        }
        const nextMatch = matchState.currentMatch + 1;
        const teams = config.teamNames.slice(0, config.teamCount);
        const matches = generateMatches(teams, config.repeatMatches);
        const nextMatchTeams = matches[nextMatch - 1];

        if (nextMatchTeams) {
          setMatchState(prev => ({
            ...prev,
            isBreak: false,
            timeLeft: config.matchDuration,
            currentMatch: nextMatch,
            homeScore: 0,
            awayScore: 0,
            homeTeam: nextMatchTeams.homeTeam,
            awayTeam: nextMatchTeams.awayTeam,
          }));
        }
      }
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [
    matchState.isRunning,
    matchState.timeLeft,
    matchState.isBreak,
    matchState.currentMatch,
    matchState.homeScore,
    matchState.awayScore,
    matchState.homeTeam,
    matchState.awayTeam,
    config.breakDuration,
    config.matchDuration,
    config.teamCount,
    config.teamNames,
    config.repeatMatches,
    isTournamentComplete,
    playWhistle,
    updateTeamStats,
    saveMatchResult,
    generateMatches
  ]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStartStop = () => {
    if (!matchState.isRunning && !isTournamentComplete) {
      playWhistle();
    }
    setMatchState(prev => ({ ...prev, isRunning: !prev.isRunning }));
  };

  const handleScore = (team: 'home' | 'away', increment: boolean) => {
    setMatchState(prev => {
      const currentScore = prev[team === 'home' ? 'homeScore' : 'awayScore'];
      const newScore = increment ? currentScore + 1 : Math.max(0, currentScore - 1);
      return {
        ...prev,
        [team === 'home' ? 'homeScore' : 'awayScore']: newScore,
      };
    });
  };

  const handleEndTournament = () => {
    localStorage.removeItem('tournamentConfig');
    localStorage.removeItem('matchResults');
    navigate('/');
  };

  const sortedTeamStats = [...teamStats]
    .filter(team => config.teamNames.slice(0, config.teamCount).includes(team.teamName))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const aDiff = a.goalsFor - a.goalsAgainst;
      const bDiff = b.goalsFor - b.goalsAgainst;
      if (bDiff !== aDiff) return bDiff - aDiff;
      return b.goalsFor - a.goalsFor;
    });

  return (
    <div className="max-w-4xl mx-auto bg-white p-4 sm:p-6 rounded-lg shadow-md">
      <audio ref={whistleSound} src={process.env.PUBLIC_URL + '/sounds/whistle.mp3'} />
      
      {!isTournamentComplete ? (
        <>
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">
              {matchState.isBreak ? '休憩中' : '試合中'}
            </h2>
            <div className="text-3xl sm:text-4xl font-mono mb-4">
              {formatTime(matchState.timeLeft)}
            </div>
            <div className="flex justify-center mb-4">
              <button
                onClick={handleStartStop}
                className={`px-6 py-2 rounded ${
                  matchState.isRunning ? 'bg-red-500' : 'bg-green-500'
                } text-white w-full sm:w-auto`}
              >
                {matchState.isRunning ? '一時停止' : '開始'}
              </button>
            </div>
          </div>

          {matchState.isBreak && (
            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold mb-2">次の試合</h3>
              {getNextMatch() ? (
                <div className="text-center">
                  <span className="text-base sm:text-lg">{getNextMatch()?.homeTeam}</span>
                  <span className="mx-2 sm:mx-4">vs</span>
                  <span className="text-base sm:text-lg">{getNextMatch()?.awayTeam}</span>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-base sm:text-lg font-bold text-green-600">全試合終了</p>
                  <button
                    onClick={handleEndTournament}
                    className="mt-4 bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 w-full sm:w-auto"
                  >
                    大会を終了する
                  </button>
                </div>
              )}
            </div>
          )}

          {!matchState.isBreak && (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="text-center">
                <h3 className="text-lg sm:text-xl font-bold mb-2">{matchState.homeTeam}</h3>
                <div className="text-2xl sm:text-3xl font-mono mb-2">{matchState.homeScore}</div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleScore('home', true)}
                    className="bg-blue-500 text-white px-3 py-1 rounded w-12 sm:w-16"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => handleScore('home', false)}
                    className="bg-red-500 text-white px-3 py-1 rounded w-12 sm:w-16"
                  >
                    -1
                  </button>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg sm:text-xl font-bold mb-2">{matchState.awayTeam}</h3>
                <div className="text-2xl sm:text-3xl font-mono mb-2">{matchState.awayScore}</div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleScore('away', true)}
                    className="bg-blue-500 text-white px-3 py-1 rounded w-12 sm:w-16"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => handleScore('away', false)}
                    className="bg-red-500 text-white px-3 py-1 rounded w-12 sm:w-16"
                  >
                    -1
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">大会終了</h2>
          <p className="text-base sm:text-lg mb-6">全試合が終了しました</p>
          <button
            onClick={handleEndTournament}
            className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 w-full sm:w-auto"
          >
            大会を終了する
          </button>
        </div>
      )}

      <div className="mt-6 sm:mt-8">
        <h3 className="text-lg sm:text-xl font-bold mb-4">順位表</h3>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="min-w-[800px] px-4 sm:px-0">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-2 sm:px-4 py-2 text-sm sm:text-base">順位</th>
                  <th className="px-2 sm:px-4 py-2 text-sm sm:text-base whitespace-nowrap">チーム</th>
                  <th className="px-2 sm:px-4 py-2 text-sm sm:text-base">試合</th>
                  <th className="px-2 sm:px-4 py-2 text-sm sm:text-base">勝</th>
                  <th className="px-2 sm:px-4 py-2 text-sm sm:text-base">分</th>
                  <th className="px-2 sm:px-4 py-2 text-sm sm:text-base">負</th>
                  <th className="px-2 sm:px-4 py-2 text-sm sm:text-base">得点</th>
                  <th className="px-2 sm:px-4 py-2 text-sm sm:text-base">失点</th>
                  <th className="px-2 sm:px-4 py-2 text-sm sm:text-base">得失点差</th>
                  <th className="px-2 sm:px-4 py-2 text-sm sm:text-base">勝点</th>
                </tr>
              </thead>
              <tbody>
                {sortedTeamStats.slice(0, config.teamCount).map((team, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-2 sm:px-4 py-2 text-sm sm:text-base text-center">{index + 1}</td>
                    <td className="px-2 sm:px-4 py-2 text-sm sm:text-base font-bold whitespace-nowrap">{team.teamName}</td>
                    <td className="px-2 sm:px-4 py-2 text-sm sm:text-base text-center">{team.played}</td>
                    <td className="px-2 sm:px-4 py-2 text-sm sm:text-base text-center">{team.won}</td>
                    <td className="px-2 sm:px-4 py-2 text-sm sm:text-base text-center">{team.drawn}</td>
                    <td className="px-2 sm:px-4 py-2 text-sm sm:text-base text-center">{team.lost}</td>
                    <td className="px-2 sm:px-4 py-2 text-sm sm:text-base text-center">{team.goalsFor}</td>
                    <td className="px-2 sm:px-4 py-2 text-sm sm:text-base text-center">{team.goalsAgainst}</td>
                    <td className="px-2 sm:px-4 py-2 text-sm sm:text-base text-center">{team.goalsFor - team.goalsAgainst}</td>
                    <td className="px-2 sm:px-4 py-2 text-sm sm:text-base text-center font-bold">{team.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mt-8">
        <h3 className="text-lg sm:text-xl font-bold mb-4">試合スケジュール</h3>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="min-w-[600px] px-4 sm:px-0">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-2 sm:px-4 py-2 text-sm sm:text-base">試合</th>
                  <th className="px-2 sm:px-4 py-2 text-sm sm:text-base whitespace-nowrap">ホーム</th>
                  <th className="px-2 sm:px-4 py-2 text-sm sm:text-base">スコア</th>
                  <th className="px-2 sm:px-4 py-2 text-sm sm:text-base whitespace-nowrap">アウェイ</th>
                  <th className="px-2 sm:px-4 py-2 text-sm sm:text-base">日時</th>
                </tr>
              </thead>
              <tbody>
                {matchSchedule.map((match, index) => (
                  <tr 
                    key={index} 
                    className={`${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    } ${
                      match.matchNumber === matchState.currentMatch ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="px-2 sm:px-4 py-2 text-sm sm:text-base text-center">{match.matchNumber}</td>
                    <td className="px-2 sm:px-4 py-2 text-sm sm:text-base font-bold whitespace-nowrap">{match.homeTeam}</td>
                    <td className="px-2 sm:px-4 py-2 text-sm sm:text-base text-center font-mono">
                      {match.homeScore !== undefined ? `${match.homeScore} - ${match.awayScore}` : 'vs'}
                    </td>
                    <td className="px-2 sm:px-4 py-2 text-sm sm:text-base font-bold whitespace-nowrap">{match.awayTeam}</td>
                    <td className="px-2 sm:px-4 py-2 text-sm sm:text-base text-center">{match.date || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchControl; 