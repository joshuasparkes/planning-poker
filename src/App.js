import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DLBoardPage from './pages/DLBoardPage';
import './App.css';
import DevBoardPage from './pages/DevBoardPage';

const App = () => {
  return (
    <BrowserRouter>
      <div style={{ textAlign: 'center' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/board/:code" element={<DLBoardPage />} />
          <Route path="/devboard/:code" element={<DevBoardPage />} /> 
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;