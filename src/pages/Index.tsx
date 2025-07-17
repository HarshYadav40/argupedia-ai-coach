
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import Dashboard from '../components/Dashboard';
import AIDebateCoach from '../components/AIDebateCoach';
import PracticeArena from '../components/PracticeArena';
import SmartJudge from '../components/SmartJudge';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/coach" element={<AIDebateCoach />} />
          <Route path="/practice" element={<PracticeArena />} />
          <Route path="/judge" element={<SmartJudge />} />
        </Routes>
      </Layout>
    </div>
  );
};

export default Index;
