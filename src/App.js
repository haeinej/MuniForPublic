import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import HistoryBlock from './pages/HistoryBlock';
import StakeholderBlock from './pages/StakeholderBlock';
import FundingBlock from './pages/FundingBlock';
import ObjectionBlock from './pages/ObjectionBlock';
import TimingBlock from './pages/TimingBlock';
import ChatPage from './pages/ChatPage';
import Header from './components/layout/Header';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/history" element={<HistoryBlock />} />
          <Route path="/stakeholders" element={<StakeholderBlock />} />
          <Route path="/funding" element={<FundingBlock />} />
          <Route path="/objections" element={<ObjectionBlock />} />
          <Route path="/timing" element={<TimingBlock />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
