import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TournamentSetup from './components/TournamentSetup';
import MatchControl from './components/MatchControl';
import Results from './components/Results';
import Standings from './components/Standings';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">フットサル大会管理</h1>
      </header>
      <main className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<TournamentSetup />} />
          <Route path="/match" element={<MatchControl />} />
          <Route path="/results" element={<Results />} />
          <Route path="/standings" element={<Standings />} />
        </Routes>
      </main>
    </div>
  );
};

export default App; 